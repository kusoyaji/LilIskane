import { strict as assert } from "node:assert";
import { test } from "node:test";
import { toProjetsHref } from "./link.ts";
import { parseQuery } from "./parse.ts";

function params(href: string): Record<string, string> {
  const [, qs = ""] = href.split("?");
  return Object.fromEntries(new URLSearchParams(qs));
}

test("empty query → plain /projets in the locale", () => {
  assert.equal(toProjetsHref(parseQuery(""), "fr"), "/fr/projets");
  assert.equal(toProjetsHref(parseQuery(""), "ar"), "/ar/projets");
});

test("free text is never carried", () => {
  assert.equal(toProjetsHref(parseQuery("massylia"), "fr"), "/fr/projets");
});

test("3 chambres à Agadir moins de 1,2 million", () => {
  assert.equal(toProjetsHref(parseQuery("3 chambres à Agadir moins de 1,2 million"), "fr"), "/fr/projets?ville=agadir&prix=1200000&chambres=3");
});

test("a region becomes a readable comma list of its cities", () => {
  const href = toProjetsHref(parseQuery("Rabat"), "fr");
  assert.match(href, /ville=temara,sala-al-jadida$/);
  assert.deepEqual(params(href).ville.split(",").sort(), ["sala-al-jadida", "temara"]);
});

test("monthly ceiling → mensualite", () => {
  assert.deepEqual(params(toProjetsHref(parseQuery("6000 dh/mois"), "fr")), { mensualite: "6000" });
});

test("standing, type, statut, equipements", () => {
  const p = params(toProjetsHref(parseQuery("villa haut standing livraison immédiate avec piscine et spa"), "ar"));
  assert.deepEqual(p, { standing: "haut-standing", type: "villa", statut: "immediate", equipements: "piscine,spa" });
});

test("Arabic query, Arabic locale", () => {
  const href = toProjetsHref(parseQuery("شقة 3 غرف بمراكش أقل من مليون"), "ar");
  assert.ok(href.startsWith("/ar/projets?"));
  assert.deepEqual(params(href), { ville: "marrakech", prix: "1000000", type: "appartement", chambres: "3" });
});

test("land with a centimes budget", () => {
  assert.deepEqual(params(toProjetsHref(parseQuery("terrain 50 millions"), "fr")), { prix: "500000", standing: "terrain" });
});

test("terrain de sport carries an amenity, never land", () => {
  assert.deepEqual(params(toProjetsHref(parseQuery("terrain de sport"), "fr")), { equipements: "terrains-de-sport" });
});
