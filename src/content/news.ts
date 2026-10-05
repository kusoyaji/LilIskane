import { company, milestones } from "@/data/company";
import { isolateRun, type Locale } from "@/i18n/config";
import type { Copy } from "./shared";

/**
 * Copy for /actualites.
 *
 * There are no article pages on this site, so this page is built only from
 * things that already have a real destination: programmes currently
 * "en lancement" (each links to its own project page) and company news taken
 * from `milestones` and the ISO facts in `company.ts` (each links to
 * /a-propos). The client's legacy "actualités" feed is lifestyle and décor
 * posts (winter cities, parks, decorating tips) — none of it is company news,
 * so none of it is reproduced here.
 */

const year = (y: number) => milestones.find((m) => m.year === y);
const hqe = year(2025);
const aide = year(2024);

/** Arabic counted nouns: 3–10 take the broken plural, 11+ the singular accusative. */
const arCount = (n: number, few: string, many: string, two: string, one: string) =>
  n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? few : many;

export type CompanyNewsId = "hqe" | "aide" | "iso";

export type CompanyNews = {
  id: CompanyNewsId;
  /** Year shown in the eyebrow — only years the source gives. */
  year: number;
  /** Big typographic mark in the panel. */
  mark: string;
  /** Small line under the mark. */
  markCaption: string;
  title: string;
  body: string;
};

