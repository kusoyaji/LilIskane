import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import { normalize, parseQuery } from "@/lib/search";
import { validationContext } from "@/lib/search/ai/catalogue";
import { askGemini, hasKey } from "@/lib/search/ai/gemini.server";
import { LruCache, RateLimiter } from "@/lib/search/ai/guard";
import { mockAnswer } from "@/lib/search/ai/mock";
import type { AiAnswer, AiError } from "@/lib/search/ai/types";
import { validateAnswer } from "@/lib/search/ai/validate";

/**
 * POST /api/search/ai {q, locale} → a validated AiAnswer, or {reason} with
 * 4xx/503 — the client then simply keeps its instant results.
 *
 * Guardrails: q ≤ 400 characters; per-IP sliding windows (20/min, 300/day);
 * a 500-entry, one-hour LRU of answers keyed by locale + normalised query;
 * identical concurrent queries share one Gemini call. Nothing about the query
 * is logged — only counts. The key stays in the server's environment.
 *
 * DEV ONLY: outside production, a request with `x-search-mock: 1` gets a
 * canned answer derived from the instant engine after ~1 s (for building the
 * UI without a key); production ignores the header.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_Q = 400;
const limiter = new RateLimiter([
  { ms: 60_000, max: 20 },
  { ms: 86_400_000, max: 300 },
]);
const cache = new LruCache<AiAnswer>(500, 3_600_000);
const inflight = new Map<string, Promise<Response>>();
const counts = { requests: 0, cached: 0, model: 0, fallbacks: 0 };

const NO_STORE = { "Cache-Control": "no-store" };
const DEV = process.env.NODE_ENV !== "production";

/**
 * The expected fallbacks (no key, rate limit, timeout, refusal, an answer that
 * failed validation) are a normal outcome — the page keeps its instant
 * results — so they answer 200 with { reason }: a non-2xx would print a red
 * "Failed to load resource" in every visitor's console. The real status
 * travels in x-search-status. Malformed requests keep their 4xx.
 */
function fail(reason: AiError["reason"], status: number): Response {
  counts.fallbacks += 1;
  const http = status === 400 || status === 413 ? status : 200;
  return NextResponse.json({ reason } satisfies AiError, {
    status: http,
    headers: { ...NO_STORE, "x-search-status": String(status) },
  });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

async function answerFromModel(q: string, locale: Locale, key: string): Promise<Response> {
  const started = Date.now();
  const result = await askGemini(q, locale);
  if (!result.ok) return fail(result.reason, result.status);
  const answer = validateAnswer(result.candidate, { q, locale, parsed: parseQuery(q) }, validationContext());
  if (!answer) return fail("invalid", 503);
  counts.model += 1;
  cache.set(key, answer);
  const headers: Record<string, string> = { ...NO_STORE, "x-search-source": "model" };
  if (DEV) {
    // Token counts and timing only — for measuring the implicit cache in development.
    headers["x-search-usage"] = JSON.stringify(result.usage);
    headers["x-search-latency"] = String(Date.now() - started);
    headers["x-search-model"] = result.model;
    // Whether the validator withheld the model's summary (a figure or a claim the data does not support).
    const said = (result.candidate as { summary?: unknown } | null)?.summary;
    // In development the withheld sentence itself, URI-encoded, to see which figure or claim failed.
    if (typeof said === "string" && said.trim() && answer.summary === null) {
      headers["x-search-summary-dropped"] = encodeURIComponent(said.slice(0, 300));
    }
  }
  return NextResponse.json(answer, { headers });
}

export async function POST(request: Request): Promise<Response> {
  counts.requests += 1;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }
  const fields = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const q = typeof fields.q === "string" ? fields.q.trim() : "";
  const locale: Locale = typeof fields.locale === "string" && isLocale(fields.locale) ? fields.locale : "fr";
  if (!q) return fail("invalid", 400);
  if (q.length > MAX_Q) return fail("too-long", 413);

  const mock = DEV && request.headers.get("x-search-mock") === "1";
  const key = `${mock ? "mock|" : ""}${locale}|${normalize(q)}`;

  const hit = cache.get(key);
  if (hit) {
    counts.cached += 1;
    return NextResponse.json(hit, { headers: { ...NO_STORE, "x-search-source": "cache" } });
  }

  if (mock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const answer = validateAnswer(mockAnswer(q, locale), { q, locale, parsed: parseQuery(q) }, validationContext());
    if (!answer) return fail("invalid", 503);
    cache.set(key, answer);
    return NextResponse.json(answer, { headers: { ...NO_STORE, "x-search-source": "mock" } });
  }

  if (!hasKey()) return fail("no-key", 503);
  if (!limiter.take(clientIp(request))) return fail("rate-limited", 429);

  // Identical concurrent queries share one call; each caller gets its own Response.
  let pending = inflight.get(key);
  if (!pending) {
    pending = answerFromModel(q, locale, key).finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  const response = await pending;
  return response.clone();
}

/** DEV ONLY — counts (no queries): how often the concierge answered, from cache, or fell back. */
export async function GET(): Promise<Response> {
  if (!DEV) return NextResponse.json({ reason: "error" } satisfies AiError, { status: 404 });
  return NextResponse.json({ ...counts, cacheSize: cache.size, configured: hasKey() }, { headers: NO_STORE });
}
