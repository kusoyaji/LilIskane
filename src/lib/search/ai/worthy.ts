import { isTypoOf } from "../fuzzy.ts";
import { normalize, wordForms, words } from "../normalize.ts";
import type { ParsedQuery, SearchOutcome } from "../types.ts";

/**
 * When the AI is worth asking. The instant engine answers every keystroke for
 * free; the AI is called only where it can add something the parser could
 * not read:
 *
 * - a sentence (3 words or more) or a question ("?", "؟");
 * - words the parser left over that match no programme ("calme");
 * - intent words the parser deliberately ignores ("famille", "pas cher",
 *   "investissement", "العائلة") — they matter to an adviser;
 * - a phrase mixing Arabic and Latin script;
 * - an instant outcome that is not exact (the parser's answer had to widen).
 *
 * Never for an empty field, a single character, or a bare programme / city /
 * neighbourhood name the parser already resolves exactly ("massylia",
 * "Agadir", "Riad Garden 2", "Les Pins de Maamora", "مراكش") — whatever its
 * length.
 *
 * Pure; node-importable.
 */

const ARABIC = /[؀-ۿ]/;

/** Words that carry a buyer's intent the lexicon has no field for. */
const INTENT_WORDS = new Set(
  [
    "famille", "familial", "familiale", "enfant", "enfants", "retraite", "retraites", "calme", "tranquille",
    "investissement", "investir", "investisseur", "louer", "location", "locatif", "rentable", "rentabilite",
    "cher", "chere", "meilleur", "meilleure", "recommande", "recommandez", "conseil", "conseillez", "comparer",
    "compare", "comparaison", "difference", "versus", "vs", "proche", "pres", "loin", "centre", "neuf", "ideal",
    "rkhis", "ghali", "l3ayla", "drari", "mzyan",
    "عائلة", "العائلة", "عائلتي", "اسرة", "الأسرة", "أطفال", "الأطفال", "اولاد", "الدراري", "تقاعد", "هادئ",
    "هادئة", "استثمار", "كراء", "رخيص", "أرخص", "ارخص", "غالي", "أفضل", "احسن", "مزيان", "مقارنة", "الفرق",
  ].flatMap((w) => words(w)),
);

/** Whether a leftover word names something among the hits (a name, a neighbourhood, a city). */
function consumed(word: string, instant: SearchOutcome): boolean {
  const forms = wordForms(word);
  for (const { doc } of instant.hits) {
    const vocabulary = words(
      `${doc.name.fr} ${doc.name.ar} ${doc.neighbourhood.fr} ${doc.neighbourhood.ar} ${doc.city.fr} ${doc.city.ar}`,
    );
    for (const target of vocabulary) {
      const targetForms = wordForms(target);
      for (const f of forms) {
        if (targetForms.includes(f)) return true;
        if (f.length >= 3 && target.length > f.length && target.startsWith(f)) return true;
        if (isTypoOf(f, target)) return true;
      }
    }
  }
  return false;
}

function hasStructured(q: ParsedQuery): boolean {
  return (
    q.cities.length > 0 ||
    q.segments.length > 0 ||
    q.kinds.length > 0 ||
    q.statuses.length > 0 ||
    q.amenities.length > 0 ||
    q.bedroomsMin !== null ||
    q.priceMax !== null ||
    q.monthlyMax !== null
  );
}

export function isAiWorthy(raw: string, parsed: ParsedQuery, instant: SearchOutcome | null): boolean {
  const text = raw.trim();
  if (normalize(text).replace(/\s/g, "").length < 2) return false;
  if (/[?؟]/.test(text)) return true;
  const all = words(text);
  if (all.some((w) => wordForms(w).some((f) => INTENT_WORDS.has(f)))) return true;
  if (instant && !instant.exact) return true;

  // Leftover words: without the index they cannot be checked — wait for it.
  const unplaced = parsed.text.length > 0 && (!instant || parsed.text.some((w) => !consumed(w, instant)));
  if (unplaced) return instant !== null;

  // A bare name ("Riad Garden 2", "Les Pins de Maamora"): resolved, nothing to add.
  if (parsed.text.length > 0 && !hasStructured(parsed)) return false;

  if (all.length >= 3) return true;
  // Mixed scripts ("appart f مراكش"): the parser reads each word alone, the model reads the sentence.
  return all.length >= 2 && ARABIC.test(text) && /[a-z]/i.test(text);
}
