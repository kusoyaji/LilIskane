import type { Amenity, Kind, Segment, Status } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Copy } from "./shared";

/**
 * Copy for the project pages and the /projets search.
 *
 * Nothing here states a figure. Every number a sentence needs is passed in by
 * the caller from `src/data/*`, already formatted for the locale, so the copy
 * can never drift from the portfolio it describes.
 */

export const SEGMENT_LABELS: Record<Segment, { fr: string; ar: string }> = {
  economique: { fr: "Économique", ar: "اقتصادي" },
  "moyen-standing": { fr: "Moyen standing", ar: "متوسط" },
  "haut-standing": { fr: "Haut standing", ar: "راقٍ" },
  terrain: { fr: "Lots de terrain", ar: "بقع أرضية" },
  commercial: { fr: "Locaux commerciaux", ar: "محلات تجارية" },
  bureaux: { fr: "Plateaux de bureaux", ar: "مكاتب" },
};

export const KIND_LABELS: Record<Kind, { fr: string; ar: string }> = {
  appartement: { fr: "Appartements", ar: "شقق" },
  studio: { fr: "Studios", ar: "استوديوهات" },
  villa: { fr: "Villas", ar: "فيلات" },
  lot: { fr: "Lots de terrain", ar: "بقع أرضية" },
  "local-commercial": { fr: "Locaux commerciaux", ar: "محلات تجارية" },
  "plateau-bureau": { fr: "Plateaux de bureaux", ar: "مكاتب" },
};

export const STATUS_LABELS: Record<Status, { fr: string; ar: string }> = {
  "en-lancement": { fr: "En lancement", ar: "في طور الإطلاق" },
  "en-construction": { fr: "En cours de construction", ar: "في طور البناء" },
  // The client's "En promotion" is a discount offer, not "on the market".
  "en-promotion": { fr: "En promotion", ar: "عرض ترويجي" },
  livre: { fr: "Livré", ar: "مُسلَّم" },
  complet: { fr: "Complet", ar: "مكتمل" },
};

const READY_SOON = { fr: "Livraison imminente", ar: "تسليم وشيك" };
const READY_NOW = { fr: "Livraison immédiate", ar: "تسليم فوري" };

/**
 * The status as the client words it, for every badge on the site.
 *
 * "Livraison imminente" replaces the status outright (it is the only label the
 * client gives those programmes); a promotion carries its discount ("En
 * promotion · Remise 6 %"), because a promotion without its figure is not
 * the client's offer. A delivered programme the client labels only
 * "Livraison immédiate" (Al Yassamine, Al Maamora R+1) shows exactly that,
 * not "Livré". Otherwise `readyNow` is not folded in here — callers show
 * "Livraison immédiate" as its own line (see `readyNowLine`).
 */
export function statusText(
  p: { status: Status; readySoon?: boolean; readyNow?: boolean; remisePct?: number | null },
  locale: Locale,
): string {
  if (p.readySoon) return READY_SOON[locale];
  if (p.readyNow && p.status === "livre") return READY_NOW[locale];
  const label = STATUS_LABELS[p.status][locale];
  if (p.status !== "en-promotion" || !p.remisePct) return label;
  return locale === "ar"
    ? `${label} · تخفيض ⁦${p.remisePct}⁩٪`
    : `${label} · Remise ${p.remisePct} %`;
}

/** Whether "Livraison immédiate" still needs its own line beside the status badge. */
export function readyNowLine(p: { status: Status; readyNow?: boolean }): boolean {
  return p.readyNow === true && p.status !== "livre";
}

export const AMENITY_LABELS: Record<Amenity, { fr: string; ar: string }> = {
  piscine: { fr: "Piscine", ar: "مسبح" },
  mosquee: { fr: "Mosquée", ar: "مسجد" },
  ecoles: { fr: "Écoles", ar: "مدارس" },
  "parking-sous-sol": { fr: "Parking en sous-sol", ar: "مرآب تحت أرضي" },
  "espaces-verts": { fr: "Espaces verts", ar: "مساحات خضراء" },
  commerces: { fr: "Commerces de proximité", ar: "محلات تجارية قريبة" },
  "centre-commercial": { fr: "Centre commercial", ar: "مركز تجاري" },
  "aires-de-jeux": { fr: "Aires de jeux", ar: "فضاءات لعب" },
  "terrains-de-sport": { fr: "Terrains de sport", ar: "ملاعب رياضية" },
  spa: { fr: "Spa", ar: "فضاء للعافية" },
  ascenseur: { fr: "Ascenseurs", ar: "مصاعد" },
  securite: { fr: "Gardiennage", ar: "حراسة" },
  "vue-mer": { fr: "Vue sur mer", ar: "إطلالة على البحر" },
  "vue-montagne": { fr: "Vue sur l'Atlas", ar: "إطلالة على الأطلس" },
  plage: { fr: "Accès plage", ar: "ولوج إلى الشاطئ" },
};

