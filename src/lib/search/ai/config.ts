/**
 * The concierge's speed/depth settings, read from the environment so the
 * client can trade one for the other without a deploy. Pure (the environment
 * is passed in), node-importable, unit-tested.
 *
 * Defaults come from the benchmark of 2026-10-06: 24 queries (FR, MSA, Darija
 * in both scripts, questions, comparisons, centimes, regions, amenities, one
 * injection), each run twice; the Gemini call alone, p50 / p90:
 *
 *   gemini-3.8-flash · low             6.1 s / 14.3 s; 8 of 48 over 12 s or failed;
 *                                      the implicit cache never hit (0 cached tokens)
 *   gemini-3.7-flash · low             4.0 s /  7.1 s; same rankings as 3.8, summaries
 *                                      as accurate, judged query by query; ~6 % over 9 s
 *   gemini-3.7-flash · low, lean       4.0 s /  7.7 s (96 calls) — lean = no per-result
 *                                      criteria in the output (445 → 307 tokens) and no
 *                                      Arabic summaries in the catalogue (11 668 → 9 740
 *                                      tokens; ~6 800 served from the implicit cache):
 *                                      no faster on 3.7 (its variance swamps it), but
 *                                      cheaper, and 20 % faster on the lite model
 *   gemini-3.5-flash-lite · minimal    1.8 s / 2.4 s (lean: 1.4 s / 1.7 s) — the fastest,
 *                                      rankings nearly as good, but about 1 summary in 6
 *                                      says something the data contradicts ("3 programmes
 *                                      avec spa" when 2 have one) that the figure check
 *                                      cannot catch → the fallback, not the default
 *   gemini-3.6-flash · minimal         8.6 s / 10.2 s and 9 of 48 HTTP 503 ("high demand")
 *   gemini-3.5-flash · minimal         3.4 s / 5.2 s, 11 of 48 summaries withheld
 *   "minimal" thinking: HTTP 400 on gemini-3.8-flash and gemini-3.7-flash.
 *
 * GEMINI_MODEL / GEMINI_THINKING     the main model and its thinking level
 * GEMINI_FALLBACK_MODEL              started once when the main model is overloaded or
 *                                    rate-limited (HTTP 429/5xx) and time remains;
 *                                    "off" disables
 * GEMINI_FALLBACK_THINKING           its thinking level
 * GEMINI_HEDGE_MS                    after this long without an answer, also start the
 *                                    fallback; the first valid answer wins (hedge.ts);
 *                                    "off" = fallback on overload only
 * GEMINI_TIMEOUT_MS                  the whole budget for one answer (both attempts)
 * GEMINI_TEMPERATURE                 unset by default (Gemini 3 is tuned for its own)
 */

export type ThinkingLevel = "minimal" | "low" | "medium" | "high";

export type GeminiConfig = {
  model: string;
  thinking: ThinkingLevel;
  fallback: { model: string; thinking: ThinkingLevel } | null;
  /** Total time for one answer, primary and fallback together. */
  budgetMs: number;
  /** Also start the fallback after this long without an answer; null: only on overload. */
  hedgeMs: number | null;
  temperature: number | undefined;
};

export const DEFAULT_MODEL = "gemini-3.7-flash";
export const DEFAULT_THINKING: ThinkingLevel = "low";
export const DEFAULT_FALLBACK_MODEL = "gemini-3.5-flash-lite";
export const DEFAULT_FALLBACK_THINKING: ThinkingLevel = "minimal";
/**
 * 9.5 s: the default model's p90 is ~7.7 s, but ~7.6 % of its calls (22 of
 * 288) took over 9 s or failed — stalls on Google's side of 12–20 s, not long
 * answers. Past this the visitor has long been reading the instant results;
 * an answer reordering them then does more harm than good. The client waits
 * this plus a margin (useAiSearch's AI_PATIENCE_MS).
 */
export const DEFAULT_BUDGET_MS = 9_500;
/** A fallback attempt is only worth starting with this much budget left (lite, lean prompt: p95 1.7 s, max 1.9 s). */
export const FALLBACK_MIN_MS = 2_000;
/**
 * 7 s: the default model's slow tail. The fallback (started at 7 s, answering
 * ~1.5 s later) only wins where the main model would have taken over ~8.5 s —
 * nearly always a call that would otherwise have hit the budget and shown no
 * answer at all (~8 % of queries). Answers that do arrive in time are never
 * replaced: the first valid answer wins. Measured with the hedge at 6 s: 47
 * of 48 answered, none over 8.5 s, against 43 of 48 without it.
 */
export const DEFAULT_HEDGE_MS: number | null = 7_000;

const LEVELS: readonly ThinkingLevel[] = ["minimal", "low", "medium", "high"];

function level(value: string | undefined, fallback: ThinkingLevel): ThinkingLevel {
  const v = value?.trim().toLowerCase();
  return LEVELS.includes(v as ThinkingLevel) ? (v as ThinkingLevel) : fallback;
}

export function geminiConfig(env: Record<string, string | undefined>): GeminiConfig {
  const model = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const rawFallback = env.GEMINI_FALLBACK_MODEL?.trim();
  const fallbackModel = rawFallback === undefined || rawFallback === "" ? DEFAULT_FALLBACK_MODEL : rawFallback;
  const fallbackOff = /^(off|none|false|0)$/i.test(fallbackModel) || fallbackModel === model;
  const budget = Number(env.GEMINI_TIMEOUT_MS);
  const budgetMs = Number.isFinite(budget) && budget > 0 ? Math.min(25_000, Math.max(2_000, Math.round(budget))) : DEFAULT_BUDGET_MS;
  const rawHedge = env.GEMINI_HEDGE_MS?.trim();
  const hedge = Number(rawHedge);
  const hedgeOff = rawHedge !== undefined && /^(off|none|false)$/i.test(rawHedge);
  const hedgeMs = hedgeOff ? null : rawHedge && Number.isFinite(hedge) && hedge >= 0 ? Math.round(hedge) : DEFAULT_HEDGE_MS;
  const t = Number(env.GEMINI_TEMPERATURE);
  return {
    model,
    thinking: level(env.GEMINI_THINKING, DEFAULT_THINKING),
    fallback: fallbackOff
      ? null
      : { model: fallbackModel, thinking: level(env.GEMINI_FALLBACK_THINKING, DEFAULT_FALLBACK_THINKING) },
    budgetMs,
    hedgeMs: hedgeMs !== null && hedgeMs < budgetMs ? hedgeMs : null,
    temperature: env.GEMINI_TEMPERATURE && Number.isFinite(t) ? t : undefined,
  };
}

/**
 * Whether a failed main-model attempt is worth starting the fallback for:
 * an overload or a rate limit (429, 5xx) — not a bad request, a refusal or a
 * timeout. (hedge.ts also requires FALLBACK_MIN_MS of the budget left.)
 */
export function retryable(status: number | null | undefined): boolean {
  return status === 429 || (typeof status === "number" && status >= 500 && status <= 599);
}
