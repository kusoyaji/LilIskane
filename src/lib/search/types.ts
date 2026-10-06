import type { Amenity, Kind, Segment } from "../../data/types.ts";
import type { StatusFacet } from "../status-facets.ts";

/**
 * The concierge search — shared contract.
 *
 * One `SearchDoc` per programme, built on the server in the page's locale
 * (`buildDocs`) and fetched by the overlay as static JSON from
 * `/api/search/<locale>` the first time it is wanted. The parser and ranker
 * are pure functions over these shapes, so they run identically in the
 * browser, on the server and under `node --test`.
 */
export type SearchDoc = {
  slug: string;
  /** Both scripts, always: a visitor on /fr may type "مراكش", and the reverse. */
  name: { fr: string; ar: string };
  cityId: string;
  city: { fr: string; ar: string };
  neighbourhood: { fr: string; ar: string };
  segment: Segment;
  kinds: Kind[];
  /** Every buyer-facing status value this programme answers to (see status-facets.ts). */
  statuses: StatusFacet[];
  /** The badge, worded by `statusText()` in the doc's locale. */
  statusLabel: string;
  readyNow: boolean;
  /** Entry price in DH: the published "à partir de", or the smallest lot's total for land. */
  price: number;
  /** Land only: the published price per m². */
  perSqm: number | null;
  bedroomsMin: number;
  bedroomsMax: number;
  surfaceMin: number;
  surfaceMax: number;
  amenities: Amenity[];
  /** Number of 360° tours on the programme page. */
  tours: number;
  /** The programme's hero, already resolved — no media manifest in the client. */
  hero: { src: string; width: number; height: number; alt: string; render: boolean };
};

/**
 * What the visitor asked for, read out of free text in French or Arabic
 * ("3 chambres à Agadir moins de 1,2 million", "شقة بمراكش مع مسبح").
 * Every structured field is also an editable chip in the UI; `text` is what
 * is left over and is matched against names and neighbourhoods.
 */
export type ParsedQuery = {
  raw: string;
  /** Leftover words, normalised (see normalize.ts), matched against names/neighbourhoods. */
  text: string[];
  /** City ids. A region ("près de Casablanca") expands to its cities and sets `region`. */
  cities: string[];
  region: RegionId | null;
  bedroomsMin: number | null;
  /** Ceiling on the entry price, DH. */
  priceMax: number | null;
  /** Ceiling on the monthly payment, DH/month (converted with lib/credit.ts at the default deposit). */
  monthlyMax: number | null;
  segments: Segment[];
  kinds: Kind[];
  statuses: StatusFacet[];
  amenities: Amenity[];
  /** Character spans of the raw query that produced each structured value — for highlighting. */
  spans: QuerySpan[];
};

export type RegionId = "casablanca-settat" | "rabat-sale-kenitra" | "marrakech-safi" | "souss-massa" | "tanger-tetouan";

export type QuerySpan = {
  start: number;
  end: number;
  field: Exclude<keyof ParsedQuery, "raw" | "text" | "spans">;
};

export type Hit = {
  doc: SearchDoc;
  score: number;
};

/**
 * Never empty while programmes exist: when nothing satisfies every
 * constraint, constraints are dropped least-important-first (as on /projets)
 * and `relaxed` names them so the UI can say what it widened.
 */
export type SearchOutcome = {
  hits: Hit[];
  exact: boolean;
  relaxed: Array<Exclude<QuerySpan["field"], "region">>;
};
