import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildDocs } from "./docs.ts";
import { PROTECTED_NAME_WORDS } from "./lexicon.ts";
import { normalize, words } from "./normalize.ts";
import { emptyQuery, parseQuery } from "./parse.ts";
import type { ParsedQuery, QuerySpan } from "./types.ts";

/** The raw words behind every span of one field, in order. */
function spanned(q: ParsedQuery, field: QuerySpan["field"]): string[] {
  return q.spans.filter((s) => s.field === field).map((s) => q.raw.slice(s.start, s.end));
}

/** Nothing structured was read. */
function isBare(q: ParsedQuery): boolean {
  return (
    q.cities.length === 0 &&
    q.region === null &&
    q.bedroomsMin === null &&
    q.priceMax === null &&
    q.monthlyMax === null &&
    q.segments.length === 0 &&
    q.kinds.length === 0 &&
    q.statuses.length === 0 &&
    q.amenities.length === 0 &&
    q.spans.length === 0
  );
}

/* ------------------------------------------------------------------ */
/* Adversarial input                                                   */
/* ------------------------------------------------------------------ */

test("empty input is an empty query", () => {
  const q = parseQuery("");
  assert.ok(isBare(q));
  assert.deepEqual(q.text, []);
  assert.deepEqual(emptyQuery(), q);
});

test("whitespace and punctuation only are an empty query", () => {
  const q = parseQuery("   ,;!? …  ");
  assert.ok(isBare(q));
  assert.deepEqual(q.text, []);
});

test("only stop words leave no text and no values", () => {
  assert.deepEqual(parseQuery("je cherche un avec de la pour").text, []);
  assert.deepEqual(parseQuery("أبحث عن في من مع").text, []);
  assert.deepEqual(parseQuery("بغيت شي حاجة ديال").text, []);
});

test("emoji are ignored, the words around them are read", () => {
  const q = parseQuery("🏠 villa 🌊 piscine ✨");
  assert.deepEqual(q.kinds, ["villa"]);
  assert.deepEqual(q.amenities, ["piscine"]);
  assert.deepEqual(q.text, []);
});

test("very long input stays fast and bounded", () => {
  const long = "appartement à Agadir avec piscine ".repeat(400);
  const t0 = Date.now();
  const q = parseQuery(long);
  assert.ok(Date.now() - t0 < 500, "parse should be fast");
  assert.deepEqual(q.cities, ["agadir"]);
  assert.deepEqual(q.amenities, ["piscine"]);
});

test("raw is kept verbatim", () => {
  const raw = "  Villa à  Marrakech ";
  assert.equal(parseQuery(raw).raw, raw);
});

/* ------------------------------------------------------------------ */
/* Cities                                                              */
/* ------------------------------------------------------------------ */

test("city names in French with and without accents", () => {
  assert.deepEqual(parseQuery("Témara").cities, ["temara"]);
  assert.deepEqual(parseQuery("temara").cities, ["temara"]);
  assert.deepEqual(parseQuery("SALÉ").cities, ["sala-al-jadida"]);
  assert.deepEqual(parseQuery("Sala Al Jadida").cities, ["sala-al-jadida"]);
});

test("city aliases and transliterations", () => {
  assert.deepEqual(parseQuery("Marrakesh").cities, ["marrakech"]);
  assert.deepEqual(parseQuery("kech").cities, ["marrakech"]);
  assert.deepEqual(parseQuery("Mogador").cities, ["essaouira"]);
  assert.deepEqual(parseQuery("souira").cities, ["essaouira"]);
  assert.deepEqual(parseQuery("Tangier").cities, ["tanger"]);
  assert.deepEqual(parseQuery("tanja").cities, ["tanger"]);
  assert.deepEqual(parseQuery("Mohamedia").cities, ["mohammedia"]);
  assert.deepEqual(parseQuery("Had Soualem").cities, ["had-soualem"]);
  assert.deepEqual(parseQuery("sidi rahal").cities, ["sidi-rahal"]);
});

