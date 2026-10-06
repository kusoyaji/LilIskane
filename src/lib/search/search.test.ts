import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildDocs } from "./docs.ts";
import { normalize } from "./normalize.ts";
import { parseQuery } from "./parse.ts";
import { searchDocs } from "./rank.ts";

test("buildDocs: one document per programme, both scripts, resolved hero", () => {
  const docs = buildDocs("fr");
  assert.equal(docs.length, 23);
  const massylia = docs.find((d) => d.slug === "massylia");
  assert.ok(massylia);
  assert.equal(massylia.city.fr, "Agadir");
  assert.ok(massylia.name.ar.length > 0);
  assert.match(massylia.hero.src, /^\/media\//);
});

test("normalize folds accents, Arabic diacritics and Eastern digits", () => {
  assert.equal(normalize("Témara"), "temara");
  assert.equal(normalize("مُسلَّم"), normalize("مسلم"));
  assert.equal(normalize("٣ غرف"), "3 غرف");
});

test("a programme name finds that programme first", () => {
  const out = searchDocs(buildDocs("fr"), parseQuery("massylia"));
  assert.equal(out.hits[0]?.doc.slug, "massylia");
});
