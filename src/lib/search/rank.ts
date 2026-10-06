import { normalize, words } from "./normalize.ts";
import type { ParsedQuery, SearchDoc, SearchOutcome } from "./types.ts";

/** STUB — replaced by the real ranker. Matches free text against names, cities and neighbourhoods. */
export function searchDocs(docs: SearchDoc[], query: ParsedQuery): SearchOutcome {
  if (query.text.length === 0) return { hits: docs.map((doc) => ({ doc, score: 0 })), exact: true, relaxed: [] };
  const hits = docs
    .map((doc) => {
      const hay = words([doc.name.fr, doc.name.ar, doc.city.fr, doc.city.ar, doc.neighbourhood.fr, doc.neighbourhood.ar].join(" "));
      const score = query.text.filter((w) => hay.some((h) => h.startsWith(normalize(w)))).length;
      return { doc, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score);
  return hits.length ? { hits, exact: true, relaxed: [] } : { hits: docs.map((doc) => ({ doc, score: 0 })), exact: false, relaxed: [] };
}
