import { z } from "zod";
import {
  AI_AMENITIES,
  AI_CITY_IDS,
  AI_CRITERIA,
  AI_KINDS,
  AI_REGION_IDS,
  AI_SEGMENTS,
  AI_SLUGS,
  AI_STATUSES,
} from "./vocab.ts";

/**
 * The AiAnswer schema (see types.ts), with every closed value an enum
 * generated from the data. Gemini decodes against its JSON Schema form
 * (`answerJsonSchema`), so the model cannot return a programme, a city or an
 * amenity that does not exist; the validator (validate.ts) still re-checks
 * everything, because a schema is a request, not a guarantee.
 *
 * Lengths and caps live in descriptions rather than `maxLength`: Gemini's
 * structured-output subset is type, enum, anyOf, properties, required,
 * additionalProperties, items, minItems/maxItems and description, and
 * `answerJsonSchema` strips anything else.
 */

const enumOf = (values: readonly string[]) => z.enum(values as [string, ...string[]]);

const CRITERION = z.object({
  key: enumOf(AI_CRITERIA).describe("Which of the visitor's criteria this is."),
  ok: z.boolean().describe("Whether this programme meets it, according to the catalogue."),
});

const RESULT = z.object({
  slug: enumOf(AI_SLUGS).describe("A programme slug from the catalogue."),
  fit: z
    .enum(["exact", "close"])
    .describe("exact: meets every criterion the visitor gave; close: misses at least one."),
  // No .max() here: Gemini rejects (HTTP 400) a capped array nested in a capped
  // array, measured 2026-10-06. validate.ts caps criteria at 8.
  criteria: z.array(CRITERION).describe("The visitor's criteria, each checked against the catalogue (at most 8)."),
});

const FILTERS = z.object({
  cities: z.array(enumOf(AI_CITY_IDS)).describe("City ids; empty when no place was asked for."),
  region: enumOf(AI_REGION_IDS).nullable().describe("Set only when the visitor named a region or a city without a programme (e.g. Casablanca)."),
  bedroomsMin: z.number().int().nullable().describe("Minimum number of bedrooms (chambres), not rooms."),
  priceMax: z.number().nullable().describe("Ceiling on the entry price, in DH."),
  monthlyMax: z.number().nullable().describe("Ceiling on the monthly payment, in DH per month."),
  segments: z.array(enumOf(AI_SEGMENTS)),
  kinds: z.array(enumOf(AI_KINDS)),
  statuses: z.array(enumOf(AI_STATUSES)),
  amenities: z.array(enumOf(AI_AMENITIES)),
});

export const AiAnswerSchema = z.object({
  intent: z.enum(["search", "question", "compare", "other"]),
  language: z.enum(["fr", "ar"]).describe("fr, or ar when the visitor wrote in Arabic script."),
  summary: z
    .string()
    .nullable()
    .describe("One sentence, at most 240 characters, in the visitor's language. Figures only as written in the catalogue."),
  clarify: z
    .string()
    .nullable()
    .describe("One short question, only when the query is genuinely ambiguous; otherwise null."),
  filters: FILTERS,
  results: z.array(RESULT).max(8).describe("At most 8 programmes, best first: exact fits, then close ones."),
  suggestions: z.array(z.string()).max(3).describe("Up to 3 short follow-up searches in the visitor's language."),
});

export type AiAnswerShape = z.infer<typeof AiAnswerSchema>;

/** Keys of Gemini's supported JSON Schema subset. Everything else is dropped. */
const SUPPORTED = new Set([
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

function prune(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(prune);
  if (node === null || typeof node !== "object") return node;
  const out: Record<string, unknown> = {};
  const source = node as Record<string, unknown>;
  // `type: ["string", "null"]` is spelled as anyOf, the form the subset documents.
  if (Array.isArray(source.type)) {
    const { type, description, ...rest } = source;
    const variants = (type as string[]).map((t) => (t === "null" ? { type: t } : prune({ ...rest, type: t })));
    return description === undefined ? { anyOf: variants } : { anyOf: variants, description };
  }
  for (const [key, value] of Object.entries(source)) {
    if (!SUPPORTED.has(key)) continue;
    if (key === "properties") {
      out[key] = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([name, child]) => [name, prune(child)]),
      );
    } else {
      out[key] = prune(value);
    }
  }
  return out;
}

let cached: Record<string, unknown> | null = null;

/** The schema as JSON Schema, within Gemini's subset. Stable bytes, built once. */
export function answerJsonSchema(): Record<string, unknown> {
  cached ??= prune(z.toJSONSchema(AiAnswerSchema, { target: "draft-2020-12", io: "output" })) as Record<string, unknown>;
  return cached;
}
