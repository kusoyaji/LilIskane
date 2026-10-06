import { statusText } from "../../content/projects.ts";
import { getCity } from "../../data/cities.ts";
import { media } from "../../data/media.generated.ts";
import { projects } from "../../data/projects.ts";
import type { Project } from "../../data/types.ts";
import type { Locale } from "../../i18n/config.ts";
import { hasStatusFacet, STATUS_FACETS } from "../status-facets.ts";
import type { SearchDoc } from "./types.ts";

/**
 * Relative imports with explicit extensions, on purpose: this module is
 * imported by `node --test` as well as by Next, and the test runner resolves
 * neither the `@/` alias nor extensionless paths.
 */

/** Same rule as `effectiveTotal` in lib/format.ts: land is quoted per m², so its entry price is the smallest lot. */
function entryPrice(project: Project): number {
  return project.price.unit === "per-sqm"
    ? project.price.amount * (project.price.minimumLotSqm ?? 1)
    : project.price.amount;
}

/**
 * One document per programme, in one locale. The names, cities and
 * neighbourhoods carry both scripts regardless of locale, so a query in
 * either language finds them; the badge and the alt text are the locale's.
 */
export function buildDocs(locale: Locale): SearchDoc[] {
  return projects.map((project) => {
    const city = getCity(project.cityId);
    const asset = media[project.hero.key];
    return {
      slug: project.slug,
      name: project.name,
      cityId: project.cityId,
      city: city.name,
      neighbourhood: project.neighbourhood,
      segment: project.segment,
      kinds: project.kinds,
      statuses: STATUS_FACETS.filter((facet) => hasStatusFacet(project, facet)),
      statusLabel: statusText(project, locale),
      readyNow: project.readyNow === true,
      price: entryPrice(project),
      perSqm: project.price.unit === "per-sqm" ? project.price.amount : null,
      bedroomsMin: project.bedroomsMin,
      bedroomsMax: project.bedroomsMax,
      surfaceMin: project.surfaceMin,
      surfaceMax: project.surfaceMax,
      amenities: project.amenities,
      tours: project.tours.length,
      hero: {
        src: asset.src,
        width: asset.width,
        height: asset.height,
        alt: project.hero.alt[locale],
        render: project.hero.nature === "render",
      },
    };
  });
}
