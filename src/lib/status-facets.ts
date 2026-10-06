import type { Project } from "../data/types.ts";

/**
 * Status as the buyer reads it on the card, which is not always the stored
 * status: "Livraison imminente" stands in for the status it replaces, and
 * "Livraison immédiate" (built, can be handed over now) cuts across "En
 * promotion" and "Livré" — it is what someone who needs keys this year filters
 * on, so it is offered as its own value. Values combine with OR.
 */
export const STATUS_FACETS = [
  "en-lancement",
  "en-construction",
  "imminente",
  "immediate",
  "en-promotion",
  "livre",
  "complet",
] as const;
export type StatusFacet = (typeof STATUS_FACETS)[number];

export function hasStatusFacet(
  project: Pick<Project, "status" | "readyNow" | "readySoon">,
  facet: StatusFacet,
): boolean {
  if (facet === "immediate") return project.readyNow === true;
  if (facet === "imminente") return project.readySoon === true;
  return !project.readySoon && project.status === facet;
}
