import type { Amenity, Kind, Segment } from "../../data/types.ts";
import type { StatusFacet } from "../status-facets.ts";
import { isTypoOf } from "./fuzzy.ts";
import {
  BEDROOM_WORDS,
  CEILING_PHRASES,
  CENTIME_WORDS,
  CITY_REGION,
  CURRENCY_WORDS,
  DELIVERY_WORDS,
  DEPOSIT_LINKS,
  DEPOSIT_WORDS,
  DUAL_BEDROOMS,
  FLOOR_PHRASES,
  GREETING_HEADS,
  GREETING_TAILS,
  HALF_WORDS,
  INCOME_WORDS,
  KIND_ALIASES,
  LEXICON,
  LEXICON_BY_FIRST,
  MILLION_WORDS,
  MONTHLY_AFTER,
  MONTHLY_BEFORE,
  MONTHLY_LINKS,
  NEVER_FUZZY,
  NUMBER_WORDS,
  ORDINAL_SUFFIXES,
  PHRASE_FILLERS,
  PLACE_LEAD_WORDS,
  PROTECTED_NAME_WORDS,
  PROTECTED_PHRASES,
  QUARTER_WORDS,
  RANGE_LINKS,
  RANGE_OPENERS,
  REGION_CITIES,
  REGION_MARKERS,
  ROOM_WORDS,
  STOP_WORDS,
  STREET_WORDS,
  SURFACE_WORDS,
  THOUSAND_WORDS,
  TIME_QUESTION_WORDS,
  TWO_MILLION_WORDS,
  type LexEntry,
  type LexValue,
} from "./lexicon.ts";
import { entryForms, tokenize, wordForms, words, type Token } from "./normalize.ts";
import type { ParsedQuery, QuerySpan, RegionId } from "./types.ts";

/**
 * The concierge's reader: free text in French, Arabic, Darija or any mix of
 * them → structured filters, each with the span of raw text that produced it
 * so the UI can show it as a chip and delete its words.
 *
 * One left-to-right pass over the tokens. At each unclaimed token, in order:
 * a protected programme name ("Jnane Souss") → text; a bedroom count; a sum
 * (price, monthly payment, or a surface/floor that is read and set aside);
 * the longest exact vocabulary phrase; the longest phrase within typo
 * tolerance. Context words ("moins de", "près de", "avec") are taken back
 * into the span of the value they introduce. What is left, minus stop words,
 * is `text`.
 */

/** Long pastes are read up to here; nobody describes a home in more words. */
const MAX_TOKENS = 200;

const BEDROOM_TYPO_TARGETS = ["chambres", "chambre"];

type Claim = "free" | "used" | "text";

