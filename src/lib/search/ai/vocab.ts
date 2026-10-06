import { projects } from "../../../data/projects.ts";
import { AMENITIES, SEGMENTS, type Amenity, type Kind, type Segment } from "../../../data/types.ts";
import { hasStatusFacet, STATUS_FACETS, type StatusFacet } from "../../status-facets.ts";
import { REGION_CITIES } from "../lexicon.ts";
import type { RegionId } from "../types.ts";
import type { AiCriterionKey } from "./types.ts";

/**
 * The closed vocabularies of the AI answer, generated from the data — the
 * enums of the JSON schema Gemini decodes against (so it cannot name a
 * programme, a city or an amenity that does not exist) and the sets the
 * validator checks every value against. Server-side: it reads the portfolio.
 *
 * Each list is in the data's own order, so the schema (and the cached prompt
 * prefix built beside it) is byte-identical from one request to the next.
 */

function present<T extends string>(all: readonly T[], has: (value: T) => boolean): T[] {
  return all.filter(has);
}

export const AI_SLUGS: string[] = projects.map((p) => p.slug);

/** The cities that have a programme, first-appearance order. */
export const AI_CITY_IDS: string[] = [...new Set(projects.map((p) => p.cityId))];

export const AI_REGION_IDS = Object.keys(REGION_CITIES) as RegionId[];

export const AI_SEGMENTS: Segment[] = present(SEGMENTS, (s) => projects.some((p) => p.segment === s));

/** The kinds the /projets URL carries (`type=`); land is the "terrain" segment. */
export const AI_KINDS: Kind[] = (["appartement", "studio", "villa"] as const).filter((k) =>
  projects.some((p) => p.kinds.includes(k)),
);

export const AI_STATUSES: StatusFacet[] = present(STATUS_FACETS, (f) => projects.some((p) => hasStatusFacet(p, f)));

export const AI_AMENITIES: Amenity[] = present(AMENITIES, (a) => projects.some((p) => p.amenities.includes(a)));

export const AI_CRITERIA: AiCriterionKey[] = [
  "city",
  "region",
  "budget",
  "monthly",
  "bedrooms",
  "segment",
  "kind",
  "status",
  "amenity",
  "surface",
  "name",
  "location",
  "other",
];

export type Vocabulary = {
  slugs: ReadonlySet<string>;
  cities: ReadonlySet<string>;
  regions: ReadonlySet<string>;
  segments: ReadonlySet<string>;
  kinds: ReadonlySet<string>;
  statuses: ReadonlySet<string>;
  amenities: ReadonlySet<string>;
  criteria: ReadonlySet<string>;
};

export const VOCABULARY: Vocabulary = {
  slugs: new Set(AI_SLUGS),
  cities: new Set(AI_CITY_IDS),
  regions: new Set(AI_REGION_IDS),
  segments: new Set(AI_SEGMENTS),
  kinds: new Set(AI_KINDS),
  statuses: new Set(AI_STATUSES),
  amenities: new Set(AI_AMENITIES),
  criteria: new Set(AI_CRITERIA),
};
