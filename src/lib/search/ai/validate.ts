import type { Locale } from "../../../i18n/config.ts";
import { SERVED_CITY_IDS } from "../lexicon.ts";
import { normalize, wordForms } from "../normalize.ts";
import { parseQuery } from "../parse.ts";
import type { ParsedQuery } from "../types.ts";
import { mergeAiFilters } from "./apply.ts";
import { CHECKABLE, evaluate, monthlyCeiling, type CheckedDoc } from "./criteria.ts";
import { cleanText, figuresIn, isAllowed, numbersIn, type FoundNumber } from "./numbers.ts";
import type { AiAnswer, AiCriterionKey, AiFilters, AiResult } from "./types.ts";
import type { Vocabulary } from "./vocab.ts";

/**
 * Everything the model returns passes through here before it leaves the
 * server. PURE: the vocabulary and the facts are passed in (the route builds
 * them from src/data; the tests can too), so it is node-importable and has no
 * side effects.
 *
 * - Structure: anything not shaped like an answer → null (the UI keeps the
 *   instant results). Unknown values are dropped one by one, not the whole
 *   answer: an unknown or repeated slug, a city that has no programme, an
 *   amenity that does not exist.
 * - Fit: "exact" is downgraded to "close" when the data contradicts it
 *   (price over the ceiling, wrong city, too few bedrooms…), and the ticks
 *   the data can settle are recomputed from the data.
 * - Text: URLs and markup stripped, lengths capped; the summary is DROPPED if
 *   it states any figure that is neither a catalogue fact of a programme it
 *   returned (or of the portfolio as a whole) nor the visitor's own budget —
 *   a hallucinated price must never reach the screen.
 */

export type ProgrammeFacts = CheckedDoc & {
  slug: string;
  numbers: number[];
  /** The ways a sentence may name it, as folded word sequences (both scripts). */
  names: string[][];
};

export type ValidationContext = {
  vocab: Vocabulary;
  facts: ReadonlyMap<string, ProgrammeFacts>;
  /** Portfolio-wide figures allowed anywhere: counts of programmes, cities, regions; 360°. */
  globalNumbers: readonly number[];
  /** The credit basis and the monthly table: allowed only in a sentence about credit. */
  creditNumbers: readonly number[];
};

export type ValidationInput = {
  q: string;
  locale: Locale;
  /** parseQuery(q) — what the visitor literally said, the source of truth for the fit checks. */
  parsed: ParsedQuery;
};

export const MAX_RESULTS = 8;
export const SUMMARY_MAX = 240;
export const CLARIFY_MAX = 160;
export const SUGGESTION_MAX = 80;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function strings(v: unknown, allowed: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const item of arr(v)) if (typeof item === "string" && allowed.has(item) && !out.includes(item)) out.push(item);
  return out;
}

function bounded(v: unknown, min: number, max: number, integer = false): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  if (integer && !Number.isInteger(v)) return null;
  return v >= min && v <= max ? v : null;
}

export function sanitizeFilters(v: unknown, vocab: Vocabulary): AiFilters {
  const f = isObj(v) ? v : {};
  const region = typeof f.region === "string" && vocab.regions.has(f.region) ? (f.region as AiFilters["region"]) : null;
  return {
    cities: strings(f.cities, vocab.cities),
    region,
    bedroomsMin: bounded(f.bedroomsMin, 1, 6, true),
    // No home is quoted under 100 000 DH: a lower "IA" ceiling would be a nonsense chip.
    priceMax: bounded(f.priceMax, 100_000, 50_000_000),
    monthlyMax: bounded(f.monthlyMax, 1_000, 200_000),
    segments: strings(f.segments, vocab.segments) as AiFilters["segments"],
    kinds: strings(f.kinds, vocab.kinds) as AiFilters["kinds"],
    statuses: strings(f.statuses, vocab.statuses) as AiFilters["statuses"],
    amenities: strings(f.amenities, vocab.amenities) as AiFilters["amenities"],
  };
}

/** A letter of any script but Latin and Arabic: the faster models occasionally slip one into an Arabic sentence. */
const FOREIGN_LETTER = /(?![\p{Script=Latin}\p{Script=Arabic}])\p{L}/u;

/**
 * Strips URLs, markup and control characters; collapses spaces; caps at a word
 * boundary. Text carrying letters of another script (a garbled word, e.g. Hebrew
 * letters inside Arabic) is dropped whole.
 */
