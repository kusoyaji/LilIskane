import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DEFAULT_DEPOSIT, maxAffordablePrice } from "../credit.ts";
import { buildDocs } from "./docs.ts";
import { parseQuery } from "./parse.ts";
import { namedProgramme, searchDocs } from "./rank.ts";
import type { SearchOutcome } from "./types.ts";

const docs = buildDocs("fr");
const run = (raw: string): SearchOutcome => searchDocs(docs, parseQuery(raw));
const slugs = (out: SearchOutcome): string[] => out.hits.map((h) => h.doc.slug);

test("empty query: every programme, exact, neutral order (price ascending)", () => {
  const out = run("");
  assert.equal(out.hits.length, 23);
  assert.equal(out.exact, true);
  assert.deepEqual(out.relaxed, []);
  const prices = out.hits.map((h) => h.doc.price);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

test("massylia → that programme first", () => {
  assert.equal(slugs(run("massylia"))[0], "massylia");
  assert.equal(slugs(run("MASSYLIA"))[0], "massylia");
  assert.equal(run("massylia").exact, true);
});

test("a typo on a programme name still finds it first: Massilia, Bougainvilier", () => {
  assert.equal(slugs(run("Massilia"))[0], "massylia");
  assert.equal(slugs(run("Bougainvilier"))[0], "bougainvillier");
  assert.equal(slugs(run("izdhiar"))[0], "izdihar");
});

test("a programme name typed in Arabic finds it first", () => {
  assert.equal(slugs(run("ماسيليا"))[0], "massylia");
  assert.equal(slugs(run("الصفاء"))[0], "assafa");
  assert.equal(slugs(run("رياض غاردن 2"))[0], "riad-garden-ii");
});

test("a name prefix is enough: mass, bouga, odys", () => {
  assert.equal(slugs(run("mass"))[0], "massylia");
  assert.equal(slugs(run("bouga"))[0], "bougainvillier");
  assert.ok(slugs(run("odys")).slice(0, 2).every((s) => s.startsWith("odyssee")));
});

test("Riad Garden 2 / II / I resolve to the right phase", () => {
  assert.equal(slugs(run("riad garden 2"))[0], "riad-garden-ii");
  assert.equal(slugs(run("Riad Garden II"))[0], "riad-garden-ii");
  assert.equal(slugs(run("riad garden i"))[0], "riad-garden-i");
  assert.equal(slugs(run("riad garden 1"))[0], "riad-garden-i");
});

test("multi-word names: Jnane Souss, Al Anbar, Les Pins de Maamora, Patio Verde", () => {
  assert.equal(slugs(run("Jnane Souss"))[0], "jnane-souss");
  assert.equal(slugs(run("al anbar"))[0], "al-anbar");
  assert.equal(slugs(run("al anbra"))[0], "al-anbra");
  assert.equal(slugs(run("les pins"))[0], "les-pins-de-maamora");
  assert.equal(slugs(run("patio verde"))[0], "patio-verde");
});

test("Océane: the villas first, then the lots of the same name", () => {
  const out = slugs(run("Océane"));
  assert.deepEqual(out.slice(0, 2), ["oceane", "oceane-r1"]);
});

test("Odyssée Studios: the name wins over the kind", () => {
  assert.equal(slugs(run("Odyssée Studios"))[0], "odyssee-studios");
});

test("a neighbourhood finds its programmes: Tassila", () => {
  assert.deepEqual(slugs(run("Tassila")).sort(), ["jnane-souss", "massylia"]);
});

test("3 chambres à Agadir moins de 1,2 million", () => {
  const out = run("3 chambres à Agadir moins de 1,2 million");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out), ["jnane-souss", "massylia"]);
});

test("livraison immédiate près de Casablanca", () => {
  const out = run("livraison immédiate près de Casablanca");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out), ["bougainvillier"]);
});

test("شقة بمراكش مع مسبح", () => {
  const out = run("شقة بمراكش مع مسبح");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out).sort(), ["amaia", "riad-garden-i", "riad-garden-ii"]);
});

test("شقة 3 غرف بمراكش أقل من مليون", () => {
  const out = run("شقة 3 غرف بمراكش أقل من مليون");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out), ["al-anbar"]);
});

test("villa piscine mer → Océane", () => {
  const out = run("villa piscine mer");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out), ["oceane"]);
});

test("terrain 50 millions → land under 500 000 DH", () => {
  const out = run("terrain 50 millions");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out), ["al-youssoufia-r2"]);
});

test("terrain de sport is not land: no lot in the answer", () => {
  const out = run("terrain de sport");
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => h.doc.segment !== "terrain" || h.doc.amenities.includes("terrains-de-sport")));
  assert.ok(out.hits.every((h) => h.doc.amenities.includes("terrains-de-sport")));
});

