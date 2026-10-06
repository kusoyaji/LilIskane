import type { Amenity, Kind, Segment } from "../../data/types.ts";
import type { StatusFacet } from "../status-facets.ts";
import type { RegionId } from "./types.ts";
import { entryForms, words } from "./normalize.ts";

/**
 * The concierge's vocabulary: what a buyer types, in French, Arabic (MSA and
 * common Moroccan Darija) and Latin transliteration, mapped to the site's own
 * ids. Every phrase is written as a person would type it and folded with
 * `normalize` when the index is built, so accents, hamza and taa marbuta never
 * matter. Filler words ("de", "la", "sur", "على"…) may sit between the words of
 * a phrase: "vue mer" also reads "vue sur la mer".
 *
 * Facts only: cities and regions are the administrative ones; a region lists
 * only the cities where the client has programmes (src/data/projects.ts).
 */

/* ------------------------------------------------------------------ */
/* Places                                                              */
/* ------------------------------------------------------------------ */

/** The nine cities with programmes, and how people write them. */
export const CITY_ALIASES: Record<string, string[]> = {
  marrakech: ["marrakech", "marrakesh", "marrakch", "marrakeche", "kech", "مراكش", "مراكيش"],
  essaouira: ["essaouira", "souira", "sawira", "essawira", "mogador", "الصويرة", "صويرة", "موكادور"],
  tanger: ["tanger", "tangier", "tangiers", "tanja", "tangier", "طنجة"],
  mohammedia: ["mohammedia", "mohamedia", "mohammadia", "fedala", "المحمدية", "محمدية"],
  temara: ["temara", "tmara", "تمارة"],
  "sala-al-jadida": [
    "sala al jadida",
    "sala el jadida",
    "sala jadida",
    "sale al jadida",
    "sale el jadida",
    "sala",
    "sale",
    "سلا الجديدة",
    "سلا",
  ],
  "had-soualem": ["had soualem", "had swalem", "had essoualem", "soualem", "حد السوالم", "السوالم"],
  "sidi-rahal": ["sidi rahal", "sidi rahhal", "rahal", "سيدي رحال"],
  agadir: ["agadir", "أكادير", "اگادير"],
};

/** Region → the cities in it that have programmes. Order is the URL order. */
export const REGION_CITIES: Record<RegionId, string[]> = {
  "casablanca-settat": ["mohammedia", "had-soualem", "sidi-rahal"],
  "rabat-sale-kenitra": ["temara", "sala-al-jadida"],
  "marrakech-safi": ["marrakech", "essaouira"],
  "souss-massa": ["agadir"],
  "tanger-tetouan": ["tanger"],
};

/** The region each programme city belongs to ("région de Marrakech"). */
export const CITY_REGION: Record<string, RegionId> = {
  mohammedia: "casablanca-settat",
  "had-soualem": "casablanca-settat",
  "sidi-rahal": "casablanca-settat",
  temara: "rabat-sale-kenitra",
  "sala-al-jadida": "rabat-sale-kenitra",
  marrakech: "marrakech-safi",
  essaouira: "marrakech-safi",
  agadir: "souss-massa",
  tanger: "tanger-tetouan",
};

/**
 * Places without a programme of their own that name a region. Casablanca is
 * the important one: the client has no programme in the city itself, so
 * "près de Casablanca" means the region (Mohammedia, Had Soualem, Sidi Rahal).
 */
export const REGION_ALIASES: Record<RegionId, string[]> = {
  "casablanca-settat": [
    "casablanca settat",
    "casablanca",
    "casa",
    "dar el beida",
    "dar bida",
    "nouaceur",
    "settat",
    "berrechid",
    "el jadida",
    "الدار البيضاء",
    "البيضاء",
    "كازا",
    "كازابلانكا",
    "النواصر",
    "سطات",
    "برشيد",
    "الدار البيضاء سطات",
  ],
  "rabat-sale-kenitra": ["rabat sale kenitra", "rabat", "kenitra", "الرباط", "القنيطرة", "الرباط سلا القنيطرة"],
  "marrakech-safi": ["marrakech safi", "safi", "آسفي", "اسفي", "مراكش آسفي"],
  "souss-massa": ["souss massa", "souss", "سوس ماسة", "سوس"],
  "tanger-tetouan": [
    "tanger tetouan al hoceima",
    "tanger tetouan",
    "tetouan",
    "al hoceima",
    "ksar el kebir",
    "طنجة تطوان الحسيمة",
    "طنجة تطوان",
    "تطوان",
    "الحسيمة",
    "القصر الكبير",
  ],
};

