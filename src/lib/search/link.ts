import type { Locale } from "../../i18n/config.ts";
import type { ParsedQuery } from "./types.ts";

/**
 * The /projets URL that shows the same selection, so "Voir sur la carte"
 * carries the query over. Keys are the /projets keys (src/lib/filter.ts):
 *
 *   ville       one city id, or a comma list (a region is its cities)
 *   prix        ceiling on the entry price, DH
 *   mensualite  ceiling on the monthly payment, DH/month
 *   standing    segments, comma list
 *   type        kinds (villa, studio, appartement), comma list
 *   chambres    minimum bedrooms
 *   statut      STATUS_FACETS values, comma list
 *   equipements amenities, comma list
 *
 * Free text is not carried: a query that names one programme goes to that
 * programme's page instead (see `namedProgramme` in rank.ts). Values are ids
 * and integers, so commas are written as commas — the link stays readable
 * when someone pastes it to a relative.
 */
export function toProjetsHref(query: ParsedQuery, locale: Locale): string {
  const pairs: Array<[string, string]> = [];
  const list = (key: string, values: readonly string[]) => {
    if (values.length) pairs.push([key, values.map(encodeURIComponent).join(",")]);
  };
  const number = (key: string, value: number | null) => {
    if (value !== null && Number.isFinite(value) && value > 0) pairs.push([key, String(Math.round(value))]);
  };

  list("ville", query.cities);
  number("prix", query.priceMax);
  number("mensualite", query.monthlyMax);
  list("standing", query.segments);
  list("type", query.kinds);
  number("chambres", query.bedroomsMin);
  list("statut", query.statuses);
  list("equipements", query.amenities);

  const qs = pairs.map(([key, value]) => `${key}=${value}`).join("&");
  return `/${locale}/projets${qs ? `?${qs}` : ""}`;
}
