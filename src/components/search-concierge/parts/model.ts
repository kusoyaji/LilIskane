import { projectCopy, STATUS_LABELS, statusText, AMENITY_LABELS, KIND_LABELS, SEGMENT_LABELS } from "@/content/projects";
import type { searchCopy } from "@/content/search";
import type { Segment } from "@/data/types";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { DEFAULT_DEPOSIT, maxAffordablePrice } from "@/lib/credit";
import { parseQuery, searchDocs, type ParsedQuery, type QuerySpan, type SearchDoc, type SearchOutcome } from "@/lib/search";
import { admitRows, orderWithAi, type RankedRow } from "@/lib/search/ai/merge";
import type { AiAnswer } from "@/lib/search/ai/types";
import { REGION_CITIES, UNSERVED_CITIES } from "@/lib/search/lexicon";
import { STATUS_FACETS, type StatusFacet } from "@/lib/status-facets";
import {
  merge,
  regionCities,
  removeRegion,
  removeValue,
  setScalar,
  toggleList,
  type Extra,
  type ListField,
  type ScalarField,
  type ValueField,
} from "../query-state";

/**
 * The concierge's shared model — pure functions used by both search surfaces
 * (the header overlay and the home's hero): how the AI's reading of the text
 * folds into the instant query, which programmes to show and in what order,
 * the chips, the filter groups and the understood-word underline.
 *
 * The rules, in one place so both surfaces behave identically:
 * - The instant engine (`@/lib/search`) answers every keystroke.
 * - The AI, when it has answered *this exact text*, only fills the fields the
 *   visitor left empty, never a value the visitor removed, and its picks come
 *   first in the order. A pick outside the instant results is shown only when
 *   it satisfies everything the visitor picked by hand (map, budget, panel) —
 *   a hand-picked value is a hard constraint, a model's reading is not — and
 *   a "close" pick only when the result was widened anyway (admitRows).
 */

type C = (typeof searchCopy)["fr"];

/* ------------------------------------------------------------ labels ---- */

export function statusFacetLabel(facet: StatusFacet, locale: Locale): string {
  if (facet === "immediate") return projectCopy[locale].readyNow;
  if (facet === "imminente") return statusText({ status: "en-construction", readySoon: true }, locale);
  return STATUS_LABELS[facet][locale];
}

/* ---------------------------------------------------------------- AI ---- */

export type ChipField = ValueField | "region";

/** Identity of one value the AI added, so the visitor can dismiss it. */
export const aiKey = (field: ChipField, value: string | number): string => `${field}:${value}`;

/**
 * The visitor's query with the AI's filters folded in: a field the visitor
 * already constrained is theirs; an empty one may be filled by the AI, minus
 * anything dismissed.
 */
export function withAiFilters(user: ParsedQuery, answer: AiAnswer | null, dismissed: ReadonlySet<string>): ParsedQuery {
  if (!answer) return user;
  const f = answer.filters;
  const out: ParsedQuery = { ...user };
  if (user.segments.length === 0) out.segments = f.segments.filter((v) => !dismissed.has(aiKey("segments", v)));
  if (user.kinds.length === 0) out.kinds = f.kinds.filter((v) => !dismissed.has(aiKey("kinds", v)));
  if (user.statuses.length === 0) out.statuses = f.statuses.filter((v) => !dismissed.has(aiKey("statuses", v)));
  if (user.amenities.length === 0) out.amenities = f.amenities.filter((v) => !dismissed.has(aiKey("amenities", v)));
  if (user.cities.length === 0 && user.region === null) {
    const region = f.region && !dismissed.has(aiKey("region", f.region)) ? f.region : null;
    const cities = new Set(f.cities.filter((v) => !dismissed.has(aiKey("cities", v))));
    if (region) for (const id of REGION_CITIES[region] ?? []) cities.add(id);
    out.cities = [...cities];
    out.region = region;
  }
  const scalars: ScalarField[] = ["bedroomsMin", "priceMax", "monthlyMax"];
  for (const field of scalars) {
    const v = f[field];
    if (user[field] === null && v !== null && !dismissed.has(aiKey(field, v))) out[field] = v;
  }
  return out;
}

