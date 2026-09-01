export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Number formatting.
 *
 * Two deliberate overrides of the platform defaults, both because ICU's data
 * disagrees with how Moroccans actually write money:
 *
 * 1. Numerals stay Western. Moroccan price lists, bank statements and street
 *    signage all use 1234567890 rather than the Eastern Arabic forms, so the
 *    Arabic build pins `nu-latn` instead of taking the locale default.
 * 2. Groups are separated by a space, not a period. ICU returns "1.830.000"
 *    for both `fr-MA` and `ar-MA`; Chaabi's own site, and every estate agent's
 *    window in Casablanca, writes "1 830 000 DHS".
 *
 * The separator is U+00A0 rather than U+202F because the narrow form is absent
 * from some Android system fonts and renders as a visible box — on a site whose
 * prices are its most important content, that is not a risk worth taking.
 */
const GROUP_SEPARATOR = " ";

/** Period, narrow no-break space, no-break space, or ordinary whitespace. */
const ANY_SEPARATOR = /[.  \s]/g;

const formatters: Partial<Record<Locale, Intl.NumberFormat>> = {};

function formatter(locale: Locale): Intl.NumberFormat {
  formatters[locale] ??= new Intl.NumberFormat(locale === "ar" ? "ar-MA-u-nu-latn" : "fr-FR", {
    maximumFractionDigits: 0,
    useGrouping: true,
  });
  return formatters[locale]!;
}

/**
 * Wraps a run in a Left-to-Right Isolate so bidirectional reordering cannot
 * scramble it.
 *
 * This is not theoretical. In an Arabic paragraph, "05 20 39 34 00" renders as
 * "00 34 39 20 05" — the digits inside each group stay put, but the groups
 * themselves are laid out right-to-left, because a space between two numbers is
 * a bidi-neutral character that inherits the paragraph direction. The same
 * happens to "84–116 m²", which becomes "116–84 m²". A reversed phone number on
 * a page whose whole purpose is getting someone to call is about as bad as a
 * bug gets, and it is invisible to anyone who does not read Arabic.
 *
 * U+2066/U+2069 are zero-width and inert in LTR, so the French build is
 * unaffected and there is no second code path to keep in sync.
 */
export function isolateLtr(value: string): string {
  return `⁦${value}⁩`;
}

export function formatNumber(value: number, locale: Locale): string {
  const formatted = formatter(locale).format(value).replace(ANY_SEPARATOR, GROUP_SEPARATOR);
  return locale === "ar" ? isolateLtr(formatted) : formatted;
}

/** For composite runs — ranges, phone numbers — assembled from several parts. */
export function isolateRun(value: string, locale: Locale): string {
  return locale === "ar" ? isolateLtr(value) : value;
}
