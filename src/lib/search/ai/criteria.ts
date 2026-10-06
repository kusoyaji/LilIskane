import type { Amenity, Kind, Segment } from "../../../data/types.ts";
import { DEFAULT_DEPOSIT, maxAffordablePrice } from "../../credit.ts";
import type { StatusFacet } from "../../status-facets.ts";
import type { ParsedQuery, SearchDoc } from "../types.ts";
import type { AiCriterionKey } from "./types.ts";

/**
 * Checks a programme against the visitor's criteria, from the DATA — the one
 * rule behind both the validator's "exact → close" downgrade and the ✓/✕
 * ticks on each row, so a tick can never contradict the fit the server let
 * through. Same filter semantics as rank.ts: places/statuses/kinds/segments
 * OR within a field, each amenity on its own, bedrooms against the largest
 * typology, price against the entry price (land: the smallest lot), a monthly
 * ceiling through lib/credit.ts at the /projets default deposit.
 *
 * Pure and dependency-light (client-safe): no data import.
 */

export type Constraints = Pick<
  ParsedQuery,
  "cities" | "region" | "bedroomsMin" | "priceMax" | "monthlyMax" | "segments" | "kinds" | "statuses" | "amenities"
>;

export type CheckedDoc = Pick<SearchDoc, "cityId" | "price" | "bedroomsMax" | "segment" | "kinds" | "statuses" | "amenities">;

export type Check =
  | { key: "city" | "region"; ok: boolean; cityId: string }
  | { key: "bedrooms"; ok: boolean; min: number; max: number }
  | { key: "budget"; ok: boolean; ceiling: number; price: number; overPct: number }
  | { key: "monthly"; ok: boolean; monthly: number; ceiling: number; price: number; overPct: number }
  | { key: "segment"; ok: boolean; segment: Segment }
  | { key: "kind"; ok: boolean; kinds: Kind[] }
  | { key: "status"; ok: boolean; statuses: StatusFacet[] }
  | { key: "amenity"; ok: boolean; amenity: Amenity };

/** How far over a ceiling, in whole per cent, rounded up (1 % at least when over). */
function over(price: number, ceiling: number): number {
  if (price <= ceiling || ceiling <= 0) return 0;
  return Math.max(1, Math.ceil(((price - ceiling) / ceiling) * 100));
}

/** The price a monthly budget reaches, as /projets and the ranker compute it. */
export function monthlyCeiling(monthly: number): number {
  return Math.round(maxAffordablePrice(monthly, DEFAULT_DEPOSIT));
}

export function evaluate(doc: CheckedDoc, q: Constraints): Check[] {
  const checks: Check[] = [];
  if (q.cities.length > 0) {
    checks.push({ key: q.region ? "region" : "city", ok: q.cities.includes(doc.cityId), cityId: doc.cityId });
  }
  if (q.bedroomsMin !== null) {
    checks.push({ key: "bedrooms", ok: doc.bedroomsMax >= q.bedroomsMin, min: q.bedroomsMin, max: doc.bedroomsMax });
  }
  if (q.priceMax !== null) {
    checks.push({
      key: "budget",
      ok: doc.price <= q.priceMax,
      ceiling: q.priceMax,
      price: doc.price,
      overPct: over(doc.price, q.priceMax),
    });
  }
  if (q.monthlyMax !== null) {
    const ceiling = monthlyCeiling(q.monthlyMax);
    checks.push({
      key: "monthly",
      ok: doc.price <= ceiling,
      monthly: q.monthlyMax,
      ceiling,
      price: doc.price,
      overPct: over(doc.price, ceiling),
    });
  }
  if (q.segments.length > 0) {
    checks.push({ key: "segment", ok: q.segments.includes(doc.segment), segment: doc.segment });
  }
  if (q.kinds.length > 0) {
    checks.push({ key: "kind", ok: doc.kinds.some((k) => q.kinds.includes(k)), kinds: doc.kinds });
  }
  if (q.statuses.length > 0) {
    checks.push({ key: "status", ok: doc.statuses.some((s) => q.statuses.includes(s)), statuses: doc.statuses });
  }
  for (const amenity of q.amenities) {
    checks.push({ key: "amenity", ok: doc.amenities.includes(amenity), amenity });
  }
  return checks;
}

/** Whether the data says the programme meets every criterion. */
export function meetsAll(doc: CheckedDoc, q: Constraints): boolean {
  return evaluate(doc, q).every((c) => c.ok);
}

/** The criterion keys the data can settle; the others (surface, name, location, other) only the model can judge. */
export const CHECKABLE: ReadonlySet<AiCriterionKey> = new Set([
  "city",
  "region",
  "bedrooms",
  "budget",
  "monthly",
  "segment",
  "kind",
  "status",
  "amenity",
]);