/** Everything the visitor picked by hand, checked directly against one programme. */
export function passesPicked(doc: SearchDoc, extra: Extra): boolean {
  if (extra.cities.length && !extra.cities.includes(doc.cityId)) return false;
  if (extra.segments.length && !extra.segments.includes(doc.segment)) return false;
  if (extra.kinds.length && !doc.kinds.some((k) => extra.kinds.includes(k))) return false;
  if (extra.statuses.length && !doc.statuses.some((st) => extra.statuses.includes(st))) return false;
  if (extra.amenities.some((a) => !doc.amenities.includes(a))) return false;
  if (extra.bedroomsMin !== null && doc.bedroomsMax < extra.bedroomsMin) return false;
  if (extra.priceMax !== null && doc.price > extra.priceMax) return false;
  if (extra.monthlyMax !== null && doc.price > maxAffordablePrice(extra.monthlyMax, DEFAULT_DEPOSIT)) return false;
  return true;
}

export type Resolved = {
  /** What the ranker saw: the visitor's query plus the AI's filters. */
  query: ParsedQuery;
  outcome: SearchOutcome;
  /** Display order — the one list every count on the page is taken from. */
  rows: RankedRow[];
};

export function resolveSearch(
  docs: SearchDoc[],
  user: ParsedQuery,
  extra: Extra,
  answer: AiAnswer | null,
  dismissed: ReadonlySet<string>,
): Resolved {
  const query = withAiFilters(user, answer, dismissed);
  const outcome = searchDocs(docs, query);
  const hit = new Set(outcome.hits.map((h) => h.doc.slug));
  const rows = admitRows(orderWithAi(docs, outcome.hits, answer), hit, outcome.exact, (doc) => passesPicked(doc, extra));
  return { query, outcome, rows };
}

/* ------------------------------------------------------- state moves ---- */

export type QueryState = { raw: string; extra: Extra };

/** Show one city (the map): typed places are cut so the city replaces them instead of adding to them. */
export function withCity({ raw, extra }: QueryState, cityId: string | null): QueryState {
  let next: QueryState = { raw, extra };
  if (parseQuery(next.raw).region) next = removeRegion(next.raw, next.extra);
  for (const id of parseQuery(next.raw).cities) next = removeValue(next.raw, next.extra, "cities", id);
  return { raw: next.raw, extra: { ...next.extra, cities: cityId ? [cityId] : [] } };
}

/**
 * Set a price ceiling (the budget finder): it replaces any typed price, and a
 * monthly ceiling too — the finder's figure already accounts for the payment.
 */
export function withPriceCeiling({ raw, extra }: QueryState, price: number | null): QueryState {
  let next: QueryState = setScalar(raw, extra, "priceMax", price);
  const typedMonthly = parseQuery(next.raw).monthlyMax;
  if (typedMonthly !== null) next = removeValue(next.raw, next.extra, "monthlyMax", typedMonthly);
  return { raw: next.raw, extra: { ...next.extra, monthlyMax: null } };
}

/* -------------------------------------------------------------- chips ---- */

export type ChipModel = {
  key: string;
  label: string;
  field: ChipField;
  value: string | number;
  /** Added by the AI, not by the visitor's words or picks. */
  ai: boolean;
};