test("city names in Arabic, with and without hamza", () => {
  assert.deepEqual(parseQuery("مراكش").cities, ["marrakech"]);
  assert.deepEqual(parseQuery("الصويرة").cities, ["essaouira"]);
  assert.deepEqual(parseQuery("طنجة").cities, ["tanger"]);
  assert.deepEqual(parseQuery("المحمدية").cities, ["mohammedia"]);
  assert.deepEqual(parseQuery("تمارة").cities, ["temara"]);
  assert.deepEqual(parseQuery("سلا الجديدة").cities, ["sala-al-jadida"]);
  assert.deepEqual(parseQuery("حد السوالم").cities, ["had-soualem"]);
  assert.deepEqual(parseQuery("سيدي رحال").cities, ["sidi-rahal"]);
  assert.deepEqual(parseQuery("أكادير").cities, ["agadir"]);
  assert.deepEqual(parseQuery("اكادير").cities, ["agadir"]);
});

test("Arabic clitics glued to a city: بمراكش, وطنجة, فالصويرة", () => {
  assert.deepEqual(parseQuery("بمراكش").cities, ["marrakech"]);
  assert.deepEqual(parseQuery("وطنجة").cities, ["tanger"]);
  assert.deepEqual(parseQuery("فالصويرة").cities, ["essaouira"]);
  assert.deepEqual(parseQuery("بالمحمدية").cities, ["mohammedia"]);
});

test("typos on city names: Marakech, Esaouira, Mohammadia, Agadr", () => {
  assert.deepEqual(parseQuery("Marakech").cities, ["marrakech"]);
  assert.deepEqual(parseQuery("Esaouira").cities, ["essaouira"]);
  assert.deepEqual(parseQuery("mohammadia").cities, ["mohammedia"]);
  assert.deepEqual(parseQuery("agadr").cities, ["agadir"]);
  assert.deepEqual(parseQuery("Marrkaech").cities, ["marrakech"], "transposition counts as one edit");
});

test("short words get no typo tolerance", () => {
  assert.deepEqual(parseQuery("sal").cities, []);
  assert.deepEqual(parseQuery("salle").cities, []);
});

test("two cities are both kept, in order", () => {
  assert.deepEqual(parseQuery("Témara ou Salé").cities, ["temara", "sala-al-jadida"]);
});

test("the preposition before a city belongs to the city's span", () => {
  const q = parseQuery("villa à Agadir");
  assert.deepEqual(spanned(q, "cities"), ["à Agadir"]);
});

/* ------------------------------------------------------------------ */
/* Regions                                                             */
/* ------------------------------------------------------------------ */

test("près de Casablanca → région Casablanca-Settat, never a Casablanca city", () => {
  const q = parseQuery("près de Casablanca");
  assert.equal(q.region, "casablanca-settat");
  assert.deepEqual([...q.cities].sort(), ["had-soualem", "mohammedia", "sidi-rahal"]);
  assert.ok(!q.cities.includes("casablanca"));
  assert.deepEqual(spanned(q, "region"), ["près de Casablanca"]);
  assert.deepEqual(q.text, []);
});

test("Casa, الدار البيضاء and كازا are the Casablanca-Settat region", () => {
  assert.equal(parseQuery("casa").region, "casablanca-settat");
  assert.equal(parseQuery("الدار البيضاء").region, "casablanca-settat");
  assert.equal(parseQuery("كازا").region, "casablanca-settat");
  assert.equal(parseQuery("قرب الدار البيضاء").region, "casablanca-settat");
});

test("Rabat and الرباط are the Rabat-Salé-Kénitra region", () => {
  const q = parseQuery("Rabat");
  assert.equal(q.region, "rabat-sale-kenitra");
  assert.deepEqual([...q.cities].sort(), ["sala-al-jadida", "temara"]);
  assert.equal(parseQuery("الرباط").region, "rabat-sale-kenitra");
});

test("région de Marrakech is the region; Marrakech alone is the city", () => {
  const region = parseQuery("région de Marrakech");
  assert.equal(region.region, "marrakech-safi");
  assert.deepEqual([...region.cities].sort(), ["essaouira", "marrakech"]);
  const city = parseQuery("Marrakech");
  assert.equal(city.region, null);
  assert.deepEqual(city.cities, ["marrakech"]);
  assert.equal(parseQuery("جهة مراكش").region, "marrakech-safi");
});

test("Souss-Massa and Tanger-Tétouan regions", () => {
  const souss = parseQuery("Souss Massa");
  assert.equal(souss.region, "souss-massa");
  assert.deepEqual(souss.cities, ["agadir"]);
  const nord = parseQuery("Tanger-Tétouan");
  assert.equal(nord.region, "tanger-tetouan");
  assert.deepEqual(nord.cities, ["tanger"]);
});

