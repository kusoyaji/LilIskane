import type { Amenity, Kind, Segment } from "../../../data/types.ts";
import type { StatusFacet } from "../../status-facets.ts";
import type { RegionId } from "../types.ts";

/**
 * The AI concierge's answer — the contract between /api/search/ai (Gemini),
 * its validator and every UI that shows it. Everything in it is checked on
 * the server before it leaves: slugs, filter values and criterion keys are
 * enums generated from the data, and a summary carrying a number the data
 * does not contain is dropped. The UI renders each programme's facts from
 * the data itself; the model only ranks and explains in one sentence.
 */
export type AiCriterionKey =
  | "city"
  | "region"
  | "budget"
  | "monthly"
  | "bedrooms"
  | "segment"
  | "kind"
  | "status"
  | "amenity"
  | "surface"
  | "name"
  | "location"
  | "other";

export type AiResult = {
  slug: string;
  fit: "exact" | "close";
  criteria: Array<{ key: AiCriterionKey; ok: boolean }>;
};

export type AiFilters = {
  cities: string[];
  region: RegionId | null;
  bedroomsMin: number | null;
  priceMax: number | null;
  monthlyMax: number | null;
  segments: Segment[];
  kinds: Kind[];
  statuses: StatusFacet[];
  amenities: Amenity[];
};

export type AiAnswer = {
  intent: "search" | "question" | "compare" | "other";
  language: "fr" | "ar";
  /** One sentence, already sanitised server-side; null when it failed validation. */
  summary: string | null;
  /** One short clarifying question when the query is genuinely ambiguous. */
  clarify: string | null;
  filters: AiFilters;
  /** Ranked, at most 8, every slug a real programme. */
  results: AiResult[];
  /** Up to 3 follow-up queries in the visitor's language. */
  suggestions: string[];
};

/** What the client knows about the AI layer for the current query. */
export type AiState = "idle" | "thinking" | "ready" | "unavailable";

/** The route's error body: the UI keeps the instant results whatever the reason. */
export type AiError = { reason: "no-key" | "rate-limited" | "timeout" | "refusal" | "invalid" | "too-long" | "error" };
