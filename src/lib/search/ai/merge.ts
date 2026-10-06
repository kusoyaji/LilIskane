import type { Hit, SearchDoc } from "../types.ts";
import type { AiAnswer, AiResult } from "./types.ts";

export type RankedRow = { doc: SearchDoc; ai: AiResult | null };

/**
 * The display order when an AI answer is present: the AI's ranked results
 * first — exact fits, then close ones, each group in the AI's own order —
 * resolved against ALL programmes (the AI may rightly pick one the instant
 * engine filtered out, e.g. "près de la mer"), then the instant hits it did
 * not mention, in instant order. A slug that resolves to no programme, or
 * repeats, is skipped. With no answer, the instant order unchanged.
 * Pure; node-importable.
 */
export function orderWithAi(docs: SearchDoc[], instant: Hit[], answer: AiAnswer | null): RankedRow[] {
  if (!answer) return instant.map((hit) => ({ doc: hit.doc, ai: null }));
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  const seen = new Set<string>();
  const exact: RankedRow[] = [];
  const close: RankedRow[] = [];
  for (const result of answer.results) {
    const doc = bySlug.get(result.slug);
    if (!doc || seen.has(result.slug)) continue;
    seen.add(result.slug);
    (result.fit === "exact" ? exact : close).push({ doc, ai: result });
  }
  const rows = [...exact, ...close];
  for (const hit of instant) if (!seen.has(hit.doc.slug)) rows.push({ doc: hit.doc, ai: null });
  return rows;
}
