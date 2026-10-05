import type { Amenity } from "@/data/types";
import type { Copy } from "./shared";

/**
 * Copy for the opening of the home page — the film, the heritage panel and the
 * flagship feature. Every figure that appears in these strings is passed in
 * from `src/data/company.ts` / `src/data/projects.ts` already formatted
 * (`formatNumber`, `isolateRun`), so nothing here hard-codes a number into an
 * Arabic sentence and nothing here can drift from the data.
 */

/* ------------------------------------------------------------------ film --- */

export const filmCopy: Copy<{
  label: string;
  videoAlt: string;
  beat1Eyebrow: string;
  /** "depuis 1948" — the year is passed in, plain (never grouped). */
  since: (year: string) => string;
  beat1Lead: (years: string) => string;
  beat2Eyebrow: string;
  beat2Title: string;
  beat2Lead: (place: string) => string;
  beat3Eyebrow: string;
  beat3Title: string;
  beat3Lead: (year: string) => string;
  ctaProject: string;
  scrollCue: string;
  chapters: [string, string, string];
  /** Render disclaimer, with the delivery year passed in. */
  note: (year: string) => string;
}> = {
  fr: {
    label: "Entrer dans Riad Garden II",
    videoAlt:
      "Travelling en images de synthèse à travers Riad Garden II : la rue, la façade à claustras, la cour et sa piscine, la terrasse, puis le séjour.",
    beat1Eyebrow: "Promoteur immobilier · Groupe Ynna",
    since: (year) => `depuis ${year}.`,
    beat1Lead: (years) =>
      `Plus de ${years} ans à bâtir au Maroc. Faites défiler : nous vous faisons entrer dans notre nouvelle résidence, à Marrakech.`,
    beat2Eyebrow: "Riad Garden II · Marrakech",
    beat2Title: "Une cour, un bassin, des palmiers.",
    beat2Lead: (place) =>
      `${place}. Des immeubles en R+2 posés autour d'une piscine et de jardins plantés.`,
    beat3Eyebrow: "Appartements de 2 et 3 chambres",
    beat3Title: "Et enfin, chez vous.",
    beat3Lead: (year) =>
      `Un séjour ouvert sur la terrasse, la lumière de Marrakech jusqu'au fond de la pièce. Livraison ${year}.`,
    ctaProject: "Découvrir Riad Garden II",
    scrollCue: "Faites défiler pour entrer",
    chapters: ["Depuis 1948", "Le lieu", "Chez vous"],
    note: (year) => `Rendu 3D — Riad Garden II, Marrakech — livraison ${year} — image non contractuelle`,
  },
  ar: {
    label: "الدخول إلى رياض غاردن 2",
    videoAlt:
      "جولة بتصوّر رقمي داخل رياض غاردن 2: الشارع، ثم الواجهة بمشربياتها، فالفناء ومسبحه، فالشرفة، ثم الصالون.",
    beat1Eyebrow: "منعش عقاري · مجموعة ينا",
    since: (year) => `منذ ${year}.`,
    beat1Lead: (years) =>
      `أكثر من ${years} سنة من البناء بالمغرب. مرّروا الصفحة، ندخلكم إقامتنا الجديدة بمراكش.`,
    beat2Eyebrow: "رياض غاردن 2 · مراكش",
    beat2Title: "فناء، ومسبح، ونخيل.",
    beat2Lead: (place) => `${place}. عمارات من طابقين حول مسبح وحدائق مغروسة.`,
    beat3Eyebrow: "شقق بغرفتين وثلاث غرف",
    beat3Title: "وأخيراً، في بيتكم.",
    beat3Lead: (year) => `صالون مفتوح على الشرفة، وضوء مراكش يملأ المكان. التسليم سنة ${year}.`,
    ctaProject: "اكتشفوا رياض غاردن 2",
    scrollCue: "مرّروا للدخول",
    chapters: ["منذ 1948", "المكان", "بيتكم"],
    note: (year) => `تصوّر ثلاثي الأبعاد — رياض غاردن 2، مراكش — التسليم ${year} — صورة غير تعاقدية`,
  },
};

/* -------------------------------------------------------------- heritage --- */

export const heritageCopy: Copy<{
  title: (years: string) => string;
  lead: string;
  rangeLabel: string;
  range: [string, string, string, string];
  foundedLabel: string;
  statYears: string;
  statCities: string;
  statUnits: (hectares: string) => string;
  statIso: string;
  milestonesLabel: string;
  link: string;
}> = {
  fr: {
    title: (years) => `Plus de ${years} ans à bâtir, ville après ville.`,
    lead: "Filiale du Groupe Ynna, Chaabi Lil Iskane conçoit et réalise ses programmes de l'aménagement à la remise des clés — au Maroc et à l'international.",
    rangeLabel: "La gamme",
    range: ["Économique", "Moyen standing", "Haut standing", "Lots de terrains"],
    foundedLabel: "Fondée en",
    statYears: "ans d'expérience",
    statCities: "villes au Maroc",
    statUnits: (ha) => `logements à Essaouira El Jadida, ville nouvelle de ${ha} ha`,
    statIso: "certifiée ISO 9001 par l'AFNOR, sur l'ensemble de ses activités",
    milestonesLabel: "Dates clés",
    link: "Notre histoire",
  },
  ar: {
    title: (years) => `أكثر من ${years} سنة من البناء، مدينةً بعد مدينة.`,
    lead: "الشعبي للإسكان، فرع مجموعة ينا، يصمّم مشاريعه وينجزها من التهيئة إلى تسليم المفاتيح — بالمغرب وخارجه.",
    rangeLabel: "العرض",
    range: ["السكن الاقتصادي", "السكن المتوسط", "السكن الراقي", "البقع الأرضية"],
    foundedLabel: "تأسست سنة",
    statYears: "سنة من الخبرة",
    statCities: "مدينة بالمغرب",
    statUnits: (ha) => `مسكن بالصويرة الجديدة، مدينة جديدة على ${ha} هكتاراً`,
    statIso: "شهادة إيزو 9001 من AFNOR تشمل جميع الأنشطة",
    milestonesLabel: "تواريخ بارزة",
    link: "تاريخنا",
  },
};

