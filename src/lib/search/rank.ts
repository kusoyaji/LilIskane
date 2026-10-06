import { DEFAULT_DEPOSIT, maxAffordablePrice } from "../credit.ts";
import { damerau, isTypoOf } from "./fuzzy.ts";
import { STOP_WORDS } from "./lexicon.ts";
import { entryForms, wordForms, words } from "./normalize.ts";
import type { Hit, ParsedQuery, SearchDoc, SearchOutcome } from "./types.ts";

/**
 * The ranker: structured values filter, free text scores.
 *
 * Filters — cities (a region arrives already expanded into its cities),
 * statuses, kinds and segments combine with OR inside a field; amenities with
 * AND; bedrooms against the programme's largest typology; the price against
 * the entry price; a monthly ceiling through lib/credit.ts at the /projets
 * default deposit, so search and /projets can never disagree.
 *
 * Text — each leftover word scores its best match on a programme: exact name
 * word > name prefix > typo of a name word > neighbourhood > city. A word that
 * matches no programme at all is noise and is ignored. Among the programmes
 * that pass the filters, only those matching the most words stay
 * ("riad garden 2" keeps Riad Garden II, not I).
 *
 * Never empty while programmes exist: when nothing satisfies everything,
 * constraints are dropped least-important-first, then any dropped constraint
 * that is not actually needed is put back, so `relaxed` names only what had to
 * go. Ties keep a neutral order: score, then price ascending — no programme is
 * pushed for any other reason.
 */

type Field = "amenities" | "text" | "bedroomsMin" | "kinds" | "segments" | "statuses" | "cities" | "monthlyMax" | "priceMax";

/** Least important first. */
const RELAX_ORDER: Field[] = [
  "amenities",
  "text",
  "bedroomsMin",
  "kinds",
  "segments",
  "statuses",
  "cities",
  "monthlyMax",
  "priceMax",
];

/* ------------------------------------------------------------------ */
/* Text index per document                                             */
/* ------------------------------------------------------------------ */

/** One word of a name/place, with every form it answers to ("ii" answers to "2"). */
type WordGroup = string[];

type DocIndex = {
  nameFr: WordGroup[];
  nameAr: WordGroup[];
  neighbourhood: WordGroup[];
  city: WordGroup[];
};

const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4" };
/** Street words say nothing about which programme someone means. */
const GENERIC_PLACE_WORDS = new Set(
  ["avenue", "av", "route", "rue", "bd", "boulevard", "zone", "entree", "شارع", "طريق", "زنقة", "المدخل", "منطقة"].flatMap((w) => words(w)),
);

function groups(value: string, skip: Set<string> = STOP_WORDS): WordGroup[] {
  return words(value)
    .filter((w) => !skip.has(w) && !GENERIC_PLACE_WORDS.has(w))
    .map((w) => {
      const forms = entryForms(w);
      const roman = Object.hasOwn(ROMAN, w) ? ROMAN[w] : undefined;
      return roman ? [...forms, roman] : forms;
    });
}

const indexCache = new WeakMap<SearchDoc, DocIndex>();

function indexOf(doc: SearchDoc): DocIndex {
  let index = indexCache.get(doc);
  if (!index) {
    index = {
      nameFr: groups(doc.name.fr),
      nameAr: groups(doc.name.ar),
      neighbourhood: [...groups(doc.neighbourhood.fr), ...groups(doc.neighbourhood.ar)],
      city: [...groups(doc.city.fr), ...groups(doc.city.ar)],
    };
    indexCache.set(doc, index);
  }
  return index;
}

type Level = 3 | 2 | 1 | 0; // exact, prefix, typo, none

/**
 * Programme names get one more edit from seven letters ("masilia" for
 * Massylia, "yasmine" for Yassamine): they are protected words, so the extra
 * tolerance cannot turn vocabulary into a name.
 */
function nameTypo(word: string, target: string): boolean {
  if (isTypoOf(word, target)) return true;
  return word.length >= 7 && target.length >= 7 && damerau(word, target, 2) <= 2;
}