export function buildChips({
  user,
  final,
  raw,
  parsed,
  extra,
  locale,
  c,
  cityName,
  priceLabel = null,
}: {
  user: ParsedQuery;
  final: ParsedQuery;
  raw: string;
  parsed: ParsedQuery;
  extra: Extra;
  locale: Locale;
  c: C;
  cityName: (id: string) => string;
  /** A label for a price ceiling picked elsewhere (the budget finder's "≤ … DH · … DH/mois"). */
  priceLabel?: string | null;
}): ChipModel[] {
  const out: ChipModel[] = [];
  const isAi = (field: ChipField, value: string | number) => {
    if (field === "region") return user.region !== value;
    const v = user[field];
    return Array.isArray(v) ? !(v as Array<string | number>).includes(value) : v !== value;
  };
  const push = (field: ChipField, value: string | number, label: string) =>
    out.push({ key: `${field}-${value}`, label, field, value, ai: isAi(field, value) });

  const coveredByRegion = new Set<string>([
    ...(user.region ? regionCities(raw, parsed) : []),
    ...(final.region && user.region === null ? (REGION_CITIES[final.region] ?? []) : []),
  ]);
  if (final.region) push("region", final.region, c.regions[final.region]);
  for (const id of final.cities) if (!coveredByRegion.has(id)) push("cities", id, cityName(id));
  for (const kind of final.kinds) push("kinds", kind, KIND_LABELS[kind][locale]);
  for (const seg of final.segments) push("segments", seg, SEGMENT_LABELS[seg][locale]);
  if (final.bedroomsMin !== null) {
    const n = final.bedroomsMin;
    push("bedroomsMin", n, c.bedroomsChip(n, isolateRun(String(n), locale)));
  }
  if (final.priceMax !== null) {
    const v = final.priceMax;
    const picked = parsed.priceMax === null && extra.priceMax === v;
    push("priceMax", v, picked && priceLabel ? priceLabel : c.priceChip(formatNumber(v, locale)));
  }
  if (final.monthlyMax !== null) push("monthlyMax", final.monthlyMax, c.monthlyChip(formatNumber(final.monthlyMax, locale)));
  for (const st of final.statuses) push("statuses", st, statusFacetLabel(st, locale));
  for (const a of final.amenities) push("amenities", a, AMENITY_LABELS[a][locale]);
  return out;
}

/**
 * Remove one chip. A value from the visitor's words or picks goes the usual
 * way (its words are cut — query-state.ts); every removal is also remembered
 * as dismissed, so the AI cannot put the same value straight back.
 */
export function removeChip(
  chip: ChipModel,
  state: QueryState,
  dismissed: ReadonlySet<string>,
): QueryState & { dismissed: Set<string> } {
  const nextDismissed = new Set(dismissed);
  nextDismissed.add(aiKey(chip.field, chip.value));
  if (chip.ai) return { ...state, dismissed: nextDismissed };
  if (chip.field === "region") {
    for (const id of regionCities(state.raw, parseQuery(state.raw))) nextDismissed.add(aiKey("cities", id));
    return { ...removeRegion(state.raw, state.extra), dismissed: nextDismissed };
  }
  return { ...removeValue(state.raw, state.extra, chip.field, chip.value), dismissed: nextDismissed };
}

/* ------------------------------------------------------------- facets ---- */

export type FacetChip = {
  key: string;
  label: string;
  count: number;
  on: boolean;
  toggle: () => QueryState;
};
export type FacetGroup = { id: "city" | "standing" | "status" | "bedrooms" | "budget" | "monthly"; title: string; chips: FacetChip[] };

export const BUDGET_PRESETS = [600_000, 900_000, 1_500_000];
export const MONTHLY_PRESETS = [4_000, 6_000];
export const BEDROOM_PRESETS = [1, 2, 3, 4];

/**
 * The filter groups shown beside (overlay) or under (home) the field, with
 * the count each choice would give: a list value narrows the current query
 * to that value, a scalar replaces the current one.
 */