/**
 * Towns next to the client's cities, with no programme of their own: they
 * name their administrative region, so "Inezgane" reads as Souss-Massa
 * (Agadir) and "Tamesna" as Rabat-Salé-Kénitra (Témara, Sala Al Jadida).
 * Exact spellings only — no typo tolerance on these.
 */
export const NEARBY_PLACES: Record<RegionId, string[]> = {
  "casablanca-settat": ["bouskoura", "dar bouazza", "bouznika", "بوسكورة", "دار بوعزة", "بوزنيقة"],
  "rabat-sale-kenitra": ["tamesna", "harhoura", "skhirat", "تامسنا", "الهرهورة", "الصخيرات"],
  "marrakech-safi": [],
  "souss-massa": ["inezgane", "ait melloul", "taroudant", "tiznit", "إنزكان", "انزكان", "أيت ملول", "تارودانت", "تزنيت"],
  "tanger-tetouan": ["martil", "asilah", "assilah", "larache", "mdiq", "fnideq", "مرتيل", "أصيلة", "العرائش", "المضيق", "الفنيدق"],
};

/**
 * Moroccan cities in regions where the client has no programme. They are read
 * as a city with no programme, so the ranker has to widen the place and the
 * UI says so ("appartement à Fès" must never look like an exact answer).
 * Exact spellings only. Their chip labels live here because only Nador is in
 * src/data/cities.ts (it keeps that id).
 */
export const UNSERVED_CITIES: Record<string, { fr: string; ar: string; aliases: string[] }> = {
  fes: { fr: "Fès", ar: "فاس", aliases: ["fes", "fez", "فاس"] },
  meknes: { fr: "Meknès", ar: "مكناس", aliases: ["meknes", "meknas", "مكناس"] },
  ifrane: { fr: "Ifrane", ar: "إفران", aliases: ["ifrane", "إفران", "افران"] },
  oujda: { fr: "Oujda", ar: "وجدة", aliases: ["oujda", "وجدة"] },
  nador: { fr: "Nador", ar: "الناظور", aliases: ["nador", "الناظور", "ناظور"] },
  saidia: { fr: "Saïdia", ar: "السعيدية", aliases: ["saidia", "السعيدية"] },
  laayoune: { fr: "Laâyoune", ar: "العيون", aliases: ["laayoune", "layoune", "laayoun", "العيون"] },
  dakhla: { fr: "Dakhla", ar: "الداخلة", aliases: ["dakhla", "الداخلة"] },
  "beni-mellal": { fr: "Béni Mellal", ar: "بني ملال", aliases: ["beni mellal", "bni mellal", "بني ملال"] },
  errachidia: { fr: "Errachidia", ar: "الرشيدية", aliases: ["errachidia", "الرشيدية"] },
  ouarzazate: { fr: "Ouarzazate", ar: "ورزازات", aliases: ["ouarzazate", "ورزازات"] },
  khouribga: { fr: "Khouribga", ar: "خريبكة", aliases: ["khouribga", "خريبكة"] },
  taza: { fr: "Taza", ar: "تازة", aliases: ["taza", "تازة"] },
  guelmim: { fr: "Guelmim", ar: "كلميم", aliases: ["guelmim", "كلميم"] },
  chefchaouen: { fr: "Chefchaouen", ar: "شفشاون", aliases: ["chefchaouen", "chaouen", "شفشاون"] },
};

/** The city ids that have programmes — the only ones a /projets link may carry. */
export const SERVED_CITY_IDS: ReadonlySet<string> = new Set(Object.keys(CITY_REGION));

