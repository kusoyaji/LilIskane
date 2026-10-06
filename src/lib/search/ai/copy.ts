import type { Locale } from "../../../i18n/config.ts";

/**
 * Copy for the AI layer: the answer card and the criterion ticks. No figure
 * is written here — every number is passed in already formatted for the
 * locale (formatNumber / isolateRun), so it is bidi-isolated in Arabic.
 * Arabic register: plural polite form, MSA.
 */
export type AiCopy = {
  /** The card's label, beside the spark. */
  concierge: string;
  thinking: string;
  /** Under the summary. */
  disclosure: string;
  clarifyLabel: string;
  suggestionsLabel: string;
  /** Screen-reader words for the tick glyphs. */
  met: string;
  unmet: string;
  ticksLabel: string;
  /** "3 chambres" / "2 chambres au plus". */
  bedrooms: (n: number, formatted: string) => string;
  bedroomsMax: (n: number, formatted: string) => string;
  budget: string;
  monthly: string;
  /** "+5 %" — the caller isolates the run for Arabic. */
  over: (pct: number) => string;
  place: string;
  /** The /projets submit while the concierge reads the sentence. */
  submitting: string;
};

export const aiCopy: Record<Locale, AiCopy> = {
  fr: {
    concierge: "Concierge",
    thinking: "Le concierge affine votre recherche…",
    disclosure: "Réponse générée par IA à partir de nos fiches — un conseiller confirme chaque détail.",
    clarifyLabel: "Une précision",
    suggestionsLabel: "Essayez aussi",
    met: "oui",
    unmet: "non",
    ticksLabel: "Vos critères",
    bedrooms: (n, f) => `${f} chambre${n > 1 ? "s" : ""}`,
    bedroomsMax: (n, f) => `${f} chambre${n > 1 ? "s" : ""} au plus`,
    budget: "Budget",
    monthly: "Mensualité",
    over: (pct) => `+${pct} %`,
    place: "Lieu",
    submitting: "Lecture de votre demande…",
  },
  ar: {
    concierge: "المساعد",
    thinking: "المساعد يدقّق بحثكم…",
    disclosure: "جواب مُعَدّ بالذكاء الاصطناعي انطلاقاً من بطاقاتنا — ويؤكّد مستشار كل التفاصيل.",
    clarifyLabel: "توضيح",
    suggestionsLabel: "جرّبوا أيضاً",
    met: "نعم",
    unmet: "لا",
    ticksLabel: "معاييركم",
    bedrooms: (n, f) => (n === 1 ? "غرفة واحدة" : n === 2 ? "غرفتان" : `${f} غرف`),
    bedroomsMax: (n, f) => (n === 1 ? "غرفة واحدة كحد أقصى" : n === 2 ? "غرفتان كحد أقصى" : `${f} غرف كحد أقصى`),
    budget: "الميزانية",
    monthly: "القسط الشهري",
    over: (pct) => `+${pct}٪`,
    place: "المكان",
    submitting: "قراءة طلبكم…",
  },
};
