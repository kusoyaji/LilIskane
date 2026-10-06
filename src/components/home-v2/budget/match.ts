import type { Price } from "@/data/types";

/**
 * The finder's slider range and opening value, and the one price rule it
 * shares with the search: land is quoted per m², so its entry price is the
 * smallest lot (the same expression as `effectiveTotal` in lib/format.ts and
 * `SearchDoc.price` in lib/search/docs.ts — so the ceiling the finder sets on
 * the results keeps exactly the programmes it counted).
 */
export const MONTHLY_MIN = 2_000;
export const MONTHLY_MAX = 20_000;
export const DEFAULT_MONTHLY = 6_000;

/** Same as `effectiveTotal` in src/lib/format.ts (which pulls the dictionaries in with it). */
export function effectiveTotal(price: Price): number {
  if (price.unit === "per-sqm") return price.amount * (price.minimumLotSqm ?? 1);
  return price.amount;
}

/** The ceiling as shown and as applied: whole thousands, rounded down (never above what the payment buys). */
export function ceilingOf(price: number): number {
  return Math.floor(price / 1_000) * 1_000;
}