test("Jnane Souss is a programme name, not the Souss region", () => {
  const q = parseQuery("Jnane Souss");
  assert.equal(q.region, null);
  assert.deepEqual(q.text, ["jnane", "souss"]);
});

/* ------------------------------------------------------------------ */
/* Bedrooms                                                            */
/* ------------------------------------------------------------------ */

test("3 chambres, 3ch, 3 ch., 3 chbr", () => {
  assert.equal(parseQuery("3 chambres").bedroomsMin, 3);
  assert.equal(parseQuery("3ch").bedroomsMin, 3);
  assert.equal(parseQuery("3 ch.").bedroomsMin, 3);
  assert.equal(parseQuery("2 chbr").bedroomsMin, 2);
  assert.deepEqual(spanned(parseQuery("appart 3 chambres"), "bedroomsMin"), ["3 chambres"]);
});

test("bedrooms in French letters: une, deux, trois, quatre, cinq", () => {
  assert.equal(parseQuery("une chambre").bedroomsMin, 1);
  assert.equal(parseQuery("deux chambres").bedroomsMin, 2);
  assert.equal(parseQuery("trois chambres").bedroomsMin, 3);
  assert.equal(parseQuery("quatre chambres").bedroomsMin, 4);
  assert.equal(parseQuery("cinq chambres").bedroomsMin, 5);
});

test("typo on chambres still reads bedrooms", () => {
  assert.equal(parseQuery("3 chambrs").bedroomsMin, 3);
  assert.equal(parseQuery("3 chamrbes").bedroomsMin, 3);
});

test("Moroccan pièces: N pièces = salon + N−1 chambres", () => {
  assert.equal(parseQuery("4 pièces").bedroomsMin, 3);
  assert.equal(parseQuery("3 pieces").bedroomsMin, 2);
  assert.equal(parseQuery("trois pièces").bedroomsMin, 2);
});

test("Arabic bedrooms: 3 غرف, ثلاث غرف, غرفتين, غرفة واحدة", () => {
  assert.equal(parseQuery("3 غرف").bedroomsMin, 3);
  assert.equal(parseQuery("٣ غرف").bedroomsMin, 3);
  assert.equal(parseQuery("ثلاث غرف").bedroomsMin, 3);
  assert.equal(parseQuery("غرفتين").bedroomsMin, 2);
  assert.equal(parseQuery("غرفتان").bedroomsMin, 2);
  assert.equal(parseQuery("غرفة واحدة").bedroomsMin, 1);
});

test("Darija bedrooms: 3 بيوت, جوج بيوت", () => {
  assert.equal(parseQuery("3 بيوت").bedroomsMin, 3);
  assert.equal(parseQuery("جوج بيوت").bedroomsMin, 2);
  assert.equal(parseQuery("بيتين").bedroomsMin, 2);
});

test("studio is a kind, not a bedroom count", () => {
  const q = parseQuery("studio");
  assert.deepEqual(q.kinds, ["studio"]);
  assert.equal(q.bedroomsMin, null);
  assert.deepEqual(parseQuery("استوديو").kinds, ["studio"]);
});

test("a bedroom count is never a price", () => {
  const q = parseQuery("3 chambres");
  assert.equal(q.priceMax, null);
  assert.equal(q.monthlyMax, null);
});

/* ------------------------------------------------------------------ */
/* Prices                                                              */
/* ------------------------------------------------------------------ */

test("moins de 900 000 → priceMax 900 000, comparator in the span", () => {
  const q = parseQuery("moins de 900 000");
  assert.equal(q.priceMax, 900_000);
  assert.deepEqual(spanned(q, "priceMax"), ["moins de 900 000"]);
  assert.deepEqual(q.text, []);
});

test("thousands written with spaces, dots, commas and non-breaking spaces", () => {
  assert.equal(parseQuery("1 200 000").priceMax, 1_200_000);
  assert.equal(parseQuery("1.200.000").priceMax, 1_200_000);
  assert.equal(parseQuery("1,200,000").priceMax, 1_200_000);
  assert.equal(parseQuery("1 200 000").priceMax, 1_200_000);
  assert.equal(parseQuery("1 200 000 dh").priceMax, 1_200_000);
  assert.equal(parseQuery("1200000").priceMax, 1_200_000);
});

