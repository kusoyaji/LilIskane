import type { BienType, MeetingMode, SlotId } from "@/components/contact/model";
import type { Copy } from "./shared";

/**
 * Copy for /contact — the conversion page.
 *
 * Sources: the client's own contact page (form fields, the "en agence ou à
 * distance" appointment modes, the Loi 09-08 notice) and `src/data/company.ts`
 * for every address and number. Placeholders in braces (`{name}`, `{phone}`,
 * `{n}`) are filled at render time so numbers can be bidi-isolated in Arabic.
 *
 * The form copy is passed to the client component for ONE locale only, as a
 * prop — this module is never imported by a "use client" file.
 */

/** Left-to-right isolate for runs of digits inside Arabic sentences. */
const L = (s: string) => `⁦${s}⁩`;

export type FormCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  about: string;
  removeProject: string;
  steps: { project: string; you: string; meeting: string; message: string };
  type: string;
  types: Record<BienType, string>;
  city: string;
  cityPlaceholder: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  phoneHint: string;
  mode: string;
  modes: Record<MeetingMode, string>;
  modeHints: Record<MeetingMode, string>;
  date: string;
  dateHint: string;
  otherDate: string;
  otherDateLabel: string;
  backToDays: string;
  slot: string;
  slots: Record<SlotId, string>;
  message: string;
  messagePlaceholder: string;
  optional: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  submit: string;
  submitting: string;
  reassurance: string;
  summaryOne: string;
  summaryMany: string;
  errors: {
    lastName: string;
    firstName: string;
    email: string;
    emailFormat: string;
    phone: string;
    phoneFormat: string;
    date: string;
    datePast: string;
    dateSunday: string;
    slot: string;
    mode: string;
    consent: string;
  };
  success: {
    eyebrow: string;
    title: string;
    body: string;
    recap: string;
    project: string;
    type: string;
    city: string;
    mode: string;
    when: string;
    contact: string;
    message: string;
    edit: string;
    explore: string;
    call: string;
  };
};

type ContactCopy = {
  meta: { title: string; description: string };
  hero: {
    crumb: string;
    title: string;
    lead: string;
    phoneLabel: string;
    phoneAbroad: string;
    hqLabel: string;
    modesLabel: string;
    modes: Record<MeetingMode, string>;
    photoCaption: string;
  };
  visit: {
    eyebrow: string;
    title: string;
    body: string;
    address: string;
    phone: string;
    group: string;
    hq: string;
    call: string;
    book: string;
  };
  data: {
    eyebrow: string;
    title: string;
    lead: string;
    collected: string;
    rights: string;
    exercise: string;
    byMail: string;
    byPhone: string;
    link: string;
  };
  form: FormCopy;
};

