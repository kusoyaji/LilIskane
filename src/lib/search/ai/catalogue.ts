import { AMENITY_LABELS, KIND_LABELS, SEGMENT_LABELS, statusText } from "../../../content/projects.ts";
import { getCity } from "../../../data/cities.ts";
import { projects } from "../../../data/projects.ts";
import type { Project } from "../../../data/types.ts";
import { CREDIT_DEFAULTS, DEFAULT_DEPOSIT } from "../../credit.ts";
import { STATUS_FACETS, hasStatusFacet } from "../../status-facets.ts";
import { CITY_REGION, REGION_CITIES } from "../lexicon.ts";
import { words } from "../normalize.ts";
import type { RegionId } from "../types.ts";
import { monthlyCeiling } from "./criteria.ts";
import { numbersIn } from "./numbers.ts";
import type { ProgrammeFacts, ValidationContext } from "./validate.ts";
import { AI_AMENITIES, AI_CITY_IDS, AI_KINDS, AI_SEGMENTS, AI_SLUGS, AI_STATUSES, VOCABULARY } from "./vocab.ts";

/**
 * The catalogue the concierge reads: ONE text block describing all 23
 * programmes from src/data, in both languages, plus the rules a Moroccan
 * buyer's sentence needs (regions, centimes, monthly payments, Darija).
 *
 * It is the prompt's stable prefix, sent first on every request so Gemini's
 * implicit cache can reuse it: the output must be byte-identical across
 * requests and processes — data order, fixed formatting, no dates, no
 * randomness, no locale-dependent Intl output (numbers are grouped by hand).
 * The catalogue test asserts it.
 *
 * Server-side (reads the portfolio); node-importable.
 */

/** "1830000" → "1 830 000", with a plain space: same bytes on every runtime. */
export function dh(n: number): string {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const REGION_NAMES: Record<RegionId, { fr: string; ar: string }> = {
  "casablanca-settat": { fr: "Casablanca-Settat", ar: "الدار البيضاء سطات" },
  "rabat-sale-kenitra": { fr: "Rabat-Salé-Kénitra", ar: "الرباط سلا القنيطرة" },
  "marrakech-safi": { fr: "Marrakech-Safi", ar: "مراكش آسفي" },
  "souss-massa": { fr: "Souss-Massa", ar: "سوس ماسة" },
  "tanger-tetouan": { fr: "Tanger-Tétouan-Al Hoceïma", ar: "طنجة تطوان الحسيمة" },
};

/** Monthly budgets the catalogue states a price ceiling for. */
export const MONTHLY_EXAMPLES = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000];

/** Programmes with a film from the client's channel (src/data/films.ts → programmeFilms). */
const WITH_FILM = new Set([
  "massylia",
  "jasmin",
  "patio-verde",
  "jnane-souss",
  "assafa",
  "al-anbar",
  "izdihar",
  "dyar-al-bahia-2",
  "assalam-tg",
  "bougainvillier",
]);

function entryPrice(p: Project): number {
  return p.price.unit === "per-sqm" ? p.price.amount * (p.price.minimumLotSqm ?? 1) : p.price.amount;
}

function range(min: number, max: number, unit = ""): string {
  return min === max ? `${dh(min)}${unit}` : `${dh(min)} à ${dh(max)}${unit}`;
}