test("1,2 million and 1.2M are both 1 200 000", () => {
  assert.equal(parseQuery("1,2 million").priceMax, 1_200_000);
  assert.equal(parseQuery("1.2M").priceMax, 1_200_000);
  assert.equal(parseQuery("1.2 millions").priceMax, 1_200_000);
  assert.equal(parseQuery("max 1M").priceMax, 1_000_000);
  assert.equal(parseQuery("1m5").priceMax, 1_500_000);
});

test("Moroccan centimes: 50 millions = 500 000 DH, 25 مليون = 250 000 DH", () => {
  assert.equal(parseQuery("terrain 50 millions").priceMax, 500_000);
  assert.equal(parseQuery("50 مليون").priceMax, 500_000);
  assert.equal(parseQuery("3 غرف و صالون ب25 مليون").priceMax, 250_000);
  assert.equal(parseQuery("120 millions").priceMax, 1_200_000);
});

test("below ten, a million is a million dirhams", () => {
  assert.equal(parseQuery("2 millions").priceMax, 2_000_000);
  assert.equal(parseQuery("un million").priceMax, 1_000_000);
  assert.equal(parseQuery("مليونين").priceMax, 2_000_000);
});

test("مليون ونص = 1 500 000 DH; million et demi too", () => {
  assert.equal(parseQuery("مليون ونص").priceMax, 1_500_000);
  assert.equal(parseQuery("مليون و نصف").priceMax, 1_500_000);
  assert.equal(parseQuery("un million et demi").priceMax, 1_500_000);
  assert.equal(parseQuery("2 مليون ونص").priceMax, 2_500_000);
});

test("أقل من مليون → priceMax 1 000 000", () => {
  const q = parseQuery("أقل من مليون");
  assert.equal(q.priceMax, 1_000_000);
  assert.deepEqual(q.text, []);
});

test("800 ألف, 800 alf, 800k and 800 mille are 800 000 DH", () => {
  assert.equal(parseQuery("800 ألف").priceMax, 800_000);
  assert.equal(parseQuery("800 الف درهم").priceMax, 800_000);
  assert.equal(parseQuery("800k").priceMax, 800_000);
  assert.equal(parseQuery("800 mille").priceMax, 800_000);
});

test("budget, jusqu'à, ≤ and < introduce a ceiling", () => {
  assert.equal(parseQuery("budget 700000").priceMax, 700_000);
  assert.equal(parseQuery("jusqu'à 650 000 DH").priceMax, 650_000);
  assert.equal(parseQuery("≤ 900000").priceMax, 900_000);
  assert.equal(parseQuery("< 900000").priceMax, 900_000);
  assert.deepEqual(spanned(parseQuery("villa ≤ 2 000 000"), "priceMax"), ["≤ 2 000 000"]);
});

test("entre 600 000 et 900 000 → ceiling 900 000, the whole phrase is the span", () => {
  const q = parseQuery("entre 600 000 et 900 000");
  assert.equal(q.priceMax, 900_000);
  assert.deepEqual(spanned(q, "priceMax"), ["entre 600 000 et 900 000"]);
  assert.deepEqual(q.text, []);
  assert.equal(parseQuery("بين 500 و 700 ألف").priceMax, 700_000);
});

test("90 m2 / 90 m² / 90 م² are surfaces, never a price", () => {
  for (const raw of ["90 m2", "90m2", "90 m²", "90 م²", "120 mètres carrés"]) {
    const q = parseQuery(raw);
    assert.equal(q.priceMax, null, raw);
    assert.equal(q.monthlyMax, null, raw);
    assert.equal(q.bedroomsMin, null, raw);
  }
});

test("a small bare number stays text (Riad Garden 2)", () => {
  const q = parseQuery("riad garden 2");
  assert.equal(q.priceMax, null);
  assert.deepEqual(q.text, ["riad", "garden", "2"]);
});

test("a floor (plus de, à partir de) never becomes a ceiling", () => {
  assert.equal(parseQuery("plus de 1 000 000").priceMax, null);
  assert.equal(parseQuery("à partir de 800 000").priceMax, null);
  assert.deepEqual(parseQuery("plus de 1 000 000").text, []);
});

/* ------------------------------------------------------------------ */
/* Monthly                                                             */
/* ------------------------------------------------------------------ */

test("6000 dh/mois → monthlyMax, not a price", () => {
  const q = parseQuery("6000 dh/mois");
  assert.equal(q.monthlyMax, 6000);
  assert.equal(q.priceMax, null);
  assert.deepEqual(spanned(q, "monthlyMax"), ["6000 dh/mois"]);
});

