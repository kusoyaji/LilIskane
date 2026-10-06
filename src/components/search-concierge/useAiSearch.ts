"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { normalize, parseQuery, type SearchOutcome } from "@/lib/search";
import type { AiAnswer, AiError, AiState } from "@/lib/search/ai/types";
import { isAiWorthy } from "@/lib/search/ai/worthy";

/**
 * The AI layer on the client. The instant engine answers every keystroke;
 * this asks /api/search/ai only when the query is worth it (see
 * lib/search/ai/worthy.ts), ~900 ms after the visitor stops typing — or at
 * once on `ask()` (Enter / submit). It never blocks the instant results and
 * never shows an error: when the AI cannot answer, the state is
 * "unavailable" and the UI simply keeps what it has.
 *
 * - Answers are cached per normalised query + locale for the page's life
 *   (module scope, shared by every surface: overlay, home, /projets).
 * - Identical in-flight requests are shared; a request nobody waits for any
 *   more is aborted (AbortController), and an answer is only ever reported
 *   for the text it was asked for (`forQuery`).
 * - "no-key" turns the layer off for the session; "rate-limited" pauses it a
 *   minute.
 * - Development: add `?aimock=1` to the page URL (or sessionStorage
 *   "concierge-mock" = "1") to get the route's canned answers without a key.
 */

const DEBOUNCE_MS = 900;
/**
 * How long the page waits for an answer: the server's Gemini budget (9.5 s,
 * lib/search/ai/config.ts DEFAULT_BUDGET_MS) plus ~1.5 s for the round trip
 * and validation. Past it the request is aborted and the state turns
 * "unavailable" — the visitor keeps the instant results, nothing jumps under
 * them later. (The server still caches an answer that completes, so asking
 * the same thing again is instant.)
 */
export const AI_PATIENCE_MS = 11_000;

type Entry = AiAnswer | "unavailable";
/** Answers per normalised query + locale, for the page's life; oldest dropped past this many. */
const MAX_ANSWERS = 200;
const answers = new Map<string, Entry>();
function remember(key: string, entry: Entry): void {
  answers.delete(key);
  answers.set(key, entry);
  if (answers.size > MAX_ANSWERS) answers.delete(answers.keys().next().value!);
}
const inflight = new Map<string, { promise: Promise<AiAnswer | null>; controller: AbortController; waiters: number }>();
let pausedUntil = 0;

function keyOf(raw: string, locale: Locale): string {
  return `${locale}|${normalize(raw.trim())}`;
}

function mockRequested(): boolean {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("aimock") === "1" || sessionStorage.getItem("concierge-mock") === "1";
  } catch {
    return false;
  }
}

/** Whether the AI layer is currently switched off (no key, or rate-limited). */
export function aiPaused(): boolean {
  return Date.now() < pausedUntil;
}

/** `signal`, or a timeout — without AbortSignal.any/timeout, absent before iOS Safari 17.4. */
function withTimeout(signal: AbortSignal, ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, ms);
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });
  return {
    signal: controller.signal,
    done: () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    },
  };
}

async function request(raw: string, locale: Locale, key: string, signal: AbortSignal): Promise<AiAnswer | null> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (mockRequested()) headers["x-search-mock"] = "1";
  const limited = withTimeout(signal, AI_PATIENCE_MS);
  let response: Response;
  try {
    response = await fetch("/api/search/ai", {
      method: "POST",
      headers,
      body: JSON.stringify({ q: raw.trim(), locale }),
      signal: limited.signal,
    });
  } catch {
    limited.done();
    return null; // aborted, offline, timed out
  }
  limited.done();
  // The route answers its expected fallbacks with 200 and { reason } (see route.ts).
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // not JSON: an error page
  }
  const failure = body && typeof body === "object" && "reason" in body ? (body as AiError) : null;
  if (response.ok && body && !failure) {
    const answer = body as AiAnswer;
    remember(key, answer);
    return answer;
  }
  const reason: AiError["reason"] = failure?.reason ?? "error";
  if (reason === "no-key") pausedUntil = Number.POSITIVE_INFINITY;
  else if (reason === "rate-limited") pausedUntil = Date.now() + 60_000;
  else if (reason === "refusal" || reason === "invalid" || reason === "too-long") remember(key, "unavailable");
  return null;
}

