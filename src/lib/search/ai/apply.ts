import { REGION_CITIES } from "../lexicon.ts";
import type { ParsedQuery, SearchDoc } from "../types.ts";
import { evaluate, type Constraints } from "./criteria.ts";
import type { AiAnswer, AiFilters } from "./types.ts";

/**
 * Putting the AI's reading of a query beside the parser's. One rule
 * everywhere (the validator, the ticks, the chips, the /projets link): what
 * the visitor typed — or picked — is the source of truth; the AI only fills
 * the fields the instant parse left empty ("pour une famille" → 3 chambres,
 * écoles). Pure, node-importable, client-safe.
 */

const LIST_FIELDS = ["segments", "kinds", "statuses", "amenities"] as const;
const SCALAR_FIELDS = ["bedroomsMin", "priceMax", "monthlyMax"] as const;

function aiPlaces(filters: AiFilters): Pick<ParsedQuery, "cities" | "region"> {
  if (filters.cities.length > 0) return { cities: [...filters.cities], region: filters.region };
  if (filters.region) return { cities: [...REGION_CITIES[filters.region]], region: filters.region };
  return { cities: [], region: null };
}

/** The query with the AI's values in every field the visitor left empty. */
export function mergeAiFilters(query: ParsedQuery, filters: AiFilters | null): ParsedQuery {
  if (!filters) return query;
  const next: ParsedQuery = { ...query };
  if (query.cities.length === 0) Object.assign(next, aiPlaces(filters));
  for (const f of SCALAR_FIELDS) if (query[f] === null) next[f] = filters[f];
  if (query.segments.length === 0) next.segments = [...filters.segments];
  if (query.kinds.length === 0) next.kinds = [...filters.kinds];
  if (query.statuses.length === 0) next.statuses = [...filters.statuses];
  if (query.amenities.length === 0) next.amenities = [...filters.amenities];
  return next;
}

/**
 * Only what the AI added — the values a UI marks "IA" (removable like any
 * chip). Empty fields everywhere the visitor's own words already decided.
 */
export function inferredFilters(query: ParsedQuery, filters: AiFilters | null): AiFilters {
  const none: AiFilters = {
    cities: [],
    region: null,
    bedroomsMin: null,
    priceMax: null,
    monthlyMax: null,
    segments: [],
    kinds: [],
    statuses: [],
    amenities: [],
  };
  if (!filters) return none;
  const merged = mergeAiFilters(query, filters);
  const out = { ...none };
  if (query.cities.length === 0) {
    out.cities = merged.cities;
    out.region = merged.region;
  }
  for (const f of SCALAR_FIELDS) if (query[f] === null) out[f] = merged[f];
  for (const f of LIST_FIELDS) if (query[f].length === 0) (out[f] as string[]) = [...merged[f]];
  return out;
}

export function hasAnyFilter(filters: AiFilters): boolean {
  return (
    filters.cities.length > 0 ||
    filters.region !== null ||
    SCALAR_FIELDS.some((f) => filters[f] !== null) ||
    LIST_FIELDS.some((f) => filters[f].length > 0)
  );
}

/** Least important first — the order the ranker relaxes in (rank.ts). */
const RELAX: Array<keyof Constraints> = [
  "amenities",
  "bedroomsMin",
  "kinds",
  "segments",
  "statuses",
  "cities",
  "monthlyMax",
  "priceMax",
];

function cleared(query: ParsedQuery, field: keyof Constraints): ParsedQuery {
  if (field === "cities") return { ...query, cities: [], region: null };
  if (field === "region") return { ...query, region: null };
  if (field === "bedroomsMin" || field === "priceMax" || field === "monthlyMax") return { ...query, [field]: null };
  return { ...query, [field]: [] };
}

/**
 * The query to write into the /projets URL for an answer: the visitor's
 * values plus the AI's, minus any AI-inferred value that would hide one of the
 * programmes the AI called an exact fit (the list must show what the
 * concierge just recommended). The visitor's own values are never dropped.
 */
export function projetsQuery(query: ParsedQuery, answer: AiAnswer | null, docs: SearchDoc[]): ParsedQuery {
  if (!answer) return query;
  let next = mergeAiFilters(query, answer.filters);
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const exact = answer.results.filter((r) => r.fit === "exact").map((r) => bySlug.get(r.slug)).filter((d) => d !== undefined);
  const inferred = inferredFilters(query, answer.filters);
  for (const field of RELAX) {
    if (exact.every((doc) => evaluate(doc, next).every((c) => c.ok))) break;
    const fromAi = field === "cities" ? inferred.cities.length > 0 : hasValue(inferred, field);
    if (fromAi) next = cleared(next, field);
  }
  return next;
}

function hasValue(filters: AiFilters, field: keyof Constraints): boolean {
  const v = filters[field as keyof AiFilters];
  return Array.isArray(v) ? v.length > 0 : v !== null;
}

/**
 * The programme an answer is about, when it is about exactly one: a single
 * exact result, or a question ("le moins cher à Marrakech ?") whose answer has a
 * single exact fit at the top. /projets opens it directly.
 */
export function answerProgramme(answer: AiAnswer | null): string | null {
  if (!answer || answer.results.length === 0) return null;
  // A single programme the concierge only calls close ("appartement à Agadir moins de 300 000" →
  // Assafa, in Had Soualem) is not opened directly: the list says what was widened.
  if (answer.results.length === 1) return answer.results[0].fit === "exact" ? answer.results[0].slug : null;
  const exact = answer.results.filter((r) => r.fit === "exact");
  if (answer.intent === "question" && exact.length === 1 && answer.results[0].fit === "exact") return exact[0].slug;
  return null;
}
