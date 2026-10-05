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
      "شقق ومكاتب وأراضٍ في 15 مدينة مغربية. شاهد ما نبنيه الآن، وما سبق أن سلّمناه.",
    projectDescription:
      "رياض غاردن 2، مراكش. شقق بغرفتين أو ثلاث غرف، من 84 إلى 116 م²، ابتداءً من 1 830 000 درهم. زيارة افتراضية متاحة.",
  },

  nav: {
    skip: "انتقل إلى المحتوى",
    home: "الرئيسية",
    projects: "مشاريعنا",
    about: "الشعبي للإسكان",
    guide: "دليل الشراء",
    news: "المستجدات",
    contact: "اتصل بنا",
    menu: "القائمة",
    close: "إغلاق",
    callUs: "اتصل بنا",
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
    seeProject: "اطّلع على المشروع",
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
    heroSwitchLabel: "اختر مدينة",
    heroRenderPrefix: "تصميم —",
    heroDelivery: "التسليم",
    heroScroll: "تابع التصفّح",
    heroPhotoLabel: "صورة — رياض غاردن 1، سُلّم 2023",

    recordEyebrow: "حصيلتنا",
    recordTitle: "أربعون سنة من التسليم",
    recordBody:
      "منذ ثمانينيات القرن الماضي، في 15 مدينة، من السكن الاقتصادي إلى الراقي. يُقاس المنعش العقاري بما سلّمه للأسر، لا بما أعلن عنه.",
    recordHomes: "وحدة سكنية مُسلَّمة",
    recordCities: "مدينة",
    recordYears: "سنة من النشاط",

    qualifierEyebrow: "ابحث عن سكنك",
    qualifierTitle: "ابدأ بما ستدفعه كل شهر.",
    qualifierBody:
      "هذا هو الرقم الحاسم، لا الثمن المعلن. حدّد القسط الشهري والمبلغ المتوفر لديك، ونعرض عليك ما هو في متناولك فعلاً.",
    qualifierBudget: "أقصى قسط شهري",
    qualifierDeposit: "المبلغ المتوفر",
    qualifierCity: "المدينة",
    qualifierAllCities: "جميع المدن",
    qualifierResults: "اعرض",
    qualifierResultsSuffix: "مشاريع",
    qualifierNone: "لا يوجد مشروع بهذا القسط",
    qualifierRelaxed: "لا يوجد مشروع بهذا القسط. إليك الأقرب إليه.",
    qualifierEstimate: "تقدير على 20 سنة بنسبة 4,5٪. غير تعاقدي.",

    filmEyebrow: "رياض غاردن 2 — مراكش",
    filmTitle: "اعبُره قبل أن يُبنى.",
    filmCaption:
      "الحركة تتبع تصفّحك: أنت لا تنتظر الفيديو، بل تقوده. كل لقطة هي تصميم للمشروع قيد الإنجاز.",

    expandTitle: "خمس عشرة مدينة. مهنة واحدة.",
    expandAlt:
      "حركة كاميرا عبر فناء سكني: حوض ماء في الوسط، وواجهات بحجر فاتح، وعرائش خشبية تحت ضوء آخر النهار.",
    expandCaption:
      "من ستوديو بمساحة 38 م² بالمحمدية إلى فيلا بمراكش، نفس مكتب الدراسات، نفس مراقبة الورش، نفس الضمان.",
    portfolioEyebrow: "المحفظة العقارية",
    portfolioTitle: "خمس عشرة مدينة، من الحسيمة إلى الصويرة.",
    portfolioBody: "كل مدينة، كل برنامج، كل ثمن. مرّر على مدينة لمعاينتها.",

    rangeEyebrow: "المدى",
    rangeTitle: "485 000 درهم بالصويرة. 2 450 000 درهم بمراكش.",
    rangeBody:
      "نفس مكتب الدراسات، نفس مراقبة الورش، نفس الضمان العشري. السكن الاقتصادي ليس مشروعاً مخفّضاً — إنه نفس المهنة، بثمن آخر.",

    simulatorEyebrow: "التمويل",
    simulatorTitle: "ما ستدفعه، قبل أن تتنقّل.",
    simulatorBody: "الحساب الكامل، دون تسجيل ودون اتصال تجاري. تخرج برقم واضح.",
    simulatorCta: "افتح المحاكي",
  },

  project: {
    backToProjects: "جميع المشاريع",
    statusLabel: "الحالة",
    deliveryLabel: "التسليم",
    priceLabel: "الثمن",
    fromPrice: "ابتداءً من",
    monthlyFrom: "أي ما يقارب",
    bookVisit: "احجز زيارة",
    callBack: "اطلب أن نتصل بك",
    callNow: "اتصل الآن",

    sequenceEyebrow: "الموقع",
    sequenceTitle: "من الشارع إلى الصالون.",
    sequenceCaption1: "الممر المركزي والمحلات التجارية بالطابق الأرضي.",
    sequenceCaption2: "الحدائق الداخلية، بمنأى عن الشارع.",
    sequenceCaption3: "المسبح والفضاءات المشتركة.",

    tourEyebrow: "زيارة افتراضية",
    tourTitle: "ادخل إلى الشقة.",
    tourBody:
      "تنقّل بحرية داخل الشقة النموذجية، غرفة غرفة. لا شيء مخفي: المساحات وارتفاع السقف والإطلالات هي ذاتها التي ستحصل عليها.",
    tourStart: "ابدأ الزيارة",
    tourLoading: "جارٍ فتح الزيارة",
    tour2br: "نموذج بغرفتين",
    tour3br: "نموذج بثلاث غرف",
    tourDelivered: "شقة مُسلَّمة — رياض غاردن 1",
    tourDataWarning:
      "تستهلك الزيارة حوالي 15 ميغابايت. إن كنت على شبكة الجيل الرابع، يُفضّل استعمال الواي‑فاي.",
    tourExit: "إنهاء الزيارة",

    proofEyebrow: "التصميم والواقع",
    proofTitle: "هذا ما سلّمناه في المرة السابقة.",
    proofBody:
      "التصميم ثلاثي الأبعاد لرياض غاردن 2 من جهة، وصورة نفس الفضاء في رياض غاردن 1 الذي سُلّم لأصحابه سنة 2023 من جهة أخرى. قارن بنفسك.",
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
    locationBody:
      "على بعد 10 دقائق من شارع محمد السادس وغولف الماعدن، بعيداً عن الضجيج لكن داخل المدينة.",
    locationDrive: "بالسيارة",
    locationWalk: "مشياً",

    amenitiesEyebrow: "في عين المكان",
    amenitiesTitle: "ما هو متوفّر.",

    simulatorTitle: "قسطك الشهري لهذا المشروع.",
    simulatorBody:
      "مملوء مسبقاً بثمن الانطلاق لرياض غاردن 2. غيّر المبلغ المتوفر والمدة لتحصل على رقمك.",

    contactEyebrow: "حدّد موعداً",
    contactTitle: "تفضّل لمعاينة الشقة النموذجية.",
    contactBody:
      "يستقبلك مستشار في عين المكان، من الاثنين إلى السبت. دون أي التزام ودون اتصالات متكرّرة.",

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
    deposit: "المبلغ المتوفر",
    city: "المدينة",
    segment: "المستوى",
    typology: "نوع العقار",
    bedrooms: "الغرف",
    surface: "المساحة",
    status: "التوفّر",
    amenities: "المرافق",
    noResults: "لا يوجد مشروع مطابق تماماً.",
    relaxedNotice: "قمنا بتوسيع",
    relaxedSuffix: "لعرض أقرب المشاريع إليك.",
    relaxedBudget: "القسط الشهري",
    relaxedCity: "المدينة",
    relaxedSurface: "المساحة",
    relaxedBedrooms: "عدد الغرف",
    relaxedAmenities: "المرافق",
    resetAll: "ابدأ من جديد",
    mapView: "الخريطة",
    listView: "اللائحة",
    sortBy: "ترتيب",
    sortPrice: "الثمن تصاعدياً",
    sortSurface: "المساحة تنازلياً",
    sortDelivery: "الأقرب تسليماً",
    shareSearch: "انسخ رابط هذا البحث",
    shareCopied: "تم نسخ الرابط",
  },

  simulator: {
    title: "محاكي القرض",
    price: "ثمن العقار",
    deposit: "المبلغ المتوفر",
    duration: "المدة",
    rate: "النسبة",
    years: "سنة",
    monthly: "القسط الشهري",
    total: "التكلفة الإجمالية للقرض",
    borrowed: "المبلغ المقترض",
    interest: "الفوائد",
    insurance: "التأمين التقديري",
    depositTooLow: "المبلغ المتوفر المعتاد لا يقل عن 10٪ من الثمن.",
    disclaimer:
      "محاكاة إرشادية، غير شاملة للتأمين الإجباري ومصاريف الملف. النسبة الفعلية تحددها البنك حسب ملفك.",
  },

  form: {
    name: "الاسم الكامل",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    city: "مدينة الإقامة",
    abroad: "أقيم خارج المغرب",
    message: "رسالتك",
    messagePlaceholder: "سؤال حول التصاميم أو التمويل أو التسليم…",
    preferredDate: "تاريخ الزيارة المرغوب",
    submitVisit: "احجز الزيارة",
    submitCallback: "اطلب أن نتصل بك",
    required: "إجباري",
    optional: "اختياري",
    errorName: "اذكر اسمك ليعرف المستشار من سيستقبل.",
    errorPhone: "نحتاج رقماً يمكن الوصول إليه لتأكيد الموعد.",
    errorPhoneFormat: "هذا الرقم لا يبدو صحيحاً. تحقّق من الأرقام.",
    errorEmail: "يبدو أن هذا البريد الإلكتروني غير مكتمل.",
    successTitle: "تم التسجيل.",
    successBody:
      "سيتصل بك مستشار خلال 24 ساعة عمل. يمكنك أيضاً الاتصال بنا مباشرة.",
    privacy:
      "تُستعمل بياناتكم لمعالجة هذا الطلب، ويمكن أن تُستعمل لإخباركم ببرامجنا. ويحق لكم الاعتراض على ذلك في أي وقت.",
  },

  footer: {
    address: "239 شارع محمد الخامس، الدار البيضاء",
    hours: "الاثنين — السبت، من 9ص إلى 6م",
    company: "الشعبي للإسكان",
    group: "مجموعة ينا",
    sitemap: "خريطة الموقع",
    legal: "المعلومات القانونية",
    privacy: "المعطيات الشخصية",
    rights: "جميع الحقوق محفوظة",
  },
};
