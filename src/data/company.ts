import type { Localized } from "./types";

/**
 * Company facts — every figure here is taken from Chaabi Lil Iskane's own
 * published pages (liliskane.com, "Chaabi Lil Iskane" and "Contact" pages,
 * read 2026-10-05). Nothing is estimated or rounded up.
 *
 * v1 of this site said "depuis 1980" and "40 000 logements". The first is
 * wrong — the founding structure dates from 1948 — and the second appears
 * nowhere in the client's own material. Both would have been read by the
 * client's leadership as errors about their own company. If a figure is not
 * in this file, it is not on the site.
 */
export const company = {
  name: { fr: "Chaabi Lil Iskane", ar: "الشعبي للإسكان" } satisfies Localized,
  group: { fr: "Groupe Ynna", ar: "مجموعة ينا" } satisfies Localized,
  /** AFCA — Association Foncière et Commerciale Africaine, the founding structure. */
  founded: 1948,
  /** The client's own phrasing: "plus de 75 ans d'expérience". */
  yearsLabel: { fr: "plus de 75 ans", ar: "أكثر من 75 سنة" } satisfies Localized,
  experienceYears: 75,
  /** First ISO 9001 (AFNOR, France), across all activities. */
  isoSince: 2005,
  /** Aligned on ISO 9001:2015. */
  iso2015Since: 2017,
  /** 1er Prix de la Ligue Arabe de l'Habitat, awarded in Cairo. */
  arabLeaguePrize: 2003,
  /** Chaabi Lil Iskane GOLD, the haut-standing brand. */
  goldLaunch: 2013,
  /** Essaouira El Jadida — a new town. */
  essaouira: { units: 11000, hectares: 180, started: 2000 },
  /** The 15 cities listed in the client's own contact form. */
  citiesCount: 15,
  phone: "05 20 39 34 00",
  phoneHref: "tel:+212520393400",
  hq: {
    fr: "239 Boulevard Mohammed V, Casablanca",
    ar: "239 شارع محمد الخامس، الدار البيضاء",
  } satisfies Localized,
  /** Address the client gives for data-protection requests. */
  dataContact: {
    fr: "Département communication, 233 Bd Mohammed V, 20000 Casablanca",
    ar: "قسم التواصل، 233 شارع محمد الخامس، 20000 الدار البيضاء",
  } satisfies Localized,
  registry: "RC 6807",
} as const;

export type Milestone = { year: number; title: Localized; body: Localized };

/** "Dates clés", from the client's own page — all ten, in order. */
export const milestones: Milestone[] = [
  {
    year: 1948,
    title: { fr: "Création", ar: "التأسيس" },
    body: {
      fr: "Création de l'AFCA, l'Association Foncière et Commerciale Africaine, structure fondatrice de Chaabi Lil Iskane.",
      ar: "تأسيس الجمعية العقارية والتجارية الإفريقية، النواة الأولى للشعبي للإسكان.",
    },
  },
  {
    year: 2000,
    title: { fr: "Essaouira El Jadida", ar: "الصويرة الجديدة" },
    body: {
      fr: "Lancement d'une ville nouvelle : 180 hectares, environ 11 000 logements.",
      ar: "إطلاق مدينة جديدة على مساحة 180 هكتاراً، بحوالي 11 000 مسكن.",
    },
  },
  {
    year: 2002,
    title: { fr: "Mobilisation sociale", ar: "تعبئة اجتماعية" },
    body: {
      fr: "Relogement des sinistrés des inondations de Mohammedia, avec des solutions d'habitat dignes et sécurisées.",
      ar: "إعادة إسكان متضرري فيضانات المحمدية في مساكن لائقة وآمنة.",
    },
  },
  {
    year: 2003,
    title: { fr: "Prix de la Ligue Arabe de l'Habitat", ar: "جائزة الجامعة العربية للإسكان" },
    body: {
      fr: "1er Prix, décerné au Caire par le Conseil des Ministres Arabes de l'Habitat, pour Essaouira El Jadida.",
      ar: "الجائزة الأولى، سلّمها بالقاهرة مجلس وزراء الإسكان العرب، عن مشروع الصويرة الجديدة.",
    },
  },
  {
    year: 2004,
    title: { fr: "Relogement à Al Hoceïma", ar: "إعادة الإسكان بالحسيمة" },
    body: {
      fr: "Construction de logements économiques pour les sinistrés du séisme, à Beni Bouayach et Imzouren.",
      ar: "بناء مساكن اقتصادية لفائدة متضرري الزلزال ببني بوعياش وإمزورن.",
    },
  },
  {
    year: 2005,
    title: { fr: "Certification ISO 9001", ar: "شهادة إيزو 9001" },
    body: {
      fr: "Certifiée par AFNOR sur l'ensemble de ses activités — l'un des premiers promoteurs certifiés au Maroc.",
      ar: "شهادة من AFNOR تشمل جميع الأنشطة، من أوائل المنعشين العقاريين الحاصلين عليها بالمغرب.",
    },
  },
  {
    year: 2006,
    title: { fr: "Partenariat international", ar: "شراكة دولية" },
    body: {
      fr: "Partenariat public-privé avec le Ministère de l'Habitat de la République de Guinée.",
      ar: "شراكة بين القطاعين العام والخاص مع وزارة الإسكان بجمهورية غينيا.",
    },
  },
  {
    year: 2013,
    title: { fr: "Chaabi Lil Iskane GOLD", ar: "الشعبي للإسكان GOLD" },
    body: {
      fr: "Lancement de la marque dédiée au haut standing.",
      ar: "إطلاق العلامة المخصصة للسكن الراقي.",
    },
  },
  {
    year: 2024,
    title: { fr: "Aide directe au logement", ar: "الدعم المباشر للسكن" },
    body: {
      fr: "Offre adaptée dans plusieurs villes pour l'éligibilité au programme d'aide directe au logement.",
      ar: "ملاءمة العرض في عدة مدن ليستفيد الزبناء من برنامج الدعم المباشر للسكن.",
    },
  },
  {
    year: 2025,
    title: { fr: "Label HQE", ar: "علامة HQE" },
    body: {
      fr: "La Résidence Beethoven à Témara obtient le label HQE, niveau Exceptionnel.",
      ar: "إقامة بيتهوفن بتمارة تحصل على علامة HQE بمستوى استثنائي.",
    },
  },
];

