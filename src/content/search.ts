import type { RegionId } from "@/lib/search";
import type { Copy } from "./shared";

/**
 * Copy for the concierge search (the header trigger, the overlay, the mobile
 * menu row). Nothing here states a fact about a programme: names, prices,
 * statuses and counts all come from the search index, built from `src/data/*`.
 *
 * The example queries are suggestions, never claims — there is deliberately no
 * "most searched" anywhere: we have no such data, so saying it would invent it.
 */
type SearchCopy = {
  /** Visible label of the desktop pill. */
  trigger: string;
  /** Accessible name of every trigger (the icon-only ones have no visible text). */
  triggerLabel: string;
  /** The button in the mobile menu panel, styled as a field. */
  menuRow: string;
  dialog: string;
  eyebrow: string;
  inputLabel: string;
  /** Cycled in the empty field; the first is also the static placeholder. */
  placeholders: string[];
  clear: string;
  close: string;
  escKey: string;
  ideasTitle: string;
  /** Example queries that fill the field. Each one is checked to return programmes. */
  ideas: string[];
  quickTitle: string;
  programmesTitle: string;
  allProgrammes: string;
  pagesTitle: string;
  /** Label before the chips when the field itself was understood… */
  understood: string;
  /** …and when every chip was picked from the panel. */
  criteria: string;
  removeChip: (label: string) => string;
  /** The small mark on a chip the AI read into the query (not the visitor). */
  aiMark: string;
  /** What that mark means, spelled out (accessible name, tooltip). */
  aiTitle: string;
  relaxedLead: string;
  relaxedWidened: (fields: string) => string;
  relaxedClosest: string;
  /** What a relaxed constraint is called in "Les plus proches, en élargissant : …". */
  relaxedFields: Record<string, string>;
  listJoin: string;
  /** Announced (polite) and shown above the results. */
  count: (n: number, formatted: string) => string;
  countRelaxed: string;
  seeOnMap: (n: number | null, formatted: string) => string;
  hintNavigate: string;
  hintOpen: string;
  hintClose: string;
  filtersTitle: string;
  filterCity: string;
  filterStanding: string;
  filterStatus: string;
  filterBedrooms: string;
  filterBudget: string;
  filterMonthly: string;
  bedroomsChip: (n: number, formatted: string) => string;
  priceChip: (formatted: string) => string;
  monthlyChip: (formatted: string) => string;
  regions: Record<RegionId, string>;
  from: string;
  currency: string;
  perMonth: string;
  sqm: string;
  /** Land, two lines: "Lot dès 756 000 DH" / "4 500 DH/m²". */
  landFrom: (total: string) => string;
  landPerSqm: (perSqm: string) => string;
  bedrooms: (min: number, max: number, formatted: string) => string;
  studio: string;
  tours: string;
  loading: string;
  failed: string;
  retry: string;
  pending: string;
};

