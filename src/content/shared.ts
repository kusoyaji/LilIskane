import type { Locale } from "@/i18n/config";

/**
 * Copy shared across v2 pages. Page-specific copy lives beside its page in
 * `src/content/<page>.ts`, typed the same way, so pages can be built in
 * parallel without anyone editing the shared dictionaries in `src/i18n`.
 */
export type Copy<T> = Record<Locale, T>;

export const shared: Copy<{
  home: string;
  bookVisit: string;
  callUs: string;
  discoverProjects: string;
  allProjects: string;
  from: string;
  learnMore: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
}> = {
  fr: {
    home: "Accueil",
    bookVisit: "Prendre rendez-vous",
    callUs: "Nous appeler",
    discoverProjects: "Découvrir nos projets",
    allProjects: "Tous nos projets",
    from: "à partir de",
    learnMore: "En savoir plus",
    ctaEyebrow: "Rendez-vous",
    ctaTitle: "Parlons de votre projet.",
    ctaBody:
      "Un conseiller vous reçoit en agence, vous rappelle ou vous retrouve en visioconférence. Sans engagement.",
  },
  ar: {
    home: "الرئيسية",
    bookVisit: "حجز موعد",
    callUs: "اتصلوا بنا",
    discoverProjects: "اكتشفوا مشاريعنا",
    allProjects: "جميع مشاريعنا",
    from: "ابتداءً من",
    learnMore: "اعرفوا المزيد",
    ctaEyebrow: "موعد",
    ctaTitle: "لنتحدث عن مشروعكم.",
    ctaBody: "يستقبلكم مستشار في الوكالة، أو يتصل بكم، أو يلتقيكم عبر مكالمة فيديو. دون أي التزام.",
  },
};
