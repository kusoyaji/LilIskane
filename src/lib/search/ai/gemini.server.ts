import { GoogleGenAI } from "@google/genai";
import type { Locale } from "@/i18n/config";
import { FALLBACK_MIN_MS, geminiConfig, retryable, type ThinkingLevel } from "./config.ts";
import { hedge } from "./hedge.ts";
import { userInput, systemInstruction } from "./prompt.ts";
import { answerJsonSchema } from "./schema.ts";
import type { AiError } from "./types.ts";

/**
 * SERVER-ONLY: the one module that talks to Google Gemini (the Interactions
 * API of @google/genai 2.x — names checked against the installed typings).
 * Imported only by the route handler; the key (GEMINI_API_KEY, read by the
 * SDK) never leaves the server and is never logged.
 *
 * Caching: the system instruction (rules + catalogue, ~9 700 tokens,
 * byte-identical every time) goes first, so Gemini's implicit cache can serve
 * it; the per-request query goes in `input`. `store: false` — the visitor's
 * words are not retained for later retrieval.
 *
 * Speed: the model, thinking level, fallback model and time budget come from
 * config.ts (env-overridable; the defaults and the benchmark behind them are
 * documented there). One budget covers the whole answer: the fallback model
 * starts when the main one is overloaded (429/5xx) or slow (GEMINI_HEDGE_MS,
 * 7 s), and the first valid answer wins (hedge.ts).
 */

if (typeof window !== "undefined") throw new Error("gemini.server.ts must never reach a browser bundle");

export type GeminiUsage = { input: number | null; cached: number | null; output: number | null };

export type GeminiOutcome =
  | { ok: true; candidate: unknown; usage: GeminiUsage; model: string }
  | { ok: false; reason: AiError["reason"]; status: number };

export function hasKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

let client: GoogleGenAI | null = null;

function statusOf(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  const e = error as { status?: unknown; statusCode?: unknown };
  const s = typeof e.status === "number" ? e.status : typeof e.statusCode === "number" ? e.statusCode : null;
  return s;
}

function isTimeout(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { name?: string; message?: string };
  return /timeout|timed out|aborted|AbortError/i.test(`${e.name ?? ""} ${e.message ?? ""}`);
}

type Attempt =
  | { ok: true; candidate: unknown; usage: GeminiUsage; model: string }
  | { ok: false; reason: AiError["reason"]; status: number; upstream?: number | null };

async function attempt(
  name: string,
  thinking: ThinkingLevel,
  temperature: number | undefined,
  q: string,
  locale: Locale,
  ms: number,
  signal: AbortSignal,
): Promise<Attempt> {
  const timeout = AbortSignal.timeout(ms);
  const combined = AbortSignal.any([signal, timeout]);
  try {
    const interaction = await client!.interactions.create(
      {
        model: name,
        system_instruction: systemInstruction(),
        input: userInput(q, locale),
        generation_config: {
          thinking_level: thinking,
          max_output_tokens: 4096,
          ...(temperature === undefined ? {} : { temperature }),
        },
        response_format: { type: "text", mime_type: "application/json", schema: answerJsonSchema() },
        store: false,
      },
      { timeout: ms, maxRetries: 0, fetchOptions: { signal: combined } },
    );
    const usage: GeminiUsage = {
      input: interaction.usage?.total_input_tokens ?? null,
      cached: interaction.usage?.total_cached_tokens ?? null,
      output: interaction.usage?.total_output_tokens ?? null,
    };
    if (interaction.status !== "completed") {
      // failed / incomplete / budget_exceeded / cancelled: a refusal or a cut-off answer.
      return { ok: false, reason: interaction.status === "failed" ? "refusal" : "invalid", status: 503 };
    }
    const text = interaction.output_text?.trim();
    if (!text) return { ok: false, reason: "refusal", status: 503 };
    let candidate: unknown;
    try {
      candidate = JSON.parse(text);
    } catch {
      return { ok: false, reason: "invalid", status: 503 };
    }
    return { ok: true, candidate, usage, model: name };
  } catch (error) {
    // Withdrawn by the caller (the other model answered first, or the visitor left): not a failure.
    if (signal.aborted) return { ok: false, reason: "timeout", status: 503, upstream: null };
    const status = statusOf(error);
    // The status and the error class only — never the query, never the key.
    console.warn(`[search/ai] ${name} failed: ${status ?? (error as Error)?.name ?? "unknown"}`);
    if (timeout.aborted || (status === null && isTimeout(error))) return { ok: false, reason: "timeout", status: 503, upstream: null };
    if (status === 429) return { ok: false, reason: "rate-limited", status: 429, upstream: status };
    if (status === 400 && /safety|blocked|prohibited/i.test(String((error as Error).message))) {
      return { ok: false, reason: "refusal", status: 503, upstream: status };
    }
    return { ok: false, reason: "error", status: 503, upstream: status };
  }
}

export async function askGemini(q: string, locale: Locale, signal?: AbortSignal): Promise<GeminiOutcome> {
  if (!hasKey()) return { ok: false, reason: "no-key", status: 503 };
  client ??= new GoogleGenAI({});
  const config = geminiConfig(process.env);
  const { fallback } = config;
  const outcome = await hedge<{ candidate: unknown; usage: GeminiUsage; model: string }>(
    (ms, s) => attempt(config.model, config.thinking, config.temperature, q, locale, ms, s),
    fallback ? (ms, s) => attempt(fallback.model, fallback.thinking, config.temperature, q, locale, ms, s) : null,
    {
      budgetMs: config.budgetMs,
      hedgeMs: config.hedgeMs,
      minMs: FALLBACK_MIN_MS,
      retryable,
      signal,
    },
  );
  if (outcome.ok) return { ok: true, candidate: outcome.candidate, usage: outcome.usage, model: outcome.model };
  return { ok: false, reason: outcome.reason as AiError["reason"], status: outcome.status };
}
