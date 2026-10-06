/**
 * Reading the figures out of a sentence, for the validator's rule that no
 * number may reach the screen unless the data (or the visitor) said it.
 * Pure; node-importable.
 *
 * A figure can be written many ways — "1 830 000 DH", "1.830.000", "1,83
 * million", "183 مليون" (Moroccan centimes), "4,5 %", "٣ غرف" — so each one
 * found yields every value it can reasonably mean, and it passes when any of
 * them is an allowed fact.
 */

const BIDI = /[‎‏؜⁦-⁩]/g;

export function westernDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ",")
    .replace(/٬/g, " ");
}

export type FoundNumber = {
  /** Every value the figure can mean. */
  values: number[];
  /** Offset in the cleaned text, and the cleaned text itself (for context checks). */
  index: number;
  end: number;
};

const NUMBER_RUN = /\d+(?:[   .,]\d+)*/g;
// Darija in Latin letters too: "80 mlyoun", "800 alf".
const MILLION = /^\s*(?:millions?|mln|mio|mlyoun|mlyon|mliyoun|melyoun|mlayn|mlayen|مليون|ملايين|ملاين|m(?![²2a-zà-ÿ]))/i;
const THOUSAND = /^\s*(?:k(?![a-z])|milles?|alf|alaf|ألف|آلاف|الف|الاف)/i;

function readUnit(unit: string): number[] {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(unit)) {
    const grouped = Number(unit.replace(/[.,]/g, ""));
    const seps = unit.match(/[.,]/g) ?? [];
    // "1,200" may be 1.2 or 1 200; "1.200.000" can only be grouping.
    return seps.length === 1 ? [grouped, Number(unit.replace(",", "."))] : [grouped];
  }
  if (/^\d+[.,]\d+$/.test(unit)) return [Number(unit.replace(",", "."))];
  if (/^\d+$/.test(unit)) return [Number(unit)];
  // Anything stranger ("1.2.3"): each digit run on its own.
  return unit.split(/[.,]/).filter(Boolean).map(Number);
}

/** Splits a run on spaces, re-joining "1 830 000"-style groups of three. */
function units(run: string): Array<{ text: string; offset: number }> {
  const parts: Array<{ text: string; offset: number }> = [];
  const re = /[^   ]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(run))) parts.push({ text: m[0], offset: m.index });
  const out: Array<{ text: string; offset: number }> = [];
  for (const part of parts) {
    const last = out[out.length - 1];
    const lastLead = last ? last.text.split(/[ ]/)[0] : "";
    if (last && /^\d{3}(?:[.,]\d+)?$/.test(part.text) && /^\d{1,3}$/.test(lastLead) && /^[\d ]+$/.test(last.text)) {
      last.text = `${last.text} ${part.text}`;
    } else {
      out.push({ ...part });
    }
  }
  return out;
}

export function cleanText(text: string): string {
  return westernDigits(text.replace(BIDI, ""));
}

