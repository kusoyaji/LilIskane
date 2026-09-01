import { cityById } from "./cities.ts";
import type { Amenity, Price, Project, ResolvedMediaRef, Segment, Status } from "./types.ts";
import type { Locale } from "@/i18n/config";

/**
 * What the search surface actually renders, in one language.
 *
 * The full `Project` carries both languages plus typologies, tours, proof
 * pairs and nearby places — none of which the list or the map touches.
 * Serialising all of that into the client bundle is the largest single payload
 * problem this project has (see REVIEW.md), and it grows with every programme
 * added: the nine-programme import would make it roughly 64% worse.
 *
 * Strings are resolved here rather than in the component, so the inactive
 * language never crosses the network at all. `list.test.ts` asserts that
 * directly by looking for Arabic script in a serialised French projection —
 * a field-by-field check would silently stop covering new fields.
 *
 * Adding a field here adds it to every client bundle that renders the search.
 * Add one only when the list or the map genuinely draws it.
 */
export type ProjectListItem = {
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  segment: Segment;
  status: Status;
  price: Price;
  surfaceMin: number;
  surfaceMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  amenities: Amenity[];
  deliveryYear: number | null;
  deliveredYear: number | null;
  /** Alt already resolved: these are full sentences, and both languages is waste. */
  hero: ResolvedMediaRef;
};

export function toListItem(project: Project, locale: Locale): ProjectListItem {
  const city = cityById.get(project.cityId);
  return {
    slug: project.slug,
    name: project.name[locale],
    cityId: project.cityId,
    // Falling back to the id keeps a mis-keyed city rendering as something
    // rather than `undefined`; `getCity` throws instead, which is right on the
    // server but would take the whole search down in the browser.
    cityName: city ? city.name[locale] : project.cityId,
    neighbourhood: project.neighbourhood[locale],
    lat: project.lat,
    lng: project.lng,
    segment: project.segment,
    status: project.status,
    price: project.price,
    surfaceMin: project.surfaceMin,
    surfaceMax: project.surfaceMax,
    bedroomsMin: project.bedroomsMin,
    bedroomsMax: project.bedroomsMax,
    amenities: project.amenities,
    deliveryYear: project.deliveryYear,
    deliveredYear: project.deliveredYear,
    hero: { key: project.hero.key, nature: project.hero.nature, alt: project.hero.alt[locale] },
  };
}

export function toListItems(projects: Project[], locale: Locale): ProjectListItem[] {
  return projects.map((project) => toListItem(project, locale));
}
