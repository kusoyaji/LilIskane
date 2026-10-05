import { media } from "@/data/media.generated";
import type { MediaKey } from "@/data/media.generated";
import type { Segment, Status } from "@/data/types";

/**
 * How a programme's lead image may be shown.
 *
 * - `land`   — land programmes. Their only source images are clip-art signposts,
 *              so they get a designed treatment (lattice plan + m² price) instead.
 * - `framed` — the source is too small to go full-bleed without visibly
 *              softening (DESIGN-V2 §8: under ~2000 px, keep it ≤ 480 px wide).
 * - `full`   — a 2000 px+ master: full-bleed.
 */
export type HeroMode = "land" | "framed" | "full";

const FULL_BLEED_MIN_WIDTH = 2000;

export function heroMode(key: MediaKey, segment: Segment): HeroMode {
  if (segment === "terrain") return "land";
  return media[key].width >= FULL_BLEED_MIN_WIDTH ? "full" : "framed";
}

export function isLand(segment: Segment): boolean {
  return segment === "terrain";
}

/** Status colour as a token, keyed to the ground it sits on. Olive means delivered. */
export function statusTone(status: Status, onDark: boolean): string {
  if (status === "livre") return onDark ? "var(--color-olive-bright)" : "var(--color-olive-deep)";
  if (status === "complet") return onDark ? "color-mix(in oklab, var(--color-paper) 62%, transparent)" : "var(--color-ink-mute)";
  return onDark ? "var(--color-ochre-bright)" : "var(--color-ochre-deep)";
}

/** Years are printed raw: the number formatter would group 2027 into "2 027". */
export function year(value: number): string {
  return String(value);
}