export function numbersIn(raw: string): FoundNumber[] {
  const text = cleanText(raw);
  const found: FoundNumber[] = [];
  for (const run of text.matchAll(NUMBER_RUN)) {
    for (const unit of units(run[0])) {
      const start = (run.index ?? 0) + unit.offset;
      const end = start + unit.text.length;
      const joined = unit.text.replace(/ /g, "");
      let values = readUnit(joined);
      const after = text.slice(end, end + 16);
      if (MILLION.test(after)) {
        values = values.flatMap((v) => (v >= 10 ? [v * 1_000_000, v * 10_000] : [v * 1_000_000]));
      } else if (THOUSAND.test(after)) {
        values = values.map((v) => v * 1_000);
      }
      found.push({ values, index: start, end });
    }
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Amounts written in words                                            */
/* ------------------------------------------------------------------ */

const fold = (w: string) =>
  w
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/[ىی]/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();

const UNITS: Record<string, number> = Object.fromEntries(
  (
    [
      ["un", 1], ["une", 1], ["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7],
      ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14],
      ["quinze", 15], ["seize", 16], ["vingt", 20], ["vingts", 20], ["trente", 30], ["quarante", 40],
      ["cinquante", 50], ["soixante", 60], ["septante", 70], ["huitante", 80], ["nonante", 90],
      ["واحد", 1], ["اثنين", 2], ["اثنان", 2], ["جوج", 2], ["ثلاث", 3], ["ثلاثه", 3], ["تلاته", 3], ["اربع", 4],
      ["اربعه", 4], ["خمس", 5], ["خمسه", 5], ["ست", 6], ["سته", 6], ["سبع", 7], ["سبعه", 7], ["ثمان", 8],
      ["ثمانيه", 8], ["تسع", 9], ["تسعه", 9], ["عشر", 10], ["عشره", 10], ["عشرين", 20], ["عشرون", 20],
      ["ثلاثين", 30], ["ثلاثون", 30], ["اربعين", 40], ["خمسين", 50], ["ستين", 60], ["سبعين", 70],
      ["ثمانين", 80], ["تسعين", 90], ["تسعون", 90], ["مئتين", 200], ["ميتين", 200],
    ] as Array<[string, number]>
  ).map(([w, n]) => [fold(w), n]),
);
const HUNDRED = new Set(["cent", "cents", "مائه", "مئه", "ميه", "مية"].map(fold));
const THOUSAND_W = new Set(["mille", "milles", "الف", "الاف", "آلاف"].map(fold));
const MILLION_W = new Set(["million", "millions", "مليون", "ملايين", "ملاين", "mlyoun", "mlyon"].map(fold));
const TWO_MILLION_W = new Set(["مليونين"].map(fold));
const NUMBER_LINKS = new Set(["et", "و"].map(fold));
const CLITICS = ["و", "ب", "ف", "ل", "ك"];

/** The number-word reading of one word, glued Arabic prepositions aside ("بمليون", "بتسعين"). */
function numberWord(word: string): string | null {
  const w = fold(word);
  const known = (x: string) => x in UNITS || HUNDRED.has(x) || THOUSAND_W.has(x) || MILLION_W.has(x) || TWO_MILLION_W.has(x);
  if (known(w)) return w;
  for (const c of CLITICS) if (w.startsWith(c) && w.length > 3 && known(w.slice(1))) return w.slice(1);
  if (w.startsWith("ال") && known(w.slice(2))) return w.slice(2);
  return null;
}

/**
 * Amounts written in words — "un million de dirhams", "neuf cent mille",
 * "بمليون درهم", "بتسعين مليون" (Moroccan centimes: also 900 000) — which
 * numbersIn, reading digits, cannot see. Only amounts are reported (a run with
 * cent/mille/million in it, or worth ten and more): "trois chambres" is left
 * to the digit check and to common sense.
 */
export function wordNumbersIn(raw: string): FoundNumber[] {
  const text = cleanText(raw);
  const found: FoundNumber[] = [];
  const toks = [...text.matchAll(/[\p{L}]+/gu)].map((m) => ({ word: m[0], index: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  let i = 0;
  while (i < toks.length) {
    // A multiplier after digits ("1 million") is numbersIn's.
    const before = text.slice(Math.max(0, toks[i].index - 3), toks[i].index);
    const first = numberWord(toks[i].word);
    if (!first || /\d\s*$/.test(before)) {
      i += 1;
      continue;
    }
    let total = 0;
    let current = 0;
    let centimes: number | null = null;
    let multiplier = false;
    let j = i;
    let end = toks[i].end;
    while (j < toks.length) {
      const w = numberWord(toks[j].word);
      if (!w) {
        // "et", "و" between two number words: "vingt et un", "مليون و نص".
        if (NUMBER_LINKS.has(fold(toks[j].word)) && j + 1 < toks.length && numberWord(toks[j + 1].word)) {
          j += 1;
          continue;
        }
        break;
      }
      if (w in UNITS) current += UNITS[w];
      else if (HUNDRED.has(w)) {
        current = (current || 1) * 100;
        multiplier = true;
      } else if (THOUSAND_W.has(w)) {
        total += (current || 1) * 1000;
        current = 0;
        multiplier = true;
      } else if (MILLION_W.has(w) || TWO_MILLION_W.has(w)) {
        const n = TWO_MILLION_W.has(w) ? 2 : current || 1;
        if (n >= 10) centimes = total + n * 10_000;
        total += n * 1_000_000;
        current = 0;
        multiplier = true;
      }
      end = toks[j].end;
      j += 1;
    }
    const value = total + current;
    // "un", "une" alone are articles.
    if (multiplier || value >= 10) {
      found.push({ values: centimes !== null ? [value, centimes] : [value], index: toks[i].index, end });
    }
    i = Math.max(j, i + 1);
  }
  return found;
}

/** Every figure a sentence states, in digits or in words. */
export function figuresIn(raw: string): FoundNumber[] {
  return [...numbersIn(raw), ...wordNumbersIn(raw)].sort((a, b) => a.index - b.index);
}

/** Equal, or — for amounts — within half a per cent (rounding in prose). */
export function sameFigure(a: number, b: number): boolean {
  if (a === b) return true;
  if (Math.abs(a) < 1000 || Math.abs(b) < 1000) return Math.abs(a - b) < 1e-9;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) <= 0.005;
}

export function isAllowed(found: FoundNumber, allowed: readonly number[]): boolean {
  return found.values.some((v) => allowed.some((a) => sameFigure(v, a)));
}

/**
 * For display, in both languages: the spaces inside a figure ("1 045 000")
 * become narrow no-break spaces — the glyph formatNumber uses — and the space
 * before its unit ("DH", "درهم", "%") a no-break space, so a price never
 * wraps as "1 045" / "000 DH". The model writes plain spaces.
 */
export function bindFigures(text: string): string {
  return text
    .replace(/(\d)[   ](?=\d{3}(?!\d))/g, "$1 ")
    .replace(/(\d)[  ](?=(?:DH|MAD|Dhs?|dh|درهم|%|٪|m²|م²)(?![\p{L}]))/gu, "$1 ");
}

/**
 * For display in Arabic: wraps every figure made of several groups ("1 130
 * 000", "84–116", "4,5") in a Left-to-Right Isolate, so the RTL paragraph
 * cannot lay its groups out right-to-left ("000 130 1"). Same mechanism as
 * isolateRun in src/i18n/config.ts; text without Arabic letters is returned
 * unchanged.
 */
export function isolateFigures(text: string): string {
  if (!/[؀-ۿ]/.test(text)) return text;
  return text.replace(/(?<![⁦\d])\d+(?:[   .,–-]\d+)+(?![\d⁩])/g, (run) => `⁦${run}⁩`);
}