function block(p: Project): string {
  const city = getCity(p.cityId);
  const region = CITY_REGION[p.cityId];
  const lines: string[] = [];
  lines.push(`### ${p.slug}`);
  lines.push(`Nom : ${p.name.fr} · ${p.name.ar}`);
  lines.push(`Ville : ${p.cityId} (${city.name.fr} · ${city.name.ar}) — région ${region} (${REGION_NAMES[region].fr})`);
  lines.push(`Quartier : ${p.neighbourhood.fr} · ${p.neighbourhood.ar}`);
  lines.push(`Standing : ${p.segment} (${SEGMENT_LABELS[p.segment].fr} · ${SEGMENT_LABELS[p.segment].ar})`);
  lines.push(`Types : ${p.kinds.map((k) => `${k} (${KIND_LABELS[k].fr})`).join(", ")}`);
  const facets = STATUS_FACETS.filter((f) => hasStatusFacet(p, f));
  lines.push(`Statut affiché : « ${statusText(p, "fr")} » · « ${statusText(p, "ar")} » — valeurs : ${facets.join(", ")}`);
  if (p.readyNow) lines.push("Livraison immédiate : oui (le client l'affiche · تسليم فوري)");
  if (p.readySoon) lines.push("Livraison imminente : oui (le client l'affiche · تسليم وشيك)");
  if (p.price.unit === "per-sqm") {
    const lot = p.price.minimumLotSqm ?? 0;
    lines.push(
      `Prix : ${dh(p.price.amount)} DH/m² · plus petit lot ${dh(lot)} m² · prix d'entrée (plus petit lot) ${dh(entryPrice(p))} DH`,
    );
  } else {
    lines.push(`Prix d'entrée : à partir de ${dh(p.price.amount)} DH`);
  }
  if (p.bedroomsMax > 0) {
    const studios = p.kinds.includes("studio") && p.bedroomsMax <= 1;
    lines.push(`Chambres : ${studios ? "studios (1 pièce)" : range(p.bedroomsMin, p.bedroomsMax)}`);
  } else {
    lines.push("Chambres : sans objet (terrain)");
  }
  lines.push(`Surfaces : ${range(p.surfaceMin, p.surfaceMax, " m²")}`);
  if (p.floors) lines.push(`Hauteur : ${p.floors}`);
  if (p.typologies.length > 0) {
    const typos = p.typologies.map((t) => {
      const price =
        t.price.amount <= 0
          ? "prix sur demande"
          : t.price.unit === "per-sqm"
            ? `${dh(t.price.amount)} DH/m²`
            : `${dh(t.price.amount)} DH`;
      return `${t.label.fr} (${range(t.surfaceMin, t.surfaceMax, " m²")}, ${price})`;
    });
    lines.push(`Typologies : ${typos.join(" ; ")}`);
  }
  lines.push(`Équipements : ${p.amenities.length > 0 ? p.amenities.join(", ") : "aucun publié"}`);
  lines.push(`Visites 360° : ${p.tours.length} · Film : ${WITH_FILM.has(p.slug) ? "oui" : "non"}`);
  if (p.previousPhaseSlug) lines.push(`Phase précédente : ${p.previousPhaseSlug}`);
  lines.push(`Résumé : ${p.summary.fr}`);
  lines.push(`ملخص : ${p.summary.ar}`);
  return lines.join("\n");
}