export function sanitizeText(v: unknown, max: number): string | null {
  if (typeof v !== "string" || FOREIGN_LETTER.test(v)) return null;
  let text = v
    // Bidi overrides and zero-width characters can reorder what is displayed (isolates are harmless).
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "")
    .replace(/\S+@\S+\.\w+/g, "")
    .replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:com|ma|net|org|fr|io|co|info|biz|xyz|app|dev|me|tv)\b\S*/gi, "")
    .replace(/(?:javascript|data|vbscript)\s*:/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/[*_`#|{}[\]<>\\]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > max) {
    const cut = text.slice(0, max - 1);
    const space = cut.lastIndexOf(" ");
    text = `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:·–—-]+$/, "")}…`;
  }
  return text.length > 0 ? text : null;
}

/* ------------------------------------------------------------------ */
/* Grounding the text: figures and claims                              */
/* ------------------------------------------------------------------ */

/**
 * A sentence is checked clause by clause ("Pour votre budget de 1 200 000 DH,
 * Massylia démarre à 1 045 000 DH" is two clauses), so a figure is held
 * against the programmes named next to it — one programme's price cannot be
 * given to another.
 */
function clauses(text: string): Array<{ text: string; sentence: number; joined: boolean }> {
  const out: Array<{ text: string; sentence: number; joined: boolean }> = [];
  let sentence = 0;
  for (const m of text.matchAll(/[^.;!?؟؛]+(?:[.;!?؟؛]|$)/g)) {
    // Inside a sentence, a comma followed by a space ("1,2 million" has none), an Arabic comma
    // and " : " end a clause; such a clause still speaks of the programmes named just before it
    // ("Massylia, moins de 300 000 DH" is about Massylia).
    let joined = false;
    for (const part of m[0].split(/(?<=,)\s+|(?<=،)\s*|\s+:\s+/)) {
      if (!part.trim()) continue;
      out.push({ text: part, sentence, joined });
      joined = true;
    }
    sentence += 1;
  }
  return out;
}

/** Alternatives inside a clause ("… à Tanger ou notre programme Océane …") are claimed separately. */
const ALTERNATIVES = /\s+(?:ou|mais|tandis que|أو|لكن|بينما)\s+/;

/** The programmes a clause names (either script; glued Arabic prepositions allowed). */
function namedIn(clause: string, ctx: ValidationContext): ProgrammeFacts[] {
  const ws = normalize(clause).split(" ").filter(Boolean);
  const forms = ws.map((w) => wordForms(w));
  const hits: Array<{ fact: ProgrammeFacts; start: number; end: number }> = [];
  for (const fact of ctx.facts.values()) {
    for (const name of fact.names) {
      for (let i = 0; i < ws.length; i += 1) {
        if (name.every((nw, k) => i + k < ws.length && (k === 0 ? forms[i].includes(nw) : ws[i + k] === nw))) {
          hits.push({ fact, start: i, end: i + name.length });
        }
      }
    }
  }
  // "Odyssée Studios" names Odyssée Studios, not also Odyssée.
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start));
  return [...new Set(kept.map((h) => h.fact))];
}

/** The visitor addressed: their wish, their search, their budget. */
const WISH = /(\bpour\b|\bvotre\b|\bvos\b|\bvous\b|souhait|recherch|cherchez|لكم|تبحثون|ترغبون|ميزانيتك|حسب|بحثكم|طلبكم)/i;
/** A link, an address or a domain in model text: the item is dropped, not just cleaned. */
const LINKISH = /(https?:|www\.|\S+@\S+\.\w+|\b[\w-]+\.(?:com|ma|net|org|fr|io|co|info|biz|xyz|app|dev|me|tv)\b|javascript:)/i;

/** "d'autres programmes", "مشاريع أخرى": a clause that turns to other programmes. */
const OTHERS = /(\bautres?\b|أخرى|اخرى|آخر|أخر)/i;

const CREDIT_WORDS = /(apport|mensualit|par mois|\/\s*mois|taux|\bans\b|financement|cr[ée]dit|emprunt|شهري|في الشهر|تسبيق|قرض|تمويل|سنة|سنوات|نسبة)/i;
/** The visitor addressed right before the figure: "votre budget de", "vos 3 chambres", "ميزانيتكم". */
const VISITOR_STRICT = /(?:\b(?:votre|vos)\s+(?:\S+\s+){0,3}|ميزانيت\S*\s+(?:\S+\s+){0,2})$/i;
/** In a clause that names no programme, a budget word is enough. */
const VISITOR_LOOSE =
  /(votre|vos\b|vous|budget|plafond|moins de|jusqu|maximum|max\b|sous\b|ne d[ée]pass|inf[ée]rieur|≤|<|en dessous|ميزاني|حددتم|حددت|يمكنكم|بإمكانكم|أقل من|اقل من|حتى|في حدود|لا يتجاوز|لا تتجاوز)/i;
const MONTHLY_AFTER = /^\s*(?:dh|dhs|mad|درهم)?\s*(?:\/\s*mois|par mois|mensuel|chaque mois|شهري|في الشهر|كل شهر)/i;
/** A ceiling in a suggested query: "moins de 900 000", "≤ 6 000", "أقل من مليون". */
const CEILING_BEFORE = /(moins de|max(?:imum)?|jusqu'?à?|budget|sous|inf[ée]rieur à|≤|<|أقل من|اقل من|حتى|ميزانية|في حدود)\s*$/i;
const BEDROOM_AFTER = /^\s*(?:chambres?|ch\b|غرف|غرفة|بيوت)/i;
/** Negations: an honest "pas de piscine", "aucun programme à Fès", "غير منشور" states nothing. */
const NEGATION =
  /(\b(?:pas|sans|aucun|aucune|ni|non|jamais|ne|manque)\b|\bn['’]|(?:^|\s)(?:لا|ليس|ليست|لم|لن|بدون|ماشي|ما)(?:\s|$)|غير\s+(?:منشور|متوفر|متوفرة|محدد|متاح|متاحة|معلن|مدرج))/i;

type TextKind = "summary" | "clarify" | "suggestion";

type FigureSets = { counts: number[]; facts: number[]; credit: boolean; creditNumbers: readonly number[]; visitor: number[] };

/**
 * Whether a piece of model text may reach the screen. Every figure must be a
 * fact of a programme named in its clause (or, when none is named, of a
 * returned programme), a portfolio-wide count, a credit figure in a sentence
 * about credit, or the visitor's own figure restated as theirs. Every status,
 * amenity, kind, standing and place a clause states must be true of the
 * programmes it talks about, and a programme the summary names must be one of
 * the results. Suggestions and the clarify question are queries, not
 * statements: a figure there may be a budget ("3 chambres moins de 900 000"),
 * and their claims are checked only when they name a programme.
 */
function textAllowed(
  raw: string,
  kind: TextKind,
  input: ValidationInput,
  results: AiResult[],
  filters: AiFilters,
  ctx: ValidationContext,
): boolean {
  const text = cleanText(raw);
  const returned = new Set(results.map((r) => r.slug));
  const returnedFacts = results.map((r) => ctx.facts.get(r.slug)).filter((f): f is ProgrammeFacts => f !== undefined);
  const counts: number[] = [...ctx.globalNumbers, results.length, results.filter((r) => r.fit === "exact").length];

  // The visitor's own figures: what they typed, what the parser read (or the model read, e.g.
  // "80 mlyoun"), and the price ceiling the site computes from a monthly budget.
  const visitor: number[] = numbersIn(input.q).flatMap((n) => n.values);
  const { parsed } = input;
  for (const price of [parsed.priceMax, filters.priceMax]) if (price !== null) visitor.push(price);
  for (const monthly of [parsed.monthlyMax, filters.monthlyMax]) {
    if (monthly !== null) visitor.push(monthly, monthlyCeiling(monthly));
  }
  for (const n of [parsed.bedroomsMin, filters.bedroomsMin]) if (n !== null) visitor.push(n);

  // What the visitor asked for may be restated in a clause that names no programme
  // ("Pour une retraite en bord de mer, …"): that is their wish, not a claim.
  const asked = mergeAiFilters(input.parsed, filters);
  let previous: ProgrammeFacts[] = [];
  for (const clause of clauses(text)) {
    const own = namedIn(clause.text, ctx);
    if (kind === "summary" && own.some((f) => !returned.has(f.slug))) return false;
    const named = own.length > 0 ? own : clause.joined && !OTHERS.test(clause.text) ? previous : [];
    previous = named;
    const subjects = named.length > 0 ? named : returnedFacts;
    const sets: FigureSets = {
      counts,
      facts: subjects.flatMap((f) => f.numbers),
      credit: CREDIT_WORDS.test(clause.text),
      creditNumbers: ctx.creditNumbers,
      visitor,
    };
    for (const found of figuresIn(clause.text)) {
      if (!figureAllowed(found, clause.text, named.length > 0, kind, sets)) return false;
    }
    if (kind !== "summary" && own.length === 0) continue;
    const parts = clause.text.split(ALTERNATIVES);
    for (const [i, part] of parts.entries()) {
      const partOwn = namedIn(part, ctx);
      // The first alternative continues the programmes of the clause before; the others stand alone.
      const partNamed = partOwn.length > 0 ? partOwn : i === 0 && own.length === 0 ? named : [];
      if (!claimsHold(part, partNamed, [...ctx.facts.values()], asked)) return false;
    }
  }
  return true;
}

function figureAllowed(found: FoundNumber, clause: string, namesProgramme: boolean, kind: TextKind, sets: FigureSets): boolean {
  if (isAllowed(found, sets.counts) || isAllowed(found, sets.facts)) return true;
  if (sets.credit && isAllowed(found, sets.creditNumbers)) return true;
  const before = clause.slice(Math.max(0, found.index - 40), found.index);
  const after = clause.slice(found.end, found.end + 24);
  // A query the visitor could type next: a ceiling or a count is not a claim
  // ("3 chambres moins de 900 000"); "Villa à 100 DH à Tanger" is.
  if (kind !== "summary" && !namesProgramme) {
    return isAllowed(found, sets.visitor) || CEILING_BEFORE.test(before) || MONTHLY_AFTER.test(after) || BEDROOM_AFTER.test(after);
  }
  if (!isAllowed(found, sets.visitor)) return false;
  // The visitor's figure restated as theirs — never as a programme's price.
  if (namesProgramme) return VISITOR_STRICT.test(before);
  return VISITOR_LOOSE.test(before) || MONTHLY_AFTER.test(after) || BEDROOM_AFTER.test(after);
}

/**
 * What a clause states — read with the search parser itself — must be true.
 * About named programmes: each status, amenity, kind, standing and place holds
 * for at least one of them ("Jnane Souss offre une piscine" fails). About no
 * programme in particular: each must exist among the programmes of the place
 * it names ("des villas à Tanger" fails, "des appartements à Tanger" passes),
 * the visitor's own wishes aside. Negated clauses state nothing; a city without a
 * programme is never a claim.
 */
function claimsHold(clause: string, named: ProgrammeFacts[], portfolio: ProgrammeFacts[], asked: ParsedQuery): boolean {
  if (NEGATION.test(clause)) return true;
  const q = parseQuery(clause);
  const places = q.cities.filter((id) => SERVED_CITY_IDS.has(id));
  if (named.length > 0) {
    const some = (test: (f: ProgrammeFacts) => boolean) => named.some(test);
    return (
      q.statuses.every((st) => some((f) => f.statuses.includes(st))) &&
      q.amenities.every((a) => some((f) => f.amenities.includes(a))) &&
      q.kinds.every((k) => some((f) => f.kinds.includes(k))) &&
      q.segments.every((seg) => some((f) => f.segment === seg)) &&
      (places.length === 0 || some((f) => places.includes(f.cityId)))
    );
  }
  // The visitor's wish restated as theirs ("Pour une retraite en bord de mer, …") is not a claim;
  // "Découvrez nos villas à Tanger" is.
  const wish = WISH.test(clause) ? asked : null;
  const statuses = q.statuses.filter((v) => !wish?.statuses.includes(v));
  const amenities = q.amenities.filter((v) => !wish?.amenities.includes(v));
  const kinds = q.kinds.filter((v) => !wish?.kinds.includes(v));
  const segments = q.segments.filter((v) => !wish?.segments.includes(v));
  const where = places.filter((id) => !wish?.cities.includes(id));
  if (statuses.length + amenities.length + kinds.length + segments.length + where.length === 0) return true;
  // Each value must exist in the place the clause names: "des villas à Tanger" fails, while
  // "des appartements et des lots de terrain" (two kinds of product) passes.
  const here = places.length > 0 ? portfolio.filter((f) => places.includes(f.cityId)) : portfolio;
  if (here.length === 0) return false;
  return (
    statuses.every((st) => here.some((f) => f.statuses.includes(st))) &&
    amenities.every((am) => here.some((f) => f.amenities.includes(am))) &&
    kinds.every((k) => here.some((f) => f.kinds.includes(k))) &&
    segments.every((seg) => here.some((f) => f.segment === seg))
  );
}

function sanitizeResults(v: unknown, ctx: ValidationContext): AiResult[] {
  const out: AiResult[] = [];
  const seen = new Set<string>();
  for (const item of arr(v)) {
    if (out.length >= MAX_RESULTS) break;
    if (!isObj(item) || typeof item.slug !== "string") continue;
    if (!ctx.vocab.slugs.has(item.slug) || !ctx.facts.has(item.slug) || seen.has(item.slug)) continue;
    seen.add(item.slug);
    const criteria: AiResult["criteria"] = [];
    for (const c of arr(item.criteria)) {
      if (!isObj(c) || typeof c.key !== "string" || typeof c.ok !== "boolean") continue;
      if (!ctx.vocab.criteria.has(c.key) || criteria.length >= 8) continue;
      criteria.push({ key: c.key as AiCriterionKey, ok: c.ok });
    }
    out.push({ slug: item.slug, fit: item.fit === "exact" ? "exact" : "close", criteria });
  }
  return out;
}

/**
 * Re-checks each result against the data: the criteria the data can settle
 * are replaced by the data's own verdict, and an "exact" fit the data
 * contradicts becomes "close".
 */
function checkFits(results: AiResult[], filters: AiFilters, input: ValidationInput, ctx: ValidationContext): AiResult[] {
  const constraints = mergeAiFilters(input.parsed, filters);
  return results.map((r) => {
    const doc = ctx.facts.get(r.slug)!;
    const checks = evaluate(doc, constraints);
    const fromData = checks.map((c) => ({ key: c.key as AiCriterionKey, ok: c.ok }));
    const fromModel = r.criteria.filter((c) => !CHECKABLE.has(c.key));
    const criteria = [...fromData, ...fromModel].slice(0, 8);
    // The data's verdict, and the model's own on what only it can judge (surface, location…).
    const contradicted = checks.some((c) => !c.ok) || fromModel.some((c) => !c.ok);
    return { ...r, fit: r.fit === "exact" && !contradicted ? "exact" : "close", criteria };
  });
}

const ARABIC = /[؀-ۿ]/;

export function validateAnswer(candidate: unknown, input: ValidationInput, ctx: ValidationContext): AiAnswer | null {
  if (!isObj(candidate)) return null;
  const intents = ["search", "question", "compare", "other"] as const;
  const intent = intents.find((i) => i === candidate.intent) ?? "search";
  const language: "fr" | "ar" =
    candidate.language === "fr" || candidate.language === "ar"
      ? candidate.language
      : ARABIC.test(input.q)
        ? "ar"
        : input.locale;

  const filters = sanitizeFilters(candidate.filters, ctx.vocab);
  const results = checkFits(sanitizeResults(candidate.results, ctx), filters, input, ctx);

  let summary = sanitizeText(candidate.summary, SUMMARY_MAX);
  if (summary && !textAllowed(summary, "summary", input, results, filters, ctx)) summary = null;

  let clarify = typeof candidate.clarify === "string" && LINKISH.test(candidate.clarify) ? null : sanitizeText(candidate.clarify, CLARIFY_MAX);
  if (clarify && !textAllowed(clarify, "clarify", input, results, filters, ctx)) clarify = null;

  const suggestions: string[] = [];
  const asked = input.q.trim().toLowerCase();
  for (const s of arr(candidate.suggestions)) {
    // A suggestion fills the search field: one that carried a link is dropped whole.
    const text = typeof s === "string" && LINKISH.test(s) ? null : sanitizeText(s, SUGGESTION_MAX);
    if (!text || text.toLowerCase() === asked || suggestions.some((x) => x.toLowerCase() === text.toLowerCase())) continue;
    if (!textAllowed(text, "suggestion", input, results, filters, ctx)) continue;
    suggestions.push(text);
    if (suggestions.length === 3) break;
  }

  return { intent, language, summary, clarify, filters, results, suggestions };
}
