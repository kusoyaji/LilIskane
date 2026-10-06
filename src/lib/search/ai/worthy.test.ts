import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildDocs } from "../docs.ts";
import { parseQuery } from "../parse.ts";
import { searchDocs } from "../rank.ts";
import { LruCache, RateLimiter } from "./guard.ts";
import { isAiWorthy } from "./worthy.ts";

const docs = buildDocs("fr");
const worthy = (q: string, withIndex = true) => {
  const parsed = parseQuery(q);
  return isAiWorthy(q, parsed, withIndex ? searchDocs(docs, parsed) : null);
};

test("never for an empty field or a single character", () => {
  assert.equal(worthy(""), false);
  assert.equal(worthy("   "), false);
  assert.equal(worthy("a"), false);
});

test("never for a bare programme, city or neighbourhood the parser resolves exactly", () => {
  for (const q of ["massylia", "Agadir", "riad garden", "Riad Garden 2", "مراكش", "ماسيليا", "Tassila", "villa", "terrain"]) {
    assert.equal(worthy(q), false, q);
  }
});

test("a sentence (3 words or more) or a question", () => {
  for (const q of [
    "3 chambres à Agadir",
    "appartement pas cher Marrakech",
    "quel est le moins cher ?",
    "massylia piscine ?",
    "واش كاين شي شقة؟",
    "بغيت شقة فمراكش",
  ]) {
    assert.equal(worthy(q), true, q);
  }
});

test("leftover words the parser could not place", () => {
  assert.equal(worthy("lumineux"), true);
  assert.equal(worthy("villa lumineuse"), true);
  // …but not while the index is still loading: they cannot be checked yet.
  assert.equal(worthy("lumineux", false), false);
});

test("intent words the parser ignores on purpose", () => {
  assert.equal(worthy("famille Agadir"), true);
  assert.equal(worthy("calme"), true);
  assert.equal(worthy("pas cher"), true);
  assert.equal(worthy("العائلة"), true);
});

test("an instant outcome that had to widen", () => {
  const q = "villa Tanger";
  const parsed = parseQuery(q);
  const outcome = searchDocs(docs, parsed);
  assert.equal(outcome.exact, false, "no villa in Tanger");
  assert.equal(isAiWorthy(q, parsed, outcome), true);
});

test("mixed Arabic and Latin script", () => {
  assert.equal(worthy("appart مراكش"), true);
});

test("rate limiter: sliding windows, refused hits not counted", () => {
  let now = 0;
  const limiter = new RateLimiter(
    [
      { ms: 60_000, max: 2 },
      { ms: 86_400_000, max: 3 },
    ],
    () => now,
  );
  assert.equal(limiter.take("ip"), true);
  assert.equal(limiter.take("ip"), true);
  assert.equal(limiter.take("ip"), false, "3rd in the minute");
  assert.equal(limiter.take("other"), true, "per key");
  now = 61_000;
  assert.equal(limiter.take("ip"), true, "minute window slid");
  now = 122_000;
  assert.equal(limiter.take("ip"), false, "day window full");
  now = 86_400_000 + 1;
  assert.equal(limiter.take("ip"), true);
});

test("LRU cache: capacity, recency and time to live", () => {
  let now = 0;
  const cache = new LruCache<number>(2, 1000, () => now);
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.get("a"), 1); // a is now most recent
  cache.set("c", 3); // evicts b
  assert.equal(cache.get("b"), undefined);
  assert.equal(cache.get("a"), 1);
  now = 1001;
  assert.equal(cache.get("a"), undefined, "expired");
});
