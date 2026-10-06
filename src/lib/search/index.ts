export type { Hit, ParsedQuery, QuerySpan, RegionId, SearchDoc, SearchOutcome } from "./types.ts";
export { normalize, words } from "./normalize.ts";
export { emptyQuery, parseQuery } from "./parse.ts";
export { searchDocs } from "./rank.ts";
export { toProjetsHref } from "./link.ts";
