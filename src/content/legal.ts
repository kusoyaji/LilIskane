import { company } from "@/data/company";
import { isolateRun } from "@/i18n/config";
import type { Copy } from "./shared";

/**
 * Copy for /mentions-legales and /donnees-personnelles.
 *
 * Built from the client's own legal notice on liliskane.com (the "Mentions
 * légales" modal and the data-protection note under its contact form) and the
 * facts in `company.ts`. Nothing is added that the client has not stated:
 * no DPO name, no e-mail address, no CNDP receipt number (the client's own
 * notice still reads "en cours"), no retention period in months.
 *
 * Every phone number, registry number and legal reference inside an Arabic
 * sentence goes through `isolateRun`, so bidi reordering cannot scramble it.
 */

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "rows"; rows: { label: string; value: string; href?: string }[] }
  | { kind: "note"; text: string };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  sections: LegalSection[];
};

export type LegalChrome = {
  crumb: string;
  toc: string;
  /** Closing band. */
  nextEyebrow: string;
  questionsTitle: string;
  questionsBody: string;
  callLabel: string;
  contactLabel: string;
};

const ar = (s: string) => isolateRun(s, "ar");

/* ------------------------------------------------------------------ chrome */

export const legalChrome: Copy<LegalChrome> = {
  fr: {
    crumb: "Informations légales",
    toc: "Sommaire",
    nextEyebrow: "À lire aussi",
    questionsTitle: "Une question sur ces informations ?",
    questionsBody: "Le service clientèle vous répond du lundi au samedi.",
    callLabel: "Appeler le service clientèle",
    contactLabel: "Écrire ou prendre rendez-vous",
  },
  ar: {
    crumb: "معلومات قانونية",
    toc: "المحتويات",
    nextEyebrow: "اقرأ أيضاً",
    questionsTitle: "سؤال حول هذه المعلومات؟",
    questionsBody: "تجيبكم خدمة الزبناء من الإثنين إلى السبت.",
    callLabel: "الاتصال بخدمة الزبناء",
    contactLabel: "راسلونا أو احجزوا موعداً",
  },
};

/* ------------------------------------------------------------ mentions */