test("studio → the programmes that sell studios", () => {
  assert.deepEqual(slugs(run("studio")).sort(), ["odyssee-studios", "patio-verde"]);
});

test("6000 dh/mois uses the /projets credit basis (DEFAULT_DEPOSIT)", () => {
  const ceiling = maxAffordablePrice(6000, DEFAULT_DEPOSIT);
  const out = run("6000 dh/mois");
  assert.equal(out.exact, true);
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => h.doc.price <= ceiling));
  assert.equal(out.hits.length, docs.filter((d) => d.price <= ceiling).length);
});

test("Marakech (typo) → only Marrakech programmes", () => {
  const out = run("Marakech");
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => h.doc.cityId === "marrakech"));
});

test("Rabat → Témara and Sala Al Jadida programmes", () => {
  const out = run("Rabat");
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => ["temara", "sala-al-jadida"].includes(h.doc.cityId)));
});

test("statuses combine with OR: promo ou livraison imminente", () => {
  const out = run("promo ou livraison imminente");
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => h.doc.statuses.includes("en-promotion") || h.doc.statuses.includes("imminente")));
});

test("amenities combine with AND", () => {
  const out = run("piscine spa ascenseur");
  assert.ok(out.hits.length > 0);
  for (const h of out.hits) {
    for (const a of ["piscine", "spa", "ascenseur"] as const) assert.ok(h.doc.amenities.includes(a), h.doc.slug);
  }
});

test("bedroomsMin compares with the programme's largest typology", () => {
  const out = run("3 chambres");
  assert.ok(out.hits.every((h) => h.doc.bedroomsMax >= 3));
  assert.ok(slugs(out).includes("al-anbra"), "1–3 bedrooms qualifies");
});

test("ties keep a neutral order: price ascending", () => {
  assert.deepEqual(slugs(run("Essaouira")), ["izdihar", "al-yassamine", "al-anbra"]);
});

test("never empty: villa à Agadir widens the kind and says so", () => {
  const out = run("villa à Agadir");
  assert.equal(out.exact, false);
  assert.deepEqual(out.relaxed, ["kinds"]);
  assert.ok(out.hits.length > 0);
  assert.ok(out.hits.every((h) => h.doc.cityId === "agadir"));
});

test("relaxation names only what had to go: appartement à Agadir moins de 300 000", () => {
  const out = run("appartement à Agadir moins de 300 000");
  assert.equal(out.exact, false);
  assert.deepEqual(out.relaxed, ["cities"]);
  assert.deepEqual(slugs(out), ["assafa"]);
});

test("an impossible budget is the last thing widened, cheapest first", () => {
  const out = run("moins de 100 000");
  assert.equal(out.exact, false);
  assert.deepEqual(out.relaxed, ["priceMax"]);
  assert.equal(out.hits.length, 23);
  assert.equal(out.hits[0].doc.slug, "assafa");
});

test("4 chambres: no programme has four, bedrooms widened", () => {
  const out = run("4 chambres à Marrakech");
  assert.equal(out.exact, false);
  assert.deepEqual(out.relaxed, ["bedroomsMin"]);
  assert.ok(out.hits.every((h) => h.doc.cityId === "marrakech"));
});

test("amenities go first: massylia vue mer still shows Massylia", () => {
  const out = run("massylia vue mer");
  assert.equal(out.exact, false);
  assert.deepEqual(out.relaxed, ["amenities"]);
  assert.equal(slugs(out)[0], "massylia");
});

test("words that match nothing at all are noise, not a failed constraint", () => {
  const out = run("appartement sympa à Agadir");
  assert.equal(out.exact, true);
  assert.deepEqual(slugs(out).sort(), ["jnane-souss", "massylia"]);
  assert.equal(run("xyzzy").hits.length, 23);
});

test("hits are never empty while programmes exist", () => {
  for (const raw of ["", "🏠", "villa 4 chambres Tanger vue mer moins de 100 000 promo", "zzz", "مسبح بحر فيلا طنجة"]) {
    assert.ok(run(raw).hits.length > 0, raw);
  }
  assert.deepEqual(searchDocs([], parseQuery("massylia")).hits, []);
});

test("namedProgramme: one programme named → that doc; several or none → null", () => {
  assert.equal(namedProgramme(docs, parseQuery("Massylia"))?.slug, "massylia");
  assert.equal(namedProgramme(docs, parseQuery("riad garden 2"))?.slug, "riad-garden-ii");
  assert.equal(namedProgramme(docs, parseQuery("ماسيليا"))?.slug, "massylia");
  assert.equal(namedProgramme(docs, parseQuery("riad garden")), null);
  assert.equal(namedProgramme(docs, parseQuery("Agadir")), null);
  assert.equal(namedProgramme(docs, parseQuery("Tassila")), null);
  assert.equal(namedProgramme(docs, parseQuery("")), null);
});