/** Street words: "Avenue Laayoune" is an address, not the city of Laâyoune. */
export const STREET_WORDS = new Set(
  ["avenue", "av", "bd", "boulevard", "rue", "route", "شارع", "زنقة", "طريق"].flatMap((w) => words(w)),
);

/** Words that, before a city, ask for its region: "région de Marrakech", "جهة مراكش". */
export const REGION_MARKERS = new Set(["region", "jiha", "جهه"].map((w) => words(w)[0]));

/**
 * Words that belong to the place they introduce, so deleting the chip also
 * deletes them: "à Agadir", "près de Casablanca", "قرب الدار البيضاء".
 */
export const PLACE_LEAD_WORDS = new Set(
  [
    "a",
    "au",
    "aux",
    "en",
    "sur",
    "vers",
    "dans",
    "pres",
    "proche",
    "proximite",
    "cote",
    "autour",
    "environs",
    "alentours",
    "region",
    "jiha",
    "de",
    "du",
    "d",
    "la",
    "ville",
    "في",
    "ب",
    "قرب",
    "بالقرب",
    "جنب",
    "حدا",
    "نواحي",
    "ناحية",
    "من",
    "جهة",
    "مدينة",
    "f",
    "fi",
  ].flatMap((w) => words(w)),
);

/* ------------------------------------------------------------------ */
/* What, which standing, which state                                   */
/* ------------------------------------------------------------------ */

export const SEGMENT_ALIASES: Partial<Record<Segment, string[]>> = {
  "haut-standing": [
    "haut standing",
    "standing",
    "luxe",
    "luxueux",
    "luxueuse",
    "prestige",
    "prestigieux",
    "haut de gamme",
    "premium",
    "راقي",
    "راقية",
    "فاخر",
    "فاخرة",
    "فخم",
    "فخمة",
  ],
  "moyen-standing": ["moyen standing", "standing moyen", "moyenne gamme", "milieu de gamme", "متوسط", "متوسطة", "متوسط المستوى"],
  economique: [
    "economique",
    "eco",
    "social",
    "sociale",
    "logement social",
    "logement economique",
    "abordable",
    "اقتصادي",
    "اقتصادية",
    "اجتماعي",
    "اجتماعية",
    "السكن الاجتماعي",
    "السكن الاقتصادي",
  ],
  terrain: [
    "terrain",
    "terrains",
    "lot",
    "lots",
    "lotissement",
    "lotissements",
    "parcelle",
    "parcelles",
    "foncier",
    "lot de terrain",
    "بقعة",
    "بقع",
    "بقعة أرضية",
    "بقع أرضية",
    "أرض",
    "أراضي",
    "تجزئة",
  ],
};

export const KIND_ALIASES: Partial<Record<Kind, string[]>> = {
  villa: ["villa", "villas", "فيلا", "فيلات", "فيلة"],
  studio: ["studio", "studios", "استوديو", "ستوديو", "استوديوهات", "ستوديوهات"],
  appartement: ["appartement", "appartements", "appart", "apparts", "appt", "apt", "apartment", "شقة", "شقق"],
};

export const STATUS_ALIASES: Partial<Record<StatusFacet, string[]>> = {
  immediate: [
    "livraison immediate",
    "immediate",
    "immediat",
    "immediatement",
    "disponible tout de suite",
    "disponible immediatement",
    "pret a habiter",
    "pret a vivre",
    "cle en main",
    "cles en main",
    "livre",
    "livres",
    "livree",
    "livrees",
    "deja livre",
    "تسليم فوري",
    "فوري",
    "جاهز",
    "جاهزة",
    "جاهز للسكن",
    "جاهزة للسكن",
    "واجد",
    "واجدة",
    "wajed",
    "wajda",
    "wajdin",
    "jahz",
    "jahza",
    "jahzin",
    "jahzine",
  ],
  imminente: [
    "livraison imminente",
    "imminente",
    "imminent",
    "bientot livre",
    "bientot livree",
    "bientot disponible",
    "تسليم وشيك",
    "وشيك",
  ],
  "en-lancement": [
    "en lancement",
    "lancement",
    "nouveau",
    "nouveaux",
    "nouvel",
    "nouvelle",
    "nouvelles",
    "nouveaute",
    "nouveautes",
    "إطلاق",
    "جديد",
    "جديدة",
    "مشروع جديد",
  ],
  "en-promotion": [
    "en promotion",
    "promo",
    "promos",
    "promotion",
    "promotions",
    "remise",
    "remises",
    "reduction",
    "reductions",
    "solde",
    "soldes",
    "offre speciale",
    "عرض",
    "عروض",
    "تخفيض",
    "تخفيضات",
    "ترويجي",
    "ترويجية",
    "برومو",
    "بروموسيون",
  ],
  "en-construction": [
    "en construction",
    "en cours de construction",
    "en cours",
    "construction",
    "chantier",
    "en chantier",
    "sur plan",
    "vefa",
    "قيد البناء",
    "طور البناء",
    "قيد الإنجاز",
    "طور الإنجاز",
  ],
};