/** Arabic counted nouns change form with the number; French only singular/plural. */
function arCount(n: number, one: string, two: string, few: string, many: string, num: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${num} ${few}`;
  return `${num} ${many}`;
}

export const projectCopy: Copy<{
  crumbProjects: string;
  renderNote: string;
  renderShort: string;
  fromPrice: string;
  monthlyApprox: string;
  perSqm: string;
  smallestLot: (total: string) => string;
  /** Land card: the smallest lot, its total and its monthly — never a monthly beside a per-m² price. */
  landLot: (lot: string, total: string, monthly: string) => string;
  factSurfaces: string;
  factBedrooms: string;
  factFloors: string;
  factPlots: string;
  factDelivery: string;
  /** Value for the delivery fact when the client labels the stock "Livraison immédiate". */
  immediate: string;
  /** The client's own label for built stock. */
  readyNow: string;
  /** Caption for a photograph of a programme the client labels "Livraison immédiate". */
  photoReady: string;
  bookVisit: string;
  overviewEyebrow: string;
  ficheTitle: string;
  ficheCity: string;
  ficheNeighbourhood: string;
  ficheSegment: string;
  ficheKinds: string;
  ficheStatus: string;
  fichePrice: string;
  previousPhase: string;
  nextPhase: string;
  delivery: (year: string) => string;
  galleryEyebrow: string;
  galleryTitleDelivered: string;
  galleryTitleRender: string;
  typologiesEyebrow: string;
  /** Built from the plans themselves, so a studio-only programme is never told it has bedrooms. */
  typologiesTitle: (plans: { minBedrooms: number; maxBedrooms: number; studioOnly: boolean }) => string;
  typologiesLead: string;
  studio: string;
  bedroomsWord: (n: number) => string;
  /** "2–3 chambres" / "2–3 غرف", "غرفتان": a bedroom range with a noun that agrees. */
  bedroomsRange: (min: number, max: number, formatted: string) => string;
  surface: string;
  monthlyEst: string;
  composition: string;
  priceOnRequest: string;
  askPlan: string;
  pricesNote: (years: string, rate: string, deposit: string) => string;
  toursBodyDelivered: string;
  amenitiesEyebrow: string;
  amenitiesTitle: string;
  locationEyebrow: string;
  nearbyTitle: string;
  minutes: (n: number, formatted: string) => string;
  byCar: string;
  onFoot: string;
  noNearby: string;
  mapCaption: (city: string) => string;
  alsoIn: (city: string) => string;
  simulatorEyebrow: string;
  simulatorTitle: (name: string) => string;
  simulatorBody: (price: string) => string;
  simulatorBodyLand: (price: string) => string;
  relatedEyebrow: string;
  relatedTitle: string;
  ctaTitle: (name: string) => string;
  /** Land programmes: no building to "come and discover". */
  ctaTitleLand: string;
  plotRange: (range: string) => string;
  plotMin: string;
  plotMax: string;
  landLead: string;
}> = {
  fr: {
    crumbProjects: "Nos projets",
    renderNote: "Rendu — image non contractuelle",
    renderShort: "Rendu — non contractuel",
    fromPrice: "À partir de",
    monthlyApprox: "soit environ",
    perSqm: "Prix au m²",
    smallestLot: (total) => `soit ${total} pour le plus petit lot`,
    landLot: (lot, total, monthly) => `Lot de ${lot} dès ${total}, soit environ ${monthly}`,
    factSurfaces: "Surfaces",
    factBedrooms: "Chambres",
    factFloors: "Hauteur",
    factPlots: "Lots",
    factDelivery: "Livraison",
    immediate: "Immédiate",
    readyNow: "Livraison immédiate",
    photoReady: "Photographie · livraison immédiate",
    bookVisit: "Prendre rendez-vous",
    overviewEyebrow: "Le programme",
    ficheTitle: "En bref",
    ficheCity: "Ville",
    ficheNeighbourhood: "Quartier",
    ficheSegment: "Standing",
    ficheKinds: "Biens proposés",
    ficheStatus: "Statut",
    fichePrice: "Prix d'entrée",
    previousPhase: "La tranche précédente",
    nextPhase: "La tranche suivante",
    delivery: (year) => `Livraison ${year}`,
    galleryEyebrow: "En images",
    galleryTitleDelivered: "Livré, photographié tel quel.",
    galleryTitleRender: "Le programme en images.",
    typologiesEyebrow: "Les plans",
    typologiesTitle: ({ minBedrooms, maxBedrooms, studioOnly }) => {
      if (studioOnly) return "Le plan du studio.";
      const words = ["", "une", "deux", "trois", "quatre", "cinq"];
      if (!(minBedrooms < maxBedrooms && maxBedrooms < words.length)) return "Les plans.";
      return minBedrooms === 1
        ? `Les plans, d'une à ${words[maxBedrooms]} chambres.`
        : `Les plans, de ${words[minBedrooms]} à ${words[maxBedrooms]} chambres.`;
    },
    typologiesLead:
      "Surfaces indicatives. Prix et disponibilités par plan : sur demande auprès d'un conseiller.",
    studio: "Studio",
    bedroomsWord: (n) => (n > 1 ? "chambres" : "chambre"),
    bedroomsRange: (_min, max, formatted) => `${formatted} ${max > 1 ? "chambres" : "chambre"}`,
    surface: "Surface",
    monthlyEst: "Mensualité estimée",
    composition: "Composition",
    priceOnRequest: "Prix sur demande",
    askPlan: "Demander le plan",
    pricesNote: (years, rate, deposit) =>
      `Prix indiqués à partir de, hors frais de notaire et d'enregistrement, susceptibles d'évoluer. Mensualités estimées sur ${years} ans à ${rate} avec ${deposit} d'apport.`,
    toursBodyDelivered:
      "Parcourez les appartements témoins de la tranche livrée, pièce par pièce : les volumes et les finitions de Riad Garden I, tels que livrés.",
    amenitiesEyebrow: "Sur place et autour",
    amenitiesTitle: "À portée de main.",
    locationEyebrow: "L'emplacement",
    nearbyTitle: "À proximité",
    minutes: (_n, f) => `${f} min`,
    byCar: "en voiture",
    onFoot: "à pied",
    noNearby:
      "Nos conseillers vous reçoivent sur place, vous indiquent l'itinéraire et organisent la visite du site.",
    mapCaption: (city) => `${city}, sur la carte du Maroc.`,
    alsoIn: (city) => `Également à ${city}`,
    simulatorEyebrow: "Simulateur de crédit",
    simulatorTitle: (name) => `Votre mensualité pour ${name}.`,
    simulatorBody: (price) =>
      `Prérempli avec le prix d'entrée du programme, ${price}. Modifiez l'apport et la durée pour obtenir votre chiffre.`,
    simulatorBodyLand: (price) =>
      `Prérempli avec le prix du plus petit lot, ${price}. Modifiez le prix, l'apport et la durée pour obtenir votre chiffre.`,
    relatedEyebrow: "Autres programmes",
    relatedTitle: "À voir aussi.",
    ctaTitle: (name) => `Venez découvrir ${name}.`,
    ctaTitleLand: "Parlons de votre terrain.",
    plotRange: (range) => `Lots de ${range}`,
    plotMin: "Le plus petit lot",
    plotMax: "Le plus grand lot",
    landLead: "Lots viabilisés, prêts à bâtir.",
  },
  ar: {
    crumbProjects: "مشاريعنا",
    renderNote: "تصوّر — صورة غير تعاقدية",
    renderShort: "تصوّر — غير تعاقدي",
    fromPrice: "ابتداءً من",
    monthlyApprox: "أي حوالي",
    perSqm: "الثمن للمتر المربع",
    smallestLot: (total) => `أي ${total} لأصغر بقعة`,
    landLot: (lot, total, monthly) => `بقعة من ${lot} ابتداءً من ${total}، أي حوالي ${monthly}`,
    factSurfaces: "المساحات",
    factBedrooms: "غرف النوم",
    factFloors: "الارتفاع",
    factPlots: "البقع",
    factDelivery: "التسليم",
    immediate: "فوري",
    readyNow: "تسليم فوري",
    photoReady: "صورة · تسليم فوري",
    bookVisit: "حجز موعد",
    overviewEyebrow: "المشروع",
    ficheTitle: "باختصار",
    ficheCity: "المدينة",
    ficheNeighbourhood: "الحي",
    ficheSegment: "الفئة",
    ficheKinds: "العقارات المعروضة",
    ficheStatus: "الوضعية",
    fichePrice: "أدنى ثمن",
    previousPhase: "الشطر السابق",
    nextPhase: "الشطر الموالي",
    delivery: (year) => `التسليم ${year}`,
    galleryEyebrow: "بالصور",
    galleryTitleDelivered: "سُلّم، وصُوّر كما هو.",
    galleryTitleRender: "المشروع بالصور.",
    typologiesEyebrow: "المخططات",
    typologiesTitle: ({ minBedrooms, maxBedrooms, studioOnly }) => {
      if (studioOnly) return "مخطط الاستوديو.";
      const rooms = ["", "غرفة واحدة", "غرفتين", "ثلاث غرف", "أربع غرف", "خمس غرف"];
      return minBedrooms < maxBedrooms && maxBedrooms < rooms.length
        ? `المخططات، من ${rooms[minBedrooms]} إلى ${rooms[maxBedrooms]}.`
        : "المخططات.";
    },
    typologiesLead: "مساحات إرشادية. الأثمنة والتوفر حسب كل مخطط: عند الطلب لدى مستشارينا.",
    studio: "استوديو",
    bedroomsWord: (n) => (n === 1 ? "غرفة" : n === 2 ? "غرفتان" : "غرف"),
    // A range takes the plural ("1–2 غرف"); a single count agrees with its number:
    // the dual stands alone ("غرفتان"), never "2 غرفتان".
    bedroomsRange: (min, max, formatted) =>
      min !== max ? `${formatted} غرف` : arCount(max, "غرفة واحدة", "غرفتان", "غرف", "غرفة", formatted),
    surface: "المساحة",
    monthlyEst: "القسط الشهري التقديري",
    composition: "التركيبة",
    priceOnRequest: "الثمن عند الطلب",
    askPlan: "طلب المخطط",
    pricesNote: (years, rate, deposit) =>
      `الأثمنة المعروضة أثمنة ابتدائية، لا تشمل مصاريف التوثيق والتسجيل، وقابلة للتغيير. الأقساط تقديرية على ${years} سنة بنسبة ${rate} مع مساهمة شخصية بنسبة ${deposit}.`,
    toursBodyDelivered:
      "تجوّلوا داخل الشقق النموذجية للشطر المُسلَّم، غرفة بغرفة: أحجام وتشطيبات رياض غاردن 1 كما سُلِّمت.",
    amenitiesEyebrow: "في عين المكان وبالجوار",
    amenitiesTitle: "في متناول اليد.",
    locationEyebrow: "الموقع",
    nearbyTitle: "على مقربة",
    // 1 and 2 take their own forms; 3–10 take the plural; 11+ the singular.
    minutes: (n, f) =>
      n === 1 ? "دقيقة واحدة" : n === 2 ? "دقيقتان" : n <= 10 ? `${f} دقائق` : `${f} دقيقة`,
    byCar: "بالسيارة",
    onFoot: "مشياً",
    noNearby: "يستقبلكم مستشارونا في عين المكان، ويدلّونكم على الطريق وينظّمون زيارة الموقع.",
    mapCaption: (city) => `${city} على خريطة المغرب.`,
    alsoIn: (city) => `أيضاً في ${city}`,
    simulatorEyebrow: "محاكي القرض",
    simulatorTitle: (name) => `قسطكم الشهري في ${name}.`,
    simulatorBody: (price) =>
      `مملوء مسبقاً بأدنى ثمن في المشروع، ${price}. غيّروا المساهمة الشخصية والمدة لتحصلوا على قسطكم.`,
    simulatorBodyLand: (price) =>
      `مملوء مسبقاً بثمن أصغر بقعة، ${price}. غيّروا الثمن والمساهمة الشخصية والمدة لتحصلوا على قسطكم.`,
    relatedEyebrow: "مشاريع أخرى",
    relatedTitle: "اكتشفوا أيضاً.",
    ctaTitle: (name) => `تعالوا لاكتشاف ${name}.`,
    ctaTitleLand: "لنتحدث عن قطعتكم الأرضية.",
    plotRange: (range) => `بقع من ${range}`,
    plotMin: "أصغر بقعة",
    plotMax: "أكبر بقعة",
    landLead: "بقع مجهّزة، جاهزة للبناء.",
  },
};

