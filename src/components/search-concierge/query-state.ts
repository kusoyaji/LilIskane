import { normalize, parseQuery, words, type ParsedQuery, type QuerySpan } from "@/lib/search";
import { wordForms } from "@/lib/search/normalize";
import type { Amenity, Kind, Segment } from "@/data/types";
import type { StatusFacet } from "@/lib/status-facets";
import { SEARCH_PAGES } from "@/content/search";

/**
 * The overlay's query model.
 *
 * The text the visitor typed is the source of truth: it is parsed on every
 * keystroke into structured values, shown as chips. Values added from the
 * filter panel live beside it in `Extra`, and the two are merged into the
 * one `ParsedQuery` the ranker sees. Removing a chip that came from the text
 * deletes the words that produced it (located through `ParsedQuery.spans`),
 * so the field and the chips can never disagree.
 *
 * Everything here goes through the public contract of `@/lib/search` only —
 * it makes no assumption about how the parser reads French or Arabic.
 */

export type ListField = "cities" | "segments" | "kinds" | "statuses" | "amenities";
export type ScalarField = "bedroomsMin" | "priceMax" | "monthlyMax";
export type ValueField = ListField | ScalarField;

export type Extra = {
  cities: string[];
  segments: Segment[];
  kinds: Kind[];
  statuses: StatusFacet[];
  amenities: Amenity[];
  bedroomsMin: number | null;
  priceMax: number | null;
  monthlyMax: number | null;
};

export const EMPTY_EXTRA: Extra = {
  cities: [],
  segments: [],
  kinds: [],
  statuses: [],
  amenities: [],
  bedroomsMin: null,
  priceMax: null,
  monthlyMax: null,
};

const LIST_FIELDS: ListField[] = ["cities", "segments", "kinds", "statuses", "amenities"];
const SCALAR_FIELDS: ScalarField[] = ["bedroomsMin", "priceMax", "monthlyMax"];

const union = <T,>(a: T[], b: T[]): T[] => [...a, ...b.filter((v) => !a.includes(v))];

export function isEmptyExtra(extra: Extra): boolean {
  return LIST_FIELDS.every((f) => extra[f].length === 0) && SCALAR_FIELDS.every((f) => extra[f] === null);
}

/** Text-derived values first (they are what the visitor said); a typed scalar wins over a picked one. */
export function merge(parsed: ParsedQuery, extra: Extra): ParsedQuery {
  return {
    ...parsed,
    cities: union(parsed.cities, extra.cities),
    segments: union(parsed.segments, extra.segments),
    kinds: union(parsed.kinds, extra.kinds),
    statuses: union(parsed.statuses, extra.statuses),
    amenities: union(parsed.amenities, extra.amenities),
    bedroomsMin: parsed.bedroomsMin ?? extra.bedroomsMin,
    priceMax: parsed.priceMax ?? extra.priceMax,
    monthlyMax: parsed.monthlyMax ?? extra.monthlyMax,
  };
}

export function hasConstraint(query: ParsedQuery): boolean {
  return (
    query.text.length > 0 ||
    LIST_FIELDS.some((f) => query[f].length > 0) ||
    SCALAR_FIELDS.some((f) => query[f] !== null)
  );
}

/** When the visitor types a value for a field they had picked in the panel, the typed one replaces it. */
export function reconcile(parsed: ParsedQuery, extra: Extra): Extra {
  let next = extra;
  for (const f of SCALAR_FIELDS) {
    if (parsed[f] !== null && next[f] !== null) next = { ...next, [f]: null };
  }
  for (const f of LIST_FIELDS) {
    const kept = (next[f] as string[]).filter((v) => !(parsed[f] as string[]).includes(v));
    if (kept.length !== next[f].length) next = { ...next, [f]: kept };
  }
  return next;
}

function has(query: ParsedQuery, field: ValueField, value: string | number): boolean {
  const v = query[field];
  return Array.isArray(v) ? (v as Array<string | number>).includes(value) : v === value;
}

/**
 * Words that only make sense attached to the value just removed — "à" in
 * "3 chambres à Agadir", "moins de" before a price — are removed with it, so
 * deleting the "Agadir" chip leaves "3 chambres", not "3 chambres à".
 */
