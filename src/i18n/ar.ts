import type { Dictionary } from "./fr";

/**
 * Arabic dictionary.
 *
 * This is a translation of the argument, not of the sentences. Where French
 * leans on a turn of phrase that does not carry — "nous vous laissons comparer",
 * "c'est la seule garantie qui vaut quelque chose" — the Arabic states the same
 * point in its own register rather than calquing the French.
 *
 * Numerals stay Western (1 2 3), which is what Moroccan price lists, bank
 * statements and street signage actually use. See `src/i18n/config.ts`.
 */
export const ar: Dictionary = {
  meta: {
    homeTitle: "الشعبي للإسكان — منعش عقاري بالمغرب",
    homeDescription:
      "الشعبي للإسكان، منعش عقاري منذ 1948: شقق وبقع أرضية في 15 مدينة مغربية. اكتشفوا مشاريعنا الجارية وما سلّمناه.",
    projectDescription:
      "رياض غاردن 2، مراكش. شقق بغرفتين أو ثلاث غرف، من 84 إلى 116 م²، ابتداءً من 1 830 000 درهم. زيارة افتراضية متاحة.",
  },

  nav: {
    skip: "انتقل إلى المحتوى",
    home: "الرئيسية",
    projects: "مشاريعنا",
    about: "من نحن",
    guide: "دليل الشراء",
    news: "المستجدات",
    contact: "اتصلوا بنا",
    menu: "القائمة",
    close: "إغلاق",
    callUs: "اتصلوا بنا",
    // Wrapped in U+2066/U+2069 (LRI/PDI). Without the isolate this renders as
    // "00 34 39 20 05" in an Arabic paragraph — the digit groups are reordered
    // right-to-left because the spaces between them are bidi-neutral. Fixing it
    // at the string means no render site can forget to.
    phone: "⁦05 20 39 34 00⁩",
    phoneHref: "tel:+212520393400",
    language: "اللغة",
    switchTo: "Français",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },

  common: {
    from: "ابتداءً من",
    currency: "درهم",
    perMonth: "درهم شهرياً",
    sqm: "م²",
    rooms: "غرف",
    delivered: "مُسلَّم",
    launching: "في طور الإطلاق",
    promotion: "في طور التسويق",
    soldOut: "نفدت الوحدات",
    seeProject: "اطّلعوا على المشروع",
    seeAll: "جميع المشاريع",
    projects: "مشاريع",
    project: "مشروع",
    city: "مدينة",
    cities: "مدن",
    loading: "جارٍ التحميل",
  },

  home: {
    heroLine1: "هذا المبنى",
    heroLine2: "لم يُبنَ بعد.",
    heroProofLine1: "وهذا المبنى،",
    heroProofLine2: "سلّمناه فعلاً.",
    heroBody:
      "كل صورة من هذه الصور تصميم. وما يليها هو ما سلّمناه في المكان نفسه، مصوَّراً كما هو. هذا هو الضمان الوحيد الذي يُعتدّ به عند الشراء على التصميم.",
    heroSwitchLead: "العيش في",
    heroSwitchLabel: "اختاروا مدينة",
    heroRenderPrefix: "تصميم —",
    heroDelivery: "التسليم",
    heroScroll: "تابعوا التصفّح",
    heroPhotoLabel: "صورة — رياض غاردن 1، سُلّم 2023",

    recordEyebrow: "حصيلتنا",
    recordTitle: "أربعون سنة من التسليم",
    recordBody:
      "منذ ثمانينيات القرن الماضي، في 15 مدينة، من السكن الاقتصادي إلى الراقي. يُقاس المنعش العقاري بما سلّمه للأسر، لا بما أعلن عنه.",
    recordHomes: "وحدة سكنية مُسلَّمة",
    recordCities: "مدينة",
    recordYears: "سنة من النشاط",

    qualifierEyebrow: "ابحث عن سكنك",
    qualifierTitle: "ابدؤوا بما ستدفعونه كل شهر.",
    qualifierBody:
      "هذا هو الرقم الحاسم، لا الثمن المعلن. حدّدوا القسط الشهري والمساهمة الشخصية، ونعرض عليكم ما هو في متناولكم فعلاً.",
    qualifierBudget: "أقصى قسط شهري",
    qualifierDeposit: "المساهمة الشخصية",
    qualifierCity: "المدينة",
    qualifierAllCities: "جميع المدن",
    qualifierResults: "اعرض",
    qualifierResultsSuffix: "مشاريع",
    qualifierNone: "لا يوجد مشروع بهذا القسط",
    qualifierRelaxed: "لا يوجد مشروع بهذا القسط. إليكم الأقرب إليه.",
    qualifierEstimate: "تقدير على 20 سنة بنسبة 4,5٪. غير تعاقدي.",

    filmEyebrow: "رياض غاردن 2 — مراكش",
    filmTitle: "اعبروه قبل أن يُبنى.",
    filmCaption:
      "الحركة تتبع تصفّحكم: لا تنتظرون الفيديو، بل تقودونه. كل لقطة هي تصميم للمشروع قيد الإنجاز.",

    expandTitle: "خمس عشرة مدينة. مهنة واحدة.",
    expandAlt:
      "حركة كاميرا عبر فناء سكني: حوض ماء في الوسط، وواجهات بحجر فاتح، وعرائش خشبية تحت ضوء آخر النهار.",
    expandCaption:
      "من ستوديو بمساحة 38 م² بالمحمدية إلى فيلا بمراكش، نفس مكتب الدراسات، نفس مراقبة الورش، نفس الضمان.",
    portfolioEyebrow: "المحفظة العقارية",
    portfolioTitle: "خمس عشرة مدينة، من الحسيمة إلى الصويرة.",
    portfolioBody: "كل مدينة، كل برنامج، كل ثمن. مرّروا على مدينة لمعاينتها.",

    rangeEyebrow: "المدى",
    rangeTitle: "485 000 درهم بالصويرة. 2 450 000 درهم بمراكش.",
    rangeBody:
      "نفس مكتب الدراسات، نفس مراقبة الورش، نفس الضمان العشري. السكن الاقتصادي ليس مشروعاً مخفّضاً — إنه نفس المهنة، بثمن آخر.",

    simulatorEyebrow: "التمويل",
    simulatorTitle: "ما ستدفعونه، قبل أن تتنقّلوا.",
    simulatorBody: "الحساب الكامل، دون تسجيل ودون اتصال تجاري. تخرجون برقم واضح.",
    simulatorCta: "افتحوا المحاكي",
  },

  project: {
    backToProjects: "جميع المشاريع",
    statusLabel: "الحالة",
    deliveryLabel: "التسليم",
    priceLabel: "الثمن",
    fromPrice: "ابتداءً من",
    monthlyFrom: "أي ما يقارب",
    bookVisit: "احجزوا زيارة",
    callBack: "اطلبوا أن نتصل بكم",
    callNow: "اتصلوا الآن",

    sequenceEyebrow: "الموقع",
    sequenceTitle: "من الشارع إلى الصالون.",
    sequenceCaption1: "الممر المركزي والمحلات التجارية بالطابق الأرضي.",
    sequenceCaption2: "الحدائق الداخلية، بمنأى عن الشارع.",
    sequenceCaption3: "المسبح والفضاءات المشتركة.",

    tourEyebrow: "زيارة افتراضية",
    tourTitle: "ادخلوا إلى الشقة.",
    tourBody:
      "تجوّلوا في الشقة النموذجية غرفةً غرفة، بتقنية 360 درجة، لتقدير الأحجام والتوزيع. زيارة إرشادية غير تعاقدية.",
    tourStart: "ابدؤوا الزيارة",
    tourLoading: "جارٍ فتح الزيارة",
    tour2br: "نموذج بغرفتين",
    tour3br: "نموذج بثلاث غرف",
    tourDelivered: "شقة مُسلَّمة — رياض غاردن 1",
    tourDataWarning:
      "تستهلك الزيارة حوالي 15 ميغابايت. إن كنتم على شبكة الجيل الرابع، يُفضّل استعمال الواي‑فاي.",
    tourExit: "إنهاء الزيارة",

    proofEyebrow: "التصميم والواقع",
    proofTitle: "هذا ما سلّمناه في المرة السابقة.",
    proofBody:
      "من جهة، التصوّر الرقمي لرياض غاردن 2، ومن جهة أخرى فضاء مماثل التُقط في رياض غاردن 1، الذي سُلّم سنة 2023. قارنوا بأنفسكم.",
    proofRender: "تصميم",
    proofReal: "مُسلَّم",
    proofToggle: "قارن بين التصميم والمُسلَّم",
    proofShowing: "المعروض:",

    typologiesEyebrow: "الشقق",
    typologiesTitle: "أربعة تصاميم، اتجاهان.",
    typologySurface: "المساحة",
    typologyRooms: "الغرف",
    typologyPrice: "ابتداءً من",
    typologyMonthly: "القسط الشهري التقديري",
    typologyAvailable: "وحدة متاحة",
    typologyLast: "آخر الوحدات",

    locationEyebrow: "الموقع",
    locationTitle: "على طريق أمزميز، بالشريفية.",
    locationDrive: "بالسيارة",
    locationWalk: "مشياً",

    amenitiesEyebrow: "في عين المكان",
    amenitiesTitle: "ما هو متوفّر.",

    simulatorTitle: "قسطك الشهري لهذا المشروع.",
    simulatorBody:
      "مملوء مسبقاً بثمن الانطلاق لرياض غاردن 2. غيّروا المساهمة الشخصية والمدة لتحصلوا على رقمكم.",

    contactEyebrow: "حدّدوا موعداً",
    contactTitle: "تفضّلوا لمعاينة الشقة النموذجية.",
    contactBody:
      "يستقبلكم مستشار بموعد مسبق. دون أي التزام ودون اتصالات آلية.",

    legalRenders:
      "الصور التركيبية ذات طابع توضيحي وغير تعاقدية. أما الصور المعروضة على أنها مُسلَّمة فقد أُخذت في رياض غاردن 1، وهو برنامج مكتمل لنفس المنعش العقاري.",
    legalPrices:
      "الأثمنة المذكورة هي أثمنة انطلاق، غير شاملة لمصاريف التوثيق والتسجيل، وقابلة للتغيير.",
  },

  search: {
    title: "مشاريعنا",
    intro: "15 مدينة، من السكن الاقتصادي إلى الراقي.",
    filters: "عوامل التصفية",
    clear: "مسح الكل",
    apply: "تطبيق",
    results: "نتائج",
    result: "نتيجة",
    budget: "القسط الشهري",
    deposit: "المساهمة الشخصية",
    city: "المدينة",
    segment: "المستوى",
    typology: "نوع العقار",
    bedrooms: "الغرف",
    surface: "المساحة",
    status: "التوفّر",
    amenities: "المرافق",
    noResults: "لا يوجد مشروع مطابق تماماً.",
    relaxedNotice: "قمنا بتوسيع",
    relaxedSuffix: "لعرض أقرب المشاريع إليكم.",
    relaxedBudget: "القسط الشهري",
    relaxedCity: "المدينة",
    relaxedSurface: "المساحة",
    relaxedBedrooms: "عدد الغرف",
    relaxedAmenities: "المرافق",
    resetAll: "ابدؤوا من جديد",
    mapView: "الخريطة",
    listView: "اللائحة",
    sortBy: "ترتيب",
    sortPrice: "الثمن تصاعدياً",
    sortSurface: "المساحة تنازلياً",
    sortDelivery: "الأقرب تسليماً",
    shareSearch: "انسخوا رابط هذا البحث",
    shareCopied: "تم نسخ الرابط",
  },

  simulator: {
    title: "محاكي القرض",
    price: "ثمن العقار",
    deposit: "المساهمة الشخصية",
    duration: "المدة",
    rate: "النسبة",
    years: "سنة",
    monthly: "القسط الشهري",
    total: "إجمالي المبلغ المسدَّد (الأصل + الفوائد)",
    borrowed: "المبلغ المقترض",
    interest: "الفوائد",
    insurance: "التأمين التقديري",
    depositTooLow: "لا تقل المساهمة الشخصية عادةً عن 10٪ من الثمن.",
    disclaimer:
      "محاكاة إرشادية بنسبة 4,5٪، تشمل تأمين المقترض التقديري (0,35٪ سنوياً)، ولا تشمل مصاريف الملف والضمانات. يحدّد البنك النسبة الفعلية حسب ملفكم.",
  },

  form: {
    name: "الاسم الكامل",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    city: "مدينة الإقامة",
    abroad: "أقيم خارج المغرب",
    message: "رسالتكم",
    messagePlaceholder: "سؤال حول التصاميم أو التمويل أو التسليم…",
    preferredDate: "تاريخ الزيارة المرغوب",
    submitVisit: "احجزوا الزيارة",
    submitCallback: "اطلبوا أن نتصل بكم",
    required: "إجباري",
    optional: "اختياري",
    errorName: "اذكروا اسمكم ليعرف المستشار من سيستقبل.",
    errorPhone: "نحتاج رقماً يمكن الوصول إليه لتأكيد الموعد.",
    errorPhoneFormat: "هذا الرقم لا يبدو صحيحاً. تحقّقوا من الأرقام.",
    errorEmail: "يبدو أن هذا البريد الإلكتروني غير مكتمل.",
    successTitle: "تم التسجيل.",
    successBody:
      "سيتصل بكم مستشار خلال 24 ساعة عمل. يمكنكم أيضاً الاتصال بنا مباشرة.",
    privacy:
      "تُستعمل بياناتكم لمعالجة هذا الطلب فقط، ولا تُستعمل لأي غرض آخر دون موافقتكم.",
  },

  footer: {
    address: "239 شارع محمد الخامس، الدار البيضاء",
    hours: "في الوكالة أو عبر مكالمة فيديو.",
    company: "الشعبي للإسكان",
    group: "مجموعة ينا",
    sitemap: "خريطة الموقع",
    legal: "المعلومات القانونية",
    privacy: "المعطيات الشخصية",
    rights: "جميع الحقوق محفوظة",
  },
};
