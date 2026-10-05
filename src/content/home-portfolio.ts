import type { Segment } from "@/data/types";
import type { Copy } from "./shared";

/**
 * Copy for the middle of the home page: the render/delivered comparison, the
 * portfolio showcase and the map. Every figure that appears in these strings
 * is injected from the data layer at render time (`{n}` placeholders) — no
 * number is typed into the copy itself, so the words cannot drift from the
 * catalogue.
 */

export const segmentLabels: Copy<Record<Segment, string>> = {
  fr: {
    economique: "Économique",
    "moyen-standing": "Moyen standing",
    "haut-standing": "Haut standing",
    terrain: "Terrains",
    commercial: "Locaux commerciaux",
    bureaux: "Bureaux",
  },
  ar: {
    economique: "السكن الاقتصادي",
    "moyen-standing": "السكن المتوسط",
    "haut-standing": "السكن الراقي",
    terrain: "بقع أرضية",
    commercial: "محلات تجارية",
    bureaux: "مكاتب",
  },
};

export const proofCopy: Copy<{
  eyebrow: string;
  titleA: string;
  titleB: string;
  /** {render} = render project, {source} = delivered project. No years: the client publishes none. */
  lead: string;
  drag: string;
  renderTag: string;
  renderNote: string;
  deliveryWord: string;
  realTag: string;
  realNote: string;
  sliderLabel: string;
  /** {n} = percentage of the frame showing the render. */
  sliderValue: string;
  pairsLabel: string;
  legal: string;
  seeProject: string;
}> = {
  fr: {
    eyebrow: "Rendu et photographie",
    titleA: "Le rendu,",
    titleB: "puis le réel.",
    lead: "À gauche, le rendu de {render}, en lancement. À droite, {source}, déjà livré, à deux cents mètres. Faites glisser pour comparer.",
    drag: "Glisser",
    renderTag: "Rendu",
    renderNote: "Image non contractuelle",
    deliveryWord: "livraison",
    realTag: "Livré",
    realNote: "Photographie",
    sliderLabel: "Comparer le rendu et la photographie du livré",
    sliderValue: "{n} % rendu",
    pairsLabel: "Choisir la pièce à comparer",
    legal: "Rendu — image non contractuelle. Photographies prises à Riad Garden I, programme livré.",
    seeProject: "Voir Riad Garden II",
  },
  ar: {
    eyebrow: "التصوّر والصورة الفوتوغرافية",
    titleA: "التصوّر،",
    titleB: "ثم الواقع.",
    lead: "على اليمين، تصوّر {render}، في طور الإطلاق. وعلى اليسار، {source} المُسلَّم، على بعد مائتي متر. اسحبوا للمقارنة.",
    drag: "اسحبوا",
    renderTag: "تصوّر",
    renderNote: "صورة غير تعاقدية",
    deliveryWord: "التسليم",
    realTag: "مُسلَّم",
    realNote: "صورة فوتوغرافية",
    sliderLabel: "قارنوا بين التصوّر وصورة المشروع المُسلَّم",
    sliderValue: "{n} ٪ تصوّر",
    pairsLabel: "اختاروا الفضاء للمقارنة",
    legal: "تصوّر — صورة غير تعاقدية. الصور الفوتوغرافية مأخوذة في رياض غاردن 1، المشروع المُسلَّم.",
    seeProject: "اكتشفوا رياض غاردن 2",
  },
};

