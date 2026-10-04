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
    ctaTitle: "Venez visiter l'appartement témoin.",
    ctaBody:
      "Un conseiller vous reçoit en agence ou à distance, en visioconférence. Sans engagement.",
  },
  ar: {
    home: "الرئيسية",
    bookVisit: "حجز موعد",
    callUs: "اتصلوا بنا",
    discoverProjects: "اكتشفوا مشاريعنا",
    allProjects: "جميع مشاريعنا",
    from: "ابتداءً من",
    learnMore: "اعرف المزيد",
    ctaEyebrow: "موعد",
    ctaTitle: "زوروا الشقة النموذجية.",
    ctaBody: "يستقبلكم مستشار في الوكالة أو عن بُعد عبر الفيديو. دون أي التزام.",
  },
};