export const AMENITY_ALIASES: Partial<Record<Amenity, string[]>> = {
  piscine: ["piscine", "piscines", "pool", "مسبح", "مسابح", "بيسين"],
  "vue-mer": [
    "vue mer",
    "mer",
    "bord de mer",
    "front de mer",
    "بحر",
    "إطلالة على البحر",
    "إطلالة بحرية",
    "واجهة بحرية",
  ],
  plage: ["plage", "plages", "شاطئ", "شواطئ", "بلاج"],
  mosquee: ["mosquee", "mosquees", "مسجد", "مساجد", "جامع"],
  ecoles: ["ecole", "ecoles", "scolaire", "etablissement scolaire", "مدرسة", "مدارس"],
  "parking-sous-sol": ["parking", "parkings", "garage", "garages", "sous sol", "stationnement", "مرأب", "مرآب", "باركينغ", "باركينج", "كراج"],
  ascenseur: ["ascenseur", "ascenseurs", "مصعد", "مصاعد", "اسانسور"],
  spa: ["spa", "hammam", "hammams", "bien etre", "wellness", "سبا", "حمام", "فضاء للعافية", "عافية"],
  "espaces-verts": [
    "jardin",
    "jardins",
    "espaces verts",
    "espace vert",
    "verdure",
    "parc",
    "parcs",
    "حديقة",
    "حدائق",
    "مساحات خضراء",
    "مساحة خضراء",
    "مساحات خضر",
  ],
  commerces: ["commerces", "commerce", "commerces de proximite", "magasins", "boutiques", "محلات", "محلات تجارية", "متاجر"],
  "centre-commercial": ["centre commercial", "centres commerciaux", "mall", "مركز تجاري", "مراكز تجارية", "مول"],
  "aires-de-jeux": [
    "aire de jeux",
    "aires de jeux",
    "jeux",
    "jeux pour enfants",
    "espace enfants",
    "terrain de jeux",
    "ألعاب",
    "ألعاب الأطفال",
    "فضاء الألعاب",
  ],
  "terrains-de-sport": [
    "terrain de sport",
    "terrains de sport",
    "terrain de foot",
    "terrain de football",
    "sport",
    "sports",
    "sportif",
    "sportifs",
    "football",
    "ملعب",
    "ملاعب",
    "ملاعب رياضية",
    "رياضة",
  ],
  "vue-montagne": ["vue montagne", "montagne", "montagnes", "atlas", "جبل", "الجبال", "إطلالة على الجبل"],
  securite: ["securite", "securise", "securisee", "gardiennage", "حراسة", "أمن"],
};

/* ------------------------------------------------------------------ */
/* Bedrooms and numbers                                                */
/* ------------------------------------------------------------------ */

