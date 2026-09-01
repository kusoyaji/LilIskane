import type { MediaKey } from "./media.generated";

/** Every user-facing string in the CMS is a language pair. */
export type Localized = { fr: string; ar: string };

export const SEGMENTS = [
  "economique",
  "moyen-standing",
  "haut-standing",
  "terrain",
  "commercial",
  "bureaux",
] as const;
export type Segment = (typeof SEGMENTS)[number];

export const STATUSES = ["en-lancement", "en-promotion", "livre", "complet"] as const;
export type Status = (typeof STATUSES)[number];

export const KINDS = [
  "appartement",
  "studio",
  "villa",
  "lot",
  "local-commercial",
  "plateau-bureau",
] as const;
export type Kind = (typeof KINDS)[number];

export const AMENITIES = [
  "piscine",
  "mosquee",
  "ecoles",
  "parking-sous-sol",
  "espaces-verts",
  "commerces",
  "centre-commercial",
  "aires-de-jeux",
  "terrains-de-sport",
  "spa",
  "ascenseur",
  "securite",
  "vue-mer",
  "vue-montagne",
  "plage",
] as const;
export type Amenity = (typeof AMENITIES)[number];

/**
 * Land is quoted per square metre; everything else is quoted as a total.
 *
 * This distinction is not cosmetic. Chaabi's own site lists "Al Youssoufia R+2,
 * à partir de 3 450 DHS" beside "Riad Garden I, à partir de 2 450 000 DHS" with
 * no indication that the first is a rate and the second is a price, which makes
 * the cheapest-looking entry in the portfolio a 300 m² plot costing over a
 * million dirhams. Any component that renders a price, sorts by price, or
 * filters by monthly payment has to read this field.
 */
export type PriceUnit = "total" | "per-sqm";

export type Price = {
  amount: number;
  unit: PriceUnit;
  /** Present when unit is "per-sqm": the smallest plot, so a real total exists. */
  minimumLotSqm?: number;
};

export type Typology = {
  id: string;
  label: Localized;
  kind: Kind;
  surfaceMin: number;
  surfaceMax: number;
  /** 0 for studios and land. */
  bedrooms: number;
  price: Price;
  composition: Localized;
  unitsAvailable: number | null;
  plan?: MediaKey;
};

export type MediaRef = {
  key: MediaKey;
  alt: Localized;
  /** Renders carry the non-contractual disclaimer; photographs do not. */
  nature: "render" | "photograph";
};

/**
 * A render paired with a photograph of the same space in a delivered programme.
 * This is the site's central device, so it is a first-class CMS field rather
 * than something assembled in a component.
 */
export type ProofPair = {
  id: string;
  render: MediaRef;
  photograph: MediaRef;
  /** The finished programme the photograph was taken in. */
  sourceProject: Localized;
  sourceYear: number;
  /** One or two words, for the picker. */
  shortLabel: Localized;
  /** A full sentence, shown beneath the comparison. */
  caption: Localized;
};

export type VirtualTour = {
  id: string;
  label: Localized;
  matterportId: string;
  /** Still framed at the tour's opening camera position, used as the poster. */
  poster: MediaRef;
  /** True when the tour walks a delivered unit rather than a show flat. */
  ofDelivered: boolean;
};

/**
 * A generated camera move for the project page.
 *
 * Two encodes rather than one: the scrub master carries a keyframe every five
 * frames so scroll-seeking lands instantly, which costs bitrate, while the
 * small encode is half-resolution with a normal GOP because it only ever loops.
 * Sending the scrub master to a phone would be paying for seek density nothing
 * on that device will use.
 */
export type Cinematic = {
  /** Dense-keyframe master, for scroll-scrubbing on pointer devices. */
  mp4: string;
  /** Half-resolution loop, for touch devices. */
  mp4Small: string;
  poster: string;
  durationSeconds: number;
};

export type NearbyPlace = {
  label: Localized;
  minutes: number;
  mode: "drive" | "walk";
};

export type City = {
  id: string;
  name: Localized;
  lat: number;
  lng: number;
};

export type Project = {
  id: string;
  slug: string;
  name: Localized;
  cityId: string;
  neighbourhood: Localized;
  lat: number;
  lng: number;
  segment: Segment;
  status: Status;
  kinds: Kind[];
  price: Price;
  surfaceMin: number;
  surfaceMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  /** e.g. "R+2". Null for land. */
  floors: string | null;
  deliveryYear: number | null;
  deliveredYear: number | null;
  amenities: Amenity[];
  summary: Localized;
  hero: MediaRef;
  gallery: MediaRef[];
  typologies: Typology[];
  tours: VirtualTour[];
  proof: ProofPair[];
  nearby: NearbyPlace[];
  /** Present only where a camera move has actually been produced. */
  cinematic?: Cinematic;
  /** Set when this programme is a later phase of an already-delivered one. */
  previousPhaseSlug?: string;
};