/* -------------------------------------------------------------- flagship --- */

export const flagshipCopy: Copy<{
  eyebrow: string;
  deck: string;
  specFrom: string;
  specSurface: string;
  specBedrooms: string;
  specHeight: string;
  specDelivery: string;
  renderNote: string;
  stripTitle: string;
  stripLead: string;
  rooms: {
    sejour: string;
    parentale: string;
    cuisine: string;
    enfants: string;
    sdb: string;
    commerces: string;
  };
  phase1Eyebrow: (year: string) => string;
  phase1Title: (metres: string) => string;
  phase1Body: string;
  photoNote: (year: string) => string;
  amenitiesLabel: string;
  amenities: Partial<Record<Amenity, string>>;
  ctaProject: string;
}> = {
  fr: {
    eyebrow: "Notre nouveau programme",
    deck: "Deuxième tranche de Riad Garden. Des appartements de deux et trois chambres posés autour d'une piscine et de jardins plantés, avec spa, parking en sous-sol et commerces au pied des immeubles.",
    specFrom: "À partir de",
    specSurface: "Surfaces",
    specBedrooms: "Chambres",
    specHeight: "Hauteur",
    specDelivery: "Livraison",
    renderNote: "Rendu — image non contractuelle",
    stripTitle: "L'intérieur, pièce par pièce.",
    stripLead:
      "Les appartements témoins, en images de synthèse. Ils se visitent aussi en 360° depuis la page du projet.",
    rooms: {
      sejour: "Le séjour",
      parentale: "La chambre parentale",
      cuisine: "La cuisine équipée",
      enfants: "La chambre d'enfants",
      sdb: "La salle de bains",
      commerces: "Les commerces",
    },
    phase1Eyebrow: (year) => `Riad Garden I · livré en ${year}`,
    phase1Title: (m) => `La première tranche est livrée, à ${m} mètres.`,
    phase1Body:
      "Mêmes équipes, mêmes finitions. Des familles y vivent déjà : venez la voir avant de vous engager sur Riad Garden II.",
    photoNote: (year) => `Photographie — Riad Garden I, livré en ${year}`,
    amenitiesLabel: "Sur place",
    amenities: {
      piscine: "Piscine",
      spa: "Spa",
      mosquee: "Mosquée",
      commerces: "Commerces",
      "centre-commercial": "Centre commercial",
      "parking-sous-sol": "Parking en sous-sol",
      ascenseur: "Ascenseur",
      "espaces-verts": "Jardins plantés",
      "vue-montagne": "Vue sur les montagnes",
      securite: "Sécurité",
    },
    ctaProject: "Tout sur Riad Garden II",
  },
  ar: {
    eyebrow: "مشروعنا الجديد",
    deck: "الشطر الثاني من رياض غاردن. شقق بغرفتين وثلاث غرف حول مسبح وحدائق مغروسة، مع فضاء للعافية ومرآب تحت أرضي ومحلات تجارية أسفل العمارات.",
    specFrom: "ابتداءً من",
    specSurface: "المساحات",
    specBedrooms: "الغرف",
    specHeight: "الارتفاع",
    specDelivery: "التسليم",
    renderNote: "تصوّر — صورة غير تعاقدية",
    stripTitle: "الداخل، غرفةً غرفة.",
    stripLead: "الشقق النموذجية بتصوّر رقمي. ويمكن زيارتها أيضاً بتقنية 360 درجة من صفحة المشروع.",
    rooms: {
      sejour: "الصالون",
      parentale: "غرفة النوم الرئيسية",
      cuisine: "المطبخ المجهّز",
      enfants: "غرفة الأطفال",
      sdb: "الحمام",
      commerces: "المحلات التجارية",
    },
    phase1Eyebrow: (year) => `رياض غاردن 1 · سُلّم سنة ${year}`,
    phase1Title: (m) => `الشطر الأول مُسلَّم، على بعد ${m} متر.`,
    phase1Body:
      "نفس الفرق، نفس التشطيبات. عائلات تسكنه اليوم: تعالوا لرؤيته قبل الالتزام برياض غاردن 2.",
    photoNote: (year) => `صورة — رياض غاردن 1، سُلّم سنة ${year}`,
    amenitiesLabel: "في عين المكان",
    amenities: {
      piscine: "مسبح",
      spa: "فضاء للعافية",
      mosquee: "مسجد",
      commerces: "محلات تجارية",
      "centre-commercial": "مركز تجاري",
      "parking-sous-sol": "مرآب تحت أرضي",
      ascenseur: "مصعد",
      "espaces-verts": "حدائق مغروسة",
      "vue-montagne": "إطلالة على الجبال",
      securite: "حراسة وأمن",
    },
    ctaProject: "كل شيء عن رياض غاردن 2",
  },
};