function levelIn(word: string, list: WordGroup[], generous = false): Level {
  const forms = wordForms(word);
  let best: Level = 0;
  for (const group of list) {
    if (forms.some((f) => group.includes(f))) return 3;
    if (best < 2 && forms.some((f) => f.length >= 3 && group.some((g) => g.length > f.length && g.startsWith(f)))) best = 2;
    if (best < 1 && forms.some((f) => group.some((g) => (generous ? nameTypo(f, g) : isTypoOf(f, g))))) best = 1;
  }
  return best;
}

const NAME_POINTS = [0, 4, 6, 10];
const NEIGHBOURHOOD_POINTS = [0, 1.5, 2, 3];
const CITY_POINTS = [0, 0.5, 1, 1.5];
/** Every word of the name typed: "Océane" is Océane before "Océane R+1 — lots de terrain". */
const FULL_NAME_BONUS = 5;

type TextMatch = { score: number; coverage: number; nameOnly: boolean; fullName: boolean };

function nameCovered(name: WordGroup[], text: string[]): boolean {
  if (name.length === 0) return false;
  const forms = text.map((w) => wordForms(w));
  return name.every((group) => forms.some((fs) => fs.some((f) => group.includes(f))));
}

function textMatch(doc: SearchDoc, text: string[]): TextMatch {
  const index = indexOf(doc);
  const name = [...index.nameFr, ...index.nameAr];
  let score = 0;
  let coverage = 0;
  let nameOnly = true;
  const hasWords = text.some((word) => !isModifier(word));
  let wordHits = 0;
  for (const word of text) {
    const n = levelIn(word, name, true);
    const best = Math.max(
      NAME_POINTS[n],
      NEIGHBOURHOOD_POINTS[levelIn(word, index.neighbourhood)],
      CITY_POINTS[levelIn(word, index.city)],
    );
    if (best > 0) {
      coverage += 1;
      if (!isModifier(word)) wordHits += 1;
    }
    if (n === 0) nameOnly = false;
    score += best;
  }
  // A programme that only matches the modifiers ("ii", "2") of a query that has
  // real words matches nothing: "Riad Garden II" is not "Dyar Al Bahia 2".
  if (hasWords && wordHits === 0) coverage = 0;
  const fullName = nameCovered(index.nameFr, text) || nameCovered(index.nameAr, text);
  if (fullName) score += FULL_NAME_BONUS;
  return { score, coverage, nameOnly, fullName };
}

/**
 * Digits and one- or two-letter words ("2", "r", "ii") only refine a name
 * ("Riad Garden 2", "R+2"); alone they score but never filter.
 */
function isModifier(word: string): boolean {
  return /^\d+$/.test(word) || word.length <= 2;
}

/**
 * The leftover words that match at least one programme; the rest is noise.
 * A place word (a neighbourhood, not a name) only counts in the places asked
 * for: "Rabat Agdal" is not Agdal in Marrakech.
 */
