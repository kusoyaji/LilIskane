import type { Copy } from "./shared";

/**
 * Guide d'achat — merges three of the client's own pages (guide d'achat,
 * financement, conventions et partenariats) into one path.
 *
 * Every statement below is a rewrite of the client's texts (liliskane.com,
 * read 2026-10-05) or of `src/data/company.ts`. No partner, rate, amount or
 * delay has been added. Numbers that must appear inside a sentence are passed
 * in already formatted, so the Arabic build can isolate them.
 */

export type GuideStep = {
  /** 0 = préparer, 1 = vérifier, 2 = signer et emménager. */
  phase: 0 | 1 | 2;
  short: string;
  title: string;
  lead: string;
  body: string;
  listTitle: string;
  list: string[];
};

type GuideCopy = {
  meta: { title: string; description: string };
  crumb: string;
  hero: { eyebrow: string; title: string; lead: string; simulate: string };
  renderNote: string;
  pillars: {
    eyebrow: string;
    title: string;
    stepsLabel: string;
    items: { title: string; body: string; steps: number[] }[];
    caption: string;
  };
  index: { label: string; step: string; of: string; simulate: string };
  phases: [string, string, string];
  stepWord: string;
  steps: GuideStep[];
  stepLinks: { projects: string; simulate: string; guarantees: string };
  captions: { pool: string; bedroom: string; garden: string };
  sim: { eyebrow: string; title: string; lead: string };
  finance: {
    eyebrow: string;
    title: string;
    lead: string;
    ratioLow: string;
    ratioHigh: string;
    criteriaTitle: string;
    criteria: string[];
    compareTitle: string;
    compareBody: string;
    checkTitle: string;
    checks: string[];
    earlyLabel: string;
    aidEyebrow: string;
    aidTitle: string;
    aidBody: (year: string) => string;
    aidCta: string;
  };
  guarantees: {
    eyebrow: string;
    title: string;
    lead: string;
    unit: (years: number) => string;
  };
  conventions: {
    eyebrow: string;
    title: string;
    body: string;
    points: { label: string; text: string }[];
    cta: string;
  };
  cta: { title: string; body: string };
};

