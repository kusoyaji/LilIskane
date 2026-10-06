/**
 * Fold a string for matching: lower case, no Latin accents, no Arabic
 * diacritics or tatweel, one form of alef / yaa / taa marbuta / kaf, hamza
 * carriers folded and the bare hamza dropped, digits in Western form,
 * punctuation as spaces. "Témara", "temara" and "TEMARA" are one word; so are
 * "مُسلَّم" and "مسلم", "شاطئ" and "شاطي", "اگادير" and "اكادير".
 */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Latin combining accents
    .replace(/[ً-ٰٟـ]/g, "") // Arabic harakat, superscript alef, tatweel
    .replace(/[آأإٱ]/g, "ا") // آ أ إ ٱ → ا
    .replace(/[ىی]/g, "ي") // ى ی → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/[کگ]/g, "ك") // ک گ → ك (Moroccan "اگادير")
    .replace(/ڤ/g, "ف") // ڤ → ف
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي") // ئ → ي
    .replace(/ء/g, "") // ء dropped: "البيضاء" = "البيضا"
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // ٠-٩ → 0-9
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // ۰-۹ → 0-9
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function words(value: string): string[] {
  const folded = normalize(value);
  return folded ? folded.split(" ") : [];
}

/**
 * One word of the raw query, with its position in the raw string so a parsed
 * value can point back at the characters that produced it (QuerySpan).
 * Digits and letters are always separate tokens: "3ch" is "3" + "ch",
 * "800k" is "800" + "k", "ب25" is "ب" + "25".
 */
export type Token = {
  start: number;
  end: number;
  /** Folded form (normalize), or ASCII digits for a number token. */
  norm: string;
  num: boolean;
};

const TOKEN_RE = /[0-9٠-٩۰-۹]+|[\p{L}\p{M}\p{No}ـ]+/gu;
const DIGITS_RE = /^[0-9٠-٩۰-۹]+$/;

export function tokenize(raw: string): Token[] {
  const out: Token[] = [];
  for (const match of raw.matchAll(TOKEN_RE)) {
    const text = match[0];
    const start = match.index ?? 0;
    const num = DIGITS_RE.test(text);
    const norm = num ? normalize(text) : normalize(text).replace(/ /g, "");
    if (!norm) continue;
    out.push({ start, end: start + text.length, norm, num });
  }
  return out;
}

export function isArabic(word: string): boolean {
  return /[؀-ۿ]/.test(word);
}

const AL = "ال"; // ال

/** "البحر" → "بحر"; leaves short words alone so "الف" (thousand) stays itself. */
export function stripArticle(word: string): string {
  return word.startsWith(AL) && word.length - 2 >= 3 ? word.slice(2) : word;
}

const CLITICS = ["و", "ب", "ف", "ل", "ك"]; // و ب ف ل ك

/**
 * The forms a query word may stand for: itself, without the article, without
 * a glued conjunction/preposition ("بمراكش", "وطنجة", "فالصويرة", "للسكن"),
 * and for Latin words without a plural -s/-x. Matching tries the word itself
 * first, so "بحر" is never read as "حر".
 */
export function wordForms(word: string): string[] {
  const forms = new Set<string>([word]);
  if (isArabic(word)) {
    const add = (w: string, depth: number) => {
      forms.add(w);
      forms.add(stripArticle(w));
      if (depth === 0) return;
      // لل = ل + ال : "للسكن" → "السكن"
      if (w.startsWith("لل") && w.length >= 5) add(AL + w.slice(2), depth - 1);
      for (const c of CLITICS) {
        if (w.startsWith(c) && w.length - 1 >= 3) add(w.slice(1), depth - 1);
      }
    };
    add(word, 2);
  } else if (word.length >= 4 && /[sx]$/.test(word) && !/\d/.test(word)) {
    forms.add(word.slice(0, -1));
  }
  return [...forms];
}

/** The forms a lexicon or name word is indexed under: itself and without the article. */
export function entryForms(word: string): string[] {
  const bare = stripArticle(word);
  return bare === word ? [word] : [word, bare];
}