function meaningfulText(docs: SearchDoc[], text: string[], cities: string[] = []): string[] {
  return text.filter((word) =>
    docs.some((doc) => {
      if (textMatch(doc, [word]).coverage === 0) return false;
      if (cities.length === 0 || cities.includes(doc.cityId)) return true;
      const index = indexOf(doc);
      return levelIn(word, [...index.nameFr, ...index.nameAr], true) > 0;
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

function isActive(query: ParsedQuery, field: Field, text: string[]): boolean {
  switch (field) {
    case "text":
      return text.some((word) => !isModifier(word));
    case "bedroomsMin":
    case "monthlyMax":
    case "priceMax":
      return query[field] !== null;
    default:
      return query[field].length > 0;
  }
}

function passes(doc: SearchDoc, query: ParsedQuery, field: Exclude<Field, "text">, monthlyCeiling: number): boolean {
  switch (field) {
    case "cities":
      return query.cities.includes(doc.cityId);
    case "statuses":
      return query.statuses.some((s) => doc.statuses.includes(s));
    case "kinds":
      return query.kinds.some((k) => doc.kinds.includes(k));
    case "segments":
      return query.segments.includes(doc.segment);
    case "amenities":
      return query.amenities.every((a) => doc.amenities.includes(a));
    case "bedroomsMin":
      return doc.bedroomsMax >= (query.bedroomsMin ?? 0);
    case "priceMax":
      return doc.price <= (query.priceMax ?? Infinity);
    case "monthlyMax":
      return doc.price <= monthlyCeiling;
  }
}

/** How much of a dropped constraint a programme still meets, to order the "closest" answers. */
function nearness(doc: SearchDoc, query: ParsedQuery, field: Exclude<Field, "text">, monthlyCeiling: number): number {
  if (field === "amenities") {
    return query.amenities.filter((a) => doc.amenities.includes(a)).length / query.amenities.length;
  }
  return passes(doc, query, field, monthlyCeiling) ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export function searchDocs(docs: SearchDoc[], query: ParsedQuery): SearchOutcome {
  const text = meaningfulText(docs, query.text, query.cities);
  const monthlyCeiling = query.monthlyMax !== null ? maxAffordablePrice(query.monthlyMax, DEFAULT_DEPOSIT) : Infinity;
  const active = RELAX_ORDER.filter((field) => isActive(query, field, text));
  const matches = new Map(docs.map((doc) => [doc, textMatch(doc, text)]));

  // The best coverage ANY programme reaches: a programme that passes the
  // filters on a word or two of another's name is not an answer to that name.
  const most = Math.max(0, ...docs.map((doc) => matches.get(doc)?.coverage ?? 0));

  const pick = (ignore: Set<Field>): SearchDoc[] => {
    let found = docs.filter((doc) =>
      active.every((field) => field === "text" || ignore.has(field) || passes(doc, query, field, monthlyCeiling)),
    );
    if (active.includes("text") && !ignore.has("text")) {
      // Every programme whose whole name was typed stays too: "Massylia ou Jnane Souss ?".
      found =
        most === 0
          ? []
          : found.filter((doc) => {
              const m = matches.get(doc);
              return m !== undefined && m.coverage > 0 && (m.coverage === most || m.fullName);
            });
    }
    return found;
  };

  // A query that names one programme keeps it: its other constraints are
  // widened before its name is ("Riad Garden II 3 chambres moins de 1 million"
  // shows Riad Garden II, budget widened — not another programme).
  const named = active.includes("text") ? namedProgramme(docs, query) : null;
  const order: Field[] = named ? [...active.filter((f) => f !== "text"), "text"] : active;

  const ignore = new Set<Field>();
  let found = pick(ignore);
  for (const field of order) {
    if (found.length > 0) break;
    ignore.add(field);
    found = pick(ignore);
  }
  // Put back whatever was dropped but not needed, most important first.
  if (found.length > 0 && ignore.size > 1) {
    for (const field of [...order].reverse()) {
      if (!ignore.has(field)) continue;
      ignore.delete(field);
      const tighter = pick(ignore);
      if (tighter.length > 0) found = tighter;
      else ignore.add(field);
    }
  }

  const hits: Hit[] = found.map((doc) => {
    let score = matches.get(doc)?.score ?? 0;
    for (const field of ignore) {
      if (field !== "text") score += 0.25 * nearness(doc, query, field, monthlyCeiling);
    }
    return { doc, score };
  });
  hits.sort((a, b) => b.score - a.score || a.doc.price - b.doc.price || a.doc.slug.localeCompare(b.doc.slug));

  return {
    hits,
    exact: ignore.size === 0,
    relaxed: RELAX_ORDER.filter((field): field is Exclude<Field, "text"> => field !== "text" && ignore.has(field)),
  };
}

/**
 * The one programme a query names, or null: every meaningful word matches
 * its name, and either it is the only such programme or the only one whose
 * whole name was typed ("riad garden 2" → Riad Garden II; "riad garden" →
 * null). The /projets hero uses it to open the programme directly.
 */
export function namedProgramme(docs: SearchDoc[], query: ParsedQuery): SearchDoc | null {
  const text = meaningfulText(docs, query.text, query.cities);
  if (!text.some((word) => !isModifier(word))) return null;
  let named = docs.filter((doc) => text.every((word) => textMatch(doc, [word]).nameOnly));
  // "Odyssée studios", "Océane lots": the kind or standing typed with the name
  // picks between programmes that share it.
  const structured = named.filter(
    (doc) =>
      (query.kinds.length === 0 || query.kinds.some((k) => doc.kinds.includes(k))) &&
      (query.segments.length === 0 || query.segments.includes(doc.segment)),
  );
  if (structured.length > 0) named = structured;
  if (named.length === 1) return named[0];
  const whole = named.filter((doc) => textMatch(doc, text).fullName);
  return whole.length === 1 ? whole[0] : null;
}