export function buildFacetGroups({
  docs,
  query,
  raw,
  extra,
  locale,
  c,
  cityName,
}: {
  docs: SearchDoc[];
  query: ParsedQuery;
  raw: string;
  extra: Extra;
  locale: Locale;
  c: C;
  cityName: (id: string) => string;
}): FacetGroup[] {
  const count = (q: ParsedQuery) => {
    const result = searchDocs(docs, q);
    return result.exact ? result.hits.length : 0;
  };
  const cityIds = [...new Set(docs.map((doc) => doc.cityId))].sort((a, b) => cityName(a).localeCompare(cityName(b), locale));
  const list = (field: ListField, values: string[], label: (v: string) => string, extraQ: Partial<ParsedQuery> = {}): FacetChip[] =>
    values.map((value) => ({
      key: `${field}-${value}`,
      label: label(value),
      count: count({ ...query, [field]: [value], ...extraQ }),
      on: (query[field] as string[]).includes(value),
      toggle: () => toggleList(raw, extra, merge(parseQuery(raw), extra), field, value),
    }));
  const scalar = (field: ScalarField, values: number[], label: (v: number) => string): FacetChip[] =>
    values.map((value) => {
      const on = query[field] === value;
      return {
        key: `${field}-${value}`,
        label: label(value),
        count: count({ ...query, [field]: value }),
        on,
        toggle: () => (on ? removeValue(raw, extra, field, value) : setScalar(raw, extra, field, value)),
      };
    });
  const segments = (["haut-standing", "moyen-standing", "economique", "terrain"] as Segment[]).filter((seg) =>
    docs.some((doc) => doc.segment === seg),
  );
  const statuses = STATUS_FACETS.filter((st) => docs.some((doc) => doc.statuses.includes(st)));
  return [
    { id: "city", title: c.filterCity, chips: list("cities", cityIds, cityName, { region: null }) },
    { id: "standing", title: c.filterStanding, chips: list("segments", segments, (v) => SEGMENT_LABELS[v as Segment][locale]) },
    { id: "status", title: c.filterStatus, chips: list("statuses", statuses, (v) => statusFacetLabel(v as StatusFacet, locale)) },
    { id: "bedrooms", title: c.filterBedrooms, chips: scalar("bedroomsMin", BEDROOM_PRESETS, (n) => isolateRun(`${n}+`, locale)) },
    { id: "budget", title: c.filterBudget, chips: scalar("priceMax", BUDGET_PRESETS, (v) => c.priceChip(formatNumber(v, locale))) },
    { id: "monthly", title: c.filterMonthly, chips: scalar("monthlyMax", MONTHLY_PRESETS, (v) => c.monthlyChip(formatNumber(v, locale))) },
  ];
}

/** What was widened when nothing matched everything, in words ("Les plus proches, en élargissant : budget."). */
export function relaxedSentence(outcome: SearchOutcome, c: C): string | null {
  if (outcome.exact) return null;
  const fields = (outcome.relaxed as string[]).map((f) => c.relaxedFields[f]).filter(Boolean);
  return fields.length ? c.relaxedWidened(fields.join(c.listJoin)) : c.relaxedClosest;
}

/* ------------------------------------------------------ understood words ---- */

/** The raw text cut into runs, the understood ones marked — for the underline layer under a field. */
export function markParts(raw: string, spans: QuerySpan[]): Array<{ text: string; mark: boolean }> {
  const ranges = [...spans]
    .filter((span) => span.end > span.start && span.end <= raw.length)
    .sort((a, b) => a.start - b.start)
    .reduce<Array<[number, number]>>((acc, span) => {
      const last = acc[acc.length - 1];
      if (last && span.start <= last[1]) last[1] = Math.max(last[1], span.end);
      else acc.push([span.start, span.end]);
      return acc;
    }, []);
  const parts: Array<{ text: string; mark: boolean }> = [];
  let at = 0;
  for (const [a, b] of ranges) {
    if (a > at) parts.push({ text: raw.slice(at, a), mark: false });
    parts.push({ text: raw.slice(a, b), mark: true });
    at = b;
  }
  if (at < raw.length) parts.push({ text: raw.slice(at), mark: false });
  return parts;
}

/** City names from the docs (both scripts are there), falling back to the id. */
export function cityNamer(docs: SearchDoc[] | null, locale: Locale): (id: string) => string {
  const names = new Map<string, string>();
  for (const doc of docs ?? []) names.set(doc.cityId, doc.city[locale]);
  return (id) => names.get(id) ?? UNSERVED_CITIES[id]?.[locale] ?? id;
}