/** Words that count bedrooms after a number: "3 chambres", "3ch", "3 غرف", "3 بيوت". */
export const BEDROOM_WORDS = new Set(
  ["chambre", "chambres", "ch", "cha", "cham", "chamb", "chambr", "chb", "chbr", "chbre", "chbres", "bedroom", "bedrooms", "غرف", "غرفة", "غرفا", "غرفات", "بيوت", "بيو", "بيت", "byout", "biout", "byut", "bit", "bayt", "beit"].flatMap(
    (w) => words(w),
  ),
);
/** Rooms counted the Moroccan way, living room included: "4 pièces" = salon + 3 chambres. */
export const ROOM_WORDS = new Set(["piece", "pieces", "pcs"]);
/** Arabic duals that carry their own count. */
export const DUAL_BEDROOMS = new Set(["غرفتين", "غرفتان", "بيتين"].flatMap((w) => words(w)));

/** Small numbers in letters, French and Arabic/Darija. */
export const NUMBER_WORDS: Map<string, number> = new Map(
  (
    [
      ["un", 1],
      ["une", 1],
      ["deux", 2],
      ["trois", 3],
      ["quatre", 4],
      ["cinq", 5],
      ["six", 6],
      ["واحد", 1],
      ["واحدة", 1],
      ["اثنين", 2],
      ["اثنان", 2],
      ["اتنين", 2],
      ["جوج", 2],
      ["زوج", 2],
      ["ثلاث", 3],
      ["ثلاثة", 3],
      ["تلات", 3],
      ["تلاتة", 3],
      ["أربع", 4],
      ["أربعة", 4],
      ["ربعة", 4],
      ["خمس", 5],
      ["خمسة", 5],
      // Darija in Latin letters
      ["wahed", 1],
      ["wahda", 1],
      ["jouj", 2],
      ["zouj", 2],
      ["joj", 2],
      ["tlata", 3],
      ["tlat", 3],
      ["tleta", 3],
      ["arba", 4],
      ["reba", 4],
      ["khamsa", 5],
      ["khmsa", 5],
    ] as Array<[string, number]>
  ).map(([w, n]) => [words(w)[0], n] as [string, number]),
);

const fold = (list: string[]) => new Set(list.flatMap((w) => words(w)));

/** ×1 000 000 (or ×10 000 from ten up: Moroccan centimes). */
export const MILLION_WORDS = fold([
  "million", "millions", "mio", "mln", "مليون", "ملايين", "ملاين",
  // Darija in Latin letters: "80 mlyoun" (centimes, like مليون)
  "mlyoun", "mlyon", "mlyun", "melyoun", "mliyoun", "mlayn", "mlayen", "malyoun",
]);
/** "مليونين" — two million, one word. */
export const TWO_MILLION_WORDS = fold(["مليونين"]);
export const THOUSAND_WORDS = fold(["mille", "mil", "k", "alf", "ألف", "الف", "آلاف", "الاف"]);
/** "et demi", "ونص", "و نصف". */
export const HALF_WORDS = fold(["demi", "demie", "نص", "نصف", "ونص", "ونصف"]);
/** "مليون وربع", "un million et quart". */
export const QUARTER_WORDS = fold(["quart", "ربع", "وربع"]);
export const CURRENCY_WORDS = fold(["dh", "dhs", "mad", "dirham", "dirhams", "drh", "درهم", "دراهم", "الدرهم"]);
export const CENTIME_WORDS = fold(["centimes", "centime", "cts", "سنتيم", "سنتيمات", "ريال"]);
/** After a sum: "/mois", "par mois", "شهريا", "في الشهر", "فالشهر". */
export const MONTHLY_AFTER = fold(["mois", "mensuel", "mensuelle", "mensuellement", "month", "شهريا", "شهري", "شهر"]);
/** Before a sum: "mensualité 4 500", "traite 3000", "قسط 3000". */
export const MONTHLY_BEFORE = fold(["mensualite", "mensualites", "mensuel", "traite", "traites", "قسط", "أقساط", "طريطة"]);
/** Linking words allowed between a sum and its monthly marker: "dh par mois", "في الشهر". */
export const MONTHLY_LINKS = fold(["par", "le", "chaque", "في", "كل", "ف"]);

