import type { Copy } from "./shared";

/**
 * Copy for the home — the search page: the hero (field, quick pickers, live
 * answer), the results, and the words the map and the budget finder gained
 * when they became part of the search.
 *
 * No figure is typed here: every count is the live result, every year comes
 * from `src/data/company.ts`. The idea chips are suggestions, never claims of
 * popularity.
 */
type HomeSearchCopy = {
  /** {year} = company.founded. */
  eyebrow: string;
  title: string;
  /** Visible label above the field. */
  fieldLabel: string;
  submit: string;
  ideasLabel: string;
  /** Shown under an empty field: label and the query it writes. */
  ideas: Array<{ label: string; query: string }>;
  pickersLabel: string;
  pickerCity: string;
  pickerBudget: string;
  pickerStatus: string;
  pickerBedrooms: string;
  pickerMonthly: string;
  pickerDone: string;
  /** Label before the chips. */
  understood: string;
  answerEyebrow: string;
  /** The words after the giant count: "programmes · 9 villes". */
  countWords: (n: number) => string;
  cities: (n: number, formatted: string) => string;
  /** Under the count when nothing matched everything: these are the closest. */
  closest: string;
  /** Announced (polite) after typing settles. */
  announce: (n: number, formatted: string) => string;
  relaxedShort: string;
  ctaResults: (n: number, formatted: string) => string;
  ctaMap: string;
  resultsEyebrow: string;
  resultsTitle: (n: number, formatted: string) => string;
  resultsAll: string;
  clearAll: string;
  sortLabel: string;
  sortRelevance: string;
  sortPrice: string;
  showMore: (n: number, formatted: string) => string;
  showLess: string;
  openProjets: string;
  /** Map panel. */
  mapCta: (n: number, formatted: string) => string;
  mapNone: string;
  mapClear: string;
  mapMatching: (n: number, formatted: string, total: string) => string;
  /** A city with no programme matching the search. */
  mapZero: string;
  /** Land tile on the thumbnail strip. */
  plot: string;
};

