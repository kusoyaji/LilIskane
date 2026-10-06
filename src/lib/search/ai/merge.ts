import type { Hit, SearchDoc } from "../types.ts";
import type { AiAnswer, AiResult } from "./types.ts";

export type RankedRow = { doc: SearchDoc; ai: AiResult | null };

/**
 * STUB contract (the AI builder implements and tests it): the display order
 * when an AI answer is present — the AI's ranked results first (exact, then
 * close), resolved against ALL programmes (the AI may rightly pick one the
 * instant engine filtered out, e.g. "près de la mer"), then the instant hits
 * it did not mention, in instant order. With no answer, the instant order
 * unchanged. Pure; node-importable.
 */
export function orderWithAi(docs: SearchDoc[], instant: Hit[], answer: AiAnswer | null): RankedRow[] {
  if (!answer) return instant.map((hit) => ({ doc: hit.doc, ai: null }));
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  const seen = new Set<string>();
  const rows: RankedRow[] = [];
  for (const result of answer.results) {
    const doc = bySlug.get(result.slug);
    if (!doc || seen.has(result.slug)) continue;
    seen.add(result.slug);
    rows.push({ doc, ai: result });
  }
  for (const hit of instant) if (!seen.has(hit.doc.slug)) rows.push({ doc: hit.doc, ai: null });
  return rows;
}
