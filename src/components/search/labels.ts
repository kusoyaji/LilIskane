import { projectCopy, STATUS_LABELS, statusText } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import type { StatusFacet } from "@/lib/status-facets";

/**
 * A status facet as /projets names it: the client's own words. "Livraison
 * immédiate" and "Livraison imminente" are the client's labels for the
 * programmes flagged readyNow / readySoon; the rest are its statuses.
 */
export function statusFacetLabel(facet: StatusFacet, locale: Locale): string {
  if (facet === "immediate") return projectCopy[locale].readyNow;
  if (facet === "imminente") return statusText({ status: "en-construction", readySoon: true }, locale);
  return STATUS_LABELS[facet][locale];
}