export const mentions: Copy<LegalDoc> = {
  fr: {
    metaTitle: "Mentions légales",
    metaDescription:
      "Éditeur, hébergement, propriété intellectuelle, crédits et conditions d'utilisation du site de Chaabi Lil Iskane, filiale du Groupe Ynna.",
    eyebrow: "Informations légales",
    title: "Mentions légales",
    lead: "Qui édite ce site, qui l'héberge, à qui appartiennent ses images, et la portée exacte de ce qu'il présente.",
    sections: [
      {
        id: "editeur",
        title: "Éditeur du site",
        blocks: [
          { kind: "p", text: "Le présent site est édité par Chaabi Lil Iskane, filiale du Groupe Ynna." },
          {
            kind: "rows",
            rows: [
              { label: "Raison sociale", value: "Chaabi Lil Iskane" },
              { label: "Groupe", value: "Groupe Ynna" },
              { label: "Siège social", value: `${company.hq.fr}, Maroc` },
              { label: "Registre du commerce", value: company.registry },
              { label: "Téléphone", value: company.phone, href: company.phoneHref },
            ],
          },
        ],
      },
      {
        id: "hebergement",
        title: "Hébergement",
        blocks: [{ kind: "p", text: "Le site est hébergé par Vercel Inc., États-Unis (vercel.com)." }],
      },
      {
        id: "propriete-intellectuelle",
        title: "Propriété intellectuelle",
        blocks: [
          {
            kind: "p",
            text: "L'ensemble des textes, photographies, perspectives, plans et vidéos présentés sur ce site, ainsi que leur mise en forme, sont la propriété de Chaabi Lil Iskane ou de leurs auteurs, et sont protégés par les lois relatives à la propriété intellectuelle.",
          },
          {
            kind: "p",
            text: "Toute reproduction ou réutilisation, sur un autre site ou tout autre support, sans l'autorisation préalable et écrite de Chaabi Lil Iskane est interdite.",
          },
        ],
      },
      {
        id: "marques",
        title: "Marques",
        blocks: [
          {
            kind: "p",
            text: "« Chaabi Lil Iskane » et « Chaabi Lil Iskane Gold » sont des marques déposées au Maroc ; elles sont protégées, ainsi que leurs logotypes.",
          },
          {
            kind: "p",
            text: "Leur utilisation, ou celle de représentations dérivées, à des fins commerciales ou personnelles, sans l'accord de Chaabi Lil Iskane, est interdite.",
          },
        ],
      },
      {
        id: "credits",
        title: "Crédits",
        blocks: [
          {
            kind: "rows",
            rows: [
              { label: "Photographies et rendus des programmes", value: "Chaabi Lil Iskane" },
              { label: "Images d'ambiance", value: "Unsplash, sous licence Unsplash" },
              { label: "Visites virtuelles 360°", value: "Matterport" },
            ],
          },
          {
            kind: "p",
            text: "Les images d'ambiance illustrent un cadre de vie ; elles ne représentent aucun programme de Chaabi Lil Iskane et ne sont jamais légendées comme tel.",
          },
          {
            kind: "p",
            text: "La séquence animée de Riad Garden II est une visualisation réalisée à partir des rendus du programme. Comme eux, elle n'a pas de valeur contractuelle.",
          },
        ],
      },
      {
        id: "visuels-et-prix",
        title: "Visuels et prix non contractuels",
        blocks: [
          {
            kind: "p",
            text: "Les images de synthèse des projets (façades, couleurs, aménagements, surfaces et plans) ont un caractère d'ambiance et ne sont pas contractuelles. Elles portent la mention « Rendu — image non contractuelle ». Les photographies présentées comme telles ont été prises dans des programmes livrés.",
          },
          {
            kind: "p",
            text: "Les prix sont indiqués « à partir de », hors frais de notaire et d'enregistrement. Les prix des lots de terrain sont exprimés au mètre carré. Les mensualités affichées par les simulateurs sont indicatives et ne constituent pas une offre de crédit.",
          },
          {
            kind: "p",
            text: "Chaabi Lil Iskane peut modifier à tout moment et sans préavis les informations du site — descriptions, prix, prestations — dans le cadre de leur mise à jour. Si vous relevez une erreur ou une omission, merci de nous la signaler afin que nous la corrigions.",
          },
          {
            kind: "note",
            text: `Pour connaître les disponibilités et les prix en vigueur, contactez le service clientèle au ${company.phone}.`,
          },
        ],
      },
      {
        id: "responsabilite",
        title: "Limitation de responsabilité",
        blocks: [
          {
            kind: "p",
            text: "Chaabi Lil Iskane ne saurait être tenue responsable des dommages, matériels ou immatériels, causés à votre équipement, à vos données ou à vos logiciels par un virus transmis par un tiers à l'occasion de votre connexion ou de votre navigation sur le site.",
          },
          {
            kind: "p",
            text: "Chaabi Lil Iskane n'exerce aucun contrôle sur le contenu des sites tiers, qu'ils soient intégrés au site — comme les visites virtuelles — ou qu'ils renvoient vers lui.",
          },
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        blocks: [
          {
            kind: "p",
            text: "Afin de mesurer la fréquentation du site et la manière dont il est consulté, Chaabi Lil Iskane peut déposer des cookies de mesure d'audience sur votre terminal. Ces cookies ne contiennent pas de données personnelles.",
          },
          {
            kind: "p",
            text: "Les visites virtuelles sont fournies par Matterport, service tiers susceptible de déposer ses propres cookies lorsqu'une visite est chargée. Vous pouvez à tout moment refuser ou supprimer les cookies depuis les réglages de votre navigateur.",
          },
          {
            kind: "note",
            text: "Le traitement de vos données personnelles est détaillé sur la page « Données personnelles ».",
          },
        ],
      },
    ],
  },
  ar: {
    metaTitle: "المعلومات القانونية",
    metaDescription: "الناشر، الاستضافة، الملكية الفكرية، المصادر وشروط استعمال موقع الشعبي للإسكان، فرع مجموعة ينا.",
    eyebrow: "معلومات قانونية",
    title: "المعلومات القانونية",
    lead: "من ينشر هذا الموقع، ومن يستضيفه، ولمن تعود صوره، وما الحدود الدقيقة لما يعرضه.",
    sections: [
      {
        id: "editeur",
        title: "ناشر الموقع",
        blocks: [
          { kind: "p", text: "ينشر هذا الموقع الشعبي للإسكان، فرع مجموعة ينا." },
          {
            kind: "rows",
            rows: [
              { label: "الاسم التجاري", value: "الشعبي للإسكان" },
              { label: "المجموعة", value: "مجموعة ينا" },
              { label: "المقر الاجتماعي", value: `${company.hq.ar}، المغرب` },
              { label: "السجل التجاري", value: ar(company.registry) },
              { label: "الهاتف", value: ar(company.phone), href: company.phoneHref },
            ],
          },
        ],
      },
      {
        id: "hebergement",
        title: "الاستضافة",
        blocks: [
          { kind: "p", text: `يستضيف الموقعَ ${ar("Vercel Inc.")}، الولايات المتحدة الأمريكية (${ar("vercel.com")}).` },
        ],
      },
      {
        id: "propriete-intellectuelle",
        title: "الملكية الفكرية",
        blocks: [
          {
            kind: "p",
            text: "جميع النصوص والصور الفوتوغرافية والتصورات والتصاميم ومقاطع الفيديو المعروضة على هذا الموقع، وكذا طريقة عرضها، ملك للشعبي للإسكان أو لأصحابها، وهي محمية بالقوانين المتعلقة بالملكية الفكرية.",
          },
          {
            kind: "p",
            text: "يُمنع أي استنساخ أو إعادة استعمال، على موقع آخر أو أي دعامة أخرى، دون إذن مسبق ومكتوب من الشعبي للإسكان.",
          },
        ],
      },
      {
        id: "marques",
        title: "العلامات التجارية",
        blocks: [
          {
            kind: "p",
            text: "«الشعبي للإسكان» و«الشعبي للإسكان Gold» علامتان مسجلتان ومودعتان بالمغرب، وهما محميتان قانونياً، وكذا شعاراهما.",
          },
          {
            kind: "p",
            text: "يُمنع استعمالهما، أو استعمال أي تمثيل مشتق منهما، لأغراض تجارية أو شخصية دون موافقة الشعبي للإسكان.",
          },
        ],
      },
      {
        id: "credits",
        title: "المصادر",
        blocks: [
          {
            kind: "rows",
            rows: [
              { label: "صور وتصورات البرامج", value: "الشعبي للإسكان" },
              { label: "صور الأجواء", value: `${ar("Unsplash")}، برخصة ${ar("Unsplash")}` },
              { label: "الزيارات الافتراضية 360°", value: ar("Matterport") },
            ],
          },
          {
            kind: "p",
            text: "توضّح صور الأجواء إطاراً للعيش فقط؛ ولا تمثّل أي برنامج للشعبي للإسكان، ولا تُقدَّم أبداً على أنها كذلك.",
          },
          {
            kind: "p",
            text: "المقطع المتحرك لرياض غاردن 2 تصوّر مُنجَز انطلاقاً من تصورات البرنامج، وهو مثلها لا يكتسي أي طابع تعاقدي.",
          },
        ],
      },
      {
        id: "visuels-et-prix",
        title: "الصور والأسعار غير تعاقدية",
        blocks: [
          {
            kind: "p",
            text: "الصور التركيبية للمشاريع (الواجهات، الألوان، التهيئة، المساحات والتصاميم) ذات طابع توضيحي وليست تعاقدية، وتحمل عبارة «تصور — صورة غير تعاقدية». أما الصور الفوتوغرافية المقدَّمة بهذه الصفة فقد التُقطت في برامج مُسلَّمة.",
          },
          {
            kind: "p",
            text: "الأسعار مذكورة «ابتداءً من»، دون احتساب مصاريف التوثيق والتسجيل. وتُحدَّد أسعار البقع الأرضية بالمتر المربع. أما الأقساط الشهرية التي تعرضها أدوات المحاكاة فهي تقديرية ولا تشكّل عرض قرض.",
          },
          {
            kind: "p",
            text: "يحتفظ الشعبي للإسكان بحق تعديل معلومات الموقع — الأوصاف والأسعار والخدمات — في أي وقت ودون إشعار مسبق، في إطار تحيينها. وإن لاحظتم خطأً أو سهواً، نرجو إبلاغنا به لتصحيحه.",
          },
          {
            kind: "note",
            text: `لمعرفة العروض المتاحة والأسعار الجاري بها العمل، اتصلوا بخدمة الزبناء على الرقم ${ar(company.phone)}.`,
          },
        ],
      },
      {
        id: "responsabilite",
        title: "حدود المسؤولية",
        blocks: [
          {
            kind: "p",
            text: "لا يتحمّل الشعبي للإسكان أي مسؤولية عن الأضرار، المادية أو غير المادية، التي قد تلحق بأجهزتكم أو معطياتكم أو برامجكم بسبب فيروس ينقله طرف ثالث أثناء اتصالكم بالموقع أو تصفحكم له.",
          },
          {
            kind: "p",
            text: "لا يمارس الشعبي للإسكان أي رقابة على محتوى المواقع الخارجية، سواء كانت مدمجة في الموقع — مثل الزيارات الافتراضية — أو كانت تحيل إليه.",
          },
        ],
      },
      {
        id: "cookies",
        title: "ملفات تعريف الارتباط (الكوكيز)",
        blocks: [
          {
            kind: "p",
            text: "لقياس عدد زوار الموقع وطريقة تصفحه، قد يضع الشعبي للإسكان ملفات لقياس الجمهور على جهازكم. ولا تتضمن هذه الملفات أي معطيات شخصية.",
          },
          {
            kind: "p",
            text: `تُقدَّم الزيارات الافتراضية عبر ${ar("Matterport")}، وهي خدمة خارجية قد تضع ملفاتها الخاصة عند تحميل زيارة. ويمكنكم في أي وقت رفض هذه الملفات أو حذفها من إعدادات متصفحكم.`,
          },
          {
            kind: "note",
            text: "تفاصيل معالجة معطياتكم الشخصية مبيّنة في صفحة «المعطيات الشخصية».",
          },
        ],
      },
    ],
  },
};

/* ------------------------------------------------------- données perso */

const LAW_FR =
  "Loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel";
const LAW_AR = `القانون رقم ${ar("09-08")} المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي`;

export const privacy: Copy<LegalDoc> = {
  fr: {
    metaTitle: "Données personnelles",
    metaDescription:
      "Comment Chaabi Lil Iskane traite les données transmises par ses formulaires, conformément à la loi n° 09-08, et comment exercer vos droits d'accès, de rectification et d'opposition.",
    eyebrow: "Informations légales",
    title: "Données personnelles",
    lead: "Ce que nos formulaires vous demandent, pourquoi, qui y a accès, et comment exercer vos droits au titre de la loi n° 09-08.",
    sections: [
      {
        id: "responsable",
        title: "Responsable du traitement",
        blocks: [
          {
            kind: "p",
            text: "Les données transmises par l'intermédiaire de ce site sont traitées par Chaabi Lil Iskane, filiale du Groupe Ynna.",
          },
          {
            kind: "rows",
            rows: [
              { label: "Société", value: "Chaabi Lil Iskane" },
              { label: "Siège social", value: `${company.hq.fr}, Maroc` },
              { label: "Registre du commerce", value: company.registry },
            ],
          },
        ],
      },
      {
        id: "cadre-legal",
        title: "Cadre légal",
        blocks: [
          {
            kind: "p",
            text: `Les traitements réalisés à partir du site respectent la ${LAW_FR}, promulguée par le Dahir n° 1-09-15 du 22 safar 1430 (18 février 2009).`,
          },
          {
            kind: "p",
            text: "Leur respect est contrôlé au Maroc par la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP), auprès de laquelle Chaabi Lil Iskane déclare les traitements réalisés à partir de son site.",
          },
        ],
      },
      {
        id: "donnees-collectees",
        title: "Données collectées",
        blocks: [
          {
            kind: "p",
            text: "Le site ne collecte des données personnelles que lorsque vous remplissez un formulaire de demande d'information ou de prise de rendez-vous, en agence ou à distance. Selon le formulaire, il peut s'agir de :",
          },
          {
            kind: "list",
            items: [
              "votre nom et votre prénom ;",
              "votre numéro de téléphone ;",
              "votre adresse e-mail ;",
              "la ville ou le programme qui vous intéresse ;",
              "la date et le créneau de rendez-vous souhaités ;",
              "le message que vous choisissez de nous écrire.",
            ],
          },
          {
            kind: "p",
            text: "Les champs signalés comme obligatoires sont nécessaires au traitement de votre demande ; les autres sont facultatifs.",
          },
          {
            kind: "note",
            text: "Les simulateurs de budget et de crédit calculent dans votre navigateur : les montants que vous y saisissez ne nous sont pas transmis.",
          },
        ],
      },
      {
        id: "finalites",
        title: "Pourquoi nous les utilisons",
        blocks: [
          {
            kind: "p",
            text: "Vos coordonnées servent à traiter la demande que vous nous adressez : vous répondre, vous rappeler, organiser et confirmer votre rendez-vous avec un conseiller commercial.",
          },
          {
            kind: "p",
            text: "Comme l'indiquent nos formulaires, elles peuvent également être utilisées par Chaabi Lil Iskane pour vous informer de ses programmes. Vous pouvez vous y opposer à tout moment (voir « Vos droits »).",
          },
          {
            kind: "p",
            text: "Elles sont conservées le temps nécessaire au traitement de votre demande et au suivi de la relation qui en découle.",
          },
        ],
      },
      {
        id: "destinataires",
        title: "Qui y a accès",
        blocks: [
          {
            kind: "p",
            text: "Vos données sont traitées de manière strictement confidentielle. Elles sont destinées aux services de Chaabi Lil Iskane chargés de répondre à votre demande et, le cas échéant, aux sociétés du Groupe Ynna.",
          },
        ],
      },
      {
        id: "droits",
        title: "Vos droits",
        blocks: [
          { kind: "p", text: "Conformément à la loi n° 09-08, vous disposez à tout moment :" },
          {
            kind: "list",
            items: [
              "d'un droit d'accès aux informations qui vous concernent ;",
              "d'un droit de rectification, si elles sont inexactes ou incomplètes ;",
              "d'un droit d'opposition, pour des motifs légitimes, à leur traitement.",
            ],
          },
          {
            kind: "p",
            text: "Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez saisir la CNDP.",
          },
        ],
      },
      {
        id: "exercer-vos-droits",
        title: "Exercer vos droits",
        blocks: [
          { kind: "p", text: "Adressez votre demande, en précisant vos nom, prénom et coordonnées :" },
          {
            kind: "rows",
            rows: [
              { label: "Par courrier", value: `Chaabi Lil Iskane — ${company.dataContact.fr}` },
              { label: "Par téléphone", value: company.phone, href: company.phoneHref },
            ],
          },
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        blocks: [
          {
            kind: "p",
            text: "Chaabi Lil Iskane peut déposer des cookies de mesure d'audience afin d'établir des statistiques de fréquentation et de navigation. Ces cookies ne contiennent pas de données personnelles.",
          },
          {
            kind: "p",
            text: "Les visites virtuelles sont fournies par Matterport, service tiers susceptible de déposer ses propres cookies lorsqu'une visite est chargée. Vous pouvez refuser ou supprimer les cookies depuis les réglages de votre navigateur.",
          },
        ],
      },
    ],
  },
  ar: {
    metaTitle: "المعطيات الشخصية",
    metaDescription:
      "كيف يعالج الشعبي للإسكان المعطيات المرسلة عبر استماراته، وفقاً للقانون رقم 09-08، وكيف تمارسون حقوقكم في الولوج والتصحيح والتعرض.",
    eyebrow: "معلومات قانونية",
    title: "المعطيات الشخصية",
    lead: `ما تطلبه منكم استماراتنا، ولماذا، ومن يطّلع عليه، وكيف تمارسون حقوقكم بموجب القانون رقم ${ar("09-08")}.`,
    sections: [
      {
        id: "responsable",
        title: "المسؤول عن المعالجة",
        blocks: [
          {
            kind: "p",
            text: "يعالج المعطياتِ المرسلةَ عبر هذا الموقع الشعبي للإسكان، فرع مجموعة ينا.",
          },
          {
            kind: "rows",
            rows: [
              { label: "الشركة", value: "الشعبي للإسكان" },
              { label: "المقر الاجتماعي", value: `${company.hq.ar}، المغرب` },
              { label: "السجل التجاري", value: ar(company.registry) },
            ],
          },
        ],
      },
      {
        id: "cadre-legal",
        title: "الإطار القانوني",
        blocks: [
          {
            kind: "p",
            text: `تحترم عمليات المعالجة المنجزة عبر الموقع ${LAW_AR}، الصادر بتنفيذه الظهير الشريف رقم ${ar("1.09.15")} بتاريخ 22 من صفر 1430 (18 فبراير 2009).`,
          },
          {
            kind: "p",
            text: "وتسهر على مراقبة احترامه بالمغرب اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي، التي يصرّح لديها الشعبي للإسكان بعمليات المعالجة المنجزة عبر موقعه.",
          },
        ],
      },
      {
        id: "donnees-collectees",
        title: "المعطيات المجمَّعة",
        blocks: [
          {
            kind: "p",
            text: "لا يجمع الموقع معطيات شخصية إلا عندما تملؤون استمارة طلب معلومات أو حجز موعد، في الوكالة أو عن بُعد. وحسب الاستمارة، قد تشمل:",
          },
          {
            kind: "list",
            items: [
              "اسمكم العائلي والشخصي؛",
              "رقم هاتفكم؛",
              "بريدكم الإلكتروني؛",
              "المدينة أو البرنامج الذي يهمّكم؛",
              "تاريخ الموعد والوقت المرغوب فيهما؛",
              "الرسالة التي تختارون كتابتها إلينا.",
            ],
          },
          {
            kind: "p",
            text: "الخانات المشار إليها بأنها إلزامية ضرورية لمعالجة طلبكم؛ أما الباقي فاختياري.",
          },
          {
            kind: "note",
            text: "تُجري أدوات محاكاة الميزانية والقرض حساباتها داخل متصفحكم: المبالغ التي تُدخلونها لا تُرسَل إلينا.",
          },
        ],
      },
      {
        id: "finalites",
        title: "لماذا نستعملها",
        blocks: [
          {
            kind: "p",
            text: "تُستعمل بياناتكم لمعالجة الطلب الذي توجّهونه إلينا: الرد عليكم، معاودة الاتصال بكم، وتنظيم موعدكم مع مستشار تجاري وتأكيده.",
          },
          {
            kind: "p",
            text: "وكما تشير إليه استماراتنا، يمكن أن يستعملها الشعبي للإسكان أيضاً لإخباركم ببرامجه. ويحق لكم الاعتراض على ذلك في أي وقت (انظر «حقوقكم»).",
          },
          {
            kind: "p",
            text: "وتُحفَظ طوال المدة اللازمة لمعالجة طلبكم وتتبّع العلاقة الناتجة عنه.",
          },
        ],
      },
      {
        id: "destinataires",
        title: "من يطّلع عليها",
        blocks: [
          {
            kind: "p",
            text: "تُعالَج معطياتكم بسرية تامة. وهي موجّهة إلى مصالح الشعبي للإسكان المكلّفة بالرد على طلبكم، وعند الاقتضاء إلى شركات مجموعة ينا.",
          },
        ],
      },
      {
        id: "droits",
        title: "حقوقكم",
        blocks: [
          { kind: "p", text: `وفقاً للقانون رقم ${ar("09-08")}، تتمتعون في أي وقت:` },
          {
            kind: "list",
            items: [
              "بحق الولوج إلى المعلومات المتعلقة بكم؛",
              "بحق تصحيحها إن كانت غير دقيقة أو غير مكتملة؛",
              "بحق التعرض، لأسباب مشروعة، على معالجتها.",
            ],
          },
          {
            kind: "p",
            text: "وإذا رأيتم، بعد التواصل معنا، أن حقوقكم لم تُحترم، يمكنكم اللجوء إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي.",
          },
        ],
      },
      {
        id: "exercer-vos-droits",
        title: "ممارسة حقوقكم",
        blocks: [
          { kind: "p", text: "وجّهوا طلبكم مع ذكر اسمكم العائلي والشخصي ومعلومات الاتصال بكم:" },
          {
            kind: "rows",
            rows: [
              { label: "بالبريد", value: `الشعبي للإسكان — ${company.dataContact.ar}` },
              { label: "بالهاتف", value: ar(company.phone), href: company.phoneHref },
            ],
          },
        ],
      },
      {
        id: "cookies",
        title: "ملفات تعريف الارتباط (الكوكيز)",
        blocks: [
          {
            kind: "p",
            text: "قد يضع الشعبي للإسكان ملفات لقياس الجمهور بغرض إعداد إحصائيات حول عدد الزوار وطريقة التصفح. ولا تتضمن هذه الملفات أي معطيات شخصية.",
          },
          {
            kind: "p",
            text: `تُقدَّم الزيارات الافتراضية عبر ${ar("Matterport")}، وهي خدمة خارجية قد تضع ملفاتها الخاصة عند تحميل زيارة. ويمكنكم رفض هذه الملفات أو حذفها من إعدادات متصفحكم.`,
          },
        ],
      },
    ],
  },
};

export type LegalPage = "mentions" | "privacy";
export const legalDocs: Record<LegalPage, Copy<LegalDoc>> = { mentions, privacy };
export const legalHref: Record<LegalPage, string> = {
  mentions: "mentions-legales",
  privacy: "donnees-personnelles",
};
