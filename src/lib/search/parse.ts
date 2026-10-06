import type { ParsedQuery } from "./types.ts";
import { words } from "./normalize.ts";

/**
 * STUB — replaced by the real intent parser (cities, regions, bedrooms,
 * budgets, standing, kind, status, amenities, in French and Arabic). It
 * keeps the contract so the UI works end to end meanwhile: every word is
 * free text.
 */
export function parseQuery(raw: string): ParsedQuery {
  return {
    raw,
    text: words(raw),
    cities: [],
    region: null,
    bedroomsMin: null,
    priceMax: null,
    monthlyMax: null,
    segments: [],
    kinds: [],
    statuses: [],
    amenities: [],
    spans: [],
  };
}

export function emptyQuery(): ParsedQuery {
  return parseQuery("");
}