/** Ceiling phrases, as word sequences: "moins de", "jusqu'à", "أقل من", "ما يفوتش". */
export const CEILING_PHRASES: string[][] = [
  "moins de",
  "moins d",
  "a moins de",
  "max",
  "maximum",
  "maxi",
  "jusqu a",
  "jusqu au",
  "jusqu",
  "jusque",
  "pas plus de",
  "inferieur a",
  "en dessous de",
  "sous",
  "budget",
  "budget max",
  "budget maximum",
  "mon budget",
  "prix",
  "prix max",
  "prix maximum",
  "à",
  "أقل من",
  "اقل من",
  "حتى",
  "إلى",
  "لا يتجاوز",
  "ما يفوتش",
  "ميزانية",
  "ميزانيتي",
  "بحد أقصى",
  "كحد أقصى",
  "حد أقصى",
  "ماكس",
  "ب",
  "b",
  "bi",
  "بثمن",
  "ثمن",
].map((p) => words(p));

/** Floor phrases: a minimum is not a ceiling, so the sum is read and set aside. */
export const FLOOR_PHRASES: string[][] = [
  "plus de",
  "au moins",
  "minimum",
  "min",
  "a partir de",
  "superieur a",
  "au dessus de",
  "أكثر من",
  "على الأقل",
  "ابتداء من",
].map((p) => words(p));

/** "entre X et Y", "de X à Y", "بين X و Y", "من X إلى Y". */
export const RANGE_OPENERS = fold(["entre", "بين"]);
export const RANGE_LINKS = fold(["et", "a", "au", "و", "الى", "إلى", "حتى"]);

/** Units that make a number a surface, never a price: "90 m²", "90 م²", "120 mètres carrés". */
export const SURFACE_WORDS = fold(["m²", "m2", "mq", "sqm", "metre", "metres", "metre carre", "metres carres", "م²", "متر", "امتار", "مربع"]);

/**
 * A sum the visitor already has or earns is not a ceiling on the price: "un
 * apport de 200 000 DH", "تسبيق 10 مليون", "je gagne 10 000 DH par mois". Such
 * sums are read and set aside, like surfaces (the site's own budget finder has
 * an "Apport personnel" field, so buyers do type it).
 */
export const DEPOSIT_WORDS = fold(["apport", "apports", "avance", "acompte", "تسبيق", "التسبيق", "دفعة", "tasbiq"]);
export const INCOME_WORDS = fold([
  "salaire", "salaires", "revenu", "revenus", "gagne", "gagnons", "gagnent", "touche", "salary", "income", "earn",
  "راتب", "راتبي", "مدخول", "مدخولي", "دخل", "دخلي", "خلصة", "خلصتي", "كنربح", "كنشد", "kanchedd", "kanched",
  "khlass", "khlassi",
]);
/** Words between such a sum and a deposit word after it: "300 000 DH d'apport", "comme apport". */
export const DEPOSIT_LINKS = fold(["d", "de", "l", "comme", "en", "pour", "ك", "ل"]);

/**
 * A question about time ("quand sera livré…", "متى…"): "livré" then asks for a
 * date, it is not the status filter "Livraison immédiate".
 */
export const TIME_QUESTION_WORDS = fold([
  "quand", "date", "dates", "sera", "seront", "prevu", "prevue", "prevus", "prevues", "delai", "delais", "when",
  "متى", "ايمتى", "امتى", "فوقاش", "وقتاش", "imta", "emta", "wqtach", "waqtach", "foqach", "fogach",
]);
/** The words that make a status phrase about delivery. */
export const DELIVERY_WORDS = fold(["livre", "livree", "livres", "livrees", "livraison", "livrable", "bientot", "تسليم", "التسليم"]);

/** "السلام عليكم", "salam", "bonjour": politeness, never the programme Assalam TG. */
export const GREETING_TAILS = fold([
  "عليكم", "عليكوم", "alaikoum", "alikoum", "alaykoum", "alaykum", "aleikoum", "alikom", "alaikom", "alaikum",
]);
export const GREETING_HEADS = fold(["السلام", "assalam", "salam", "assalamou", "assalamu", "salamou"]);

/** "2ème étage": an ordinal, not a programme number. */
export const ORDINAL_SUFFIXES = new Set(["eme", "e", "er", "ere", "ieme", "em", "nd", "th"]);

