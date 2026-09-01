import type { MediaRef } from "./types";

/**
 * The four programmes the hero cycles through.
 *
 * Curated rather than computed, because the two constraints that narrow the
 * portfolio to almost exactly this set are not expressible as a filter over the
 * data — one of them is about what the headline says.
 *
 * The type above these images reads "Ce bâtiment n'existe pas encore." That
 * makes every entry necessarily a *render*. Tanger is absent for this reason
 * and no other: `th_assalam_tg` is a photograph of a block that has already
 * been delivered, and running it under that headline would turn the site's one
 * legally-loaded claim — the `caractère d'ambiance` disclosure the whole proof
 * argument is built on — into a false statement.
 *
 * The frame is also full-bleed at 100vw, which rules out every master under
 * 2560px: Temara (1304px), Had Soualem (1274px) and Salé Al Jadida (514px).
 *
 * What is left happens to spread well — Marrakech inland, Mohammedia port,
 * Sidi Rahal beach, Essaouira Atlantic — but that is a consequence of the two
 * rules above, not the reason for the selection. Adding a fifth means shooting
 * a render for it first.
 */
export const HERO_SLUGS = ["riad-garden-ii", "odyssee", "oceane", "izdihar"] as const;

/**
 * The image the page opens on, and the ground the film later opens over.
 *
 * Deliberately one asset used twice. The hero establishes a place; the film
 * section then grows out of that same place rather than cutting to an unrelated
 * backdrop, so the two moments read as one continuous descent into the project
 * instead of two separate set pieces. Reusing it also costs nothing — by the
 * time the backdrop is needed the file is already decoded and in cache.
 */
export const OPENING_IMAGE: MediaRef = {
  key: "hero_courtyard",
  nature: "render",
  alt: {
    fr: "Cour intérieure d'une résidence : bassin en longueur bordé de dallage clair, façades en pierre et pergolas de bois sous la lumière de fin de journée.",
    ar: "فناء داخلي لإقامة سكنية: حوض ماء ممتد يحيط به بلاط فاتح، وواجهات حجرية وعرائش خشبية تحت ضوء آخر النهار.",
  },
};
