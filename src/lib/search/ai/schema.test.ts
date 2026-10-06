import { strict as assert } from "node:assert";
import { test } from "node:test";
import { projects } from "../../../data/projects.ts";
import { AMENITIES } from "../../../data/types.ts";
import { STATUS_FACETS, hasStatusFacet } from "../../status-facets.ts";
import { REGION_CITIES } from "../lexicon.ts";
import { AiAnswerSchema, answerJsonSchema } from "./schema.ts";
import { AI_AMENITIES, AI_CITY_IDS, AI_KINDS, AI_SEGMENTS, AI_SLUGS, AI_STATUSES } from "./vocab.ts";

type Node = Record<string, unknown>;
const at = (node: unknown, ...path: string[]): Node =>
  path.reduce<Node>((n, key) => (n as Record<string, Node>)[key], node as Node);

/** The enum of a property, whether it is plain, nullable (anyOf) or an array of enums. */
function enumOf(node: Node): string[] {
  if (Array.isArray(node.enum)) return node.enum as string[];
  if (node.items) return enumOf(node.items as Node);
  if (Array.isArray(node.anyOf)) return (node.anyOf as Node[]).flatMap((n) => (Array.isArray(n.enum) ? (n.enum as string[]) : []));
  return [];
}

test("schema enums: exactly the programmes, cities and values in the data", () => {
  const schema = answerJsonSchema();
  const props = at(schema, "properties");
  const filters = at(props, "filters", "properties");
  const result = at(props, "results", "items", "properties");

  assert.deepEqual(enumOf(at(result, "slug")), projects.map((p) => p.slug));
  assert.equal(new Set(AI_SLUGS).size, projects.length);
  assert.deepEqual(new Set(enumOf(at(filters, "cities"))), new Set(projects.map((p) => p.cityId)));
  assert.equal(AI_CITY_IDS.length, 9);
  assert.ok(!AI_CITY_IDS.includes("casablanca"), "no programme in Casablanca itself");
  assert.deepEqual(enumOf(at(filters, "region")), Object.keys(REGION_CITIES));
  assert.deepEqual(new Set(enumOf(at(filters, "segments"))), new Set(projects.map((p) => p.segment)));
  assert.deepEqual(enumOf(at(filters, "kinds")), AI_KINDS);
  assert.deepEqual(new Set(AI_KINDS), new Set(["appartement", "studio", "villa"]));
  assert.deepEqual(
    enumOf(at(filters, "statuses")),
    STATUS_FACETS.filter((f) => projects.some((p) => hasStatusFacet(p, f))),
  );
  assert.ok(!AI_STATUSES.includes("complet"), "no programme is complet");
  assert.deepEqual(
    enumOf(at(filters, "amenities")),
    AMENITIES.filter((a) => projects.some((p) => p.amenities.includes(a))),
  );
  assert.deepEqual(new Set(AI_AMENITIES).size, AI_AMENITIES.length);
  assert.deepEqual(enumOf(at(props, "intent")), ["search", "question", "compare", "other"]);
  assert.deepEqual(enumOf(at(result, "fit")), ["exact", "close"]);
  // Lean result: slug + fit only — the ticks are computed from the data (validate.ts).
  assert.deepEqual(Object.keys(at(props, "results", "items", "properties")), ["slug", "fit"]);
  assert.deepEqual(AI_SEGMENTS.includes("commercial"), false);
});

test("schema: within Gemini's structured-output subset, caps stated", () => {
  const allowed = new Set([
    "type",
    "enum",
    "anyOf",
    "properties",
    "required",
    "additionalProperties",
    "items",
    "minItems",
    "maxItems",
    "description",
  ]);
  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
    if (node === null || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (path.endsWith(".properties")) {
        walk(value, `${path}.${key}`);
        continue;
      }
      assert.ok(allowed.has(key), `unsupported keyword "${key}" at ${path}`);
      if (key === "type") assert.equal(typeof value, "string", `type must be a single string at ${path}`);
      walk(value, `${path}.${key}`);
    }
  };
  const schema = answerJsonSchema();
  walk(schema, "$");
  assert.equal(at(schema, "properties", "results").maxItems, 8);
  assert.equal(at(schema, "properties", "suggestions").maxItems, 3);
  assert.equal(at(schema, "properties", "results", "items", "properties", "criteria"), undefined);
  assert.deepEqual(
    new Set(at(schema).required as string[]),
    new Set(["intent", "language", "summary", "clarify", "filters", "results", "suggestions"]),
  );
  // Stable bytes: built once, identical on every call.
  assert.equal(JSON.stringify(answerJsonSchema()), JSON.stringify(schema));
});

test("schema: a well-formed answer parses, an invented slug does not", () => {
  const answer = {
    intent: "search",
    language: "fr",
    summary: "Massylia, à Agadir, à partir de 1 045 000 DH.",
    clarify: null,
    filters: {
      cities: ["agadir"],
      region: null,
      bedroomsMin: 3,
      priceMax: null,
      monthlyMax: null,
      segments: [],
      kinds: [],
      statuses: [],
      amenities: [],
    },
    results: [{ slug: "massylia", fit: "exact", criteria: [{ key: "city", ok: true }] }],
    suggestions: [],
  };
  assert.equal(AiAnswerSchema.safeParse(answer).success, true);
  const invented = { ...answer, results: [{ slug: "villa-imaginaire", fit: "exact", criteria: [] }] };
  assert.equal(AiAnswerSchema.safeParse(invented).success, false);
});