export const guide: Copy<GuideCopy> = {
  fr: {
    meta: {
      title: "Guide d'achat et financement",
      description:
        "Les huit étapes pour acheter un logement neuf au Maroc avec Chaabi Lil Iskane : budget, financement et simulateur de crédit, vérifications, signature chez le notaire, livraison et garanties.",
    },
    crumb: "Guide d'achat",
    hero: {
      eyebrow: "Guide d'achat",
      title: "De la première visite à la remise des clés.",
      lead: "Huit étapes pour acheter un logement neuf au Maroc, que vous y résidiez ou que vous viviez à l'étranger. Pour chacune : ce qu'il faut faire, et ce qu'il faut préparer.",
      simulate: "Simuler mon crédit",
    },
    renderNote: "Rendu — image non contractuelle",
    pillars: {
      eyebrow: "Notre approche",
      title: "Un achat réussi repose sur trois piliers.",
      stepsLabel: "Étapes",
      items: [
        {
          title: "Une information transparente",
          body: "Prix, surfaces, prestations, charges : vous décidez sur des éléments écrits et vérifiables.",
          steps: [1, 5, 6],
        },
        {
          title: "Une sécurisation juridique rigoureuse",
          body: "Le notaire vérifie la situation du bien et formalise la vente. Rien ne se signe sans être clair.",
          steps: [4, 7],
        },
        {
          title: "Un accompagnement de bout en bout",
          body: "De la définition de votre budget au suivi après livraison, nous vous accompagnons à chaque étape.",
          steps: [2, 3, 8],
        },
      ],
      caption: "Riad Garden I, Marrakech — photographié après sa livraison.",
    },
    index: { label: "Les huit étapes", step: "Étape", of: "sur", simulate: "Simuler mon crédit" },
    phases: ["Préparer", "Vérifier", "Signer et emménager"],
    stepWord: "Étape",
    steps: [
      {
        phase: 0,
        short: "Besoin et budget",
        title: "Définir votre besoin et votre budget global",
        lead: "Avant de visiter, posez votre projet et le montant que vous pouvez y consacrer, tout compris.",
        body: "Résidence ou investissement : la réponse change les critères qui comptent. Classez-les, puis chiffrez une enveloppe qui couvre bien plus que le prix affiché.",
        listTitle: "À préparer",
        list: [
          "Le type de projet : résidence ou investissement",
          "Vos critères prioritaires : surface, exposition, parking, prestations",
          "Une enveloppe « tout compris » : prix, frais d'acquisition, charges",
          "Le budget d'aménagement éventuel",
        ],
      },
      {
        phase: 0,
        short: "Choisir le programme",
        title: "Choisir le programme adapté à votre style de vie",
        lead: "Comparez les programmes sur ce qui fera la différence au quotidien.",
        body: "Visitez, comparez les plans, regardez les parties communes. Un bon programme se juge sur la vie qu'il permet et sur sa valeur dans le temps.",
        listTitle: "À comparer",
        list: [
          "L'emplacement et l'accessibilité",
          "Les services et la qualité des parties communes",
          "La distribution des plans",
          "Le standing réel des prestations",
          "Le potentiel de valorisation",
        ],
      },
      {
        phase: 0,
        short: "Préparer le financement",
        title: "Préparer votre financement",
        lead: "Connaissez votre capacité d'achat avant de vous engager.",
        body: "Faites une simulation, puis obtenez si besoin un pré-accord de votre banque. Réglez par des moyens traçables et gardez chaque justificatif : ils serviront pour vos démarches bancaires et administratives.",
        listTitle: "À préparer",
        list: [
          "Une simulation de votre mensualité",
          "Un pré-accord bancaire, si besoin",
          "Des paiements traçables",
          "Vos justificatifs, conservés et classés",
        ],
      },
      {
        phase: 1,
        short: "Situation juridique",
        title: "Vérifier la situation juridique du bien",
        lead: "Avant tout engagement, faites sécuriser les vérifications essentielles.",
        body: "Le notaire est votre allié pour fiabiliser chaque étape : il contrôle la propriété du bien et ce qui pourrait la grever.",
        listTitle: "À vérifier",
        list: ["La propriété du bien", "Les charges éventuelles qui le grèvent", "La situation du lot"],
      },
      {
        phase: 1,
        short: "Conformité et documents",
        title: "Contrôler la conformité et les documents",
        lead: "Assurez-vous que le bien sera livré dans un cadre conforme.",
        body: "Les plans doivent correspondre au lot, les documents administratifs requis doivent être réunis, et le contrat doit décrire précisément ce que vous recevez.",
        listTitle: "À vérifier",
        list: [
          "La cohérence entre les plans et le lot",
          "Les documents administratifs requis",
          "Les prestations et les surfaces au contrat",
          "Les annexes contractuelles",
        ],
      },
      {
        phase: 1,
        short: "Copropriété et charges",
        title: "Comprendre la copropriété et les charges",
        lead: "Ce que vous paierez chaque mois après l'achat compte autant que le prix.",
        body: "Demandez comment la résidence sera gérée et entretenue, et projetez les coûts, surtout pour l'ascenseur, la sécurité et la maintenance.",
        listTitle: "À demander",
        list: [
          "Le règlement de copropriété",
          "Le mode de gestion",
          "Le niveau des charges",
          "L'entretien et les équipements communs",
          "La projection des coûts dans le temps",
        ],
      },
      {
        phase: 2,
        short: "Signature chez le notaire",
        title: "Formaliser l'accord et sécuriser la signature",
        lead: "Tout doit être clair, écrit et aligné avant de signer.",
        body: "La signature chez le notaire formalise la transaction et sécurise vos droits.",
        listTitle: "À fixer par écrit",
        list: ["Le prix", "Les modalités de paiement", "Les délais", "Les conditions particulières"],
      },
      {
        phase: 2,
        short: "Livraison et garanties",
        title: "Livraison, procès-verbal, SAV et garanties",
        lead: "Le jour de la remise des clés, prenez le temps d'un contrôle complet.",
        body: "Consignez toute réserve dans le procès-verbal de livraison. Vous bénéficiez ensuite des garanties applicables et d'un service après-vente structuré pour le suivi.",
        listTitle: "Le jour de la livraison",
        list: [
          "Un contrôle complet du logement",
          "Les réserves consignées dans le PV",
          "Le suivi par le service après-vente",
        ],
      },
    ],
    stepLinks: {
      projects: "Explorer nos projets",
      simulate: "Simuler ma mensualité",
      guarantees: "Voir les garanties",
    },
    captions: {
      pool: "Piscine de Riad Garden I, Marrakech — photographiée après livraison.",
      bedroom: "Chambre d'un appartement livré, Riad Garden I — photographie.",
      garden: "Riad Garden II, Marrakech.",
    },
    sim: {
      eyebrow: "Simulateur de crédit",
      title: "Simulez votre mensualité.",
      lead: "Indiquez le prix du bien et votre apport, choisissez la durée : la mensualité, l'assurance estimée et le coût total du crédit s'affichent aussitôt. Sans inscription.",
    },
    finance: {
      eyebrow: "Financement",
      title: "Ce que regarde votre banque.",
      lead: "Sauf achat au comptant, vous financerez votre logement par un crédit immobilier. Au Maroc, la banque évalue d'abord votre capacité d'endettement et votre reste à vivre.",
      ratioLow: "Taux d'endettement autour duquel certaines banques recommandent de rester.",
      ratioHigh: "Taux généralement toléré par d'autres, parfois davantage selon le dossier.",
      criteriaTitle: "Pour fixer le taux, la durée, la quotité et les garanties, le prêteur analyse :",
      criteria: [
        "Votre stabilité professionnelle et votre ancienneté",
        "Le niveau, la régularité et la traçabilité de vos revenus",
        "Vos crédits et engagements en cours",
        "Votre apport personnel et votre épargne",
        "La durée du financement et votre capacité d'épargne mensuelle",
        "Pour les MRE : la nature des revenus à l'étranger, les justificatifs et l'historique bancaire",
      ],
      compareTitle: "Comparez le coût total, pas seulement le taux.",
      compareBody:
        "Le taux nominal ne suffit pas. Demandez un chiffrage complet avec le taux effectif global (TEG), qui intègre les frais et accessoires du crédit : frais de dossier, assurances…",
      checkTitle: "À vérifier avant de signer",
      checks: [
        "Les frais de dossier, de garantie (hypothèque) et d'assurance",
        "La possibilité de moduler vos échéances",
        "Les conditions de remboursement anticipé",
      ],
      earlyLabel:
        "Du capital restant dû, au maximum : l'indemnité de remboursement anticipé correspond généralement à un mois d'intérêts, sans pouvoir dépasser ce plafond, selon la réglementation.",
      aidEyebrow: "Aide directe au logement",
      aidTitle: "Une offre adaptée à l'aide directe au logement.",
      aidBody: (year) =>
        `Depuis ${year}, notre offre est adaptée dans plusieurs villes pour permettre à nos clients d'être éligibles au programme d'aide directe au logement. Demandez à un conseiller quels programmes sont concernés.`,
      aidCta: "Poser la question",
    },
    guarantees: {
      eyebrow: "Garanties",
      title: "Après la remise des clés, vous restez couvert.",
      lead: "Les garanties légales courent à compter de la réception des travaux ; un service après-vente structuré assure le suivi.",
      unit: (years) => (years > 1 ? "ans" : "an"),
    },
    conventions: {
      eyebrow: "Conventions et partenariats",
      title: "Des conditions réservées aux membres de nos partenaires.",
      body: "Nos partenariats reposent sur un intérêt commun : nous les construisons pour un développement réciproque et équilibré.",
      points: [
        { label: "Pour qui", text: "Les dirigeants et les adhérents des organisations partenaires" },
        { label: "Ce qu'ils obtiennent", text: "Des tarifs préférentiels et des offres avantageuses" },
        { label: "Sur quoi", text: "Plusieurs de nos programmes résidentiels et professionnels" },
      ],
      cta: "Proposer une convention",
    },
    cta: {
      title: "Un conseiller, à chaque étape.",
      body: "De la première simulation à la remise des clés : prenez rendez-vous, ou appelez-nous.",
    },
  },

  ar: {
    meta: {
      title: "دليل الشراء والتمويل",
      description:
        "المراحل الثماني لشراء مسكن جديد بالمغرب مع الشعبي للإسكان: الميزانية، التمويل ومحاكي القرض، التحققات، التوقيع لدى الموثق، التسليم والضمانات.",
    },
    crumb: "دليل الشراء",
    hero: {
      eyebrow: "دليل الشراء",
      title: "من الزيارة الأولى إلى تسلّم المفاتيح.",
      lead: "ثماني مراحل لشراء مسكن جديد بالمغرب، سواء كنتم مقيمين فيه أو في الخارج. لكل مرحلة: ما يجب فعله، وما يجب تحضيره.",
      simulate: "احسبوا قرضكم",
    },
    renderNote: "تصوّر — صورة غير تعاقدية",
    pillars: {
      eyebrow: "مقاربتنا",
      title: "الشراء الناجح يقوم على ثلاث ركائز.",
      stepsLabel: "المراحل",
      items: [
        {
          title: "معلومة شفافة",
          body: "الثمن والمساحات والتجهيزات والتكاليف: تتخذون قراركم بناءً على معطيات مكتوبة وقابلة للتحقق.",
          steps: [1, 5, 6],
        },
        {
          title: "أمان قانوني تام",
          body: "يتحقق الموثّق من وضعية العقار ويُضفي الطابع الرسمي على البيع. لا شيء يُوقَّع دون أن يكون واضحاً.",
          steps: [4, 7],
        },
        {
          title: "مواكبة من البداية إلى النهاية",
          body: "من تحديد ميزانيتكم إلى المتابعة بعد التسليم، نرافقكم في كل مرحلة.",
          steps: [2, 3, 8],
        },
      ],
      caption: "رياض غاردن 1، مراكش — صورة بعد تسليمه.",
    },
    index: { label: "المراحل الثماني", step: "المرحلة", of: "من", simulate: "احسبوا قرضكم" },
    phases: ["التحضير", "التحقق", "التوقيع والسكن"],
    stepWord: "المرحلة",
    steps: [
      {
        phase: 0,
        short: "الحاجة والميزانية",
        title: "حدّدوا حاجتكم وميزانيتكم الإجمالية",
        lead: "قبل الزيارة، حدّدوا مشروعكم والمبلغ الذي يمكنكم تخصيصه له، بكل التكاليف.",
        body: "سكن أم استثمار: الجواب يغيّر المعايير التي تهمّ. رتّبوها، ثم احسبوا ميزانية تغطي أكثر بكثير من الثمن المعلن.",
        listTitle: "ما يجب تحضيره",
        list: [
          "نوع المشروع: سكن أم استثمار",
          "معاييركم الأساسية: المساحة، التوجّه، موقف السيارات، التجهيزات",
          "ميزانية شاملة: الثمن، مصاريف الاقتناء، التكاليف",
          "ميزانية التهيئة المحتملة",
        ],
      },
      {
        phase: 0,
        short: "اختيار المشروع",
        title: "اختاروا المشروع الملائم لنمط حياتكم",
        lead: "قارنوا المشاريع بما سيصنع الفرق في حياتكم اليومية.",
        body: "زوروا، قارنوا التصاميم، وتفقّدوا الأجزاء المشتركة. يُقاس المشروع الجيد بالحياة التي يتيحها وبقيمته مع مرور الزمن.",
        listTitle: "ما يجب مقارنته",
        list: [
          "الموقع وسهولة الولوج",
          "الخدمات وجودة الأجزاء المشتركة",
          "توزيع التصاميم",
          "المستوى الفعلي للتجهيزات",
          "إمكانية ارتفاع القيمة",
        ],
      },
      {
        phase: 0,
        short: "تحضير التمويل",
        title: "حضّروا تمويلكم",
        lead: "اعرفوا قدرتكم على الشراء قبل أي التزام.",
        body: "أنجزوا محاكاة، ثم احصلوا عند الحاجة على موافقة مبدئية من البنك. ادفعوا بوسائل قابلة للتتبع واحتفظوا بكل وثيقة إثبات: ستفيدكم في إجراءاتكم البنكية والإدارية.",
        listTitle: "ما يجب تحضيره",
        list: [
          "محاكاة لقسطكم الشهري",
          "موافقة بنكية مبدئية عند الحاجة",
          "أداءات قابلة للتتبع",
          "وثائق الإثبات، محفوظة ومرتّبة",
        ],
      },
      {
        phase: 1,
        short: "الوضعية القانونية",
        title: "تحقّقوا من الوضعية القانونية للعقار",
        lead: "قبل أي التزام، احرصوا على إجراء التحققات الأساسية.",
        body: "الموثّق حليفكم لتأمين كل مرحلة: يتحقق من ملكية العقار ومما قد يُثقله من تحمّلات.",
        listTitle: "ما يجب التحقق منه",
        list: ["ملكية العقار", "التحمّلات المحتملة عليه", "وضعية القطعة"],
      },
      {
        phase: 1,
        short: "المطابقة والوثائق",
        title: "راقبوا المطابقة والوثائق",
        lead: "تأكّدوا من أن العقار سيُسلَّم في إطار مطابق.",
        body: "يجب أن تتطابق التصاميم مع القطعة، وأن تكتمل الوثائق الإدارية المطلوبة، وأن يصف العقد بدقة ما ستتسلّمونه.",
        listTitle: "ما يجب التحقق منه",
        list: [
          "تطابق التصاميم مع القطعة",
          "الوثائق الإدارية المطلوبة",
          "التجهيزات والمساحات في العقد",
          "ملحقات العقد",
        ],
      },
      {
        phase: 1,
        short: "الملكية المشتركة والتكاليف",
        title: "افهموا الملكية المشتركة وتكاليفها",
        lead: "ما ستدفعونه كل شهر بعد الشراء لا يقل أهمية عن الثمن.",
        body: "اسألوا عن طريقة تسيير الإقامة وصيانتها، وتوقّعوا التكاليف، خاصة للمصعد والأمن والصيانة.",
        listTitle: "ما يجب طلبه",
        list: [
          "نظام الملكية المشتركة",
          "طريقة التسيير",
          "مستوى التكاليف المشتركة",
          "الصيانة والتجهيزات المشتركة",
          "توقّع التكاليف على المدى البعيد",
        ],
      },
      {
        phase: 2,
        short: "التوقيع لدى الموثق",
        title: "اتفقوا كتابةً ووقّعوا بأمان",
        lead: "كل شيء يجب أن يكون واضحاً ومكتوباً ومتّفقاً عليه قبل التوقيع.",
        body: "التوقيع لدى الموثّق يُضفي الطابع الرسمي على المعاملة ويحمي حقوقكم.",
        listTitle: "ما يجب تثبيته كتابةً",
        list: ["الثمن", "طرق الأداء", "الآجال", "الشروط الخاصة"],
      },
      {
        phase: 2,
        short: "التسليم والضمانات",
        title: "تسلّموا مسكنكم وتابعوا الضمانات",
        lead: "يوم تسلّم المفاتيح، خذوا الوقت لمعاينة شاملة.",
        body: "دوّنوا كل تحفّظ في محضر التسليم. بعد ذلك، تستفيدون من الضمانات المعمول بها ومن خدمة ما بعد البيع المنظّمة للمتابعة.",
        listTitle: "يوم التسليم",
        list: ["معاينة شاملة للمسكن", "تدوين التحفّظات في المحضر", "المتابعة من طرف خدمة ما بعد البيع"],
      },
    ],
    stepLinks: {
      projects: "استكشفوا مشاريعنا",
      simulate: "احسبوا قسطكم الشهري",
      guarantees: "اطّلعوا على الضمانات",
    },
    captions: {
      pool: "مسبح رياض غاردن 1، مراكش — صورة بعد التسليم.",
      bedroom: "غرفة نوم في شقة مُسلَّمة، رياض غاردن 1 — صورة فوتوغرافية.",
      garden: "رياض غاردن 2، مراكش.",
    },
    sim: {
      eyebrow: "محاكي القرض",
      title: "احسبوا قسطكم الشهري.",
      lead: "أدخلوا ثمن العقار ومساهمتكم الشخصية، واختاروا المدة: يظهر القسط الشهري والتأمين التقديري والتكلفة الإجمالية للقرض فوراً. دون تسجيل.",
    },
    finance: {
      eyebrow: "التمويل",
      title: "ما يدرسه البنك.",
      lead: "ما لم تشتروا نقداً، ستموّلون مسكنكم بقرض عقاري. في المغرب، يقيّم البنك أولاً قدرتكم على الاستدانة وما يتبقى لكم للعيش.",
      ratioLow: "نسبة الاستدانة التي توصي بعض البنوك بعدم تجاوزها تقريباً.",
      ratioHigh: "النسبة التي تقبلها بنوك أخرى عموماً، وأحياناً أكثر حسب الملف.",
      criteriaTitle: "لتحديد النسبة والمدة وحصة التمويل والضمانات، يدرس المُقرض:",
      criteria: [
        "استقراركم المهني وأقدميتكم",
        "مستوى مداخيلكم وانتظامها وقابليتها للتتبع",
        "قروضكم والتزاماتكم الجارية",
        "مساهمتكم الشخصية وادخاركم",
        "مدة التمويل وقدرتكم على الادخار الشهري",
        "بالنسبة لمغاربة العالم: طبيعة المداخيل بالخارج، الوثائق المثبتة والسجل البنكي",
      ],
      compareTitle: "قارنوا التكلفة الإجمالية، لا النسبة وحدها.",
      compareBody:
        "النسبة الاسمية لا تكفي. اطلبوا تقديراً كاملاً يتضمن السعر الفعلي الإجمالي (TEG)، الذي يشمل مصاريف القرض وتوابعه: مصاريف الملف، التأمينات…",
      checkTitle: "ما يجب التحقق منه قبل التوقيع",
      checks: [
        "مصاريف الملف والضمان (الرهن) والتأمين",
        "إمكانية تعديل الأقساط",
        "شروط السداد المسبق",
      ],
      earlyLabel:
        "من الرأسمال المتبقي كحد أقصى: يعادل تعويض السداد المسبق عادةً فوائد شهر واحد، دون أن يتجاوز هذا السقف، وفق القانون الجاري به العمل.",
      aidEyebrow: "الدعم المباشر للسكن",
      aidTitle: "عرض ملائم للدعم المباشر للسكن.",
      aidBody: (year) =>
        `منذ ${year}، لاءمنا عرضنا في عدة مدن ليتمكن زبناؤنا من الاستفادة من برنامج الدعم المباشر للسكن. اسألوا مستشاراً عن المشاريع المعنية.`,
      aidCta: "اسألوا مستشاراً",
    },
    guarantees: {
      eyebrow: "الضمانات",
      title: "بعد تسلّم المفاتيح، تظلّون محميين.",
      lead: "تسري الضمانات القانونية ابتداءً من تسلّم الأشغال، مع خدمة ما بعد البيع منظَّمة للمتابعة.",
      unit: (years) => (years === 1 ? "سنة" : years === 2 ? "سنتان" : "سنوات"),
    },
    conventions: {
      eyebrow: "الاتفاقيات والشراكات",
      title: "شروط خاصة لأعضاء شركائنا.",
      body: "تقوم شراكاتنا على مصلحة مشتركة، ونبنيها من أجل تنمية متبادلة ومتوازنة.",
      points: [
        { label: "لمن", text: "مسيّرو المؤسسات الشريكة ومنخرطوها" },
        { label: "ماذا يستفيدون", text: "أسعار تفضيلية وعروض مميزة" },
        { label: "على ماذا", text: "عدة مشاريع من مشاريعنا السكنية والمهنية" },
      ],
      cta: "اقترحوا اتفاقية",
    },
    cta: {
      title: "مستشار يرافقكم في كل مرحلة.",
      body: "من أول محاكاة إلى تسلّم المفاتيح: احجزوا موعداً، أو اتصلوا بنا.",
    },
  },
};
