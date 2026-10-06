import { strict as assert } from "node:assert";
import { test } from "node:test";
import { projects } from "../data/projects.ts";
import { EMPTY_FILTERS, facetCount, fromSearchParams, search, toQueryString, type Filters } from "./filter.ts";
import { buildDocs } from "./search/docs.ts";
import { toProjetsHref } from "./search/link.ts";
import { parseQuery } from "./search/parse.ts";
import { searchDocs } from "./search/rank.ts";

const entry = (slug: string) => {
  const p = projects.find((x) => x.slug === slug);
  assert.ok(p, `${slug} must exist`);
  return p.price.unit === "per-sqm" ? p.price.amount * (p.price.minimumLotSqm ?? 1) : p.price.amount;
};
const filters = (patch: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...patch });
const slugs = (list: { slug: string }[]) => list.map((p) => p.slug).sort();

/* ------------------------------------------------------------------ URL -- */

test("ville: a single id still parses as before", () => {
  assert.deepEqual(fromSearchParams(new URLSearchParams("ville=agadir")).cities, ["agadir"]);
  assert.deepEqual(fromSearchParams({ ville: "agadir" }).cities, ["agadir"]);
  assert.deepEqual(fromSearchParams({}).cities, []);
});

test("ville: a comma list is several cities, trimmed and de-duplicated", () => {
  assert.deepEqual(fromSearchParams({ ville: "temara,sala-al-jadida" }).cities, ["temara", "sala-al-jadida"]);
  assert.deepEqual(fromSearchParams({ ville: "temara, temara,," }).cities, ["temara"]);
  // The encoded form a browser may send.
  assert.deepEqual(fromSearchParams(new URLSearchParams("ville=temara%2Csala-al-jadida")).cities, [
    "temara",
    "sala-al-jadida",
  ]);
});

test("prix and type are read; unknown kinds and non-numbers are dropped", () => {
  const f = fromSearchParams({ prix: "1200000", type: "villa,studio,chateau" });
  assert.equal(f.priceMax, 1_200_000);
  assert.deepEqual(f.kinds, ["villa", "studio"]);
  assert.equal(fromSearchParams({ prix: "beaucoup" }).priceMax, null);
  assert.equal(fromSearchParams({ prix: "-5" }).priceMax, null);
});

test("toQueryString writes legible commas in the concierge's key order", () => {
  const qs = toQueryString(
    filters({ cities: ["temara", "sala-al-jadida"], priceMax: 900_000, kinds: ["villa"], bedrooms: 3 }),
  );
  assert.equal(qs, "ville=temara,sala-al-jadida&prix=900000&type=villa&chambres=3");
});

test("every href the concierge builds round-trips through the /projets URL unchanged", () => {
  for (const q of [
    "3 chambres à Agadir",
    "près de Casablanca",
    "terrain moins de 1 million",
    "villa",
    "livraison immédiate piscine",
    "شقة بمراكش أقل من مليون",
    "50 millions",
    "haut standing à Tanger moins de 6 000 DH par mois",
  ]) {
    const href = toProjetsHref(parseQuery(q), "fr");
    const qs = href.split("?")[1] ?? "";
    assert.equal(toQueryString(fromSearchParams(new URLSearchParams(qs))), qs, q);
  }
});

/* ------------------------------------------------------------- matching -- */

test("several cities combine with OR", () => {
  const { projects: found, relaxed } = search(filters({ cities: ["temara", "sala-al-jadida"] }));
  assert.deepEqual(relaxed, []);
  assert.ok(found.length > 0);
  assert.ok(found.every((p) => p.cityId === "temara" || p.cityId === "sala-al-jadida"));
  assert.ok(found.some((p) => p.cityId === "temara"));
  assert.ok(found.some((p) => p.cityId === "sala-al-jadida"));
});

test("prix caps the entry price, the smallest lot's total for land", () => {
  const land = projects.filter((p) => p.price.unit === "per-sqm");
  assert.ok(land.length > 0, "fixture must have land");
  const cheapestLot = Math.min(...land.map((p) => entry(p.slug)));
  const { projects: found } = search(filters({ priceMax: cheapestLot, segments: ["terrain"] }));
  assert.ok(found.length > 0);
  assert.ok(found.every((p) => entry(p.slug) <= cheapestLot));
  // One dirham under the cheapest lot: no land answers. The standing is
  // widened before the price, so what comes back still fits the budget.
  const under = search(filters({ priceMax: cheapestLot - 1, segments: ["terrain"] }));
  assert.deepEqual(under.relaxed, ["amenities", "surfaceMin", "bedrooms", "kinds", "segments"]);
  assert.ok(under.projects.length > 0);
  assert.ok(under.projects.every((p) => p.segment !== "terrain" && entry(p.slug) < cheapestLot));
});

test("type keeps the programmes offering that kind", () => {
  const { projects: found, relaxed } = search(filters({ kinds: ["villa"] }));
  assert.deepEqual(relaxed, []);
  assert.deepEqual(slugs(found), slugs(projects.filter((p) => p.kinds.includes("villa"))));
});

test("relaxation widens kinds before the city, and money last — price after the monthly payment", () => {
  // A villa in a city with no villa: the kind goes, the city stays.
  const villaCities = new Set(projects.filter((p) => p.kinds.includes("villa")).map((p) => p.cityId));
  const other = projects.find((p) => !villaCities.has(p.cityId));
  assert.ok(other);
  const r = search(filters({ kinds: ["villa"], cities: [other.cityId] }));
  assert.ok(r.relaxed.includes("kinds"));
  assert.ok(!r.relaxed.includes("city"));
  assert.ok(r.projects.every((p) => p.cityId === other.cityId));

  // An impossible price: everything else is stepped past first, price last.
  const all = search(filters({ priceMax: 1, cities: ["agadir"] }));
  assert.equal(all.relaxed.at(-1), "price");
  assert.ok(all.relaxed.indexOf("city") < all.relaxed.indexOf("budget"));
  assert.ok(all.relaxed.indexOf("budget") < all.relaxed.indexOf("price"));
});

test("city facet counts release the city selection, so each city says what choosing it gives", () => {
  const f = filters({ cities: ["temara", "sala-al-jadida"], kinds: ["appartement"] });
  for (const cityId of ["agadir", "temara", "marrakech"]) {
    const expected = projects.filter((p) => p.cityId === cityId && p.kinds.includes("appartement")).length;
    assert.equal(facetCount(f, "city", (p) => p.cityId === cityId), expected, cityId);
  }
});

/* ------------------------------------------------- the concierge, end to end -- */

test("/projets shows exactly what each concierge query meant", () => {
  const docs = buildDocs("fr");
  for (const q of [
    "3 chambres à Agadir",
    "près de Casablanca",
    "terrain moins de 1 million",
    "villa",
    "livraison immédiate piscine",
    "شقة بمراكش أقل من مليون",
    "50 millions",
  ]) {
    const parsed = parseQuery(q);
    const outcome = searchDocs(docs, parsed);
    const href = toProjetsHref(parsed, "fr");
    const page = search(fromSearchParams(new URLSearchParams(href.split("?")[1] ?? "")));
    assert.ok(outcome.exact, `${q}: the concierge answers it exactly`);
    assert.deepEqual(page.relaxed, [], `${q}: /projets needs no widening (${href})`);
    assert.deepEqual(slugs(page.projects), slugs(outcome.hits.map((h) => h.doc)), `${q} → ${href}`);
  }
});