export const showcaseCopy: Copy<{
  eyebrow: string;
  title: string;
  /** {n} = programme count, {cities} = city count. */
  lead: string;
  filterLabel: string;
  all: string;
  renderNote: string;
  landKicker: string;
  /** {n} = smallest lot in m². */
  lotsFrom: string;
  perSqm: string;
  allTitle: string;
  allBody: string;
  scrollHint: string;
  /** The client's own label for built stock. */
  readyNow: string;
  deliveryIn: string;
}> = {
  fr: {
    eyebrow: "Nos programmes",
    title: "Choisissez votre adresse.",
    lead: "{n} programmes au catalogue, dans {cities} villes — appartements de haut et moyen standing, et lots de terrain viabilisés.",
    filterLabel: "Filtrer par catégorie",
    all: "Tous",
    renderNote: "Rendu — image non contractuelle",
    landKicker: "Lots de terrain",
    lotsFrom: "Lots à partir de {n} m²",
    perSqm: "le m²",
    allTitle: "Tous nos programmes",
    allBody: "Filtrez par ville, mensualité, nombre de chambres et standing.",
    scrollHint: "Faire défiler",
    readyNow: "Livraison immédiate",
    deliveryIn: "Livraison",
  },
  ar: {
    eyebrow: "مشاريعنا",
    title: "اختاروا عنوانكم.",
    lead: "{n} مشروعاً ضمن عروضنا الحالية، في {cities} مدن — شقق من المستوى الراقي والمتوسط، وبقع أرضية مجهّزة.",
    filterLabel: "التصفية حسب الفئة",
    all: "الكل",
    renderNote: "تصوّر — صورة غير تعاقدية",
    landKicker: "بقع أرضية",
    lotsFrom: "بقع ابتداءً من {n} م²",
    perSqm: "للمتر المربع",
    allTitle: "جميع مشاريعنا",
    allBody: "صفّوا حسب المدينة والقسط الشهري وعدد الغرف ومستوى السكن.",
    scrollHint: "مرّروا",
    readyNow: "تسليم فوري",
    deliveryIn: "التسليم",
  },
};

export const mapCopy: Copy<{
  eyebrow: string;
  /** {n} = company.citiesCount. */
  title: string;
  /** {first} = founding year, {n} = programmes on the map, {cities} = their cities. */
  lead: string;
  legendProgramme: string;
  legendCity: string;
  loupe: string;
  /** Singular / plural programme count. */
  one: string;
  many: string;
  listLabel: string;
  panelHint: string;
  seeAll: string;
}> = {
  fr: {
    eyebrow: "Présence",
    title: "Présents dans {n} villes du Royaume.",
    lead: "Depuis {first}, Chaabi Lil Iskane construit à travers le Maroc. La carte situe les {n} programmes de notre catalogue actuel, dans {cities} villes.",
    legendProgramme: "Programmes au catalogue",
    legendCity: "Villes d'implantation",
    loupe: "Axe Rabat – Casablanca",
    one: "programme",
    many: "programmes",
    listLabel: "Villes et programmes",
    panelHint: "Choisissez une ville sur la carte ou dans la liste.",
    seeAll: "Voir tous les programmes",
  },
  ar: {
    eyebrow: "حضورنا",
    title: "حاضرون في {n} مدينة عبر المملكة.",
    lead: "منذ {first}، يبني الشعبي للإسكان عبر ربوع المغرب. تحدّد الخريطة {n} مشروعاً من عروضنا الحالية، في {cities} مدن.",
    legendProgramme: "مشاريع ضمن عروضنا الحالية",
    legendCity: "مدن الحضور",
    loupe: "محور الرباط – الدار البيضاء",
    one: "مشروع",
    many: "مشاريع",
    listLabel: "المدن والمشاريع",
    panelHint: "اختاروا مدينة على الخريطة أو من القائمة.",
    seeAll: "عرض جميع المشاريع",
  },
};

/** Replaces `{key}` placeholders. Values are expected to be pre-formatted runs. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/**
 * "3 programmes" / "3 مشاريع". Arabic agrees the noun with the number (dual,
 * 3–10 plural, 11+ singular accusative), so this cannot be one template.
 */
export function programmeCount(n: number, locale: "fr" | "ar", format: (v: number) => string): string {
  if (locale === "fr") return `${format(n)} ${n > 1 ? "programmes" : "programme"}`;
  if (n === 1) return "مشروع واحد";
  if (n === 2) return "مشروعان";
  if (n <= 10) return `${format(n)} مشاريع`;
  return `${format(n)} مشروعاً`;
}
