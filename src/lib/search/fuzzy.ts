/**
 * Typo tolerance, shared by the parser (cities, vocabulary) and the ranker
 * (programme names). Kept deliberately strict: on 23 programmes a false
 * positive ("ville" read as "villa") costs more than a missed typo.
 */

/** Edits allowed for a word of this length: none under 5, one for 5–7, two from 8. */
export function typoBudget(length: number): number {
  if (length < 5) return 0;
  if (length < 8) return 1;
  return 2;
}

/**
 * Damerau–Levenshtein distance (optimal string alignment: insertions,
 * deletions, substitutions and adjacent transpositions), abandoned as soon as
 * it must exceed `max` — the caller only ever asks "within budget?".
 * Works on UTF-16 units, which is exact for Latin and Arabic letters.
 */
export function damerau(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let prev2 = new Array<number>(m + 1).fill(0);
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  let curr = new Array<number>(m + 1).fill(0);
  for (let i = 1; i <= n; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= m; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    [prev2, prev, curr] = [prev, curr, prev2];
  }
  return prev[m];
}

/** True when `word` is a plausible typo of `target` under the length budget of `word`. */
export function isTypoOf(word: string, target: string): boolean {
  if (word === target) return true;
  const budget = typoBudget(word.length);
  if (budget === 0 || target.length < 5) return false;
  return damerau(word, target, budget) <= budget;
}
