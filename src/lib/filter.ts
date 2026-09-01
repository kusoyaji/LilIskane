import { maxAffordablePrice } from "./credit";
import { effectiveTotal } from "./format";
import { projects } from "@/data/projects";
import type { Amenity, Project, Segment, Status } from "@/data/types";

/**
 * Search state, and the only place it is turned into and out of a URL.
 *
 * Every filter lives in the query string so a search is a link. That is not a
 * nicety here: a couple comparing projects will send each other the URL, and an
 * MRE buyer will mail it to family in Casablanca to go and look.
 */
export type Filters = {
  /** Maximum monthly payment in DH. The primary axis. */
  budget: number | null;
  deposit: number;
  city: string | null;
  segments: Segment[];
  bedrooms: number | null;
  surfaceMin: number | null;
  statuses: Status[];
  amenities: Amenity[];
};

export const DEFAULT_DEPOSIT = 150_000;

export const EMPTY_FILTERS: Filters = {
  budget: null,
  deposit: DEFAULT_DEPOSIT,
  city: null,
  segments: [],
  bedrooms: null,
  surfaceMin: null,
  statuses: [],
  amenities: [],
};

/** Query-string keys are French because the URLs are user-facing. */
export function toSearchParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.budget) params.set("mensualite", String(filters.budget));
  if (filters.deposit !== DEFAULT_DEPOSIT) params.set("apport", String(filters.deposit));
  if (filters.city) params.set("ville", filters.city);
  if (filters.segments.length) params.set("standing", filters.segments.join(","));
  if (filters.bedrooms) params.set("chambres", String(filters.bedrooms));
  if (filters.surfaceMin) params.set("surface", String(filters.surfaceMin));
  if (filters.statuses.length) params.set("statut", filters.statuses.join(","));
  if (filters.amenities.length) params.set("equipements", filters.amenities.join(","));
  return params;
}

export function fromSearchParams(params: URLSearchParams | Record<string, string | string[] | undefined>): Filters {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(key);
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  };
  const list = <T extends string>(key: string): T[] => {
    const raw = get(key);
    return raw ? (raw.split(",").filter(Boolean) as T[]) : [];
  };
  const num = (key: string): number | null => {
    const raw = get(key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  return {
    budget: num("mensualite"),
    deposit: num("apport") ?? DEFAULT_DEPOSIT,
    city: get("ville"),
    segments: list<Segment>("standing"),
    bedrooms: num("chambres"),
    surfaceMin: num("surface"),
    statuses: list<Status>("statut"),
    amenities: list<Amenity>("equipements"),
  };
}

/** Which facets are actually narrowing the result, for the "relaxed" notice. */
export type FacetKey = "amenities" | "surfaceMin" | "bedrooms" | "segments" | "statuses" | "city" | "budget";

function matches(project: Project, filters: Filters, ignore: Set<FacetKey>): boolean {
  if (!ignore.has("budget") && filters.budget) {
    const ceiling = maxAffordablePrice(filters.budget, filters.deposit);
    if (effectiveTotal(project.price) > ceiling) return false;
  }
  if (!ignore.has("city") && filters.city && project.cityId !== filters.city) return false;
  if (!ignore.has("segments") && filters.segments.length && !filters.segments.includes(project.segment)) {
    return false;
  }
  if (!ignore.has("statuses") && filters.statuses.length && !filters.statuses.includes(project.status)) {
    return false;
  }
  if (!ignore.has("bedrooms") && filters.bedrooms && project.bedroomsMax < filters.bedrooms) return false;
  if (!ignore.has("surfaceMin") && filters.surfaceMin && project.surfaceMax < filters.surfaceMin) return false;
  if (!ignore.has("amenities") && filters.amenities.length) {
    const has = new Set(project.amenities);
    if (!filters.amenities.every((a) => has.has(a))) return false;
  }
  return true;
}

/**
 * Relaxation order: least meaningful constraint dropped first.
 *
 * Budget is last precisely because it is the one people care most about — by
 * the time we are widening it we have exhausted everything else, and the notice
 * says so explicitly rather than silently returning results they cannot afford.
 */
const RELAX_ORDER: FacetKey[] = [
  "amenities",
  "surfaceMin",
  "bedrooms",
  "segments",
  "statuses",
  "city",
  "budget",
];

export type SearchResult = {
  projects: Project[];
  /** Facets that had to be widened to return anything. Empty on an exact match. */
  relaxed: FacetKey[];
};

/**
 * Never returns an empty list while any project exists.
 *
 * A zero-result state is a dead end, and a dead end on the only route into the
 * portfolio is the most expensive failure this page can have. We widen, and we
 * tell the user exactly what we widened.
 */
export function search(filters: Filters, source: Project[] = projects): SearchResult {
  const ignore = new Set<FacetKey>();

  for (let step = 0; step <= RELAX_ORDER.length; step += 1) {
    const found = source.filter((project) => matches(project, filters, ignore));
    if (found.length > 0) {
      return { projects: found, relaxed: [...ignore] };
    }
    const next = RELAX_ORDER[step];
    if (!next) break;
    ignore.add(next);
  }

  return { projects: source, relaxed: [...ignore] };
}

/** Count for one facet value, computed with that facet's own selection removed. */
export function facetCount(
  filters: Filters,
  facet: FacetKey,
  predicate: (project: Project) => boolean,
  source: Project[] = projects,
): number {
  const ignore = new Set<FacetKey>([facet]);
  return source.filter((project) => matches(project, filters, ignore) && predicate(project)).length;
}