function rules(): string {
  const regions = (Object.keys(REGION_CITIES) as RegionId[])
    .map((r) => `- ${r} (${REGION_NAMES[r].fr} · ${REGION_NAMES[r].ar}) → ${REGION_CITIES[r].join(", ")}`)
    .join("\n");
  const monthly = MONTHLY_EXAMPLES.map((m) => `- ${dh(m)} DH/mois → prix d'entrée jusqu'à ${dh(roundK(monthlyCeiling(m)))} DH`).join("\n");
  const amenities = AI_AMENITIES.map((a) => `- ${a} : ${AMENITY_LABELS[a].fr} · ${AMENITY_LABELS[a].ar}`).join("\n");
  return [
    "## Valeurs autorisées",
    `- villes (ids) : ${AI_CITY_IDS.join(", ")}`,
    `- standings : ${AI_SEGMENTS.join(", ")}`,
    `- types : ${AI_KINDS.join(", ")} (un terrain est le standing « terrain », pas un type)`,
    `- statuts : ${AI_STATUSES.join(", ")} (immediate = « Livraison immédiate », imminente = « Livraison imminente »)`,
    `- programmes : ${AI_SLUGS.length} (${AI_SLUGS.join(", ")})`,
    "",
    "## Équipements (ids)",
    amenities,
    "",
    "## Régions → villes où Chaabi Lil Iskane a un programme",
    regions,
    "Aucun programme à Casablanca même : « Casablanca », « Casa », « الدار البيضاء », « كازا » = région casablanca-settat. « Rabat » = région rabat-sale-kenitra. Une ville seule reste cette ville.",
    "",
    "## Montants",
    "- Les prix sont en dirhams (DH). « 1,2 million », « 1.2M », « 1 200 000 », « 1200k » = 1 200 000 DH.",
    "- Centimes marocains : « N millions » / « N مليون » avec N ≥ 10 = N × 10 000 DH (« 50 millions » = 500 000 DH, « 25 مليون » = 250 000 DH). Avec N < 10 : N × 1 000 000 DH. « مليون ونص » = 1 500 000 DH. « ألف » = × 1 000.",
    "- Un montant suivi de « par mois », « /mois », « mensualité », « شهريا », « في الشهر » est un plafond de mensualité (monthlyMax), pas un prix.",
    "- Un minimum (« plus de », « à partir de ») n'est pas un plafond : ne le mets pas dans priceMax.",
    "- Les surfaces (m², م²) ne sont pas des prix.",
    "",
    "## Mensualités (règle du site)",
    `Le site convertit une mensualité en prix plafond avec un apport de ${dh(DEFAULT_DEPOSIT)} DH, un crédit sur ${CREDIT_DEFAULTS.years} ans à ${String(CREDIT_DEFAULTS.annualRate * 100).replace(".", ",")} % (assurance comprise). Ne calcule rien toi-même : mets la mensualité dans filters.monthlyMax et le site fait le calcul. Repères (arrondis) :`,
    monthly,
    "",
    "## Chambres",
    "- « N chambres » = N chambres. « N pièces » au Maroc = salon + (N−1) chambres. « F3 » / « T3 » = 2 chambres. « studio » = type studio.",
    "- bedroomsMin compare au plus grand logement du programme.",
    "",
    "## Glossaire (darija, translittérations)",
    "bghit / بغيت = je veux · dar / دار = maison, logement · appart / شقة = appartement · jouj / جوج = 2 · tlata / تلاتة = 3 · rb3a / ربعة = 4 · bit, byout / بيت، بيوت = chambre(s) · mlyoun / مليون = million · f / ف = à, dans · b / ب = avec, pour · qrib / قريب = près de · lbhar / البحر = la mer · chi / شي = un, quelque · ghali / غالي = cher · rkhis / رخيص = pas cher · mzyan / مزيان = bien · daba / دابا = maintenant · wajed / واجد = prêt (livraison immédiate) · bqe3a / بقعة = lot de terrain · l3ayla / العائلة = famille · drari / الدراري = enfants · lmdrasa / المدرسة = école · jame3 / جامع = mosquée · bisin / بيسين = piscine.",
  ].join("\n");
}

function roundK(n: number): number {
  return Math.round(n / 1000) * 1000;
}

/** Renders the catalogue from the data (no memo — the determinism test calls it twice). */
export function renderCatalogue(): string {
  return [
    "# CATALOGUE — Chaabi Lil Iskane (الشعبي للإسكان), programmes publiés sur liliskane.com",
    "Chaque fiche ci-dessous est la seule source de vérité. Tout ce qui n'y figure pas est « non publié ».",
    "",
    rules(),
    "",
    "## Programmes",
    projects.map(block).join("\n\n"),
  ].join("\n");
}

let catalogue: string | null = null;

/** The whole catalogue. Built once per process; byte-identical every time. */
export function buildCatalogue(): string {
  catalogue ??= renderCatalogue();
  return catalogue;
}

/* ------------------------------------------------------------------ */
/* Facts, for the validator                                            */
/* ------------------------------------------------------------------ */

