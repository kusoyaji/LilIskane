import { CREDIT_DEFAULTS, maxAffordablePrice } from "@/lib/credit";
import type { Price } from "@/data/types";

/**
 * The budget facet of `search()` (src/lib/filter.ts), runnable in the browser.
 *
 * `filter.ts` imports the full `projects` dataset at module level, so pulling
 * it into a client component would ship every programme in both languages.
 * The finder only ever sets budget + deposit, and for that input `search()`
 * reduces to exactly this: keep what fits under `maxAffordablePrice`; if
 * nothing does, drop the budget constraint and say so (`relaxed`). The rule —
 * `effectiveTotal(price) <= ceiling` — is the same expression, so the count
 * shown here is the count /projets shows for the same query string.
 */

/** Mirrors `DEFAULT_DEPOSIT` in src/lib/filter.ts — kept equal so the URL omits it the same way. */
export const DEFAULT_DEPOSIT = 150_000;

/** The duration /projets assumes (it has no duration parameter). */
const SEARCH_YEARS = CREDIT_DEFAULTS.years;

/** Same as `effectiveTotal` in src/lib/format.ts (which pulls the dictionaries in with it). */
export function effectiveTotal(price: Price): number {
  if (price.unit === "per-sqm") return price.amount * (price.minimumLotSqm ?? 1);
  return price.amount;
}

export type Matchable = { price: Price };

export function matchBudget<T extends Matchable>(items: T[], ceiling: number): { found: T[]; relaxed: boolean } {
  const found = items.filter((item) => effectiveTotal(item.price) <= ceiling);
  if (found.length > 0) return { found, relaxed: false };
  return { found: items, relaxed: true };
}

/**
 * The monthly payment that, over the 20 years /projets assumes, buys the same
 * ceiling as `monthly` over `years`. Lets the finder offer 15/20/25 years and
 * still hand /projets a query that returns exactly the programmes it counted.
 */
export function searchMonthlyFor(monthly: number, deposit: number, years: number): number {
  if (years === SEARCH_YEARS) return monthly;
  const ceiling = maxAffordablePrice(monthly, deposit, CREDIT_DEFAULTS.annualRate, years);
  const perDh = maxAffordablePrice(1, 0, CREDIT_DEFAULTS.annualRate, SEARCH_YEARS);
  return Math.ceil((ceiling - deposit) / perDh);
}

/** Same keys and omission rules as `toSearchParams` in src/lib/filter.ts. */
export function toQuery(monthly: number, deposit: number): string {
  const params = new URLSearchParams();
  if (monthly) params.set("mensualite", String(monthly));
  if (deposit !== DEFAULT_DEPOSIT) params.set("apport", String(deposit));
  return params.toString();
}