/** Never read as vocabulary by typo tolerance: "Mohammed" is not Mohammedia, "instructions" not "construction". */
export const NEVER_FUZZY = fold([
  "mohammed", "mohamed", "mohammad", "mohamad", "mhammed", "muhammad", "محمد",
  "instruction", "instructions", "apport", "apporte", "avance", "personnel",
]);

/* ------------------------------------------------------------------ */
/* Stop words, protected names                                         */
/* ------------------------------------------------------------------ */

/** Never text, never fuzzily read as vocabulary. */
export const STOP_WORDS = fold([
  // French
  "a", "à", "au", "aux", "de", "des", "du", "d", "l", "la", "le", "les", "un", "une", "avec", "et", "ou",
  "pour", "sur", "en", "dans", "pres", "près", "proche", "proximite", "je", "j", "cherche", "recherche",
  "cherchons", "veux", "voudrais", "souhaite", "souhaiterais", "besoin", "aimerais", "chez", "mon", "ma",
  "mes", "notre", "nous", "on", "qui", "que", "qu", "quel", "quelle", "il", "y", "est", "ai", "avoir",
  "acheter", "achat", "vendre", "vente", "immobilier", "projet", "projets", "programme", "programmes",
  "residence", "residences", "logement", "logements", "bien", "biens", "immeuble", "maison", "salon",
  "sejour", "plus", "max", "maximum", "maxi", "moins", "environ", "autour", "vers", "entre", "budget",
  "prix", "dh", "dhs", "mad", "dirham", "dirhams", "livraison", "ville", "villes", "quartier", "region",
  "jusqu", "jusque", "partir", "minimum", "min", "par", "mois", "cote", "environs", "alentours",
  "chambre", "chambres", "ch", "piece", "pieces", "famille", "s", "t", "n", "ce", "cette", "ces",
  "tres", "bon", "bonne", "pas", "ne", "sous", "dessous", "dessus", "superieur", "inferieur", "the",
  "in", "with", "near", "for",
  // deposit, income and questions about time (read with their sums or set aside)
  "apport", "apports", "avance", "acompte", "personnel", "salaire", "revenu", "revenus", "gagne", "quand", "sera",
  "seront", "date", "prevu", "prevue", "delai", "delais", "etage", "etages",
  // greetings
  "salam", "slm", "salut", "bonjour", "bonsoir", "hello", "merci", "assalamou", "assalamu", "assalamo", "salamou",
  "alaikoum", "alikoum", "alaykoum", "alaykum", "aleikoum", "alikom", "alaikom", "alaikum",
  // Darija in Latin letters
  "bghit", "bghina", "nbghi", "chi", "fiha", "fih", "ola", "wla", "w", "o", "dial", "dyal", "f", "fi", "b", "bi",
  "daba", "mzyan", "kayn", "wach",
  // Arabic, Darija
  "في", "من", "مع", "و", "ب", "ف", "ل", "على", "عن", "إلى", "الى", "قرب", "بالقرب", "أبحث", "ابحث",
  "نبحث", "بغيت", "بغينا", "نبغي", "كنقلب", "كنبحث", "نقلب", "شي", "ديال", "د", "او", "أو", "أريد",
  "اريد", "نريد", "عندي", "لي", "هاد", "هذا", "هذه", "فيها", "فيه", "بها", "به", "مشروع", "مشاريع",
  "عقار", "شراء", "شري", "نشري", "بيع", "صالون", "ثمن", "بثمن", "بحال", "قريب", "قريبة", "جنب",
  "حدا", "منطقة", "مدينة", "حي", "دار", "منزل", "سكن", "مسكن", "أقل", "اقل", "أكثر", "اكثر", "حتى",
  "درهم", "دراهم", "غرف", "غرفة", "بيوت", "بيت", "شهر", "الشهر", "مراكز", "ميزانية", "ميزانيتي",
  "جهة", "نواحي", "حاجة", "كاين", "واش", "كل",
  "سلام", "عليكم", "عليكوم", "شكرا", "مرحبا", "متى", "ايمتى", "امتى", "فوقاش", "وقتاش", "تسبيق", "التسبيق",
  "راتب", "راتبي", "مدخول", "مدخولي", "دخلي", "كنربح", "طابق", "ولا",
]);

