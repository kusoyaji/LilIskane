import { GoogleGenAI } from "@google/genai";
import type { Locale } from "@/i18n/config";
import { userInput, systemInstruction } from "./prompt.ts";
import { answerJsonSchema } from "./schema.ts";
import type { AiError } from "./types.ts";

/**
 * SERVER-ONLY: the one module that talks to Google Gemini (the Interactions
 * API of @google/genai 2.x — names checked against the installed typings).
 * Imported only by the route handler; the key (GEMINI_API_KEY, read by the
 * SDK) never leaves the server and is never logged.
 *
 * Caching: the system instruction (rules + catalogue, several thousand
 * tokens, byte-identical every time) goes first, so Gemini's implicit cache
 * can serve it; the per-request query goes in `input`. `store: false` — the
 * visitor's words are not retained for later retrieval.
 *
 * Env knobs, so the client can trade speed for depth without a deploy:
 * GEMINI_MODEL (default gemini-3.8-flash), GEMINI_THINKING (low | medium |
 * high; default low), GEMINI_TEMPERATURE (unset by default: Gemini 3 models
 * are tuned for their default temperature).
 */

if (typeof window !== "undefined") throw new Error("gemini.server.ts must never reach a browser bundle");

export const DEFAULT_MODEL = "gemini-3.8-flash";
const TIMEOUT_MS = 12_000;

export type GeminiUsage = { input: number | null; cached: number | null; output: number | null };

export type GeminiOutcome =
  | { ok: true; candidate: unknown; usage: GeminiUsage; model: string }
  | { ok: false; reason: AiError["reason"]; status: number };

export function hasKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

let client: GoogleGenAI | null = null;

function model(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

/** "minimal" is in the SDK's type but gemini-3.8-flash answers it with HTTP 400 (measured 2026-10-06). */
function thinking(): "low" | "medium" | "high" {
  const level = process.env.GEMINI_THINKING?.trim();
  return level === "medium" || level === "high" ? level : "low";
}

function temperature(): number | undefined {
  const t = Number(process.env.GEMINI_TEMPERATURE);
  return process.env.GEMINI_TEMPERATURE && Number.isFinite(t) ? t : undefined;
}

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

export async function askGemini(q: string, locale: Locale, signal?: AbortSignal): Promise<GeminiOutcome> {
  if (!hasKey()) return { ok: false, reason: "no-key", status: 503 };
  client ??= new GoogleGenAI({});
  const name = model();
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const t = temperature();
  try {
    const interaction = await client.interactions.create(
      {
        model: name,
        system_instruction: systemInstruction(),
        input: userInput(q, locale),
        generation_config: {
          thinking_level: thinking(),
          max_output_tokens: 4096,
          ...(t === undefined ? {} : { temperature: t }),
        },
        response_format: { type: "text", mime_type: "application/json", schema: answerJsonSchema() },
        store: false,
      },
      { timeout: TIMEOUT_MS, maxRetries: 0, fetchOptions: { signal: combined } },
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
    const status = statusOf(error);
    // The status and the error class only — never the query, never the key.
    console.warn(`[search/ai] ${name} failed: ${status ?? (error as Error)?.name ?? "unknown"}`);
    if (status === 429) return { ok: false, reason: "rate-limited", status: 429 };
    if (timeout.aborted || isTimeout(error)) return { ok: false, reason: "timeout", status: 503 };
    if (status === 400 && /safety|blocked|prohibited/i.test(String((error as Error).message))) {
      return { ok: false, reason: "refusal", status: 503 };
    }
    return { ok: false, reason: "error", status: 503 };
  }
}
