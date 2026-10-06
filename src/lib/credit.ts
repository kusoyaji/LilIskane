/**
 * Credit maths.
 *
 * One module, two surfaces: the DH/month filter in search and the simulator on
 * the project page both call these functions. Keeping the amortisation in a
 * single pure module is what makes "filter by monthly payment" and "simulate
 * this project" agree with each other — if they diverged, the site would offer
 * a family a project it then tells them they cannot afford.
 *
 * Deliberately dependency-free and side-effect-free so it can run in a Server
 * Component, in the browser, and under `node --test`.
 */

/** Market defaults for Morocco, stated once so both surfaces show the same basis. */
export const CREDIT_DEFAULTS = {
  annualRate: 0.045,
  years: 20,
  /** Banks here generally expect at least 10% down. */
  minDepositRatio: 0.1,
  /** Rough death-and-disability premium, quoted separately so it isn't hidden. */
  insuranceAnnualRate: 0.0035,
} as const;

/**
 * The deposit /projets assumes when nobody has typed one (and leaves out of its
 * URL). Lives here, beside the maths, so every surface that turns a monthly
 * budget into a price ceiling — /projets, the home budget finder, the concierge
 * search — starts from the same figure.
 */
export const DEFAULT_DEPOSIT = 150_000;

export type CreditInput = {
  price: number;
  deposit: number;
  annualRate?: number;
  years?: number;
};

export type CreditResult = {
  borrowed: number;
  monthly: number;
  monthlyInsurance: number;
  monthlyTotal: number;
  totalPaid: number;
  totalInterest: number;
};

/**
 * Standard annuity payment: M = P·r / (1 − (1+r)^−n)
 *
 * The zero-rate branch is not theoretical — promotional developer financing at
 * 0% exists in this market, and without the branch the formula divides by zero.
 */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  if (annualRate === 0) return principal / n;
  const r = annualRate / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function computeCredit({
  price,
  deposit,
  annualRate = CREDIT_DEFAULTS.annualRate,
  years = CREDIT_DEFAULTS.years,
}: CreditInput): CreditResult {
  const borrowed = Math.max(0, price - deposit);
  const monthly = monthlyPayment(borrowed, annualRate, years);
  const monthlyInsurance = (borrowed * CREDIT_DEFAULTS.insuranceAnnualRate) / 12;
  const n = Math.round(years * 12);

  return {
    borrowed,
    monthly,
    monthlyInsurance,
    monthlyTotal: monthly + monthlyInsurance,
    totalPaid: monthly * n,
    totalInterest: monthly * n - borrowed,
  };
}

/**
 * Inverse of the annuity formula: the largest price affordable at a given
 * monthly payment. This is what powers budget-in-DH/month filtering.
 *
 *   P = M·(1 − (1+r)^−n) / r,  then add the deposit back.
 */
export function maxAffordablePrice(
  monthlyBudget: number,
  deposit: number,
  annualRate: number = CREDIT_DEFAULTS.annualRate,
  years: number = CREDIT_DEFAULTS.years,
): number {
  if (monthlyBudget <= 0) return deposit;
  const n = Math.round(years * 12);

  // Both the capital payment and the insurance premium are proportional to the
  // amount borrowed, so the budget divides by the sum of their two factors.
  // Solving exactly (rather than approximating the insurance share) is what
  // makes this a true inverse of computeCredit — see credit.test.ts, which
  // asserts the round trip.
  const r = annualRate / 12;
  const annuityFactor = annualRate === 0 ? 1 / n : r / (1 - Math.pow(1 + r, -n));
  const insuranceFactor = CREDIT_DEFAULTS.insuranceAnnualRate / 12;

  const borrowed = monthlyBudget / (annuityFactor + insuranceFactor);
  return borrowed + deposit;
}

/**
 * The monthly payment we advertise beside a price.
 *
 * Assumes the conventional 10% deposit rather than whatever the user last typed,
 * so the figure on a card is stable and comparable between projects.
 */
export function indicativeMonthly(
  price: number,
  annualRate: number = CREDIT_DEFAULTS.annualRate,
  years: number = CREDIT_DEFAULTS.years,
): number {
  const deposit = price * CREDIT_DEFAULTS.minDepositRatio;
  return computeCredit({ price, deposit, annualRate, years }).monthlyTotal;
}

/** Rounds to a readable step so the UI never shows "4 217,63 DH/mois". */
export function roundMonthly(value: number): number {
  if (value < 1000) return Math.round(value / 10) * 10;
  return Math.round(value / 50) * 50;
}