/**
 * The answer for a query, from cache, from a request already in flight, or
 * from a new one. Resolves to null whenever the AI cannot answer (never
 * throws). `timeoutMs` stops waiting (the request itself carries on and
 * fills the cache); `signal` withdraws this caller.
 */
export function fetchAiAnswer(
  raw: string,
  locale: Locale,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<AiAnswer | null> {
  const key = keyOf(raw, locale);
  const cached = answers.get(key);
  if (cached) return Promise.resolve(cached === "unavailable" ? null : cached);
  if (!raw.trim() || aiPaused()) return Promise.resolve(null);

  let entry = inflight.get(key);
  if (!entry) {
    const controller = new AbortController();
    const promise = request(raw, locale, key, controller.signal).finally(() => inflight.delete(key));
    entry = { promise, controller, waiters: 0 };
    inflight.set(key, entry);
  }
  const current = entry;
  current.waiters += 1;

  return new Promise<AiAnswer | null>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const leave = (value: AiAnswer | null) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      current.waiters -= 1;
      // Nobody waits any more: let the request go — unless someone joins in this same tick.
      if (current.waiters === 0 && value === null) {
        setTimeout(() => {
          if (current.waiters === 0 && inflight.get(key) === current) current.controller.abort();
        }, 0);
      }
      resolve(value);
    };
    const onAbort = () => leave(null);
    if (options.signal?.aborted) return leave(null);
    options.signal?.addEventListener("abort", onAbort);
    if (options.timeoutMs) timer = setTimeout(() => leave(null), options.timeoutMs);
    current.promise.then(leave, () => leave(null));
  });
}

export function useAiSearch({ raw, locale, instant }: { raw: string; locale: Locale; instant: SearchOutcome | null }): {
  state: AiState;
  answer: AiAnswer | null;
  /** The `raw` the current answer belongs to (answers for an older query are never shown). */
  forQuery: string | null;
  ask: () => void;
} {
  const parsed = useMemo(() => parseQuery(raw), [raw]);
  const worthy = useMemo(() => isAiWorthy(raw, parsed, instant), [raw, parsed, instant]);
  const key = keyOf(raw, locale);
  const empty = raw.trim() === "";

  const [thinking, setThinking] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [, setVersion] = useState(0);
  const [forced, setForced] = useState<{ key: string; nonce: number } | null>(null);

  const thinkingRef = useRef<string | null>(null);
  thinkingRef.current = thinking;
  const rawRef = useRef(raw);
  rawRef.current = raw;
  const worthyRef = useRef(worthy);
  worthyRef.current = worthy;

  const isForced = forced?.key === key;
  useEffect(() => {
    if (empty || answers.has(key)) return;
    if (!worthy && !isForced) return;
    if (aiPaused()) {
      setFailed(key);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        setThinking(key);
        fetchAiAnswer(rawRef.current, locale, { signal: controller.signal }).then((answer) => {
          if (controller.signal.aborted) return;
          setThinking((k) => (k === key ? null : k));
          if (!answer) setFailed(key);
          setVersion((v) => v + 1);
        });
      },
      isForced ? 0 : DEBOUNCE_MS,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
      setThinking((k) => (k === key ? null : k));
    };
    // `forced.nonce` re-runs the effect for a repeated ask() on the same text.
  }, [key, empty, worthy, isForced, forced?.nonce, locale]);

  const ask = useCallback(() => {
    const k = keyOf(rawRef.current, locale);
    // Already asked (or answered): Enter while the concierge reads must not restart the request.
    if (!rawRef.current.trim() || answers.has(k) || thinkingRef.current === k) return;
    // A bare name or city the instant engine already resolves ("Agadir", "massylia"): nothing to ask.
    if (!worthyRef.current) return;
    setFailed((f) => (f === k ? null : f));
    setForced((f) => ({ key: k, nonce: (f?.nonce ?? 0) + 1 }));
  }, [locale]);

  const cached = empty ? undefined : answers.get(key);
  if (cached && cached !== "unavailable") return { state: "ready", answer: cached, forQuery: raw, ask };
  if (thinking === key) return { state: "thinking", answer: null, forQuery: null, ask };
  if (cached === "unavailable" || failed === key) return { state: "unavailable", answer: null, forQuery: null, ask };
  return { state: "idle", answer: null, forQuery: null, ask };
}