test("par mois, mensualité, traite", () => {
  assert.equal(parseQuery("5 000 DH par mois").monthlyMax, 5000);
  assert.equal(parseQuery("mensualité 4500").monthlyMax, 4500);
  assert.equal(parseQuery("mensualité max 4 500 dh").monthlyMax, 4500);
  assert.equal(parseQuery("traite 3000").monthlyMax, 3000);
});

test("Arabic monthly: شهريا, في الشهر, فالشهر", () => {
  assert.equal(parseQuery("5000 درهم شهريا").monthlyMax, 5000);
  assert.equal(parseQuery("4000 في الشهر").monthlyMax, 4000);
  assert.equal(parseQuery("3000 درهم فالشهر").monthlyMax, 3000);
});

test("6k par mois is 6 000 DH a month", () => {
  assert.equal(parseQuery("6k par mois").monthlyMax, 6000);
});

/* ------------------------------------------------------------------ */
/* Standing / segments                                                 */
/* ------------------------------------------------------------------ */

test("haut standing, standing, luxe, prestige, haut de gamme", () => {
  for (const raw of ["haut standing", "standing", "luxe", "prestige", "haut de gamme"]) {
    assert.deepEqual(parseQuery(raw).segments, ["haut-standing"], raw);
  }
  assert.deepEqual(spanned(parseQuery("appart haut de gamme"), "segments"), ["haut de gamme"]);
});

test("moyen standing is not haut standing", () => {
  assert.deepEqual(parseQuery("moyen standing").segments, ["moyen-standing"]);
  assert.deepEqual(parseQuery("متوسط").segments, ["moyen-standing"]);
});

test("économique, social, logement social, اقتصادي, اجتماعي", () => {
  for (const raw of ["économique", "social", "logement social", "اقتصادي", "السكن الاجتماعي"]) {
    assert.deepEqual(parseQuery(raw).segments, ["economique"], raw);
  }
});

test("Arabic standing: راقي, فاخر", () => {
  assert.deepEqual(parseQuery("شقة راقية").segments, ["haut-standing"]);
  assert.deepEqual(parseQuery("فاخر").segments, ["haut-standing"]);
});

test("terrain, lots, lotissement, parcelle, بقعة, أرض → land", () => {
  for (const raw of ["terrain", "lots", "lotissement", "parcelle", "بقعة", "بقع", "أرض"]) {
    assert.deepEqual(parseQuery(raw).segments, ["terrain"], raw);
  }
});

test("terrain de sport is an amenity, never land", () => {
  const q = parseQuery("terrain de sport");
  assert.deepEqual(q.segments, []);
  assert.deepEqual(q.amenities, ["terrains-de-sport"]);
  assert.deepEqual(spanned(q, "amenities"), ["terrain de sport"]);
  assert.deepEqual(parseQuery("terrains de sport").segments, []);
  assert.deepEqual(parseQuery("ملاعب").amenities, ["terrains-de-sport"]);
  assert.deepEqual(parseQuery("ملاعب").segments, []);
});

test("terrain 50 millions → land under 500 000 DH", () => {
  const q = parseQuery("terrain 50 millions");
  assert.deepEqual(q.segments, ["terrain"]);
  assert.equal(q.priceMax, 500_000);
});

/* ------------------------------------------------------------------ */
/* Kinds                                                               */
/* ------------------------------------------------------------------ */

test("villa, فيلا, appartement, appart, شقة", () => {
  assert.deepEqual(parseQuery("villa").kinds, ["villa"]);
  assert.deepEqual(parseQuery("villas").kinds, ["villa"]);
  assert.deepEqual(parseQuery("فيلا").kinds, ["villa"]);
  assert.deepEqual(parseQuery("appartement").kinds, ["appartement"]);
  assert.deepEqual(parseQuery("appart").kinds, ["appartement"]);
  assert.deepEqual(parseQuery("شقة").kinds, ["appartement"]);
  assert.deepEqual(parseQuery("شقق").kinds, ["appartement"]);
});

/* ------------------------------------------------------------------ */
/* Statuses                                                            */
/* ------------------------------------------------------------------ */