test("digits and short words refine a name but never filter alone", () => {
  const agadir = run("Agadir 3");
  assert.equal(agadir.exact, true);
  assert.deepEqual(slugs(agadir).sort(), ["jnane-souss", "massylia"]);
  assert.equal(slugs(run("R+2"))[0], "al-youssoufia-r2");
  assert.equal(run("R+2").hits.length, 23);
  assert.equal(namedProgramme(docs, parseQuery("R+3")), null);
  assert.equal(namedProgramme(docs, parseQuery("F3 Agadir")), null);
});

/* ------------------------------------------------------------------ */
/* Final review regressions (2026-10-06)                               */
/* ------------------------------------------------------------------ */

test("a question about one programme's delivery shows that programme, not a sibling", () => {
  const rg2 = run("quand sera livré Riad Garden II ?");
  assert.equal(slugs(rg2)[0], "riad-garden-ii");
  assert.ok(!slugs(rg2).includes("riad-garden-i"));
  assert.equal(slugs(run("quand sera livré Amaïa ?"))[0], "amaia");
  assert.equal(slugs(run("Massylia est livré quand ?"))[0], "massylia");
});

test("a named programme that fails a filter is kept and the filter widened", () => {
  const out = run("Riad Garden II 3 chambres moins de 1 million");
  assert.equal(slugs(out)[0], "riad-garden-ii");
  assert.ok(!slugs(out).includes("dyar-al-bahia-2"), "matching only 'ii' is not matching the name");
  assert.equal(out.exact, false);
  assert.ok(out.relaxed.includes("priceMax"));
});

test("a deposit does not shrink the results to one programme", () => {
  const out = run("j'ai 300 000 dh d'apport");
  assert.equal(out.hits.length, 23);
  assert.equal(out.exact, true);
});

test("greetings: the Marrakech flats are an exact answer, and nothing names Assalam TG", () => {
  for (const raw of ["السلام عليكم بغيت شقة فمراكش", "Assalamou alaikoum, je cherche à Marrakech"]) {
    const out = run(raw);
    assert.equal(out.exact, true, raw);
    assert.ok(out.hits.every((h) => h.doc.cityId === "marrakech"), raw);
    assert.equal(namedProgramme(docs, parseQuery(raw)), null, raw);
  }
  assert.equal(namedProgramme(docs, parseQuery("السلام عليكم")), null);
  assert.equal(slugs(run("Assalam Tanger"))[0], "assalam-tg");
  assert.equal(slugs(run("السلام طنجة"))[0], "assalam-tg");
});

test("Avenue Mohammed VI finds the programmes on it, not Mohammedia", () => {
  const top = slugs(run("Avenue Mohammed VI")).slice(0, 5).sort();
  assert.deepEqual(top, ["al-youssoufia-r2", "al-youssoufia-r3", "assafa", "riad-garden-i", "riad-garden-ii"].sort());
});

test("a city without a programme is never an exact answer", () => {
  for (const raw of ["appartement à Fès", "Nador", "Meknès", "Oujda villa", "Laâyoune"]) {
    const out = run(raw);
    assert.equal(out.exact, false, raw);
    assert.ok(out.relaxed.includes("cities"), raw);
    assert.ok(out.hits.length > 0, raw);
  }
  assert.equal(run("Fès ou Marrakech").exact, true);
  assert.equal(run("appartement Massira Marrakech").exact, true, "a neighbourhood elsewhere is noise");
});

test("land for a villa near Rabat: Al Maamora R+1, exact", () => {
  const out = run("terrain pour construire une villa près de Rabat");
  assert.equal(out.exact, true);
  assert.equal(slugs(out)[0], "al-maamora-r1");
});

test("a comparison keeps both programmes", () => {
  const top = slugs(run("Massylia ou Jnane Souss ?"));
  assert.ok(top.includes("massylia") && top.includes("jnane-souss"));
  const ar = slugs(run("قارن بين ماسيليا وجنان سوس"));
  assert.ok(ar.includes("massylia") && ar.includes("jnane-souss"));
});

test("two-edit typos on long programme names: masilia, Yasmine", () => {
  assert.equal(slugs(run("masilia"))[0], "massylia");
  assert.equal(slugs(run("Yasmine Essaouira"))[0], "al-yassamine");
});

test("the kind or standing typed with a shared name picks the programme", () => {
  assert.equal(namedProgramme(docs, parseQuery("Odyssée studios"))?.slug, "odyssee-studios");
  assert.equal(namedProgramme(docs, parseQuery("Océane lots"))?.slug, "oceane-r1");
  assert.equal(namedProgramme(docs, parseQuery("Océane terrain"))?.slug, "oceane-r1");
  assert.equal(namedProgramme(docs, parseQuery("Odyssée"))?.slug, "odyssee");
});
