import type { Copy } from "./shared";

/**
 * Copy for the end of the home page: the budget finder and the services grid.
 *
 * Nothing here states a figure about the company. The only numbers are the
 * simulator's own assumptions, which come from `CREDIT_DEFAULTS` in
 * `src/lib/credit.ts` and are interpolated at render time — never typed in.
 */

export type BudgetCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  monthlyLabel: string;
  perMonth: string;
  currency: string;
  perSqm: string;
  depositLabel: string;
  depositHint: string;
  durationLabel: string;
  years: string;
  ceilingLabel: string;
  ceilingNote: string;
  /** `{n}` = matching count, `{total}` = portfolio size. */
  /** 0 or 1 (French and Arabic both take the singular there). */
  countOne: string;
  countTwo: string;
  /** 3–10. */
  countFew: string;
  /** 11 and over. */
  countMany: string;
  countOf: string;
  scaleLabel: string;
  scaleYou: string;
  bestMatches: string;
  closestMatches: string;
  from: string;
  render: string;
  plot: string;
  relaxed: string;
  /** `{n}` = count. */
  cta: string;
  ctaOne: string;
  disclaimer: string;
  /** `{rate}`, `{ins}` are filled from CREDIT_DEFAULTS. */
  basis: string;
  sliderMinLabel: string;
  sliderMaxLabel: string;
};

export const budgetCopy: Copy<BudgetCopy> = {
  fr: {
    eyebrow: "Votre budget",
    title: "Partez de ce que vous payez chaque mois.",
    lead:
      "Personne ne connaît son budget en prix de vente. Tout le monde connaît sa mensualité. Réglez-la : le prix accessible et les programmes qui y répondent s'affichent aussitôt.",
    monthlyLabel: "Mensualité",
    perMonth: "DH / mois",
    currency: "DH",
    perSqm: "DH/m²",
    depositLabel: "Apport personnel",
    depositHint: "Montant versé sans crédit",
    durationLabel: "Durée du crédit",
    years: "ans",
    ceilingLabel: "Prix accessible, jusqu'à",
    ceilingNote: "Mensualité, apport et durée compris.",
    countOne: "programme à votre portée",
    countTwo: "programmes à votre portée",
    countFew: "programmes à votre portée",
    countMany: "programmes à votre portée",
    countOf: "sur {total}",
    scaleLabel: "Les programmes, du plus accessible au plus haut",
    scaleYou: "Votre plafond",
    bestMatches: "Les plus proches de votre budget",
    closestMatches: "Les plus accessibles",
    from: "à partir de",
    render: "Rendu",
    plot: "Lot de terrain",
    relaxed:
      "Aucun programme ne tient encore dans ce budget. Voici les plus accessibles — un apport plus élevé ou une durée plus longue les rapproche.",
    cta: "Voir les {n} projets",
    ctaOne: "Voir le projet",
    disclaimer:
      "Simulation indicative, sans valeur d'offre de crédit. Les conditions réelles dépendent de votre banque et de votre dossier. Visuels marqués « Rendu » : images non contractuelles.",
    basis: "Base de calcul : taux {rate} %, assurance {ins} % par an incluse.",
    sliderMinLabel: "2 000",
    sliderMaxLabel: "20 000",
  },
  ar: {
    eyebrow: "ميزانيتكم",
    title: "انطلقوا مما تدفعونه كل شهر.",
    lead:
      "لا أحد يعرف ميزانيته بثمن البيع، لكن الجميع يعرف قسطه الشهري. حدّدوه، فيظهر فوراً الثمن الممكن والمشاريع التي تناسبه.",
    monthlyLabel: "القسط الشهري",
    perMonth: "درهم في الشهر",
    currency: "درهم",
    perSqm: "درهم/م²",
    depositLabel: "المساهمة الشخصية",
    depositHint: "المبلغ المدفوع دون قرض",
    durationLabel: "مدة القرض",
    years: "سنة",
    ceilingLabel: "الثمن الممكن، حتى",
    ceilingNote: "باحتساب القسط والمساهمة والمدة.",
    countOne: "مشروع في متناولكم",
    countTwo: "مشروعان في متناولكم",
    countFew: "مشاريع في متناولكم",
    countMany: "مشروعاً في متناولكم",
    countOf: "من أصل {total}",
    scaleLabel: "المشاريع، من الأقل ثمناً إلى الأعلى",
    scaleYou: "سقفكم",
    bestMatches: "الأقرب إلى ميزانيتكم",
    closestMatches: "الأقل ثمناً",
    from: "ابتداءً من",
    render: "تصور",
    plot: "بقعة أرضية",
    relaxed:
      "لا يوجد بعد مشروع ضمن هذه الميزانية. إليكم الأقل ثمناً — مساهمة أكبر أو مدة أطول تقرّبكم منها.",
    cta: "عرض المشاريع ({n})",
    ctaOne: "عرض المشروع",
    disclaimer:
      "محاكاة إرشادية لا تُعدّ عرض قرض. تتوقف الشروط الفعلية على بنككم وملفكم. الصور المعلَّمة «تصور»: صور غير تعاقدية.",
    basis: "أساس الحساب: نسبة فائدة {rate}٪، مع احتساب تأمين {ins}٪ سنوياً.",
    sliderMinLabel: "2 000",
    sliderMaxLabel: "20 000",
  },
};