export type Value = { title: Localized; body: Localized };

/** "Nos valeurs", the client's four. */
export const values: Value[] = [
  {
    title: { fr: "Rigueur", ar: "الصرامة" },
    body: {
      fr: "Tenir nos engagements de délais et de qualité, aux côtés de nos clients et partenaires.",
      ar: "الوفاء بالتزاماتنا في الآجال والجودة، إلى جانب زبنائنا وشركائنا.",
    },
  },
  {
    title: { fr: "Innovation constante", ar: "الابتكار المستمر" },
    body: {
      fr: "Anticiper les usages et améliorer sans cesse l'offre, en gardant des prix très compétitifs.",
      ar: "استباق الاستعمالات وتحسين العرض باستمرار مع الحفاظ على أسعار تنافسية.",
    },
  },
  {
    title: { fr: "Respect de la société et de l'environnement", ar: "احترام المجتمع والبيئة" },
    body: {
      fr: "Agir de manière responsable, gage de pérennité et de compétitivité à long terme.",
      ar: "التصرف بمسؤولية، ضماناً للاستدامة والتنافسية على المدى البعيد.",
    },
  },
  {
    title: { fr: "Écoute et satisfaction client", ar: "الإنصات ورضا الزبون" },
    body: {
      fr: "Disponibles et réactifs, pour comprendre chaque attente et y répondre avec justesse.",
      ar: "متاحون ومتجاوبون، لفهم كل انتظار والاستجابة له بدقة.",
    },
  },
];

export type Guarantee = { years: number; title: Localized; body: Localized };

/** The legal guarantees the client lists on its own page. */
export const guarantees: Guarantee[] = [
  {
    years: 1,
    title: { fr: "Parfait achèvement", ar: "الإنجاز التام" },
    body: {
      fr: "Les désordres signalés pendant la première année sont pris en charge.",
      ar: "التكفل بالعيوب المبلغ عنها خلال السنة الأولى.",
    },
  },
  {
    years: 2,
    title: { fr: "Bon fonctionnement", ar: "حسن الاشتغال" },
    body: {
      fr: "Menuiseries, robinetterie et équipements techniques couverts deux ans.",
      ar: "النجارة والصنابير والتجهيزات التقنية مضمونة لمدة سنتين.",
    },
  },
  {
    years: 10,
    title: { fr: "Décennale", ar: "الضمان العشري" },
    body: {
      fr: "Les dommages compromettant la solidité de l'ouvrage, couverts dix ans.",
      ar: "الأضرار التي تمس متانة البناء مضمونة لعشر سنوات.",
    },
  },
];
