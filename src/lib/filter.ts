import { DEFAULT_DEPOSIT, maxAffordablePrice } from "./credit.ts";
import { projects } from "../data/projects.ts";
import { KINDS, type Amenity, type Kind, type Price, type Project, type Segment } from "../data/types.ts";
import { hasStatusFacet, STATUS_FACETS, type StatusFacet } from "./status-facets.ts";

/*
 * Relative imports with explicit extensions, on purpose: `filter.test.ts`
 * runs this module under `node --test`, which resolves neither the `@/` alias
 * nor extensionless paths (same rule as src/lib/search/*).
 */

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
  /**
   * City ids, OR-combined. Usually zero or one (the city select, a map pin);
   * several when a search named a region ("près de Casablanca" →
   * mohammedia, had-soualem, sidi-rahal).
   */
  cities: string[];
  /** Ceiling on the entry price in DH — the smallest lot's total for land. */
  priceMax: number | null;
  segments: Segment[];
  /** Kinds of home (villa, studio, appartement…), OR-combined. */
  kinds: Kind[];
  bedrooms: number | null;
  surfaceMin: number | null;
  statuses: StatusFacet[];
  amenities: Amenity[];
};

export { hasStatusFacet, STATUS_FACETS, type StatusFacet };

export { DEFAULT_DEPOSIT };

export const EMPTY_FILTERS: Filters = {
  budget: null,
  deposit: DEFAULT_DEPOSIT,
  cities: [],
  priceMax: null,
  segments: [],
  kinds: [],
  bedrooms: null,
  surfaceMin: null,
  statuses: [],
  amenities: [],
};

/**
 * Entry price in DH: the published "à partir de", or the smallest lot's total
 * for land quoted per m². The same rule as `effectiveTotal` in lib/format.ts
 * (not imported: that module reaches the `@/` alias, which `node --test`
 * cannot resolve) and `entryPrice` in lib/search/docs.ts.
 */
function entryPrice(price: Price): number {
  return price.unit === "per-sqm" ? price.amount * (price.minimumLotSqm ?? 1) : price.amount;
}

/**
 * Query-string keys are French because the URLs are user-facing. The key
 * order is the one `toProjetsHref` (lib/search/link.ts) writes, so a link
 * from the concierge search and the URL the page settles on read the same.
 */
export function toSearchParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.cities.length) params.set("ville", filters.cities.join(","));
  if (filters.priceMax) params.set("prix", String(filters.priceMax));
  if (filters.budget) params.set("mensualite", String(filters.budget));
  if (filters.deposit !== DEFAULT_DEPOSIT) params.set("apport", String(filters.deposit));
  if (filters.segments.length) params.set("standing", filters.segments.join(","));
  if (filters.kinds.length) params.set("type", filters.kinds.join(","));
  if (filters.bedrooms) params.set("chambres", String(filters.bedrooms));
  if (filters.surfaceMin) params.set("surface", String(filters.surfaceMin));
  if (filters.statuses.length) params.set("statut", filters.statuses.join(","));
  if (filters.amenities.length) params.set("equipements", filters.amenities.join(","));
  return params;
}

/** `toSearchParams`, with list commas left as commas so a shared link stays legible. */
export function toQueryString(filters: Filters): string {
  return toSearchParams(filters).toString().replace(/%2C/gi, ",");
}

export function fromSearchParams(params: URLSearchParams | Record<string, string | string[] | undefined>): Filters {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(key);
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  };
  const list = <T extends string>(key: string): T[] => {
    const raw = get(key);
    if (!raw) return [];
    // Trimmed and de-duplicated: "ville=temara, temara" is one city.
    return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))] as T[];
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
    cities: list<string>("ville"),
    priceMax: num("prix"),
    segments: list<Segment>("standing"),
    kinds: list<Kind>("type").filter((v) => (KINDS as readonly string[]).includes(v)),
    bedrooms: num("chambres"),
    surfaceMin: num("surface"),
    statuses: list<StatusFacet>("statut").filter((v) => (STATUS_FACETS as readonly string[]).includes(v)),
    amenities: list<Amenity>("equipements"),
  };
}

/** Which facets are actually narrowing the result, for the "relaxed" notice. */
export type FacetKey =
  | "amenities"
  | "surfaceMin"
  | "bedrooms"
  | "kinds"
  | "segments"
  | "statuses"
  | "city"
  | "budget"
  | "price";

function matches(project: Project, filters: Filters, ignore: Set<FacetKey>): boolean {
  if (!ignore.has("price") && filters.priceMax && entryPrice(project.price) > filters.priceMax) return false;
  if (!ignore.has("budget") && filters.budget) {
    const ceiling = maxAffordablePrice(filters.budget, filters.deposit);
    if (entryPrice(project.price) > ceiling) return false;
  }
  if (!ignore.has("city") && filters.cities.length && !filters.cities.includes(project.cityId)) return false;
  if (!ignore.has("segments") && filters.segments.length && !filters.segments.includes(project.segment)) {
    return false;
  }
  if (!ignore.has("kinds") && filters.kinds.length && !filters.kinds.some((k) => project.kinds.includes(k))) {
    return false;
  }
  if (!ignore.has("statuses") && filters.statuses.length && !filters.statuses.some((f) => hasStatusFacet(project, f))) {
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
 * Money is last precisely because it is what people care most about — by the
 * time we are widening it we have exhausted everything else, and the notice
 * says so explicitly rather than silently returning results they cannot
 * afford. The monthly payment goes before the price ceiling: the price is the
 * harder number (a figure the visitor typed), the payment an estimate that
 * already depends on an assumed deposit.
 */
export const RELAX_ORDER: readonly FacetKey[] = [
  "amenities",
  "surfaceMin",
  "bedrooms",
  "kinds",
  "segments",
  "statuses",
  "city",
  "budget",
  "price",
];

/** Whether the visitor set this facet at all — the relaxation steps past unset ones too. */
export function isActive(filters: Filters, facet: FacetKey): boolean {
  switch (facet) {
    case "amenities":
      return filters.amenities.length > 0;
    case "surfaceMin":
      return filters.surfaceMin !== null;
    case "bedrooms":
      return filters.bedrooms !== null;
    case "kinds":
      return filters.kinds.length > 0;
    case "segments":
      return filters.segments.length > 0;
    case "statuses":
      return filters.statuses.length > 0;
    case "city":
      return filters.cities.length > 0;
    case "budget":
      return filters.budget !== null;
    case "price":
      return filters.priceMax !== null;
  }
}

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