export const searchCopy: Copy<SearchCopy> = {
  fr: {
    trigger: "Rechercher",
    triggerLabel: "Rechercher un programme",
    menuRow: "Rechercher un programme, une ville…",
    dialog: "Recherche de programmes",
    eyebrow: "Recherche",
    inputLabel: "Décrivez ce que vous cherchez",
    placeholders: [
      "3 chambres à Agadir…",
      "Livraison immédiate près de Casablanca…",
      "Appartement à Marrakech avec piscine…",
      "Moins de 6 000 DH par mois…",
      "Villa face à la mer…",
    ],
    clear: "Effacer",
    close: "Fermer",
    escKey: "Échap",
    ideasTitle: "Idées de recherche",
    ideas: [
      "3 chambres à Agadir",
      "Livraison immédiate près de Casablanca",
      "Appartement à Marrakech avec piscine",
      "Moins de 6 000 DH par mois",
      "Villa face à la mer",
      "Terrain près de Casablanca",
    ],
    quickTitle: "Accès rapides",
    programmesTitle: "Programmes",
    allProgrammes: "Tous les programmes",
    pagesTitle: "Pages",
    understood: "Vos critères",
    criteria: "Critères",
    removeChip: (label) => `Retirer « ${label} »`,
    aiMark: "IA",
    aiTitle: "proposé par l'IA",
    relaxedLead: "Aucun programme ne réunit tout cela.",
    relaxedWidened: (fields) => `Les plus proches, en élargissant : ${fields}.`,
    relaxedClosest: "Voici les plus proches.",
    relaxedFields: {
      priceMax: "budget",
      monthlyMax: "mensualité",
      cities: "ville",
      region: "région",
      statuses: "statut",
      segments: "standing",
      kinds: "type de bien",
      bedroomsMin: "chambres",
      amenities: "équipements",
      text: "nom recherché",
    },
    listJoin: ", ",
    count: (n, formatted) =>
      n === 0 ? "Aucun programme" : n === 1 ? "1 programme correspond" : `${formatted} programmes correspondent`,
    countRelaxed: "Aucun programme exact — les plus proches sont affichés",
    seeOnMap: (n, formatted) =>
      n === null
        ? "Voir la sélection sur la carte"
        : n === 1
          ? "Voir le programme sur la carte"
          : `Voir les ${formatted} programmes sur la carte`,
    hintNavigate: "naviguer",
    hintOpen: "ouvrir",
    hintClose: "fermer",
    filtersTitle: "Affiner",
    filterCity: "Ville",
    filterStanding: "Standing",
    filterStatus: "Statut",
    filterBedrooms: "Chambres",
    filterBudget: "Budget",
    filterMonthly: "Mensualité",
    bedroomsChip: (n, formatted) => `${formatted} ${n > 1 ? "chambres" : "chambre"} et +`,
    priceChip: (formatted) => `≤ ${formatted} DH`,
    monthlyChip: (formatted) => `≤ ${formatted} DH/mois`,
    regions: {
      "casablanca-settat": "Région Casablanca-Settat",
      "rabat-sale-kenitra": "Région Rabat-Salé-Kénitra",
      "marrakech-safi": "Région Marrakech-Safi",
      "souss-massa": "Région Souss-Massa",
      "tanger-tetouan": "Région Tanger-Tétouan-Al Hoceïma",
    },
    from: "à partir de",
    currency: "DH",
    perMonth: "DH/mois",
    sqm: "m²",
    landFrom: (total) => `Lot dès ${total} DH`,
    landPerSqm: (perSqm) => `${perSqm} DH/m²`,
    bedrooms: (_min, max, formatted) => `${formatted} ${max > 1 ? "chambres" : "chambre"}`,
    studio: "Studios",
    tours: "360°",
    loading: "Chargement des programmes…",
    failed: "La recherche n'a pas pu se charger.",
    retry: "Réessayer",
    pending: "Ouverture…",
  },
  ar: {
    trigger: "بحث",
    triggerLabel: "البحث عن مشروع",
    menuRow: "ابحثوا عن مشروع أو مدينة…",
    dialog: "البحث في المشاريع",
    eyebrow: "بحث",
    inputLabel: "صفوا ما تبحثون عنه",
    placeholders: [
      "3 غرف في أكادير…",
      "تسليم فوري قرب الدار البيضاء…",
      "شقة في مراكش مع مسبح…",
      "أقل من 6000 درهم في الشهر…",
      "فيلا مع إطلالة على البحر…",
    ],
    clear: "مسح",
    close: "إغلاق",
    escKey: "Esc",
    ideasTitle: "أفكار للبحث",
    ideas: [
      "3 غرف في أكادير",
      "تسليم فوري قرب الدار البيضاء",
      "شقة في مراكش مع مسبح",
      "أقل من 6000 درهم في الشهر",
      "فيلا مع إطلالة على البحر",
      "بقعة أرضية قرب الدار البيضاء",
    ],
    quickTitle: "روابط سريعة",
    programmesTitle: "المشاريع",
    allProgrammes: "جميع المشاريع",
    pagesTitle: "صفحات",
    understood: "معاييركم",
    criteria: "المعايير",
    removeChip: (label) => `حذف «${label}»`,
    aiMark: "ذكاء اصطناعي",
    aiTitle: "مقترح من الذكاء الاصطناعي",
    relaxedLead: "لا يوجد مشروع يجمع كل هذه الشروط.",
    relaxedWidened: (fields) => `أقرب الاقتراحات بعد توسيع: ${fields}.`,
    relaxedClosest: "إليكم أقرب الاقتراحات.",
    relaxedFields: {
      priceMax: "الميزانية",
      monthlyMax: "القسط الشهري",
      cities: "المدينة",
      region: "الجهة",
      statuses: "الوضعية",
      segments: "الفئة",
      kinds: "نوع العقار",
      bedroomsMin: "عدد الغرف",
      amenities: "المرافق",
      text: "الاسم",
    },
    listJoin: "، ",
    count: (n, formatted) =>
      n === 0
        ? "لا يوجد أي مشروع"
        : n === 1
          ? "مشروع واحد يطابق بحثكم"
          : n === 2
            ? "مشروعان يطابقان بحثكم"
            : n <= 10
              ? `${formatted} مشاريع تطابق بحثكم`
              : `${formatted} مشروعاً يطابق بحثكم`,
    countRelaxed: "لا يوجد تطابق تام — نعرض أقرب الاقتراحات",
    seeOnMap: (n, formatted) =>
      n === null
        ? "عرض الاختيار على الخريطة"
        : n === 1
          ? "عرض المشروع على الخريطة"
          : n === 2
            ? "عرض المشروعين على الخريطة"
            : n <= 10
              ? `عرض المشاريع الـ${formatted} على الخريطة`
              : `عرض الـ${formatted} مشروعاً على الخريطة`,
    hintNavigate: "للتنقل",
    hintOpen: "للفتح",
    hintClose: "للإغلاق",
    filtersTitle: "تدقيق البحث",
    filterCity: "المدينة",
    filterStanding: "الفئة",
    filterStatus: "الوضعية",
    filterBedrooms: "الغرف",
    filterBudget: "الميزانية",
    filterMonthly: "القسط الشهري",
    bedroomsChip: (n, formatted) =>
      n === 1 ? "غرفة فأكثر" : n === 2 ? "غرفتان فأكثر" : `${formatted} غرف فأكثر`,
    // Words, not "≤": mirrored in RTL it reads as "≥" to a reader used to French notation.
    priceChip: (formatted) => `حتى ${formatted} درهم`,
    monthlyChip: (formatted) => `حتى ${formatted} درهم شهرياً`,
    regions: {
      "casablanca-settat": "جهة الدار البيضاء-سطات",
      "rabat-sale-kenitra": "جهة الرباط-سلا-القنيطرة",
      "marrakech-safi": "جهة مراكش-آسفي",
      "souss-massa": "جهة سوس-ماسة",
      "tanger-tetouan": "جهة طنجة-تطوان-الحسيمة",
    },
    from: "ابتداءً من",
    currency: "درهم",
    perMonth: "درهم شهرياً",
    sqm: "م²",
    landFrom: (total) => `بقعة ابتداءً من ${total} درهم`,
    landPerSqm: (perSqm) => `${perSqm} درهم/م²`,
    bedrooms: (min, max, formatted) =>
      min === max ? (max === 1 ? "غرفة واحدة" : max === 2 ? "غرفتان" : `${formatted} غرف`) : `${formatted} غرف`,
    studio: "استوديوهات",
    tours: "360°",
    loading: "جارٍ تحميل المشاريع…",
    failed: "تعذر تحميل البحث.",
    retry: "إعادة المحاولة",
    pending: "جارٍ الفتح…",
  },
};