export const contact: Copy<ContactCopy> = {
  fr: {
    meta: {
      title: "Contact et rendez-vous",
      description:
        "Prenez rendez-vous avec un conseiller Chaabi Lil Iskane : en agence, par téléphone ou en visioconférence. 05 20 39 34 00 — 239 Boulevard Mohammed V, Casablanca.",
    },
    hero: {
      crumb: "Contact",
      title: "Prenons rendez‑vous.",
      lead: "Un conseiller commercial répond à vos questions sur nos programmes, leurs prix et leur financement. Sans engagement.",
      phoneLabel: "Par téléphone",
      phoneAbroad: "Depuis l'étranger",
      hqLabel: "Siège",
      modesLabel: "Trois façons de nous rencontrer",
      modes: { agence: "En agence", telephone: "Par téléphone", visio: "En visioconférence" },
      photoCaption: "Riad Garden I, Marrakech — photographie d'un programme livré",
    },
    visit: {
      eyebrow: "Venir nous voir",
      title: "Le siège, à Casablanca.",
      body: "Nos conseillers commerciaux vous reçoivent sur rendez-vous. Appelez avant de passer : nous préparons les plans et les prix du programme qui vous intéresse.",
      address: "Adresse",
      phone: "Téléphone",
      group: "Groupe",
      hq: "Siège",
      call: "Nous appeler",
      book: "Prendre rendez-vous",
    },
    data: {
      eyebrow: "Loi n° 09-08",
      title: "Vos données, vos droits.",
      lead: "Ce que nous faisons des informations que vous nous confiez, et comment en garder la maîtrise.",
      collected:
        "Les informations demandées dans ce formulaire sont nécessaires pour traiter votre demande d'information ou de rendez-vous ; leur collecte est donc obligatoire. Elles font l'objet d'un traitement informatique et peuvent être utilisées à des fins de prospection commerciale.",
      rights:
        "Conformément à la loi n° 09-08 promulguée le 18 février 2009, relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent.",
      exercise: "Pour exercer ce droit",
      byMail: "Par courrier",
      byPhone: "Par téléphone",
      link: "Données personnelles",
    },
    form: {
      eyebrow: "Rendez-vous",
      title: "Demander un rendez-vous",
      lead: "Un conseiller vous rappelle pour confirmer le jour et l'heure.",
      about: "À propos de",
      removeProject: "Retirer ce programme",
      steps: {
        project: "Votre projet",
        you: "Vos coordonnées",
        meeting: "Le rendez-vous",
        message: "Un message",
      },
      type: "Type de bien",
      types: {
        economique: "Économique",
        "moyen-standing": "Moyen standing",
        "haut-standing": "Haut standing",
        terrain: "Terrains",
      },
      city: "Ville",
      cityPlaceholder: "Choisir une ville",
      lastName: "Nom",
      firstName: "Prénom",
      email: "E-mail",
      phone: "Téléphone",
      phoneHint: "Numéro marocain, ou international avec l'indicatif",
      mode: "Mode de rendez-vous",
      modes: {
        agence: "En agence",
        telephone: "Par téléphone",
        visio: "En visioconférence",
      },
      modeHints: {
        agence: "Nous vous confirmons l'adresse de l'agence en vous rappelant.",
        telephone: "Un conseiller vous appelle au numéro indiqué.",
        visio: "Nous vous envoyons le lien de connexion avant le rendez-vous.",
      },
      date: "Jour",
      dateHint: "Du lundi au samedi",
      otherDate: "Une autre date",
      otherDateLabel: "Date souhaitée",
      backToDays: "Revenir aux prochains jours",
      slot: "Créneau horaire",
      slots: {
        "09-11": "9h – 11h",
        "11-13": "11h – 13h",
        "14-16": "14h – 16h",
        "16-18": "16h – 18h",
      },
      message: "Message",
      messagePlaceholder: "Une question sur les plans, le financement, la livraison…",
      optional: "facultatif",
      consentBefore: "J'accepte que mes informations soient utilisées pour traiter ma demande, conformément à la loi n° 09-08. ",
      consentLink: "Données personnelles",
      consentAfter: "",
      submit: "Demander mon rendez-vous",
      submitting: "Un instant…",
      reassurance: "Sans engagement. Nous vous rappelons pour confirmer.",
      summaryOne: "Une information est à compléter.",
      summaryMany: "{n} informations sont à compléter.",
      errors: {
        lastName: "Indiquez votre nom.",
        firstName: "Indiquez votre prénom.",
        email: "Indiquez votre adresse e-mail.",
        emailFormat: "Cette adresse semble incomplète — format attendu : nom@domaine.ma",
        phone: "Indiquez un numéro où vous joindre.",
        phoneFormat: "Numéro non reconnu — par exemple 06 12 34 56 78, ou +33 6 12 34 56 78 depuis l'étranger.",
        date: "Choisissez un jour.",
        datePast: "Cette date est passée — choisissez un jour à venir.",
        dateSunday: "Nous ne recevons pas le dimanche — choisissez un autre jour.",
        slot: "Choisissez un créneau.",
        mode: "Choisissez comment nous rencontrer.",
        consent: "Cochez cette case pour que nous puissions traiter votre demande.",
      },
      success: {
        eyebrow: "Rendez-vous demandé",
        title: "Merci, {name}.",
        body: "Un conseiller commercial vous rappelle au {phone} pour confirmer votre rendez‑vous.",
        recap: "Votre demande",
        project: "Programme",
        type: "Type de bien",
        city: "Ville",
        mode: "Mode",
        when: "Date souhaitée",
        contact: "Coordonnées",
        message: "Message",
        edit: "Modifier ma demande",
        explore: "Découvrir nos projets",
        call: "Une urgence ? Appelez le",
      },
    },
  },
  ar: {
    meta: {
      title: "اتصلوا بنا وحدّدوا موعداً",
      description: `حدّدوا موعداً مع مستشار الشعبي للإسكان: في الوكالة، عبر الهاتف أو عبر الفيديو. ${L("05 20 39 34 00")} — ${L("239")} شارع محمد الخامس، الدار البيضاء.`,
    },
    hero: {
      crumb: "اتصلوا بنا",
      title: "لنحدّد موعداً.",
      lead: "يجيب مستشار تجاري عن أسئلتكم حول مشاريعنا وأسعارها وتمويلها. دون أي التزام.",
      phoneLabel: "عبر الهاتف",
      phoneAbroad: "من خارج المغرب",
      hqLabel: "المقر الرئيسي",
      modesLabel: "ثلاث طرق للقائنا",
      modes: { agence: "في الوكالة", telephone: "عبر الهاتف", visio: "عبر الفيديو" },
      photoCaption: "رياض غاردن 1، مراكش — صورة لمشروع تم تسليمه",
    },
    visit: {
      eyebrow: "زورونا",
      title: "المقر الرئيسي، بالدار البيضاء.",
      body: "يستقبلكم مستشارونا التجاريون بموعد مسبق. اتصلوا بنا قبل الزيارة لنُعدّ لكم تصاميم وأسعار المشروع الذي يهمّكم.",
      address: "العنوان",
      phone: "الهاتف",
      group: "المجموعة",
      hq: "المقر",
      call: "اتصلوا بنا",
      book: "حجز موعد",
    },
    data: {
      eyebrow: `القانون رقم ${L("09-08")}`,
      title: "معطياتكم، حقوقكم.",
      lead: "ما نفعله بالمعلومات التي تأتمنوننا عليها، وكيف تحتفظون بالتحكم فيها.",
      collected:
        "المعلومات المطلوبة في هذه الاستمارة ضرورية لمعالجة طلب المعلومات أو الموعد، ولذلك فإن جمعها إجباري. وهي تخضع لمعالجة معلوماتية، ويمكن استعمالها لأغراض الاستكشاف التجاري.",
      rights: `طبقاً للقانون رقم ${L("09-08")} الصادر في ${L("18")} فبراير ${L("2009")}، المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي، تتمتعون بحق الولوج إلى المعلومات التي تخصكم وتصحيحها.`,
      exercise: "لممارسة هذا الحق",
      byMail: "بالبريد",
      byPhone: "بالهاتف",
      link: "المعطيات الشخصية",
    },
    form: {
      eyebrow: "موعد",
      title: "طلب موعد",
      lead: "يتصل بكم مستشار لتأكيد اليوم والساعة.",
      about: "بخصوص",
      removeProject: "إزالة هذا المشروع",
      steps: {
        project: "مشروعكم",
        you: "معلوماتكم",
        meeting: "الموعد",
        message: "رسالة",
      },
      type: "نوع العقار",
      types: {
        economique: "سكن اقتصادي",
        "moyen-standing": "سكن متوسط",
        "haut-standing": "سكن راقٍ",
        terrain: "بقع أرضية",
      },
      city: "المدينة",
      cityPlaceholder: "اختاروا مدينة",
      lastName: "الاسم العائلي",
      firstName: "الاسم الشخصي",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      phoneHint: "رقم مغربي، أو دولي مع رمز البلد",
      mode: "طريقة الموعد",
      modes: {
        agence: "في الوكالة",
        telephone: "عبر الهاتف",
        visio: "عبر الفيديو",
      },
      modeHints: {
        agence: "نؤكد لكم عنوان الوكالة عند الاتصال بكم.",
        telephone: "يتصل بكم مستشار على الرقم المذكور.",
        visio: "نرسل لكم رابط الاتصال قبل الموعد.",
      },
      date: "اليوم",
      dateHint: "من الإثنين إلى السبت",
      otherDate: "تاريخ آخر",
      otherDateLabel: "التاريخ المرغوب",
      backToDays: "العودة إلى الأيام القادمة",
      slot: "التوقيت",
      slots: {
        "09-11": "9:00 – 11:00",
        "11-13": "11:00 – 13:00",
        "14-16": "14:00 – 16:00",
        "16-18": "16:00 – 18:00",
      },
      message: "الرسالة",
      messagePlaceholder: "سؤال حول التصاميم أو التمويل أو التسليم…",
      optional: "اختياري",
      consentBefore: `أوافق على استعمال معلوماتي لمعالجة طلبي، طبقاً للقانون رقم ${L("09-08")}. `,
      consentLink: "المعطيات الشخصية",
      consentAfter: "",
      submit: "اطلبوا موعدكم",
      submitting: "لحظة من فضلكم…",
      reassurance: "دون أي التزام. نتصل بكم للتأكيد.",
      summaryOne: "معلومة واحدة تحتاج إلى استكمال.",
      summaryMany: "عدد المعلومات التي تحتاج إلى استكمال: {n}.",
      errors: {
        lastName: "يرجى إدخال الاسم العائلي.",
        firstName: "يرجى إدخال الاسم الشخصي.",
        email: "يرجى إدخال البريد الإلكتروني.",
        emailFormat: `يبدو أن العنوان غير مكتمل — الصيغة المطلوبة: ${L("name@domaine.ma")}`,
        phone: "يرجى إدخال رقم يمكن الاتصال بكم عليه.",
        phoneFormat: `رقم غير صحيح — مثلاً ${L("06 12 34 56 78")}، أو ${L("+33 6 12 34 56 78")} من الخارج.`,
        date: "يرجى اختيار يوم.",
        datePast: "هذا التاريخ قد مضى — اختاروا يوماً قادماً.",
        dateSunday: "لا نستقبل يوم الأحد — اختاروا يوماً آخر.",
        slot: "يرجى اختيار توقيت.",
        mode: "يرجى اختيار طريقة اللقاء.",
        consent: "يرجى تأكيد الموافقة لنتمكن من معالجة طلبكم.",
      },
      success: {
        eyebrow: "تم طلب الموعد",
        title: "شكراً، {name}.",
        body: "سيتصل بكم مستشار تجاري على الرقم {phone} لتأكيد موعدكم.",
        recap: "طلبكم",
        project: "المشروع",
        type: "نوع العقار",
        city: "المدينة",
        mode: "الطريقة",
        when: "التاريخ المرغوب",
        contact: "معلومات الاتصال",
        message: "الرسالة",
        edit: "تعديل الطلب",
        explore: "اكتشفوا مشاريعنا",
        call: "لأمر مستعجل، اتصلوا على",
      },
    },
  },
};
