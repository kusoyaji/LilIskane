import type { Copy } from "./shared";
import { company } from "@/data/company";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";

/**
 * Copy for /a-propos.
 *
 * Every figure is read from `src/data/company.ts` rather than typed here, so the
 * page cannot drift from the single source of facts. Years go through
 * `isolateRun` (no grouping: "1948", never "1 948"); counts go through
 * `formatNumber`. The source text is the client's own "Chaabi Lil Iskane" page,
 * rewritten — the facts are theirs, the voice is ours.
 */

const y = (year: number, locale: Locale) => isolateRun(String(year), locale);

const build = (l: Locale) => ({
  units: formatNumber(company.essaouira.units, l),
  ha: formatNumber(company.essaouira.hectares, l),
  founded: y(company.founded, l),
  iso: y(company.isoSince, l),
  iso2015: y(company.iso2015Since, l),
  prize: y(company.arabLeaguePrize, l),
  gold: y(company.goldLaunch, l),
});
const fr = build("fr");
const ar = build("ar");

type Item = { title: string; note: string };

export const about: Copy<{
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  hero: { eyebrow: string; title: string; lead: string; caption: string };
  who: {
    eyebrow: string;
    title: string;
    p1: string;
    p2: string;
    trades: Item[];
    tradesLabel: string;
    delivery: string;
    deliveryNote: string;
    stats: { founded: string; years: string; cities: string; units: string };
  };
  chrono: {
    eyebrow: string;
    title: string;
    /** One-word chapter per milestone, keyed by year. Our framing, not a fact. */
    chapters: Record<number, string>;
    /**
     * A sentence appended to a milestone's own text, keyed by year. Holds what
     * the former "Certifications & distinctions" block said that the ten dates
     * did not (that block otherwise repeated 2003, 2005 and 2025 word for word).
     */
    addenda: Record<number, string>;
    jump: string;
    of: string;
  };
  next: { eyebrow: string; title: string; body: string; cta: string; renderNote: string };
  values: { eyebrow: string; title: string; lead: string; caption: string };
  guarantees: {
    eyebrow: string;
    title: string;
    lead: string;
    /** Unit after the figure; Arabic needs the dual for 2 ("سنتان"). */
    unit: (years: number) => string;
    scale: string;
    after: string;
    sav: string;
    guide: string;
  };
}> = {
  fr: {
    metaTitle: "Chaabi Lil Iskane — bâtisseurs depuis 1948",
    metaDescription: `Filiale du Groupe Ynna, Chaabi Lil Iskane conçoit et livre des logements au Maroc depuis ${fr.founded} : plus de 75 ans d'expérience, ISO 9001 depuis ${fr.iso}, 1er Prix de la Ligue Arabe de l'Habitat en ${fr.prize}.`,
    crumb: "Chaabi Lil Iskane",
    hero: {
      eyebrow: "Chaabi Lil Iskane · Groupe Ynna",
      title: `Bâtisseurs depuis ${fr.founded}.`,
      lead: "Plus de 75 ans de promotion immobilière au Maroc. Du logement économique au haut standing, d'une ville nouvelle à Essaouira aux résidences de Marrakech — avec la même exigence, de la conception à la livraison.",
      caption: "Riad Garden I, Marrakech · la piscine, après livraison",
    },
    who: {
      eyebrow: "Qui sommes-nous",
      title: "De la conception à la livraison, un seul métier.",
      p1: `Filiale du Groupe Ynna, Chaabi Lil Iskane est une référence de la promotion immobilière au Maroc depuis ${fr.founded}. Nous concevons et développons des programmes résidentiels — économique, moyen et haut standing — ainsi que des projets d'immobilier d'entreprise et industriel, au Maroc et à l'international.`,
      p2: "De l'aménagement à la construction, des équipes pluridisciplinaires pilotent chaque projet avec la même exigence : qualité d'exécution, maîtrise des délais, sécurité, respect de l'environnement. Notre ambition : des cadres de vie et de travail attractifs, un meilleur équilibre qualité/prix, et un accompagnement de proximité à chaque étape.",
      tradesLabel: "Nos métiers",
      trades: [
        { title: "Résidentiel économique", note: "Une offre adaptée en 2024 à l'aide directe au logement" },
        { title: "Moyen standing", note: "Programmes à Tanger, Mohammedia, Essaouira et Témara" },
        { title: "Haut standing", note: `La marque Chaabi Lil Iskane GOLD, depuis ${fr.gold}` },
        { title: "Immobilier d'entreprise", note: "Bureaux, commerces, équipements, hôtellerie, sites industriels" },
      ],
      delivery: "Livrer",
      deliveryNote: "Riad Garden I, Marrakech · la façade, après livraison",
      stats: {
        founded: "Création de l'AFCA, structure fondatrice",
        years: "ans d'expérience",
        cities: "villes du Royaume",
        units: `logements environ à Essaouira El Jadida, sur ${fr.ha} hectares`,
      },
    },
    chrono: {
      eyebrow: "Dates clés",
      title: `De ${fr.founded} à 2025, dix dates.`,
      chapters: {
        1948: "Fondation",
        2000: "Urbanisme",
        2002: "Engagement",
        2003: "Distinction",
        2004: "Solidarité",
        2005: "Qualité",
        2006: "International",
        2013: "Haut standing",
        2024: "Accession",
        2025: "Environnement",
      },
      addenda: {
        [company.isoSince]: `En ${fr.iso2015}, le système est aligné sur la version ISO 9001:2015.`,
      },
      jump: "Aller à l'année",
      of: "sur",
    },
    next: {
      eyebrow: "Aujourd'hui",
      title: "La suite s'écrit à Marrakech.",
      body: "Riad Garden II, deuxième tranche de Riad Garden, sur la même avenue que la première. En lancement.",
      cta: "Découvrir Riad Garden II",
      renderNote: "Rendu — image non contractuelle",
    },
    values: {
      eyebrow: "Nos valeurs",
      title: "Quatre valeurs, depuis la création.",
      lead: "Elles orientent nos décisions au quotidien et forment le socle commun de toutes nos équipes.",
      caption: "Riad Garden I · chambre et salle d'eau d'un appartement livré",
    },
    guarantees: {
      eyebrow: "Garanties & durabilité",
      title: "Des garanties légales, jusqu'à dix ans après la réception.",
      lead: "Acheter un logement est une étape majeure. Chaque bien est protégé par les garanties prévues par le cadre légal marocain, à compter de la réception des travaux.",
      unit: (n) => (n === 1 ? "an" : "ans"),
      scale: "Durée de couverture après réception",
      after: "après réception",
      sav: "En complément, un service après-vente structuré — réserves, interventions correctives, suivi — pour une prise en charge rapide et traçable.",
      guide: "Lire le guide d'achat",
    },
  },
  ar: {
    metaTitle: "الشعبي للإسكان — نبني منذ 1948",
    metaDescription: `الشعبي للإسكان، فرع مجموعة ينا، يصمّم ويسلّم المساكن بالمغرب منذ ${ar.founded}: أكثر من 75 سنة من الخبرة، شهادة إيزو 9001 منذ ${ar.iso}، والجائزة الأولى للجامعة العربية للإسكان سنة ${ar.prize}.`,
    crumb: "الشعبي للإسكان",
    hero: {
      eyebrow: "الشعبي للإسكان · مجموعة ينا",
      title: `نبني منذ ${ar.founded}.`,
      lead: "أكثر من 75 سنة من الإنعاش العقاري بالمغرب. من السكن الاقتصادي إلى السكن الراقي، ومن مدينة جديدة بالصويرة إلى إقامات مراكش — بالصرامة نفسها، من التصميم إلى التسليم.",
      caption: "رياض غاردن 1، مراكش · المسبح بعد التسليم",
    },
    who: {
      eyebrow: "من نحن",
      title: "من التصميم إلى التسليم، مهنة واحدة.",
      p1: `الشعبي للإسكان، فرع مجموعة ينا، مرجع في الإنعاش العقاري بالمغرب منذ ${ar.founded}. نصمّم ونطوّر مشاريع سكنية — اقتصادية ومتوسطة وراقية — إلى جانب مشاريع عقار المقاولات والعقار الصناعي، داخل المغرب وخارجه.`,
      p2: "من التهيئة إلى البناء، تقود فرق متعددة التخصصات كل مشروع بالصرامة ذاتها: جودة التنفيذ، والتحكم في الآجال، والسلامة، واحترام البيئة. طموحنا: فضاءات عيش وعمل جذابة، وتوازن أفضل بين الجودة والثمن، ومواكبة قريبة لزبنائنا في كل مرحلة.",
      tradesLabel: "مهننا",
      trades: [
        { title: "السكن الاقتصادي", note: `عرض مُلاءَم سنة ${y(2024, "ar")} مع برنامج الدعم المباشر للسكن` },
        { title: "السكن المتوسط", note: "مشاريع بطنجة والمحمدية والصويرة وتمارة" },
        { title: "السكن الراقي", note: `علامة الشعبي للإسكان GOLD منذ ${ar.gold}` },
        { title: "عقار المقاولات", note: "مكاتب، محلات تجارية، تجهيزات، فنادق، مواقع صناعية" },
      ],
      delivery: "نسلّم",
      deliveryNote: "رياض غاردن 1، مراكش · الواجهة بعد التسليم",
      stats: {
        founded: "تأسيس الجمعية العقارية والتجارية الإفريقية، النواة الأولى",
        years: "سنة من الخبرة",
        cities: "مدينة عبر المملكة",
        units: `مسكن تقريباً بالصويرة الجديدة، على ${ar.ha} هكتاراً`,
      },
    },
    chrono: {
      eyebrow: "تواريخ مفصلية",
      title: `من ${ar.founded} إلى ${y(2025, "ar")}، عشرة تواريخ.`,
      chapters: {
        1948: "التأسيس",
        2000: "التعمير",
        2002: "الالتزام",
        2003: "التتويج",
        2004: "التضامن",
        2005: "الجودة",
        2006: "الانفتاح الدولي",
        2013: "السكن الراقي",
        2024: "الولوج إلى الملكية",
        2025: "البيئة",
      },
      addenda: {
        [company.isoSince]: `وفي ${ar.iso2015}، تمت ملاءمة النظام مع صيغة ISO 9001:2015.`,
      },
      jump: "الانتقال إلى سنة",
      of: "من",
    },
    next: {
      eyebrow: "اليوم",
      title: "والحكاية تتواصل في مراكش.",
      body: "رياض غاردن 2، الشطر الثاني من رياض غاردن، على الشارع نفسه الذي يقع عليه الشطر الأول. في طور الإطلاق.",
      cta: "اكتشفوا رياض غاردن 2",
      renderNote: "تصوّر — صورة غير تعاقدية",
    },
    values: {
      eyebrow: "قيمنا",
      title: "أربع قيم، منذ التأسيس.",
      lead: "توجّه قراراتنا اليومية، وتشكّل الأساس المشترك لكل فرقنا.",
      caption: "رياض غاردن 1 · غرفة نوم وحمّام في شقة مُسلَّمة",
    },
    guarantees: {
      eyebrow: "الضمانات والاستدامة",
      title: "ضمانات قانونية تصل إلى عشر سنوات بعد تسلّم الأشغال.",
      lead: "اقتناء مسكن خطوة كبرى. لذلك يحظى كل عقار بالضمانات التي ينص عليها الإطار القانوني المغربي، ابتداءً من تسلّم الأشغال.",
      unit: (n) => (n === 1 ? "سنة" : n === 2 ? "سنتان" : "سنوات"),
      scale: "مدة الضمان بعد التسلّم",
      after: "بعد التسلّم",
      sav: "وإلى جانب هذه الضمانات، خدمة ما بعد البيع منظَّمة — تحفّظات، وتدخلات تصحيحية، وتتبّع — لتكفّل سريع وقابل للتتبع.",
      guide: "اطّلعوا على دليل الشراء",
    },
  },
};
