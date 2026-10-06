import type { Copy } from "./shared";

/**
 * Copy for the budget finder, the home's third way into the search.
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
  /** `{total}` = what the current search finds, budget aside. */
  countOfSearch: string;
  /** The results chip the finder sets: `{price}` = its ceiling, `{monthly}` = the payment. */
  chip: string;
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
    countOfSearch: "sur {total} pour votre recherche",
    chip: "≤ {price} DH · {monthly} DH/mois",
    scaleLabel: "Les programmes, du plus accessible au plus haut",
    scaleYou: "Votre plafond",
    bestMatches: "Les plus proches de votre budget",
    closestMatches: "Les plus accessibles",
    from: "à partir de",
    render: "Rendu",
    plot: "Lot de terrain",
    relaxed:
      "Aucun programme ne tient encore dans ce budget. Voici les plus accessibles — un apport plus élevé ou une durée plus longue les rapproche.",
    cta: "Voir les {n} programmes",
    ctaOne: "Voir le programme",
    disclaimer:
      "Simulation indicative, sans valeur d'offre de crédit. Les conditions réelles dépendent de votre banque et de votre dossier. Visuels marqués « Rendu » : images non contractuelles.",
    basis: "Base de calcul : taux {rate} %, assurance {ins} % par an incluse.",
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
    countOfSearch: "من أصل {total} حسب بحثكم",
    chip: "حتى {price} درهم · {monthly} درهم شهرياً",
    scaleLabel: "المشاريع، من الأقل ثمناً إلى الأعلى",
    scaleYou: "سقفكم",
    bestMatches: "الأقرب إلى ميزانيتكم",
    closestMatches: "الأقل ثمناً",
    from: "ابتداءً من",
    render: "تصوّر",
    plot: "بقعة أرضية",
    relaxed:
      "لا يوجد بعد مشروع ضمن هذه الميزانية. إليكم الأقل ثمناً — مساهمة أكبر أو مدة أطول تقرّبكم منها.",
    cta: "عرض المشاريع ({n})",
    ctaOne: "عرض المشروع",
    disclaimer:
      "محاكاة إرشادية لا تُعدّ عرض قرض. تتوقف الشروط الفعلية على بنككم وملفكم. الصور المعلَّمة «تصوّر»: صور غير تعاقدية.",
    basis: "أساس الحساب: نسبة فائدة {rate}٪، مع احتساب تأمين {ins}٪ سنوياً.",
  },
};