/**
 * Words of programme names (folded) that must stay text: they are never read
 * as vocabulary by typo tolerance ("jasmin" is not "jardin"). parse.test.ts
 * checks that every name word of five letters or more is listed here or is
 * vocabulary on purpose ("Studios", "terrain").
 */
export const PROTECTED_NAME_WORDS: string[] = [
  "riad", "garden", "amaia", "oceane", "odyssee", "assalam", "bougainvillier", "izdihar", "dyar", "bahia",
  "youssoufia", "maamora", "assafa", "massylia", "jnane", "anbar", "anbra", "yassamine", "jasmin", "patio",
  "verde", "pins",
  "رياض", "غاردن", "أمايا", "أوسيان", "أرضية", "أوديسي", "السلام", "بوغانفيلي", "الازدهار", "ديار", "الباهية",
  "اليوسفية", "المعمورة", "معمورة", "الصفاء", "ماسيليا", "جنان", "العنبر", "العنبرة", "الياسمين", "جاسمين",
  "باتيو", "فيردي",
].flatMap((w) => words(w));

/** Name phrases that contain vocabulary but are a name: "Jnane Souss" is not the Souss region. */
export const PROTECTED_PHRASES: string[][] = ["jnane souss", "جنان سوس"].map((p) => words(p));

/** Fillers that may sit between the words of a phrase ("vue sur la mer", "terrain de sport"). */
export const PHRASE_FILLERS = fold(["de", "des", "du", "d", "la", "le", "les", "l", "sur", "a", "en", "pour", "على", "في", "ل"]);

/* ------------------------------------------------------------------ */
/* The index                                                           */
/* ------------------------------------------------------------------ */

export type LexValue =
  | { field: "cities"; value: string }
  | { field: "region"; value: RegionId }
  | { field: "segments"; value: Segment }
  | { field: "kinds"; value: Kind }
  | { field: "statuses"; value: StatusFacet }
  | { field: "amenities"; value: Amenity };

export type LexEntry = {
  /** Folded words, fillers excluded except where the phrase starts with one ("en construction"). */
  phrase: string[];
  value: LexValue;
  /** Never matched within typo tolerance (towns without a programme). */
  exactOnly?: boolean;
};

function entries<F extends LexValue["field"]>(
  field: F,
  table: Partial<Record<string, string[]>>,
  exactOnly = false,
): LexEntry[] {
  const out: LexEntry[] = [];
  for (const [value, phrases] of Object.entries(table)) {
    for (const p of phrases ?? []) {
      const ws = words(p);
      if (ws.length === 0) continue;
      // Fillers inside a phrase are optional at match time, so they are not stored.
      const phrase = [ws[0], ...ws.slice(1).filter((w) => !PHRASE_FILLERS.has(w))];
      out.push({ phrase, value: { field, value } as LexValue, ...(exactOnly ? { exactOnly } : {}) });
    }
  }
  return out;
}

export const LEXICON: LexEntry[] = [
  ...entries("cities", CITY_ALIASES),
  ...entries("region", REGION_ALIASES),
  ...entries("region", NEARBY_PLACES, true),
  ...entries(
    "cities",
    Object.fromEntries(Object.entries(UNSERVED_CITIES).map(([id, city]) => [id, city.aliases])),
    true,
  ),
  ...entries("segments", SEGMENT_ALIASES),
  ...entries("kinds", KIND_ALIASES),
  ...entries("statuses", STATUS_ALIASES),
  ...entries("amenities", AMENITY_ALIASES),
];

/** First word (in every indexed form) → the entries that start with it. */
export const LEXICON_BY_FIRST: Map<string, LexEntry[]> = (() => {
  const map = new Map<string, LexEntry[]>();
  for (const entry of LEXICON) {
    for (const form of entryForms(entry.phrase[0])) {
      const list = map.get(form) ?? [];
      list.push(entry);
      map.set(form, list);
    }
  }
  return map;
})();