test("livraison immédiate, prêt à habiter, clés en main → immediate", () => {
  for (const raw of ["livraison immédiate", "immédiate", "prêt à habiter", "clés en main", "disponible tout de suite", "livré"]) {
    assert.deepEqual(parseQuery(raw).statuses, ["immediate"], raw);
  }
  assert.deepEqual(spanned(parseQuery("villa livraison immédiate"), "statuses"), ["livraison immédiate"]);
});

test("Arabic immediate: تسليم فوري, جاهزة للسكن", () => {
  assert.deepEqual(parseQuery("تسليم فوري").statuses, ["immediate"]);
  assert.deepEqual(parseQuery("جاهزة للسكن").statuses, ["immediate"]);
  assert.deepEqual(parseQuery("شقة جاهزة").statuses, ["immediate"]);
});

test("livraison imminente, bientôt livré, تسليم وشيك → imminente", () => {
  assert.deepEqual(parseQuery("livraison imminente").statuses, ["imminente"]);
  assert.deepEqual(parseQuery("bientôt livré").statuses, ["imminente"]);
  assert.deepEqual(parseQuery("تسليم وشيك").statuses, ["imminente"]);
});

test("nouveau, lancement, جديد, إطلاق → en-lancement", () => {
  for (const raw of ["nouveau", "nouveautés", "lancement", "جديد", "إطلاق"]) {
    assert.deepEqual(parseQuery(raw).statuses, ["en-lancement"], raw);
  }
});

test("promo, remise, réduction, تخفيض, عرض → en-promotion", () => {
  for (const raw of ["promo", "promotion", "remise", "réduction", "تخفيض", "عرض"]) {
    assert.deepEqual(parseQuery(raw).statuses, ["en-promotion"], raw);
  }
});

test("en construction, chantier, sur plan, VEFA, قيد البناء → en-construction", () => {
  for (const raw of ["en construction", "chantier", "sur plan", "VEFA", "قيد البناء", "في طور البناء"]) {
    assert.deepEqual(parseQuery(raw).statuses, ["en-construction"], raw);
  }
});

/* ------------------------------------------------------------------ */
/* Amenities                                                           */
/* ------------------------------------------------------------------ */

test("piscine, mer, plage, mosquée, écoles, parking, ascenseur", () => {
  assert.deepEqual(parseQuery("piscine").amenities, ["piscine"]);
  assert.deepEqual(parseQuery("vue mer").amenities, ["vue-mer"]);
  assert.deepEqual(parseQuery("mer").amenities, ["vue-mer"]);
  assert.deepEqual(parseQuery("plage").amenities, ["plage"]);
  assert.deepEqual(parseQuery("mosquée").amenities, ["mosquee"]);
  assert.deepEqual(parseQuery("écoles").amenities, ["ecoles"]);
  assert.deepEqual(parseQuery("parking").amenities, ["parking-sous-sol"]);
  assert.deepEqual(parseQuery("garage").amenities, ["parking-sous-sol"]);
  assert.deepEqual(parseQuery("ascenseur").amenities, ["ascenseur"]);
});

test("spa, hammam, jardin, espaces verts, commerces, centre commercial, aire de jeux, montagne", () => {
  assert.deepEqual(parseQuery("spa").amenities, ["spa"]);
  assert.deepEqual(parseQuery("hammam").amenities, ["spa"]);
  assert.deepEqual(parseQuery("jardin").amenities, ["espaces-verts"]);
  assert.deepEqual(parseQuery("espaces verts").amenities, ["espaces-verts"]);
  assert.deepEqual(parseQuery("commerces").amenities, ["commerces"]);
  assert.deepEqual(parseQuery("centre commercial").amenities, ["centre-commercial"]);
  assert.deepEqual(parseQuery("aire de jeux").amenities, ["aires-de-jeux"]);
  assert.deepEqual(parseQuery("vue montagne").amenities, ["vue-montagne"]);
});

test("Arabic amenities", () => {
  assert.deepEqual(parseQuery("مسبح").amenities, ["piscine"]);
  assert.deepEqual(parseQuery("إطلالة على البحر").amenities, ["vue-mer"]);
  assert.deepEqual(parseQuery("البحر").amenities, ["vue-mer"]);
  assert.deepEqual(parseQuery("شاطئ").amenities, ["plage"]);
  assert.deepEqual(parseQuery("مسجد").amenities, ["mosquee"]);
  assert.deepEqual(parseQuery("مدارس").amenities, ["ecoles"]);
  assert.deepEqual(parseQuery("مرأب").amenities, ["parking-sous-sol"]);
  assert.deepEqual(parseQuery("مصعد").amenities, ["ascenseur"]);
  assert.deepEqual(parseQuery("حديقة").amenities, ["espaces-verts"]);
  assert.deepEqual(parseQuery("مساحات خضراء").amenities, ["espaces-verts"]);
  assert.deepEqual(parseQuery("مركز تجاري").amenities, ["centre-commercial"]);
  assert.deepEqual(parseQuery("ألعاب الأطفال").amenities, ["aires-de-jeux"]);
});

