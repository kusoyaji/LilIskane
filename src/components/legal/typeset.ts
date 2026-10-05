import type { Locale } from "@/i18n/config";

const NBSP = " ";
const WJ = "⁠"; // word joiner: no visible width, forbids a line break

/**
 * Last-mile typography for long legal copy, applied at render time so the
 * content module stays plain, searchable text.
 *
 * - French: a no-break space before ; : ? ! » and after «, so a semicolon is
 *   never stranded alone at the start of a line.
 * - Both languages: legal references ("09-08", "1-09-15", "1.09.15") and the
 *   phone number never break across lines. A law number split as "09-" / "08"
 *   reads as two different numbers, and in Arabic the halves can even swap.
 */
export function typeset(text: string, locale: Locale): string {
  let out = text
    .replace(/\b(\d{1,2})([-.])(\d{2})(?:([-.])(\d{2}))?\b/g, (_m, a, s1, b, s2, c) =>
      c ? `${a}${WJ}${s1}${WJ}${b}${WJ}${s2}${WJ}${c}` : `${a}${WJ}${s1}${WJ}${b}`,
    )
    .replace(/\b0(\d) (\d{2}) (\d{2}) (\d{2}) (\d{2})\b/g, `0$1${NBSP}$2${NBSP}$3${NBSP}$4${NBSP}$5`);
  if (locale === "fr") {
    out = out
      .replace(/ ([;:?!»])/g, `${NBSP}$1`)
      .replace(/« /g, `«${NBSP}`)
      .replace(/n° /g, `n°${NBSP}`)
      .replace(/États-Unis/g, `États${WJ}-${WJ}Unis`);
  }
  return out;
}