const DANGLING =
  /(?:^|\s)(?:à|a|au|aux|en|dans|de|du|des|d'|avec|près de|pres de|proche de|vers|sur|moins de|max|maximum|jusqu'à|jusqu'a|budget|sous|pour|et|ou|في|ب|مع|قرب|من|أقل من|اقل من|حتى|و)\s*$/i;

export function cut(raw: string, start: number, end: number): string {
  let head = raw.slice(0, start).replace(/\s+$/u, "");
  const tail = raw.slice(end).replace(/^[\s,;]+/u, "");
  for (let i = 0; i < 2; i++) {
    const trimmed = head.replace(DANGLING, "");
    if (trimmed === head) break;
    head = trimmed.replace(/\s+$/u, "");
  }
  head = head.replace(/[\s,;]+$/u, "");
  return head && tail ? `${head} ${tail}` : head || tail;
}

function cutSpans(raw: string, spans: QuerySpan[]): string {
  // Right to left, so earlier offsets stay valid.
  return [...spans].sort((a, b) => b.start - a.start).reduce((text, span) => cut(text, span.start, span.end), raw);
}

/** Values present in `before` but not in `after`, as an Extra — what a deletion took with it. */
function lost(before: ParsedQuery, after: ParsedQuery): Extra {
  const out: Extra = { ...EMPTY_EXTRA };
  for (const f of LIST_FIELDS) {
    (out[f] as string[]) = (before[f] as string[]).filter((v) => !(after[f] as string[]).includes(v));
  }
  for (const f of SCALAR_FIELDS) out[f] = before[f] !== null && after[f] === null ? before[f] : null;
  return out;
}

function addExtra(a: Extra, b: Extra): Extra {
  const out = { ...a };
  for (const f of LIST_FIELDS) (out[f] as string[]) = union(a[f] as string[], b[f] as string[]);
  for (const f of SCALAR_FIELDS) out[f] = a[f] ?? b[f];
  return out;
}

function withoutValue(extra: Extra, field: ValueField, value: string | number): Extra {
  if ((SCALAR_FIELDS as string[]).includes(field)) {
    return extra[field as ScalarField] === value ? { ...extra, [field]: null } : extra;
  }
  return { ...extra, [field]: (extra[field as ListField] as Array<string | number>).filter((v) => v !== value) };
}

/**
 * Remove one structured value, wherever it came from. For a value read from
 * the text, the span whose deletion makes it disappear is cut; anything else
 * that deletion took along (the other cities of a region, say) is kept as a
 * picked value, so removing one thing never silently removes another.
 */
export function removeValue(
  raw: string,
  extra: Extra,
  field: ValueField,
  value: string | number,
): { raw: string; extra: Extra } {
  let nextExtra = withoutValue(extra, field, value);
  const parsed = parseQuery(raw);
  if (!has(parsed, field, value)) return { raw, extra: nextExtra };

  const candidates = [
    ...parsed.spans.filter((s) => s.field === field),
    ...(field === "cities" ? parsed.spans.filter((s) => s.field === "region") : []),
  ];
  for (const span of candidates) {
    const nextRaw = cut(raw, span.start, span.end);
    const after = parseQuery(nextRaw);
    if (has(after, field, value)) continue;
    nextExtra = addExtra(nextExtra, withoutValue(lost(parsed, after), field, value));
    return { raw: nextRaw, extra: nextExtra };
  }
  // No span accounts for it (should not happen with a well-formed parse):
  // leave the text alone rather than guess which words to delete.
  return { raw, extra: nextExtra };
}

/** Remove a region chip: its words go, and so do the cities it stood for. */
export function removeRegion(raw: string, extra: Extra): { raw: string; extra: Extra } {
  const parsed = parseQuery(raw);
  const spans = parsed.spans.filter((s) => s.field === "region");
  if (!spans.length) return { raw, extra };
  const nextRaw = cutSpans(raw, spans);
  const after = parseQuery(nextRaw);
  const gone = lost(parsed, after);
  gone.cities = [];
  return { raw: nextRaw, extra: addExtra(extra, gone) };
}

/** Cities that the region in the text stands for (they vanish when the region's words do). */
export function regionCities(raw: string, parsed: ParsedQuery): string[] {
  if (!parsed.region) return [];
  const spans = parsed.spans.filter((s) => s.field === "region");
  if (!spans.length) return [];
  const after = parseQuery(cutSpans(raw, spans));
  return parsed.cities.filter((c) => !after.cities.includes(c));
}

/** Set a scalar from the panel: the typed value for that field, if any, is cut first. */
export function setScalar(
  raw: string,
  extra: Extra,
  field: ScalarField,
  value: number | null,
): { raw: string; extra: Extra } {
  const parsed = parseQuery(raw);
  let next = { raw, extra };
  if (parsed[field] !== null) next = removeValue(raw, extra, field, parsed[field] as number);
  return { raw: next.raw, extra: { ...next.extra, [field]: value } };
}

/** Toggle a list value from the panel. */
export function toggleList(
  raw: string,
  extra: Extra,
  merged: ParsedQuery,
  field: ListField,
  value: string,
): { raw: string; extra: Extra } {
  if ((merged[field] as string[]).includes(value)) return removeValue(raw, extra, field, value);
  return { raw, extra: { ...extra, [field]: [...(extra[field] as string[]), value] } };
}

/* -------------------------------------------------------------- pages ---- */

const PAGE_KEYS = SEARCH_PAGES.map((page) => ({ id: page.id, keys: page.keywords.map(normalize) }));

function matchesKey(word: string, key: string): boolean {
  if (word === key) return true;
  if (word.length >= 5 && key.startsWith(word)) return true;
  return key.length >= 5 && word.startsWith(key);
}

/** The site pages the words call for, and the words that called them (so they are not also matched against programme names). */
export function matchPages(raw: string): { ids: string[]; words: Set<string> } {
  const ws = words(raw);
  const folded = ` ${ws.join(" ")} `;
  const ids: string[] = [];
  const used = new Set<string>();
  for (const page of PAGE_KEYS) {
    // Phrases ("rendez vous", "qui sommes nous") match whole and take all
    // their words with them; single keywords match by word or prefix.
    const phrases = page.keys.filter((k) => k.includes(" ") && folded.includes(` ${k} `));
    // Through the parser's word forms: "القرض" is "قرض", "والشراء" is "شراء".
    const hit = ws.filter((w) => wordForms(w).some((f) => page.keys.some((k) => !k.includes(" ") && matchesKey(f, k))));
    if (hit.length || phrases.length) {
      ids.push(page.id);
      hit.forEach((w) => used.add(w));
      phrases.forEach((k) => k.split(" ").forEach((w) => used.add(w)));
    }
  }
  return { ids, words: used };
}