test("avec belongs to the amenity span", () => {
  assert.deepEqual(spanned(parseQuery("appartement avec piscine"), "amenities"), ["avec piscine"]);
});

test("piscine typo still reads the amenity", () => {
  assert.deepEqual(parseQuery("pisicne").amenities, ["piscine"]);
});

/* ------------------------------------------------------------------ */
/* Leftover text                                                       */
/* ------------------------------------------------------------------ */

test("a programme name stays text, normalised", () => {
  assert.deepEqual(parseQuery("Massylia").text, ["massylia"]);
  assert.deepEqual(parseQuery("Océane").text, ["oceane"]);
  assert.deepEqual(parseQuery("ماسيليا").text, ["ماسيليا"]);
});

test("a programme name is not fuzzily read as vocabulary", () => {
  const jasmin = parseQuery("jasmin");
  assert.deepEqual(jasmin.amenities, []);
  assert.deepEqual(jasmin.text, ["jasmin"]);
  const verde = parseQuery("patio verde");
  assert.ok(isBare(verde));
});

test("every programme-name word is protected or is vocabulary on purpose", () => {
  const known = new Set(PROTECTED_NAME_WORDS);
  for (const doc of buildDocs("fr")) {
    for (const w of [...words(doc.name.fr), ...words(doc.name.ar)]) {
      if (w.length < 5 || /\d/.test(w)) continue;
      const q = parseQuery(w);
      const structured = !isBare(q);
      assert.ok(known.has(w) || structured, `${doc.slug}: "${w}" must be protected (lexicon.ts)`);
    }
  }
});

test("Tassila (a neighbourhood) stays text", () => {
  const q = parseQuery("Tassila");
  assert.deepEqual(q.text, ["tassila"]);
  assert.deepEqual(q.cities, []);
});

/* ------------------------------------------------------------------ */
/* Whole queries                                                       */
/* ------------------------------------------------------------------ */

test("3 chambres à Agadir moins de 1,2 million", () => {
  const q = parseQuery("3 chambres à Agadir moins de 1,2 million");
  assert.equal(q.bedroomsMin, 3);
  assert.deepEqual(q.cities, ["agadir"]);
  assert.equal(q.priceMax, 1_200_000);
  assert.deepEqual(q.text, []);
  assert.deepEqual(spanned(q, "priceMax"), ["moins de 1,2 million"]);
});

test("livraison immédiate près de Casablanca", () => {
  const q = parseQuery("livraison immédiate près de Casablanca");
  assert.deepEqual(q.statuses, ["immediate"]);
  assert.equal(q.region, "casablanca-settat");
  assert.deepEqual(q.text, []);
});

test("شقة بمراكش مع مسبح", () => {
  const q = parseQuery("شقة بمراكش مع مسبح");
  assert.deepEqual(q.kinds, ["appartement"]);
  assert.deepEqual(q.cities, ["marrakech"]);
  assert.deepEqual(q.amenities, ["piscine"]);
  assert.deepEqual(q.text, []);
});

test("شقة 3 غرف بمراكش أقل من مليون", () => {
  const q = parseQuery("شقة 3 غرف بمراكش أقل من مليون");
  assert.deepEqual(q.kinds, ["appartement"]);
  assert.equal(q.bedroomsMin, 3);
  assert.deepEqual(q.cities, ["marrakech"]);
  assert.equal(q.priceMax, 1_000_000);
  assert.deepEqual(q.text, []);
});

test("villa piscine mer", () => {
  const q = parseQuery("villa piscine mer");
  assert.deepEqual(q.kinds, ["villa"]);
  assert.deepEqual([...q.amenities].sort(), ["piscine", "vue-mer"]);
  assert.deepEqual(q.text, []);
});