export const searchCopy: Copy<{
  heroEyebrow: string;
  heroTitle: string;
  heroLead: (programmes: string, cities: string) => string;
  budget: string;
  budgetAny: string;
  perMonth: string;
  currency: string;
  deposit: string;
  ceiling: (amount: string) => string;
  city: string;
  allCities: string;
  segment: string;
  bedrooms: string;
  status: string;
  amenities: string;
  moreFilters: string;
  fewerFilters: string;
  clear: string;
  results: (n: number, formatted: string) => string;
  noExact: string;
  relaxedPrefix: string;
  relaxedSuffix: string;
  relaxed: Record<
    "budget" | "price" | "city" | "surfaceMin" | "bedrooms" | "amenities" | "segments" | "kinds" | "statuses",
    string
  >;
  /** The removable chips above the facets for values only a search or a link sets (prix, type, several cities). */
  activeTitle: string;
  removeChip: (label: string) => string;
  priceChip: (amount: string) => string;
  /** The city select's own line while several cities are chosen. */
  citiesSelected: (n: number, formatted: string) => string;
  /** The sentence search in the hero. */
  smartLabel: string;
  smartPlaceholder: string;
  smartSubmit: string;
  smartOpen: (name: string) => string;
  smartUnderstood: string;
  smartTry: string;
  /** Example sentences that fill the field — suggestions, never popularity claims. */
  smartExamples: string[];
  smartNamed: string;
  smartCount: (n: number, formatted: string) => string;
  smartClosest: string;
  mapEyebrow: string;
  mapHint: string;
  mapLabel: string;
  showMap: string;
  hideMap: string;
  programmesIn: (n: number, formatted: string) => string;
  filtersTitle: string;
  updating: string;
  ctaTitle: string;
  ctaBody: string;
}> = {
  fr: {
    heroEyebrow: "Nos projets",
    heroTitle: "Trouvez votre adresse.",
    heroLead: (programmes, cities) =>
      `${programmes} programmes dans ${cities} villes, du studio au lot de terrain, en lancement ou déjà livrés. Décrivez ce que vous cherchez, en français ou en arabe.`,
    budget: "Mensualité maximale",
    budgetAny: "Sans limite",
    perMonth: "DH/mois",
    currency: "DH",
    deposit: "Apport",
    ceiling: (amount) => `Budget jusqu'à environ ${amount}`,
    city: "Ville",
    allCities: "Toutes les villes",
    segment: "Standing",
    bedrooms: "Chambres",
    status: "Disponibilité",
    amenities: "Équipements",
    moreFilters: "Plus de filtres",
    fewerFilters: "Moins de filtres",
    clear: "Tout effacer",
    results: (n, formatted) => (n === 1 ? "1 programme" : `${formatted} programmes`),
    noExact: "Aucun programme ne correspond exactement.",
    relaxedPrefix: "Nous avons élargi",
    relaxedSuffix: "pour vous montrer les plus proches.",
    relaxed: {
      budget: "la mensualité",
      price: "le prix",
      city: "la ville",
      surfaceMin: "la surface",
      bedrooms: "le nombre de chambres",
      amenities: "les équipements",
      segments: "le standing",
      kinds: "le type de bien",
      statuses: "la disponibilité",
    },
    activeTitle: "Votre recherche",
    removeChip: (label) => `Retirer « ${label} »`,
    priceChip: (amount) => `Prix ≤ ${amount} DH`,
    citiesSelected: (n, formatted) => `${formatted} ${n > 1 ? "villes choisies" : "ville choisie"}`,
    smartLabel: "Décrivez ce que vous cherchez",
    smartPlaceholder: "Décrivez ce que vous cherchez…",
    smartSubmit: "Rechercher",
    smartOpen: (name) => `Ouvrir ${name}`,
    smartUnderstood: "Compris",
    smartTry: "Par exemple",
    smartExamples: ["3 chambres à Agadir", "Près de Casablanca", "Terrain moins de 1 million", "شقة بمراكش"],
    smartNamed: "Programmes",
    smartCount: (n, formatted) =>
      n === 1 ? "1 programme correspond" : `${formatted} programmes correspondent`,
    smartClosest: "Aucun programme exact : les plus proches seront affichés",
    mapEyebrow: "La carte",
    mapHint: "Choisissez une ville pour filtrer.",
    mapLabel: "Carte du Maroc — les villes où se trouvent nos programmes",
    showMap: "Voir la carte",
    hideMap: "Masquer la carte",
    programmesIn: (n, formatted) => (n === 1 ? "1 programme" : `${formatted} programmes`),
    filtersTitle: "Affiner la recherche",
    updating: "Mise à jour",
    ctaTitle: "Un conseiller pour votre recherche.",
    ctaBody:
      "Dites-nous votre budget, votre ville et vos délais : un conseiller vous présente les programmes qui y répondent, en agence ou par visioconférence. Sans engagement.",
  },
  ar: {
    heroEyebrow: "مشاريعنا",
    heroTitle: "اعثروا على عنوانكم.",
    heroLead: (programmes, cities) =>
      `${programmes} مشروعاً في ${cities} مدن، من الاستوديو إلى البقعة الأرضية، في طور الإطلاق أو مُسلَّمة. صِفوا ما تبحثون عنه، بالعربية أو بالفرنسية.`,
    budget: "القسط الشهري الأقصى",
    budgetAny: "دون حد",
    perMonth: "درهم شهرياً",
    currency: "درهم",
    deposit: "المساهمة الشخصية",
    ceiling: (amount) => `ميزانية تصل إلى حوالي ${amount}`,
    city: "المدينة",
    allCities: "جميع المدن",
    segment: "الفئة",
    bedrooms: "غرف النوم",
    status: "الوضعية",
    amenities: "التجهيزات",
    moreFilters: "مزيد من المعايير",
    fewerFilters: "معايير أقل",
    clear: "مسح الكل",
    results: (n, formatted) => arCount(n, "مشروع واحد", "مشروعان", "مشاريع", "مشروعاً", formatted),
    noExact: "لا يوجد مشروع مطابق تماماً.",
    relaxedPrefix: "وسّعنا",
    relaxedSuffix: "لنعرض عليكم الأقرب.",
    relaxed: {
      budget: "القسط الشهري",
      price: "السعر",
      city: "المدينة",
      surfaceMin: "المساحة",
      bedrooms: "عدد الغرف",
      amenities: "التجهيزات",
      segments: "الفئة",
      kinds: "نوع العقار",
      statuses: "الوضعية",
    },
    activeTitle: "بحثكم",
    removeChip: (label) => `إزالة «${label}»`,
    priceChip: (amount) => `السعر ≤ ${amount} درهم`,
    citiesSelected: (n, formatted) =>
      arCount(n, "مدينة واحدة مختارة", "مدينتان مختارتان", "مدن مختارة", "مدينة مختارة", formatted),
    smartLabel: "صِفوا ما تبحثون عنه",
    smartPlaceholder: "صِفوا ما تبحثون عنه…",
    smartSubmit: "ابحثوا",
    smartOpen: (name) => `فتح ${name}`,
    smartUnderstood: "فهمنا",
    smartTry: "مثلاً",
    smartExamples: ["شقة بمراكش", "قرب الدار البيضاء", "بقعة أرضية أقل من مليون", "3 chambres à Agadir"],
    smartNamed: "المشاريع",
    smartCount: (n, formatted) =>
      arCount(n, "مشروع واحد مطابق", "مشروعان مطابقان", "مشاريع مطابقة", "مشروعاً مطابقاً", formatted),
    smartClosest: "لا يوجد مشروع مطابق تماماً: ستُعرض الأقرب",
    mapEyebrow: "الخريطة",
    mapHint: "اختاروا مدينة للتصفية.",
    mapLabel: "خريطة المغرب — المدن التي توجد بها مشاريعنا",
    showMap: "عرض الخريطة",
    hideMap: "إخفاء الخريطة",
    programmesIn: (n, formatted) => arCount(n, "مشروع واحد", "مشروعان", "مشاريع", "مشروعاً", formatted),
    filtersTitle: "تدقيق البحث",
    updating: "جارٍ التحديث",
    ctaTitle: "مستشار يرافق بحثكم.",
    ctaBody:
      "أخبرونا بميزانيتكم ومدينتكم وآجالكم: يعرض عليكم مستشار المشاريع التي تستجيب لها، في الوكالة أو عبر الفيديو. دون أي التزام.",
  },
};

export type SearchCopy = (typeof searchCopy)[Locale];
