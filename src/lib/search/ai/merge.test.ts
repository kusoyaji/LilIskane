import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildDocs } from "../docs.ts";
import { toProjetsHref } from "../link.ts";
import { parseQuery } from "../parse.ts";
import { searchDocs } from "../rank.ts";
import { answerProgramme, inferredFilters, mergeAiFilters, projetsQuery } from "./apply.ts";
import { evaluate } from "./criteria.ts";
import { orderWithAi } from "./merge.ts";
import type { AiAnswer, AiFilters } from "./types.ts";

const docs = buildDocs("fr");

const NO_FILTERS: AiFilters = {
  cities: [],
  region: null,
  bedroomsMin: null,
  priceMax: null,
  monthlyMax: null,
  segments: [],
  kinds: [],
  statuses: [],
  amenities: [],
};

function ai(results: AiAnswer["results"], over: Partial<AiAnswer> = {}): AiAnswer {
  return {
    intent: "search",
    language: "fr",
    summary: null,
    clarify: null,
    filters: NO_FILTERS,
    results,
    suggestions: [],
    ...over,
  };
}

test("orderWithAi: no answer → the instant order unchanged", () => {
  const instant = searchDocs(docs, parseQuery("Agadir")).hits;
  const rows = orderWithAi(docs, instant, null);
  assert.deepEqual(
    rows.map((r) => r.doc.slug),
    instant.map((h) => h.doc.slug),
  );
  assert.ok(rows.every((r) => r.ai === null));
});

test("orderWithAi: AI picks first (exact, then close), resolved against ALL docs, then the rest of the instant hits", () => {
  const instant = searchDocs(docs, parseQuery("Agadir")).hits; // massylia, jnane-souss…
  const answer = ai([
    { slug: "oceane-r1", fit: "close", criteria: [] }, // not an instant hit (Sidi Rahal) — still shown
    { slug: "jnane-souss", fit: "exact", criteria: [] },
    { slug: "inexistant", fit: "exact", criteria: [] },
    { slug: "jnane-souss", fit: "close", criteria: [] },
  ]);
  const rows = orderWithAi(docs, instant, answer);
  assert.deepEqual(
    rows.slice(0, 2).map((r) => [r.doc.slug, r.ai?.fit]),
    [
      ["jnane-souss", "exact"],
      ["oceane-r1", "close"],
    ],
  );
  const rest = rows.slice(2).map((r) => r.doc.slug);
  assert.deepEqual(
    rest,
    instant.map((h) => h.doc.slug).filter((s) => s !== "jnane-souss"),
  );
  assert.ok(rows.slice(2).every((r) => r.ai === null));
  assert.equal(new Set(rows.map((r) => r.doc.slug)).size, rows.length, "no programme twice");
});

test("mergeAiFilters: the visitor's values win, the AI fills only the empty fields", () => {
  const parsed = parseQuery("appartement à Agadir");
  const merged = mergeAiFilters(parsed, {
    ...NO_FILTERS,
    cities: ["marrakech"],
    bedroomsMin: 3,
    amenities: ["ecoles"],
    kinds: ["villa"],
  });
  assert.deepEqual(merged.cities, ["agadir"]);
  assert.deepEqual(merged.kinds, ["appartement"]);
  assert.equal(merged.bedroomsMin, 3);
  assert.deepEqual(merged.amenities, ["ecoles"]);
  assert.equal(merged.raw, parsed.raw);
});

test("mergeAiFilters: a region alone expands to its cities", () => {
  const merged = mergeAiFilters(parseQuery("un appartement"), { ...NO_FILTERS, region: "casablanca-settat" });
  assert.deepEqual(merged.cities, ["mohammedia", "had-soualem", "sidi-rahal"]);
  assert.equal(merged.region, "casablanca-settat");
});

test("inferredFilters: only what the AI added", () => {
  const parsed = parseQuery("3 chambres à Agadir");
  const added = inferredFilters(parsed, { ...NO_FILTERS, cities: ["agadir"], bedroomsMin: 3, amenities: ["ecoles"] });
  assert.deepEqual(added, { ...NO_FILTERS, amenities: ["ecoles"] });
  assert.deepEqual(inferredFilters(parsed, null), NO_FILTERS);
});

test("projetsQuery: AI-inferred values that would hide an exact pick are dropped; the visitor's stay", () => {
  // "près de la mer" — the AI infers vue-mer AND ecoles; Massylia (an exact pick) has no ecoles.
  const parsed = parseQuery("appartement à Agadir");
  const answer = ai([{ slug: "massylia", fit: "exact", criteria: [] }], {
    filters: { ...NO_FILTERS, amenities: ["ecoles", "piscine"], bedroomsMin: 3 },
  });
  const q = projetsQuery(parsed, answer, docs);
  const massylia = docs.find((d) => d.slug === "massylia")!;
  assert.ok(evaluate(massylia, q).every((c) => c.ok), "the exact pick passes the URL's filters");
  assert.deepEqual(q.cities, ["agadir"]);
  assert.deepEqual(q.kinds, ["appartement"]);
  const href = toProjetsHref(q, "fr");
  assert.match(href, /^\/fr\/projets\?/);
  assert.match(href, /ville=agadir/);
});

test("answerProgramme: one exact programme → open it; a question with one exact top pick → open it; else none", () => {
  assert.equal(answerProgramme(null), null);
  assert.equal(answerProgramme(ai([])), null);
  assert.equal(answerProgramme(ai([{ slug: "massylia", fit: "exact", criteria: [] }])), "massylia");
  // A single programme that is only close is not opened: /projets shows what was widened.
  assert.equal(answerProgramme(ai([{ slug: "assafa", fit: "close", criteria: [] }])), null);
  const question = ai(
    [
      { slug: "al-anbar", fit: "exact", criteria: [] },
      { slug: "al-anbra", fit: "close", criteria: [] },
    ],
    { intent: "question" },
  );
  assert.equal(answerProgramme(question), "al-anbar");
  assert.equal(answerProgramme({ ...question, intent: "search" }), null);
  assert.equal(
    answerProgramme(
      ai(
        [
          { slug: "al-anbar", fit: "exact", criteria: [] },
          { slug: "al-anbra", fit: "exact", criteria: [] },
        ],
        { intent: "question" },
      ),
    ),
    null,
  );
});
