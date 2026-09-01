import { strict as assert } from "node:assert";
import { test } from "node:test";
import { toListItem, toListItems } from "../data/list.ts";
import { projects } from "../data/projects.ts";

test("toListItem resolves localised strings to a single language", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2, "riad-garden-ii must exist");

  const fr = toListItem(rg2, "fr");
  assert.equal(fr.name, "Riad Garden II");
  assert.equal(typeof fr.name, "string");

  const ar = toListItem(rg2, "ar");
  assert.equal(ar.name, "رياض غاردن 2");
});

test("toListItem carries the city name, not just the id", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2);
  const item = toListItem(rg2, "fr");
  assert.equal(item.cityId, "marrakech");
  assert.equal(item.cityName, "Marrakech");
});

test("the projection drops the heavy fields entirely", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2);
  assert.ok(rg2.typologies.length > 0, "fixture must have typologies to drop");
  assert.ok(rg2.proof.length > 0, "fixture must have proof pairs to drop");

  const item = toListItem(rg2, "fr") as unknown as Record<string, unknown>;
  for (const key of ["typologies", "tours", "proof", "gallery", "nearby", "cinematic", "summary"]) {
    assert.equal(item[key], undefined, `${key} must not survive the projection`);
  }
});

test("no Arabic string survives a French projection", () => {
  // The whole point of the projection is that the inactive language never
  // reaches the browser. Serialise and look for Arabic script directly rather
  // than trusting the field list above to stay complete.
  const arabic = /[؀-ۿ]/;
  const serialised = JSON.stringify(toListItems(projects, "fr"));
  assert.equal(arabic.test(serialised), false, "French projection must contain no Arabic");

  // And the converse, so this cannot pass by projecting nothing at all.
  const latin = JSON.stringify(toListItems(projects, "ar"));
  assert.equal(arabic.test(latin), true, "Arabic projection must contain Arabic");
});

test("toListItems preserves order and length", () => {
  const items = toListItems(projects, "fr");
  assert.equal(items.length, projects.length);
  assert.equal(items[0].slug, projects[0].slug);
});