export const news: Copy<{
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  title: string;
  lead: string;
  statLaunches: (n: number) => string;
  statCities: (n: number) => string;

  featuredBadge: string;
  launch: string;
  fromLabel: string;
  surfaces: string;
  bedrooms: string;
  bedroomsValue: (min: number, max: number) => string;
  delivery: string;
  tours: string;
  toursValue: (n: number) => string;
  discover: string;
  renderNote: string;
  photoNote: string;
  previousPhase: (name: string, year: number) => string;
  seePrevious: (name: string) => string;

  listEyebrow: string;
  listTitle: string;
  filterLabel: string;
  filterAll: string;
  filterLaunches: string;
  filterCompany: string;
  resultCount: (n: number) => string;

  deliveryShort: (y: number) => string;
  seeProgramme: string;
  landPanel: string;
  buildable: string;
  lotRange: (min: string, max: string) => string;
  companyLabel: string;
  companyCta: string;
  companyNews: CompanyNews[];
}> = {
  fr: {
    metaTitle: "Actualités & lancements",
    metaDescription:
      "Les programmes que Chaabi Lil Iskane ouvre à la commercialisation, et les nouvelles de l'entreprise : label HQE, aide directe au logement, certification ISO 9001.",
    crumb: "Actualités",
    title: "Actualités & lancements",
    lead: "Les programmes que nous ouvrons à la commercialisation, et les étapes qui comptent pour l'entreprise.",
    statLaunches: (n) => (n > 1 ? "programmes en lancement" : "programme en lancement"),
    statCities: (n) => (n > 1 ? "villes concernées" : "ville concernée"),

    featuredBadge: "À la une",
    launch: "Lancement",
    fromLabel: "À partir de",
    surfaces: "Surfaces",
    bedrooms: "Chambres",
    bedroomsValue: (min, max) => (min === max ? `${min}` : `${min} et ${max}`),
    delivery: "Livraison prévisionnelle",
    tours: "Visites 360°",
    toursValue: (n) => (n > 1 ? `${n} appartements` : `${n} appartement`),
    discover: "Découvrir le programme",
    renderNote: "Rendu — image non contractuelle",
    photoNote: "Photographie",
    previousPhase: (name, y) => `${name}, la première tranche, a été livrée en ${y}.`,
    seePrevious: (name) => `Voir ${name}`,

    listEyebrow: "Le fil",
    listTitle: "Ce qui se lance, ce qui nous fait avancer.",
    filterLabel: "Filtrer les actualités",
    filterAll: "Tout",
    filterLaunches: "Lancements",
    filterCompany: "Entreprise",
    resultCount: (n) => (n > 1 ? `${n} actualités affichées` : `${n} actualité affichée`),

    deliveryShort: (y) => `Livraison prévisionnelle ${y}`,
    seeProgramme: "Voir le programme",
    landPanel: "Lots de terrain",
    buildable: "Constructible",
    lotRange: (min, max) => `Lots de ${min} à ${max}`,
    companyLabel: "Entreprise",
    companyCta: "Notre histoire",
    companyNews: [
      {
        id: "hqe",
        year: hqe?.year ?? 2025,
        mark: "HQE",
        markCaption: "Niveau Exceptionnel",
        title: "La Résidence Beethoven, à Témara, obtient le label HQE",
        body: "Niveau Exceptionnel, pour l'amélioration de la qualité environnementale et énergétique du programme sur l'ensemble de son cycle de vie.",
      },
      {
        id: "aide",
        year: aide?.year ?? 2024,
        mark: String(aide?.year ?? 2024),
        markCaption: "Aide directe au logement",
        title: "Une offre adaptée à l'aide directe au logement",
        body: "Dans plusieurs villes du Royaume, l'offre a été adaptée pour ouvrir l'éligibilité au programme d'aide directe au logement et faciliter l'accès à la propriété.",
      },
      {
        id: "iso",
        year: company.isoSince,
        mark: "ISO 9001",
        markCaption: `Depuis ${company.isoSince} · AFNOR`,
        title: `La qualité certifiée ISO 9001 depuis ${company.isoSince}`,
        body: `Certifiée par AFNOR sur l'ensemble de ses activités dès ${company.isoSince} — l'un des premiers promoteurs certifiés au Maroc — Chaabi Lil Iskane a aligné son système de management sur la version ISO 9001:2015 en ${company.iso2015Since}.`,
      },
    ],
  },
  ar: {
    metaTitle: "المستجدات والإطلاقات",
    metaDescription:
      "البرامج التي يفتحها الشعبي للإسكان للتسويق، وأخبار الشركة: علامة HQE، الدعم المباشر للسكن، شهادة إيزو 9001.",
    crumb: "المستجدات",
    title: "المستجدات والإطلاقات",
    lead: "البرامج التي نفتحها للتسويق، والمحطات التي تهمّ الشركة.",
    statLaunches: (n) =>
      arCount(n, "برامج قيد الإطلاق", "برنامجاً قيد الإطلاق", "برنامجان قيد الإطلاق", "برنامج قيد الإطلاق"),
    statCities: (n) => arCount(n, "مدن معنية", "مدينة معنية", "مدينتان معنيتان", "مدينة معنية"),

    featuredBadge: "في الواجهة",
    launch: "إطلاق",
    fromLabel: "ابتداءً من",
    surfaces: "المساحات",
    bedrooms: "غرف النوم",
    bedroomsValue: (min, max) => (min === max ? `${min}` : `${min} أو ${max}`),
    delivery: "التسليم المرتقب",
    tours: "زيارات 360°",
    toursValue: (n) => isolateRun(`${n}`, "ar") + (n === 1 ? " شقة" : n === 2 ? " شقتان" : " شقق"),
    discover: "اكتشفوا البرنامج",
    renderNote: "تصور — صورة غير تعاقدية",
    photoNote: "صورة فوتوغرافية",
    previousPhase: (name, y) => `سُلّم ${name}، الشطر الأول، سنة ${y}.`,
    seePrevious: (name) => `عرض ${name}`,

    listEyebrow: "آخر المستجدات",
    listTitle: "ما يُطلق، وما يدفعنا إلى الأمام.",
    filterLabel: "تصفية المستجدات",
    filterAll: "الكل",
    filterLaunches: "الإطلاقات",
    filterCompany: "الشركة",
    resultCount: (n) => `${isolateRun(String(n), "ar")} ${n >= 3 && n <= 10 ? "مستجدات معروضة" : "مستجد معروض"}`,

    deliveryShort: (y) => `التسليم المرتقب ${y}`,
    seeProgramme: "عرض البرنامج",
    landPanel: "بقع أرضية",
    buildable: "قابلة للبناء",
    lotRange: (min, max) => `بقع من ${min} إلى ${max}`,
    companyLabel: "الشركة",
    companyCta: "تاريخنا",
    companyNews: [
      {
        id: "hqe",
        year: hqe?.year ?? 2025,
        mark: "HQE",
        markCaption: "مستوى استثنائي",
        title: "إقامة بيتهوفن بتمارة تحصل على علامة HQE",
        body: "بمستوى استثنائي، بفضل تحسين الجودة البيئية والطاقية للبرنامج على امتداد دورة حياته.",
      },
      {
        id: "aide",
        year: aide?.year ?? 2024,
        mark: String(aide?.year ?? 2024),
        markCaption: "الدعم المباشر للسكن",
        title: "عرض ملائم للدعم المباشر للسكن",
        body: "في عدة مدن بالمملكة، تمت ملاءمة العرض ليستفيد الزبناء من برنامج الدعم المباشر للسكن، تيسيراً للولوج إلى الملكية.",
      },
      {
        id: "iso",
        year: company.isoSince,
        mark: "ISO 9001",
        markCaption: `منذ ${company.isoSince} · AFNOR`,
        title: `جودة معتمدة بشهادة إيزو 9001 منذ ${company.isoSince}`,
        body: `حصل الشعبي للإسكان سنة ${company.isoSince} على شهادة AFNOR التي تشمل جميع أنشطته — من أوائل المنعشين العقاريين الحاصلين عليها بالمغرب — ثم لاءم نظام تدبيره مع صيغة ${isolateRun("ISO 9001:2015", "ar")} سنة ${company.iso2015Since}.`,
      },
    ],
  },
};

export type NewsCopy = (typeof news)[Locale];
