"use client";

import type { Locale } from "@/i18n/config";
import type { SearchOutcome } from "@/lib/search";
import type { AiAnswer, AiState } from "@/lib/search/ai/types";

/**
 * STUB — the contract for the AI layer's client hook (the AI builder
 * implements it: AI-worthiness rule, ~900 ms debounce or immediate on
 * `ask()`, AbortController for stale requests, per-query cache, POST to
 * /api/search/ai). Until then it never calls the network and stays idle, so
 * every UI can integrate it now and the instant results keep working.
 *
 * - `raw`: the text in the field (the AI reads what the visitor wrote).
 * - `instant`: the deterministic outcome for the same query (used to decide
 *   whether the AI is worth calling, and as the fallback order).
 * - `ask()`: call now (Enter / submit), bypassing the debounce.
 */
export function useAiSearch(_args: { raw: string; locale: Locale; instant: SearchOutcome | null }): {
  state: AiState;
  answer: AiAnswer | null;
  /** The `raw` the current answer belongs to (answers for an older query are never shown). */
  forQuery: string | null;
  ask: () => void;
} {
  return { state: "idle", answer: null, forQuery: null, ask: () => {} };
}
