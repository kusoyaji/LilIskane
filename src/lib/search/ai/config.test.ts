import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  DEFAULT_BUDGET_MS,
  DEFAULT_FALLBACK_MODEL,
  DEFAULT_MODEL,
  DEFAULT_HEDGE_MS,
  FALLBACK_MIN_MS,
  geminiConfig,
  retryable,
} from "./config.ts";

test("config: measured defaults when nothing is set", () => {
  const c = geminiConfig({});
  assert.equal(c.model, DEFAULT_MODEL);
  assert.equal(c.model, "gemini-3.7-flash");
  assert.equal(c.thinking, "low");
  assert.deepEqual(c.fallback, { model: DEFAULT_FALLBACK_MODEL, thinking: "minimal" });
  assert.equal(c.budgetMs, DEFAULT_BUDGET_MS);
  assert.equal(c.temperature, undefined);
});

test("config: every knob is env-overridable", () => {
  const c = geminiConfig({
    GEMINI_MODEL: " gemini-3.8-flash ",
    GEMINI_THINKING: "MEDIUM",
    GEMINI_FALLBACK_MODEL: "gemini-3.1-flash-lite",
    GEMINI_FALLBACK_THINKING: "low",
    GEMINI_TIMEOUT_MS: "12000",
    GEMINI_TEMPERATURE: "0.2",
  });
  assert.equal(c.model, "gemini-3.8-flash");
  assert.equal(c.thinking, "medium");
  assert.deepEqual(c.fallback, { model: "gemini-3.1-flash-lite", thinking: "low" });
  assert.equal(c.budgetMs, 12_000);
  assert.equal(c.temperature, 0.2);
});

test("config: nonsense falls back to the defaults, the budget is clamped", () => {
  const c = geminiConfig({ GEMINI_THINKING: "max", GEMINI_TIMEOUT_MS: "abc", GEMINI_TEMPERATURE: "hot" });
  assert.equal(c.thinking, "low");
  assert.equal(c.budgetMs, DEFAULT_BUDGET_MS);
  assert.equal(c.temperature, undefined);
  assert.equal(geminiConfig({ GEMINI_TIMEOUT_MS: "100" }).budgetMs, 2_000);
  assert.equal(geminiConfig({ GEMINI_TIMEOUT_MS: "600000" }).budgetMs, 25_000);
  assert.equal(geminiConfig({ GEMINI_MODEL: "  " }).model, DEFAULT_MODEL);
});

test("config: the fallback can be switched off, and never repeats the main model", () => {
  assert.equal(geminiConfig({ GEMINI_FALLBACK_MODEL: "off" }).fallback, null);
  assert.equal(geminiConfig({ GEMINI_FALLBACK_MODEL: "none" }).fallback, null);
  assert.equal(geminiConfig({ GEMINI_MODEL: "gemini-3.5-flash-lite" }).fallback, null);
});

test("fallback: only for an overloaded or rate-limited main model", () => {
  for (const status of [429, 500, 502, 503, 504]) assert.equal(retryable(status), true, String(status));
  for (const status of [null, undefined, 400, 401, 403, 404]) assert.equal(retryable(status), false, String(status));
});

test("hedge delay: default, env, off, and never past the budget", () => {
  assert.equal(geminiConfig({}).hedgeMs, DEFAULT_HEDGE_MS);
  assert.equal(DEFAULT_HEDGE_MS, 7_000);
  assert.ok(DEFAULT_BUDGET_MS - DEFAULT_HEDGE_MS! >= FALLBACK_MIN_MS, "the hedge leaves the fallback its minimum");
  assert.equal(geminiConfig({ GEMINI_HEDGE_MS: "4000" }).hedgeMs, 4_000);
  assert.equal(geminiConfig({ GEMINI_HEDGE_MS: "off" }).hedgeMs, null);
  assert.equal(geminiConfig({ GEMINI_HEDGE_MS: "15000" }).hedgeMs, null);
  assert.equal(geminiConfig({ GEMINI_HEDGE_MS: "junk" }).hedgeMs, DEFAULT_HEDGE_MS);
});
