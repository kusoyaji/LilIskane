/**
 * Shared vocabulary for the contact form — safe to import from client code
 * (no copy, no data). The copy lives in `src/content/contact.ts` and reaches the
 * client as a prop, for one locale only.
 */
export type BienType = "economique" | "moyen-standing" | "haut-standing" | "terrain";
export type MeetingMode = "agence" | "telephone" | "visio";

/** The client's own residential categories, in their order. */
export const BIEN_TYPES: BienType[] = ["economique", "moyen-standing", "haut-standing", "terrain"];
export const MEETING_MODES: MeetingMode[] = ["agence", "telephone", "visio"];
export const SLOT_IDS = ["09-11", "11-13", "14-16", "16-18"] as const;
export type SlotId = (typeof SLOT_IDS)[number];

/** What `?projet=<slug>` resolves to on the server, handed to the form. */
export type ProjectPrefill = {
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  type: BienType | null;
  /** The plan asked for from a typology ("Demander le plan"), already labelled. */
  plan?: { id: string; label: string };
};

export type CityOption = { id: string; name: string };
