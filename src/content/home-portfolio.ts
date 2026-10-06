import type { Segment } from "@/data/types";
import type { Copy } from "./shared";

/**
 * Copy for the home's map explorer, and the segment names it prints. Every
 * figure in these strings is injected from the data layer at render time
 * (`{n}` placeholders) — no number is typed into the copy itself, so the
 * words cannot drift from the catalogue.
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