export const homeSearchCopy: Copy<HomeSearchCopy> = {
  fr: {
    eyebrow: "Depuis {year}",
    title: "Trouvez votre adresse.",
    fieldLabel: "Décrivez ce que vous cherchez",
    submit: "Chercher",
    ideasLabel: "Par exemple",
    ideas: [
      { label: "Livraison immédiate", query: "Livraison immédiate" },
      { label: "Près de Casablanca", query: "Près de Casablanca" },
      { label: "Terrains", query: "Terrains" },
    ],
    pickersLabel: "Ou choisissez",
    pickerCity: "Ville",
    pickerBudget: "Budget",
    pickerStatus: "Statut",
    pickerBedrooms: "Chambres",
    pickerMonthly: "Mensualité",
    pickerDone: "Fermer",
    understood: "Vos critères",
    answerEyebrow: "Votre sélection",
    countWords: (n) => (n > 1 ? "programmes" : "programme"),
    cities: (n, formatted) => (n > 1 ? `dans ${formatted} villes` : n === 1 ? "dans 1 ville" : ""),
    announce: (n, formatted) =>
      n === 0 ? "Aucun programme" : n === 1 ? "1 programme correspond" : `${formatted} programmes correspondent`,
    relaxedShort: "Rien ne réunit tout cela : voici les plus proches.",
    closest: "les plus proches",
    ctaResults: (n, formatted) => (n === 1 ? "Voir le programme" : `Voir les ${formatted} programmes`),
    ctaMap: "Sur la carte",
    resultsEyebrow: "Résultats",
    resultsTitle: (n, formatted) => (n === 1 ? "1 programme" : `${formatted} programmes`),
    resultsAll: "Tous nos programmes",
    clearAll: "Tout effacer",
    sortLabel: "Trier",
    sortRelevance: "Pertinence",
    sortPrice: "Prix croissant",
    showMore: (n, formatted) => (n === 1 ? "Voir l'autre programme" : `Voir les ${formatted} autres`),
    showLess: "Réduire la liste",
    openProjets: "Ouvrir dans la page Projets (carte et filtres détaillés)",
    mapCta: (n, formatted) => (n === 1 ? "Voir ce programme" : `Voir ces ${formatted} programmes`),
    mapNone: "Aucun programme de cette ville ne correspond à votre recherche.",
    mapClear: "Effacer la recherche",
    mapMatching: (n, formatted, total) => `${formatted} sur ${total} pour votre recherche`,
    mapZero: "Aucun",
    plot: "Terrain",
  },
  ar: {
    eyebrow: "منذ {year}",
    title: "اعثروا على عنوانكم.",
    fieldLabel: "صفوا ما تبحثون عنه",
    submit: "بحث",
    ideasLabel: "مثلاً",
    ideas: [
      { label: "تسليم فوري", query: "تسليم فوري" },
      { label: "قرب الدار البيضاء", query: "قرب الدار البيضاء" },
      { label: "بقع أرضية", query: "بقع أرضية" },
    ],
    pickersLabel: "أو اختاروا",
    pickerCity: "المدينة",
    pickerBudget: "الميزانية",
    pickerStatus: "الوضعية",
    pickerBedrooms: "الغرف",
    pickerMonthly: "القسط الشهري",
    pickerDone: "إغلاق",
    understood: "معاييركم",
    answerEyebrow: "اختياركم",
    countWords: (n) => (n === 1 ? "مشروع" : n === 2 ? "مشروعان" : n <= 10 ? "مشاريع" : "مشروعاً"),
    cities: (n, formatted) => (n === 1 ? "في مدينة واحدة" : n === 2 ? "في مدينتين" : n <= 10 ? `في ${formatted} مدن` : `في ${formatted} مدينة`),
    announce: (n, formatted) =>
      n === 0
        ? "لا يوجد أي مشروع"
        : n === 1
          ? "مشروع واحد يطابق بحثكم"
          : n === 2
            ? "مشروعان يطابقان بحثكم"
            : n <= 10
              ? `${formatted} مشاريع تطابق بحثكم`
              : `${formatted} مشروعاً يطابق بحثكم`,
    relaxedShort: "لا شيء يجمع كل ذلك: إليكم الأقرب.",
    closest: "الأقرب إلى بحثكم",
    ctaResults: (n, formatted) =>
      n === 1 ? "عرض المشروع" : n === 2 ? "عرض المشروعين" : n <= 10 ? `عرض المشاريع الـ${formatted}` : `عرض الـ${formatted} مشروعاً`,
    ctaMap: "على الخريطة",
    resultsEyebrow: "النتائج",
    resultsTitle: (n, formatted) =>
      n === 1 ? "مشروع واحد" : n === 2 ? "مشروعان" : n <= 10 ? `${formatted} مشاريع` : `${formatted} مشروعاً`,
    resultsAll: "جميع مشاريعنا",
    clearAll: "مسح الكل",
    sortLabel: "الترتيب",
    sortRelevance: "الأنسب",
    sortPrice: "الأقل ثمناً",
    showMore: (n, formatted) => (n === 1 ? "عرض المشروع الآخر" : n === 2 ? "عرض المشروعين الآخرين" : n <= 10 ? `عرض ${formatted} مشاريع أخرى` : `عرض ${formatted} مشروعاً آخر`),
    showLess: "تقليص القائمة",
    openProjets: "الفتح في صفحة المشاريع (خريطة وتصفية مفصّلة)",
    mapCta: (n, formatted) =>
      n === 1 ? "عرض هذا المشروع" : n === 2 ? "عرض هذين المشروعين" : n <= 10 ? `عرض هذه المشاريع الـ${formatted}` : `عرض هذه الـ${formatted} مشروعاً`,
    mapNone: "لا يطابق أي مشروع في هذه المدينة بحثكم.",
    mapClear: "مسح البحث",
    mapMatching: (_n, formatted, total) => `${formatted} من أصل ${total} حسب بحثكم`,
    mapZero: "لا شيء",
    plot: "بقعة أرضية",
  },
};