test("mixed French and Arabic in one query", () => {
  const q = parseQuery("appartement فمراكش 2 chambres مع مسبح");
  assert.deepEqual(q.cities, ["marrakech"]);
  assert.equal(q.bedroomsMin, 2);
  assert.deepEqual(q.amenities, ["piscine"]);
  assert.deepEqual(q.kinds, ["appartement"]);
});

test("Darija: بغيت شي دار فطنجة ب 80 مليون", () => {
  const q = parseQuery("بغيت شي شقة فطنجة ب 80 مليون");
  assert.deepEqual(q.cities, ["tanger"]);
  assert.equal(q.priceMax, 800_000);
  assert.deepEqual(q.kinds, ["appartement"]);
  assert.deepEqual(q.text, []);
});

test("je cherche un appartement haut standing à Mohammedia avec ascenseur", () => {
  const q = parseQuery("je cherche un appartement haut standing à Mohammedia avec ascenseur");
  assert.deepEqual(q.kinds, ["appartement"]);
  assert.deepEqual(q.segments, ["haut-standing"]);
  assert.deepEqual(q.cities, ["mohammedia"]);
  assert.deepEqual(q.amenities, ["ascenseur"]);
  assert.deepEqual(q.text, []);
});

test("values are deduplicated, every occurrence keeps a span", () => {
  const q = parseQuery("piscine Agadir piscine agadir");
  assert.deepEqual(q.amenities, ["piscine"]);
  assert.deepEqual(q.cities, ["agadir"]);
  assert.equal(spanned(q, "amenities").length, 2);
});

test("spans never overlap and always lie inside the raw string", () => {
  const raws = [
    "3 chambres à Agadir moins de 1,2 million",
    "شقة 3 غرف بمراكش أقل من مليون",
    "villa avec piscine vue mer près de Casablanca 6000 dh/mois",
    "entre 600 000 et 900 000 terrain de sport",
  ];
  for (const raw of raws) {
    const q = parseQuery(raw);
    const sorted = [...q.spans].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sorted.length; i += 1) {
      const s = sorted[i];
      assert.ok(s.start >= 0 && s.end <= raw.length && s.start < s.end, raw);
      if (i > 0) assert.ok(sorted[i - 1].end <= s.start, `overlap in "${raw}"`);
    }
  }
});

test("deleting a chip's span and re-parsing removes exactly that value", () => {
  const raw = "villa à Agadir avec piscine moins de 2 millions";
  const q = parseQuery(raw);
  const span = q.spans.find((s) => s.field === "amenities");
  assert.ok(span);
  const next = parseQuery(raw.slice(0, span.start) + raw.slice(span.end));
  assert.deepEqual(next.amenities, []);
  assert.deepEqual(next.kinds, ["villa"]);
  assert.deepEqual(next.cities, ["agadir"]);
  assert.equal(next.priceMax, 2_000_000);
  assert.deepEqual(next.text, []);
});

test("normalize is unchanged for the contract cases", () => {
  assert.equal(normalize("Témara"), "temara");
  assert.equal(normalize("أكادير"), "اكادير");
});

/* ------------------------------------------------------------------ */
/* Found by probing real phrasings                                     */
/* ------------------------------------------------------------------ */

test("F3 / T4 count rooms the French way (living room included)", () => {
  assert.equal(parseQuery("F3 Agadir").bedroomsMin, 2);
  assert.deepEqual(parseQuery("F3 Agadir").text, []);
  assert.equal(parseQuery("T4").bedroomsMin, 3);
  assert.equal(parseQuery("R+2").bedroomsMin, null, "R+2 is a name, not a room count");
});

test("a land rate (dh/m²) is read and set aside, never a monthly budget", () => {
  for (const raw of ["lot 4500 dh/m2", "4 500 DH le m²", "terrain à 3450 dh/m2"]) {
    const q = parseQuery(raw);
    assert.equal(q.monthlyMax, null, raw);
    assert.equal(q.priceMax, null, raw);
    assert.deepEqual(q.text, [], raw);
  }
});

test("millions followed by thousands: 1 million 200, مليون و200 ألف, 25 مليون و500", () => {
  assert.equal(parseQuery("1 million 200").priceMax, 1_200_000);
  assert.equal(parseQuery("مليون و200 ألف").priceMax, 1_200_000);
  assert.equal(parseQuery("25 مليون و500").priceMax, 255_000);
  assert.equal(parseQuery("2 millions 3 chambres").priceMax, 2_000_000);
  assert.equal(parseQuery("2 millions 3 chambres").bedroomsMin, 3);
});