/**
 * The site's own pages, offered when the words call for them ("crédit",
 * "rendez-vous", "قرض"…). Keywords are language-independent and compared
 * after `normalize()`, so accents and Arabic letter forms do not matter.
 */
export const SEARCH_PAGES: Array<{
  id: string;
  path: string;
  label: { fr: string; ar: string };
  hint: { fr: string; ar: string };
  keywords: string[];
}> = [
  {
    id: "simulateur",
    path: "/guide-achat#simulateur",
    label: { fr: "Simulateur de crédit", ar: "محاكي القرض" },
    hint: { fr: "Calculer une mensualité", ar: "احتساب القسط الشهري" },
    keywords: ["simulateur de credit", "simulateur", "simulation", "simuler", "credit", "pret", "emprunt", "banque", "financement", "mensualites", "قرض", "محاكي", "تمويل", "بنك", "سلف"],
  },
  {
    id: "guide",
    path: "/guide-achat",
    label: { fr: "Guide d'achat", ar: "دليل الشراء" },
    hint: { fr: "Les étapes d'un achat", ar: "مراحل الشراء" },
    keywords: ["guide d achat", "guide", "achat", "acheter", "etapes", "demarches", "notaire", "frais", "dossier", "دليل", "شراء", "خطوات", "موثق"],
  },
  {
    id: "contact",
    path: "/contact",
    label: { fr: "Prendre rendez-vous", ar: "حجز موعد" },
    hint: { fr: "Rencontrer un conseiller", ar: "لقاء مستشار" },
    keywords: ["rendez vous", "prendre rendez vous", "rendez", "rdv", "visite", "visiter", "contact", "contacter", "conseiller", "appeler", "agence", "telephone", "موعد", "زيارة", "اتصال", "تواصل", "مستشار"],
  },
  {
    id: "about",
    path: "/a-propos",
    label: { fr: "Qui sommes-nous", ar: "من نحن" },
    hint: { fr: "L'histoire et les engagements", ar: "التاريخ والالتزامات" },
    keywords: ["qui sommes nous", "a propos", "من نحن", "qui", "propos", "histoire", "groupe", "societe", "entreprise", "chaabi", "iskane", "valeurs", "نحن", "تاريخ", "الشعبي", "للاسكان", "شركه"],
  },
  {
    id: "news",
    path: "/actualites",
    label: { fr: "Actualités", ar: "المستجدات" },
    hint: { fr: "Lancements et films", ar: "الإطلاقات والأفلام" },
    keywords: ["actualites", "actualite", "actus", "news", "nouvelles", "presse", "اخبار", "مستجدات", "جديد"],
  },
];
