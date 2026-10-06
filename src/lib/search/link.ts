import type { Locale } from "../../i18n/config.ts";
import type { ParsedQuery } from "./types.ts";

/**
 * STUB — replaced with the full mapping. The /projets URL that shows the same
 * selection, so "Voir sur la carte" carries the query over. Only what
 * /projets can express is carried.
 */
export function toProjetsHref(query: ParsedQuery, locale: Locale): string {
  const params = new URLSearchParams();
  if (query.cities.length === 1) params.set("ville", query.cities[0]);
  const qs = params.toString();
  return `/${locale}/projets${qs ? `?${qs}` : ""}`;
}
