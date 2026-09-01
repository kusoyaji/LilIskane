import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  CREDIT_DEFAULTS,
  computeCredit,
  indicativeMonthly,
  maxAffordablePrice,
  monthlyPayment,
  roundMonthly,
} from "./credit.ts";

test("monthlyPayment matches a known annuity", () => {
  // 1 000 000 over 20 years at 4.5% is ~6 326 DH/month.
  const m = monthlyPayment(1_000_000, 0.045, 20);
  assert.ok(Math.abs(m - 6326) < 2, `expected ~6326, got ${m.toFixed(2)}`);
});

test("zero-rate financing divides evenly instead of dividing by zero", () => {
  const m = monthlyPayment(240_000, 0, 20);
  assert.equal(m, 1000);
  assert.ok(Number.isFinite(m));
});

test("degenerate inputs return zero rather than NaN", () => {
  assert.equal(monthlyPayment(0, 0.045, 20), 0);
  assert.equal(monthlyPayment(-5, 0.045, 20), 0);
  assert.equal(monthlyPayment(100_000, 0.045, 0), 0);
});

test("computeCredit separates insurance from capital", () => {
  const r = computeCredit({ price: 1_830_000, deposit: 183_000 });
  assert.equal(r.borrowed, 1_647_000);
  assert.ok(r.monthlyInsurance > 0);
  assert.ok(Math.abs(r.monthlyTotal - (r.monthly + r.monthlyInsurance)) < 1e-9);
  assert.ok(r.totalInterest > 0);
});

test("a full deposit means nothing is borrowed and nothing is owed", () => {
  const r = computeCredit({ price: 500_000, deposit: 500_000 });
  assert.equal(r.borrowed, 0);
  assert.equal(r.monthlyTotal, 0);
  assert.equal(r.totalInterest, 0);
});

test("maxAffordablePrice is the exact inverse of computeCredit", () => {
  // This is the property that keeps search and the simulator honest: a project
  // surfaced at a given budget must not then quote a higher payment.
  for (const budget of [2_500, 4_000, 6_500, 12_000]) {
    for (const deposit of [0, 100_000, 400_000]) {
      const price = maxAffordablePrice(budget, deposit);
      const back = computeCredit({ price, deposit }).monthlyTotal;
      assert.ok(
        Math.abs(back - budget) < 0.01,
        `budget ${budget} / deposit ${deposit}: round-tripped to ${back.toFixed(2)}`,
      );
    }
  }
});

test("the inverse holds at zero rate too", () => {
  const price = maxAffordablePrice(3_000, 50_000, 0, 20);
  const back = computeCredit({ price, deposit: 50_000, annualRate: 0, years: 20 }).monthlyTotal;
  assert.ok(Math.abs(back - 3_000) < 0.01);
});

test("a zero budget can still afford exactly the deposit", () => {
  assert.equal(maxAffordablePrice(0, 250_000), 250_000);
});

test("indicativeMonthly assumes the conventional deposit", () => {
  const price = 1_830_000;
  const expected = computeCredit({
    price,
    deposit: price * CREDIT_DEFAULTS.minDepositRatio,
  }).monthlyTotal;
  assert.equal(indicativeMonthly(price), expected);
});

test("longer terms lower the payment; higher rates raise it", () => {
  assert.ok(indicativeMonthly(1_000_000, 0.045, 25) < indicativeMonthly(1_000_000, 0.045, 15));
  assert.ok(indicativeMonthly(1_000_000, 0.06, 20) > indicativeMonthly(1_000_000, 0.045, 20));
});

test("roundMonthly produces figures a person would say out loud", () => {
  assert.equal(roundMonthly(4217.63), 4200);
  assert.equal(roundMonthly(4226), 4250);
  assert.equal(roundMonthly(884.2), 880);
});