export type ServiceEntry = {
  title: string;
  body: string;
  action: string;
  caption?: string;
};

export type ServicesCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  guide: ServiceEntry;
  simulator: ServiceEntry & { words: [string, string, string] };
  tours: ServiceEntry;
  visit: ServiceEntry;
  guaranteesEyebrow: string;
  guaranteesTitle: string;
  guaranteesLead: string;
  /** Unit after the big numeral, by number of years. */
  unit: (years: number) => string;
};

export const servicesCopy: Copy<ServicesCopy> = {
  fr: {
    eyebrow: "Accompagnement",
    title: "De la première visite à la remise des clés.",
    lead:
      "Acheter un logement est la décision d'une vie. À chaque étape, un outil précis ou un interlocuteur — jamais une impasse.",
    guide: {
      title: "Guide d'achat",
      body: "Les étapes d'un achat sur plan, du choix du programme à la signature chez le notaire et au PV de livraison.",
      action: "Lire le guide",
      caption: "Riad Garden I, livré",
    },
    simulator: {
      title: "Simulateur de crédit",
      body: "Votre mensualité, votre apport, votre durée : le coût réel de votre crédit, poste par poste.",
      action: "Simuler",
      words: ["Mensualité", "Apport", "Durée"],
    },
    tours: {
      title: "Visites virtuelles 360°",
      body: "Parcourez les appartements témoins de Riad Garden II, et un appartement déjà livré, depuis chez vous.",
      action: "Lancer une visite",
      caption: "Appartement livré, Riad Garden I",
    },
    visit: {
      title: "Prendre rendez-vous",
      body: "Un conseiller vous reçoit en agence ou à distance, et vous fait visiter l'appartement témoin.",
      action: "Choisir un créneau",
      caption: "Riad Garden I, livré",
    },
    guaranteesEyebrow: "Après la livraison",
    guaranteesTitle: "Trois garanties vous couvrent.",
    guaranteesLead: "Les garanties légales qui accompagnent chaque logement remis.",
    unit: (years) => (years > 1 ? "ans" : "an"),
  },
  ar: {
    eyebrow: "المواكبة",
    title: "من الزيارة الأولى إلى تسليم المفاتيح.",
    lead: "شراء مسكن قرار العمر. في كل مرحلة أداة دقيقة أو محاور مختص — لا طريق مسدود أبداً.",
    guide: {
      title: "دليل الشراء",
      body: "مراحل الشراء على التصميم، من اختيار المشروع إلى التوقيع لدى الموثق ومحضر التسليم.",
      action: "قراءة الدليل",
      caption: "رياض غاردن 1، مُسلَّم",
    },
    simulator: {
      title: "محاكي القرض",
      body: "قسطكم الشهري ومساهمتكم ومدة القرض: الكلفة الحقيقية لقرضكم، بنداً بنداً.",
      action: "إجراء المحاكاة",
      words: ["القسط", "المساهمة", "المدة"],
    },
    tours: {
      title: "زيارات افتراضية 360°",
      body: "تجوّلوا في الشقق النموذجية لرياض غاردن 2، وفي شقة سبق تسليمها، من منازلكم.",
      action: "بدء الزيارة",
      caption: "شقة مُسلَّمة، رياض غاردن 1",
    },
    visit: {
      title: "حجز موعد",
      body: "يستقبلكم مستشار في الوكالة أو عن بُعد، ويرافقكم لزيارة الشقة النموذجية.",
      action: "اختيار موعد",
      caption: "رياض غاردن 1، مُسلَّم",
    },
    guaranteesEyebrow: "بعد التسليم",
    guaranteesTitle: "ثلاث ضمانات تحميكم.",
    guaranteesLead: "الضمانات القانونية التي ترافق كل مسكن يتم تسليمه.",
    unit: (years) => (years === 1 ? "سنة" : years === 2 ? "سنتان" : "سنوات"),
  },
};