function programmeNumbers(p: Project): number[] {
  const out = new Set<number>([
    entryPrice(p),
    p.price.amount,
    p.surfaceMin,
    p.surfaceMax,
    p.bedroomsMin,
    p.bedroomsMax,
    p.tours.length,
  ]);
  if (p.price.minimumLotSqm) out.add(p.price.minimumLotSqm);
  if (p.remisePct) out.add(p.remisePct);
  for (const t of p.typologies) {
    for (const n of [t.surfaceMin, t.surfaceMax, t.bedrooms, t.price.amount]) if (n > 0) out.add(n);
  }
  const prose = [p.name.fr, p.name.ar, p.neighbourhood.fr, p.neighbourhood.ar, p.summary.fr, p.summary.ar, p.floors ?? ""];
  for (const text of prose) for (const found of numbersIn(text)) for (const v of found.values) out.add(v);
  return [...out];
}

const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3" };
const LEADING_ARTICLES = new Set(["les", "le", "la", "al", "el"]);

/**
 * The ways a sentence may name a programme, as folded word sequences: the
 * name in both scripts, without its descriptor ("Océane R+1 — lots de
 * terrain" → "Océane R+1"), without a leading article ("Pins de Maamora"),
 * with roman numerals as digits ("Riad Garden 2").
 */
function nameForms(p: Project): string[][] {
  const out = new Map<string, string[]>();
  const add = (ws: string[]) => {
    if (ws.length > 0) out.set(ws.join(" "), ws);
  };
  for (const name of [p.name.fr, p.name.ar]) {
    for (const head of new Set([name, name.split(/\s+[—–-]\s+/)[0]])) {
      const ws = words(head);
      add(ws);
      add(ws.map((w) => ROMAN[w] ?? w));
      if (ws.length > 1 && LEADING_ARTICLES.has(ws[0])) add(ws.slice(1));
    }
  }
  return [...out.values()];
}

let facts: Map<string, ProgrammeFacts> | null = null;

export function programmeFacts(): Map<string, ProgrammeFacts> {
  facts ??= new Map(
    projects.map((p) => [
      p.slug,
      {
        slug: p.slug,
        cityId: p.cityId,
        price: entryPrice(p),
        bedroomsMax: p.bedroomsMax,
        segment: p.segment,
        kinds: p.kinds,
        statuses: STATUS_FACETS.filter((f) => hasStatusFacet(p, f)),
        amenities: p.amenities,
        numbers: programmeNumbers(p),
        names: nameForms(p),
      },
    ]),
  );
  return facts;
}

/**
 * Figures the catalogue states for the portfolio as a whole, allowed anywhere
 * in a sentence: how many programmes, cities, regions; the 360° tours.
 * (Figures inside programme names belong to those programmes' facts.)
 */
export function globalNumbers(): number[] {
  return [...new Set<number>([AI_SLUGS.length, AI_CITY_IDS.length, Object.keys(REGION_CITIES).length, 360])];
}

/**
 * The credit basis and the monthly table — allowed only in a sentence about
 * credit ("apport", "par mois", "taux"…), never as a programme's price:
 * "Assafa est accessible à partir de 150 000 DH" must not pass.
 */
export function creditNumbers(): number[] {
  const out = new Set<number>([
    DEFAULT_DEPOSIT,
    CREDIT_DEFAULTS.years,
    CREDIT_DEFAULTS.annualRate * 100,
    CREDIT_DEFAULTS.minDepositRatio * 100,
  ]);
  for (const m of MONTHLY_EXAMPLES) {
    out.add(m);
    out.add(roundK(monthlyCeiling(m)));
    out.add(monthlyCeiling(m));
  }
  return [...out];
}

let context: ValidationContext | null = null;

/** Everything validate.ts checks an answer against, from the data. */
export function validationContext(): ValidationContext {
  context ??= { vocab: VOCABULARY, facts: programmeFacts(), globalNumbers: globalNumbers(), creditNumbers: creditNumbers() };
  return context;
}