type Ctx = {
  raw: string;
  toks: Token[];
  claim: Claim[];
  out: ParsedQuery;
  /** "quand sera livré…", "متى…": delivery words ask for a date, they are not a status. */
  timeQuestion: boolean;
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function inSet(set: Set<string>, tok: Token | undefined): boolean {
  if (!tok || tok.num) return false;
  return wordForms(tok.norm).some((f) => set.has(f));
}

function wordMatches(tok: Token, target: string, fuzzy: boolean): boolean {
  if (tok.num) return tok.norm === target;
  const targets = entryForms(target);
  const forms = wordForms(tok.norm);
  if (forms.some((f) => targets.includes(f))) return true;
  if (!fuzzy) return false;
  // A word that is the start of the target with two letters or more missing is
  // another word, not a typo: "mohammed" is not "mohammedia".
  return forms.some((f) => targets.some((t) => isTypoOf(f, t) && !(t.startsWith(f) && t.length - f.length >= 2)));
}

function gap(ctx: Ctx, j: number): string {
  const prevEnd = j > 0 ? ctx.toks[j - 1].end : 0;
  return ctx.raw.slice(prevEnd, ctx.toks[j].start);
}

function adjacent(ctx: Ctx, j: number): boolean {
  return j > 0 && ctx.toks[j - 1].end === ctx.toks[j].start;
}

function addSpan(ctx: Ctx, start: number, end: number, field: QuerySpan["field"]) {
  ctx.out.spans.push({ start, end, field });
}

function claim(ctx: Ctx, from: number, to: number) {
  for (let k = from; k < to; k += 1) ctx.claim[k] = "used";
}

function pushUnique<T>(list: T[], value: T) {
  if (!list.includes(value)) list.push(value);
}

function isProtected(norm: string): boolean {
  return PROTECTED_NAME_WORDS.some((p) => p === norm || isTypoOf(norm, p));
}

/** Words that typo tolerance must leave alone. */
function noFuzzy(norm: string): boolean {
  return STOP_WORDS.has(norm) || NEVER_FUZZY.has(norm) || isProtected(norm);
}

/**
 * Free tokens just before `i` that match one of `phrases` (longest first).
 * Returns the index of the first absorbed token, or `i` when none matched.
 */
function lookBehindPhrase(ctx: Ctx, i: number, phrases: string[][]): number {
  let best = i;
  for (const phrase of phrases) {
    const k = phrase.length;
    const from = i - k;
    if (from < 0 || from >= best) continue;
    let ok = true;
    for (let m = 0; m < k; m += 1) {
      const tok = ctx.toks[from + m];
      if (ctx.claim[from + m] !== "free" || tok.num || tok.norm !== phrase[m]) {
        ok = false;
        break;
      }
    }
    if (ok) best = from;
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Bedrooms                                                            */
/* ------------------------------------------------------------------ */

function isBedroomWord(tok: Token | undefined): boolean {
  if (!tok || tok.num) return false;
  if (inSet(BEDROOM_WORDS, tok)) return true;
  return tok.norm.length >= 5 && BEDROOM_TYPO_TARGETS.some((t) => isTypoOf(tok.norm, t));
}

function smallCount(tok: Token | undefined, max = 9): number | null {
  if (!tok) return null;
  if (tok.num) {
    const n = Number(tok.norm);
    return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
  }
  // "بثلاث غرف": the preposition is glued to the number word.
  for (const form of wordForms(tok.norm)) {
    const n = NUMBER_WORDS.get(form);
    if (n !== undefined) return n;
  }
  return null;
}

/** "2 ou 3", "2 à 3", "2-3", "2 و 3", "2 ola 3": a range of counts — the buyer accepts the smaller. */
const COUNT_RANGE_LINKS = new Set(["ou", "a", "au", "et", "or", "و", "او", "ولا", "ola", "wla"].flatMap((w) => words(w)));
/** "tlata d byout", "3 ديال البيوت": a filler between a count and the bedroom word. */
const COUNT_FILLERS = new Set(["d", "de", "dyal", "dial", "د", "ديال"].flatMap((w) => words(w)));

function setBedrooms(ctx: Ctx, n: number, from: number, to: number) {
  ctx.out.bedroomsMin = Math.max(ctx.out.bedroomsMin ?? 0, n);
  addSpan(ctx, ctx.toks[from].start, ctx.toks[to - 1].end, "bedroomsMin");
  claim(ctx, from, to);
}

function tryBedrooms(ctx: Ctx, i: number): boolean {
  const { toks } = ctx;
  const tok = toks[i];
  // "غرفتين", "بيتين"
  if (!tok.num && inSet(DUAL_BEDROOMS, tok)) {
    setBedrooms(ctx, 2, i, i + 1);
    return true;
  }
  const n = smallCount(tok);
  const next = toks[i + 1];
  // "F3", "T4": the French apartment type counts rooms, living room included.
  if ((tok.norm === "f" || tok.norm === "t") && next?.num && adjacent(ctx, i + 1) && ctx.claim[i + 1] === "free") {
    const rooms = smallCount(next);
    const after = toks[i + 2];
    if (rooms !== null && (!after || !adjacent(ctx, i + 2))) {
      if (rooms >= 2) {
        setBedrooms(ctx, rooms - 1, i, i + 2);
      } else {
        pushUnique(ctx.out.kinds, "studio" as Kind);
        addSpan(ctx, tok.start, next.end, "kinds");
        claim(ctx, i, i + 2);
      }
      return true;
    }
  }
  // A range of counts before the bedroom word: "2 ou 3 chambres", "2-3 ch", "2 à 3 chambres".
  if (n !== null && next && ctx.claim[i + 1] === "free") {
    let k = i + 1;
    if (!next.num && COUNT_RANGE_LINKS.has(next.norm)) k = i + 2;
    else if (!(next.num && /^\s*[-–/]\s*$/.test(gap(ctx, i + 1)))) k = -1;
    const m = k > 0 && ctx.claim[k] === "free" ? smallCount(toks[k], 12) : null;
    if (m !== null && m !== n) {
      let w = k + 1;
      if (toks[w] && ctx.claim[w] === "free" && COUNT_FILLERS.has(toks[w].norm) && isBedroomWord(toks[w + 1])) w += 1;
      if (ctx.claim[w] === "free" && isBedroomWord(toks[w])) {
        // setBedrooms keeps the largest floor across a query; a range sets the smaller of its own two.
        ctx.out.bedroomsMin = Math.max(ctx.out.bedroomsMin ?? 0, Math.min(n, m));
        addSpan(ctx, tok.start, toks[w].end, "bedroomsMin");
        claim(ctx, i, w + 1);
        return true;
      }
    }
  }
  // "tlata d byout"
  if (n !== null && next && ctx.claim[i + 1] === "free" && COUNT_FILLERS.has(next.norm) && ctx.claim[i + 2] === "free" && isBedroomWord(toks[i + 2])) {
    setBedrooms(ctx, n, i, i + 3);
    return true;
  }
  // "10 chambres": more than the largest home — read anyway, so the search widens and says so.
  const big = tok.num ? smallCount(tok, 12) : null;
  if (n === null && big !== null && next && ctx.claim[i + 1] === "free" && /^[\s+]*$/.test(gap(ctx, i + 1)) && isBedroomWord(next)) {
    setBedrooms(ctx, big, i, i + 2);
    return true;
  }
  if (n !== null && next && ctx.claim[i + 1] === "free" && /^[\s+]*$/.test(gap(ctx, i + 1))) {
    // A digit glued to the next digits is a bigger number ("3 200 000"), not a count.
    if (isBedroomWord(next)) {
      setBedrooms(ctx, n, i, i + 2);
      return true;
    }
    if (inSet(ROOM_WORDS, next)) {
      if (n >= 2) {
        setBedrooms(ctx, n - 1, i, i + 2);
      } else {
        // "1 pièce" is a studio.
        pushUnique(ctx.out.kinds, "studio" as Kind);
        addSpan(ctx, tok.start, next.end, "kinds");
        claim(ctx, i, i + 2);
      }
      return true;
    }
  }
  // "غرفة واحدة", "غرف 3"
  if (isBedroomWord(tok) && next && ctx.claim[i + 1] === "free") {
    const count = smallCount(next);
    if (count !== null) {
      setBedrooms(ctx, count, i, i + 2);
      return true;
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Sums: prices, monthly payments, surfaces                            */
/* ------------------------------------------------------------------ */

type Sum = {
  value: number;
  /** Exclusive token index after the sum. */
  end: number;
  scaled: boolean;
  currency: boolean;
  surface: boolean;
  monthly: boolean;
};

const THOUSANDS_SEP = /^[    .,']$/;

/** Reads a number expression starting at token i, or null. */
function readSum(ctx: Ctx, i: number): Sum | null {
  const { toks } = ctx;
  const free = (j: number) => j < toks.length && ctx.claim[j] === "free";
  if (!free(i)) return null;
  const tok = toks[i];
  let value: number;
  let j: number;
  let scaled = false;
  let million = false;

  if (tok.num) {
    let digits = tok.norm;
    j = i + 1;
    let grouped = false;
    while (
      free(j) &&
      toks[j].num &&
      toks[j].norm.length === 3 &&
      THOUSANDS_SEP.test(gap(ctx, j)) &&
      (grouped || digits.length <= 3)
    ) {
      digits += toks[j].norm;
      grouped = true;
      j += 1;
    }
    value = Number(digits);
    if (!grouped && free(j) && toks[j].num && /^[.,]$/.test(gap(ctx, j)) && toks[j].norm.length <= 2) {
      value = Number(`${digits}.${toks[j].norm}`);
      j += 1;
    }
  } else if (NUMBER_WORDS.has(tok.norm) && (inSet(MILLION_WORDS, toks[i + 1]) || inSet(THOUSAND_WORDS, toks[i + 1]))) {
    value = NUMBER_WORDS.get(tok.norm) ?? 1;
    j = i + 1;
  } else if (inSet(MILLION_WORDS, tok)) {
    value = 1; // "أقل من مليون", "million et demi"
    j = i;
  } else if (inSet(TWO_MILLION_WORDS, tok)) {
    value = 2;
    j = i;
  } else {
    return null;
  }

  // Multiplier.
  if (free(j) && !toks[j].num) {
    const w = toks[j];
    if ((w.norm === "m" || w.norm === "م") && value < 10) {
      // "1.2M", "1m5" (one million five hundred thousand)
      million = true;
      j += 1;
      if (free(j) && toks[j].num && adjacent(ctx, j) && toks[j].norm.length === 1 && Number.isInteger(value)) {
        value += Number(toks[j].norm) / 10;
        j += 1;
      }
    } else if (inSet(MILLION_WORDS, w) || inSet(TWO_MILLION_WORDS, w)) {
      million = true;
      j += 1;
    } else if (inSet(THOUSAND_WORDS, w)) {
      value *= 1000;
      scaled = true;
      j += 1;
    }
  }
  if (million) {
    // "et demi", "ونص", "و نصف"
    if (free(j) && inSet(HALF_WORDS, toks[j]) && !["demi", "demie", "نص", "نصف"].includes(toks[j].norm)) {
      value += 0.5;
      j += 1;
    } else if (free(j + 1) && (toks[j]?.norm === "et" || toks[j]?.norm === "و") && inSet(HALF_WORDS, toks[j + 1])) {
      value += 0.5;
      j += 2;
    } else if (free(j) && toks[j].norm === "وربع") {
      value += 0.25;
      j += 1;
    } else if (free(j + 1) && (toks[j]?.norm === "et" || toks[j]?.norm === "و") && inSet(QUARTER_WORDS, toks[j + 1])) {
      value += 0.25;
      j += 2;
    }
    // Moroccan centimes: from ten "millions" up, the unit is ten thousand dirhams.
    const centimes = value >= 10;
    value = centimes ? value * 10_000 : value * 1_000_000;
    scaled = true;
    // "1 million 200", "مليون و200 ألف": the thousands that follow the millions.
    let k = j;
    if (free(k) && (toks[k].norm === "et" || toks[k].norm === "و")) k += 1;
    const rest = free(k) && toks[k].num ? Number(toks[k].norm) : NaN;
    if (Number.isInteger(rest) && rest >= 1 && rest <= 999 && !isBedroomWord(toks[k + 1]) && !inSet(ROOM_WORDS, toks[k + 1]) && !inSet(SURFACE_WORDS, toks[k + 1]) && toks[k + 1]?.norm !== "m") {
      value += centimes ? rest * 10 : rest * 1000;
      j = k + 1;
      if (free(j) && inSet(THOUSAND_WORDS, toks[j])) j += 1;
    }
  }

  // Currency.
  let currency = false;
  if (free(j) && inSet(CURRENCY_WORDS, toks[j])) {
    currency = true;
    j += 1;
  } else if (free(j) && inSet(CENTIME_WORDS, toks[j])) {
    if (!million) value /= 100;
    currency = true;
    j += 1;
  }

  // Surface: "90 m²", "90m2", "90 م²", "120 mètres carrés" — and a land rate,
  // "4 500 dh/m²", "4500 dh le m2": both are read and set aside, never a budget.
  let surface = false;
  if (!scaled && free(j)) {
    let k = j;
    if (currency && free(k) && ["le", "par", "du", "ل", "لل", "للمتر"].includes(toks[k].norm)) k += 1;
    const w = toks[k];
    if (w && free(k) && !w.num) {
      const unitWithTwo = (w.norm === "m" || w.norm === "م") && free(k + 1) && toks[k + 1].num && toks[k + 1].norm === "2" && adjacent(ctx, k + 1);
      if (unitWithTwo) {
        surface = true;
        j = k + 2;
      } else if (inSet(SURFACE_WORDS, w) || ((w.norm === "m" || w.norm === "م") && (value >= 10 || currency))) {
        surface = true;
        j = k + 1;
        if (free(j) && inSet(SURFACE_WORDS, toks[j])) j += 1; // "mètres carrés"
      }
    }
  }

  // Monthly marker after: "/mois", "par mois", "شهريا", "في الشهر", "فالشهر".
  let monthly = false;
  if (!surface) {
    let k = j;
    let links = 0;
    while (free(k) && links < 2 && inSet(MONTHLY_LINKS, toks[k]) && !inSet(MONTHLY_AFTER, toks[k])) {
      k += 1;
      links += 1;
    }
    if (free(k) && inSet(MONTHLY_AFTER, toks[k])) {
      monthly = true;
      j = k + 1;
    }
  }

  return { value, end: j, scaled, currency, surface, monthly };
}

type SumContext = { start: number; ceiling: boolean; floor: boolean; monthly: boolean };

/** Takes "moins de", "jusqu'à", "≤", "mensualité max", "plus de"… back into the sum. */
function sumContext(ctx: Ctx, i: number): SumContext {
  let first = i;
  let ceiling = false;
  let floor = false;
  let monthly = false;
  for (let round = 0; round < 3; round += 1) {
    const c = lookBehindPhrase(ctx, first, CEILING_PHRASES);
    if (c < first) {
      ceiling = true;
      first = c;
      continue;
    }
    const f = lookBehindPhrase(ctx, first, FLOOR_PHRASES);
    if (f < first) {
      floor = true;
      first = f;
      continue;
    }
    const prev = ctx.toks[first - 1];
    if (prev && ctx.claim[first - 1] === "free" && inSet(MONTHLY_BEFORE, prev)) {
      monthly = true;
      first -= 1;
      continue;
    }
    const opener = ctx.toks[first - 1];
    if (opener && ctx.claim[first - 1] === "free" && inSet(RANGE_OPENERS, opener)) {
      first -= 1;
      continue;
    }
    break;
  }
  let start = ctx.toks[first].start;
  // Symbols are not tokens: "≤ 900 000", "< 900000", "> 1 000 000".
  const before = ctx.raw.slice(first > 0 ? ctx.toks[first - 1].end : 0, ctx.toks[first].start);
  const sym = before.search(/(<=|=<|≤|<|>=|≥|>)\s*$/);
  if (sym >= 0) {
    const symbol = before.slice(sym).trim();
    if (symbol.includes(">") || symbol.includes("≥")) floor = true;
    else ceiling = true;
    start = (first > 0 ? ctx.toks[first - 1].end : 0) + sym;
  }
  return { start, ceiling, floor, monthly };
}

/**
 * A deposit or an income word just before the sum ("apport de 200 000",
 * "je gagne 10 000", "تسبيق 10 مليون"): the index of that word, or -1.
 * Looks back over at most three free words.
 */
function setAsideBefore(ctx: Ctx, i: number): number {
  for (let k = i - 1; k >= 0 && k >= i - 3; k -= 1) {
    const tok = ctx.toks[k];
    if (ctx.claim[k] !== "free" || tok.num) return -1;
    if (inSet(DEPOSIT_WORDS, tok) || inSet(INCOME_WORDS, tok)) return k;
  }
  return -1;
}

/** "300 000 DH d'apport", "comme apport": the index after the deposit word, or -1. */
function setAsideAfter(ctx: Ctx, end: number): number {
  let k = end;
  let links = 0;
  while (k < ctx.toks.length && ctx.claim[k] === "free" && links < 2 && inSet(DEPOSIT_LINKS, ctx.toks[k]) && !inSet(DEPOSIT_WORDS, ctx.toks[k])) {
    k += 1;
    links += 1;
  }
  return k < ctx.toks.length && ctx.claim[k] === "free" && inSet(DEPOSIT_WORDS, ctx.toks[k]) ? k + 1 : -1;
}

function trySum(ctx: Ctx, i: number): boolean {
  const first = readSum(ctx, i);
  if (!first) return false;
  // What the visitor has (a deposit) or earns (a salary) is read and set aside, never a ceiling.
  const before = setAsideBefore(ctx, i);
  const afterEnd = before < 0 ? setAsideAfter(ctx, first.end) : -1;
  if (before >= 0 || afterEnd >= 0) {
    claim(ctx, before >= 0 ? before : i, afterEnd >= 0 ? afterEnd : first.end);
    return true;
  }
  const context = sumContext(ctx, i);

  // A range: "entre 600 000 et 900 000", "بين 500 و 700 ألف", "de 4000 à 6000 dh/mois".
  let sum = first;
  const link = ctx.toks[first.end];
  if (link && ctx.claim[first.end] === "free" && inSet(RANGE_LINKS, link) && !first.surface) {
    const second = readSum(ctx, first.end + 1);
    if (second && !second.surface && second.value > first.value) sum = second;
  }

  const end = ctx.toks[sum.end - 1].end;
  const monthly = sum.monthly || context.monthly;
  let field: "priceMax" | "monthlyMax" | null = null;
  if (sum.surface || context.floor) field = null;
  else if (monthly) field = "monthlyMax";
  else if (sum.value >= 100_000) field = "priceMax";
  else if ((context.ceiling || sum.currency || sum.scaled) && sum.value >= 1_000 && sum.value <= 30_000) field = "monthlyMax";
  // A sum no home costs and no monthly payment reaches ("99 000 DH", "max 800 DH"): read and set aside.
  else if ((context.ceiling || sum.currency || sum.scaled) && sum.value >= 500) field = null;
  else return false; // a small bare number: text ("Riad Garden 2")

  const fromTok = ctx.toks.findIndex((t) => t.end > context.start);
  claim(ctx, Math.max(0, fromTok), sum.end);
  if (field) {
    const value = Math.round(sum.value);
    ctx.out[field] = Math.max(ctx.out[field] ?? 0, value);
    addSpan(ctx, context.start, end, field);
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

type PhraseMatch = { entry: LexEntry; end: number };

/** Matches one phrase at i; fillers may sit between its words. */
function matchPhrase(ctx: Ctx, i: number, entry: LexEntry, fuzzy: boolean): number | null {
  let j = i;
  for (let w = 0; w < entry.phrase.length; w += 1) {
    if (w > 0) {
      let skipped = 0;
      while (
        j < ctx.toks.length &&
        ctx.claim[j] === "free" &&
        skipped < 2 &&
        !wordMatches(ctx.toks[j], entry.phrase[w], false) &&
        PHRASE_FILLERS.has(ctx.toks[j].norm)
      ) {
        j += 1;
        skipped += 1;
      }
    }
    const tok = ctx.toks[j];
    if (!tok || ctx.claim[j] !== "free") return null;
    const allowFuzzy = fuzzy && !noFuzzy(tok.norm);
    if (!wordMatches(tok, entry.phrase[w], allowFuzzy)) return null;
    j += 1;
  }
  return j;
}

function bestPhrase(ctx: Ctx, i: number, fuzzy: boolean): PhraseMatch | null {
  const tok = ctx.toks[i];
  let candidates: LexEntry[];
  if (fuzzy) {
    candidates = LEXICON;
  } else {
    const seen = new Set<LexEntry>();
    candidates = [];
    for (const form of wordForms(tok.norm)) {
      for (const entry of LEXICON_BY_FIRST.get(form) ?? []) {
        if (!seen.has(entry)) {
          seen.add(entry);
          candidates.push(entry);
        }
      }
    }
  }
  let best: PhraseMatch | null = null;
  for (const entry of candidates) {
    if (fuzzy && entry.exactOnly) continue;
    const end = matchPhrase(ctx, i, entry, fuzzy);
    if (end === null) continue;
    if (!best || end > best.end || (end === best.end && entry.phrase.length > best.entry.phrase.length)) {
      best = { entry, end };
    }
  }
  return best;
}

/** Free lead-in words before a place or an amenity ("près de", "à", "avec", "قرب"). */
function leadIn(ctx: Ctx, i: number, lead: Set<string>, max = 3): number {
  let first = i;
  while (first > 0 && i - first < max && ctx.claim[first - 1] === "free" && !ctx.toks[first - 1].num && lead.has(ctx.toks[first - 1].norm)) {
    first -= 1;
  }
  return first;
}

const AMENITY_LEADS = new Set(["avec", "مع"]);

function applyValue(ctx: Ctx, value: LexValue, i: number, end: number) {
  const { out } = ctx;
  let from = i;
  let field: QuerySpan["field"] = value.field;
  switch (value.field) {
    case "cities": {
      from = leadIn(ctx, i, PLACE_LEAD_WORDS);
      const asksRegion = ctx.toks.slice(from, i).some((t) => REGION_MARKERS.has(t.norm));
      const region = CITY_REGION[value.value];
      if (asksRegion && region) {
        setRegion(ctx, region);
        field = "region";
      } else {
        pushUnique(out.cities, value.value);
      }
      break;
    }
    case "region":
      from = leadIn(ctx, i, PLACE_LEAD_WORDS);
      setRegion(ctx, value.value);
      break;
    case "segments":
      pushUnique(out.segments, value.value as Segment);
      break;
    case "kinds":
      pushUnique(out.kinds, value.value as Kind);
      break;
    case "statuses":
      pushUnique(out.statuses, value.value as StatusFacet);
      break;
    case "amenities":
      from = leadIn(ctx, i, AMENITY_LEADS, 1);
      pushUnique(out.amenities, value.value as Amenity);
      break;
  }
  addSpan(ctx, ctx.toks[from].start, ctx.toks[end - 1].end, field);
  claim(ctx, from, end);
}

function setRegion(ctx: Ctx, region: RegionId) {
  if (ctx.out.region === null) ctx.out.region = region;
  for (const city of REGION_CITIES[region]) pushUnique(ctx.out.cities, city);
}

function tryProtectedPhrase(ctx: Ctx, i: number): number {
  for (const phrase of PROTECTED_PHRASES) {
    const end = i + phrase.length;
    if (end > ctx.toks.length) continue;
    if (phrase.every((w, k) => ctx.claim[i + k] === "free" && ctx.toks[i + k].norm === w)) {
      for (let k = i; k < end; k += 1) ctx.claim[k] = "text";
      return end;
    }
  }
  return i;
}

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

function blank(raw: string): ParsedQuery {
  return {
    raw,
    text: [],
    cities: [],
    region: null,
    bedroomsMin: null,
    priceMax: null,
    monthlyMax: null,
    segments: [],
    kinds: [],
    statuses: [],
    amenities: [],
    spans: [],
  };
}

/** "السلام عليكم", "assalam alaikoum": a greeting, never the programme Assalam TG. */
function tryGreeting(ctx: Ctx, i: number): boolean {
  const tok = ctx.toks[i];
  const next = ctx.toks[i + 1];
  if (tok.num || !GREETING_HEADS.has(tok.norm) || !next || ctx.claim[i + 1] !== "free") return false;
  if (!wordForms(next.norm).some((f) => GREETING_TAILS.has(f))) return false;
  claim(ctx, i, i + 2);
  return true;
}

/** "2ème", "1er": an ordinal (a floor), not a programme number. */
function tryOrdinal(ctx: Ctx, i: number): boolean {
  const tok = ctx.toks[i];
  const next = ctx.toks[i + 1];
  if (!tok.num || !next || !adjacent(ctx, i + 1) || ctx.claim[i + 1] !== "free" || !ORDINAL_SUFFIXES.has(next.norm)) return false;
  claim(ctx, i, i + 2);
  return true;
}

/**
 * Whether a matched phrase may become a value. A delivery status inside a
 * question about time is a question ("quand sera livré Amaïa ?"); a town
 * without a programme after a street word is an address ("Avenue Laayoune").
 */
function acceptable(ctx: Ctx, entry: LexEntry, i: number, end: number): boolean {
  if (entry.value.field === "statuses" && ctx.timeQuestion) {
    for (let k = i; k < end; k += 1) if (inSet(DELIVERY_WORDS, ctx.toks[k])) return false;
  }
  if (entry.exactOnly && entry.value.field === "cities" && i > 0 && STREET_WORDS.has(ctx.toks[i - 1].norm)) return false;
  return true;
}

const VILLA_WORDS = new Set((KIND_ALIASES.villa ?? []).flatMap((w) => words(w)));

/**
 * "terrain pour (construire une) villa", "lot pour villa": the villa is what
 * the buyer will build, so it does not filter the kind — no programme is both
 * land and a villa, and the filter would only cancel the land search.
 */
function landForVilla(ctx: Ctx) {
  const { out } = ctx;
  if (!out.segments.includes("terrain" as Segment) || !out.kinds.includes("villa" as Kind)) return;
  out.kinds = out.kinds.filter((k) => k !== "villa");
  ctx.toks.forEach((tok, k) => {
    if (!tok.num && wordForms(tok.norm).some((f) => VILLA_WORDS.has(f))) {
      ctx.claim[k] = "text";
      out.spans = out.spans.filter((sp) => !(sp.field === "kinds" && sp.start <= tok.start && sp.end >= tok.end));
    }
  });
}

export function parseQuery(raw: string): ParsedQuery {
  const out = blank(raw);
  const toks = tokenize(raw).slice(0, MAX_TOKENS);
  const timeQuestion = toks.some((t) => !t.num && TIME_QUESTION_WORDS.has(t.norm));
  const ctx: Ctx = { raw, toks, claim: toks.map(() => "free" as Claim), out, timeQuestion };

  for (let i = 0; i < toks.length; i += 1) {
    if (ctx.claim[i] !== "free") continue;
    if (tryGreeting(ctx, i)) {
      i += 1;
      continue;
    }
    const after = tryProtectedPhrase(ctx, i);
    if (after > i) {
      i = after - 1;
      continue;
    }
    if (tryOrdinal(ctx, i)) continue;
    if (tryBedrooms(ctx, i)) continue;
    if (trySum(ctx, i)) continue;
    const exact = bestPhrase(ctx, i, false);
    if (exact) {
      if (acceptable(ctx, exact.entry, i, exact.end)) applyValue(ctx, exact.entry.value, i, exact.end);
      // An address keeps its words as text (they match the neighbourhood); a time question drops them.
      else for (let k = i; k < exact.end; k += 1) ctx.claim[k] = exact.entry.exactOnly ? "text" : "used";
      continue;
    }
    const tok = toks[i];
    if (!tok.num && tok.norm.length >= 5 && !noFuzzy(tok.norm)) {
      const near = bestPhrase(ctx, i, true);
      if (near && acceptable(ctx, near.entry, i, near.end)) applyValue(ctx, near.entry.value, i, near.end);
    }
  }
  landForVilla(ctx);

  out.text = toks.filter((t, k) => ctx.claim[k] !== "used" && !STOP_WORDS.has(t.norm)).map((t) => t.norm);
  out.spans.sort((a, b) => a.start - b.start);
  return out;
}

export function emptyQuery(): ParsedQuery {
  return parseQuery("");
}
