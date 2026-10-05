import type { GalleryRef } from "./types";

/**
 * Every programme's pictures as the client publishes them on liliskane.com,
 * curated: cross-programme duplicates (the same photograph on two fiches)
 * kept only where the photo belongs, clip-art and placeholders dropped,
 * ordered exterior → living → rooms → amenities, with descriptive FR/AR alts.
 * Renders are marked so the viewer labels them non-contractual.
 *
 * Built from the curation pass over the client's media — regenerate rather
 * than hand-edit when the client's set changes.
 */
export const galleries: Record<string, GalleryRef[]> = {
  "al-anbar": [
    {
      key: "g_al_anbar_01",
      nature: "render",
      sameAs: "hp_al_anbar",
      alt: {
        fr: "Rendu de la résidence Al Anbar, à Marrakech, vue depuis un carrefour : immeubles ocre rose aux fenêtres à ferronnerie et petits balcons, palmiers et passage piéton au premier plan.",
        ar: "تصوّر لإقامة العنبر بمراكش من أحد ملتقيات الطرق: عمارات بلون المغرة الوردية بنوافذ ذات مشبّكات حديدية وشرفات صغيرة، ونخيل وممرّ للراجلين في المقدّمة.",
      },
    },
    {
      key: "g_al_anbar_02",
      nature: "render",
      alt: {
        fr: "Rendu de la résidence Al Anbar, à Marrakech : longue façade aux tons ocre rose et brique rythmée de lames noires verticales, le long d'une rue bordée de places de stationnement et de palmiers.",
        ar: "تصوّر لإقامة العنبر بمراكش: واجهة طويلة بألوان المغرة الوردية والآجر تتخلّلها شفرات سوداء عمودية، على امتداد شارع تحفّه مواقف السيارات وأشجار النخيل.",
      },
    },
  ],
  "al-anbra": [
    {
      key: "g_al_anbra_01",
      nature: "photograph",
      sameAs: "hp_al_anbra",
      alt: {
        fr: "Entrée d'un immeuble d'Al Anbra, à Essaouira : façades beige et sable rythmées de persiennes et de hublots, allée pavée et plantations récentes.",
        ar: "مدخل إحدى عمارات إقامة العنبرة بالصويرة: واجهات بلون البيج والرمل تتخللها شرائح تهوية ونوافذ دائرية، وممرّ مرصوف ونباتات حديثة الغرس.",
      },
    },
    {
      key: "g_al_anbra_02",
      nature: "photograph",
      alt: {
        fr: "Séjour non meublé d'un appartement d'Al Anbra, à Essaouira : carrelage clair brillant, faux plafond à caisson et couloir menant aux chambres.",
        ar: "صالون غير مؤثث في إحدى شقق إقامة العنبرة بالصويرة: أرضية من البلاط الفاتح اللامع، سقف معلّق متدرّج، وممرّ يؤدي إلى الغرف.",
      },
    },
    {
      key: "g_al_anbra_03",
      nature: "photograph",
      alt: {
        fr: "Cuisine d'un appartement d'Al Anbra, à Essaouira : meubles bas en bois, plan de travail noir, crédence en carreaux à motifs, four encastré et réfrigérateur.",
        ar: "مطبخ إحدى شقق إقامة العنبرة بالصويرة: خزائن سفلية خشبية، سطح عمل أسود، جدار مكسوّ ببلاط مزخرف، فرن مدمج وثلاجة.",
      },
    },
    {
      key: "g_al_anbra_04",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement d'Al Anbra, à Essaouira, ouvrant sur un dressing en bois avec étagères et tiroirs.",
        ar: "غرفة نوم في إحدى شقق إقامة العنبرة بالصويرة تنفتح على غرفة ملابس خشبية برفوف وأدراج.",
      },
    },
    {
      key: "g_al_anbra_05",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement d'Al Anbra, à Essaouira : baie coulissante sur un balcon à balustres et sol imitation bois.",
        ar: "غرفة نوم في إحدى شقق إقامة العنبرة بالصويرة: باب زجاجي منزلق يطلّ على شرفة بدرابزين، وأرضية بمظهر الخشب.",
      },
    },
    {
      key: "g_al_anbra_06",
      nature: "photograph",
      alt: {
        fr: "Chambre ensoleillée d'un appartement d'Al Anbra, à Essaouira : porte-fenêtre sur balcon, fenêtre à volet roulant et sol imitation bois.",
        ar: "غرفة نوم مشمسة في إحدى شقق إقامة العنبرة بالصويرة: باب زجاجي على الشرفة، نافذة بمصراع ملفوف، وأرضية بمظهر الخشب.",
      },
    },
    {
      key: "g_al_anbra_07",
      nature: "photograph",
      alt: {
        fr: "Deux chambres d'un appartement d'Al Anbra, à Essaouira, vues depuis le dégagement : portes en bois, fenêtres et accès au balcon.",
        ar: "غرفتان في إحدى شقق إقامة العنبرة بالصويرة كما تبدوان من الممرّ: أبواب خشبية، نوافذ ومنفذ إلى الشرفة.",
      },
    },
    {
      key: "g_al_anbra_08",
      nature: "photograph",
      alt: {
        fr: "Dressing en bois et salle d'eau attenante dans un appartement d'Al Anbra, à Essaouira : penderie, tiroirs et douche à paroi vitrée.",
        ar: "غرفة ملابس خشبية وحمّام ملحق بها في إحدى شقق إقامة العنبرة بالصويرة: خزانة تعليق، أدراج ودُشّ بحاجز زجاجي.",
      },
    },
    {
      key: "g_al_anbra_09",
      nature: "photograph",
      alt: {
        fr: "Salle de bain d'un appartement d'Al Anbra, à Essaouira : douche derrière paroi vitrée, meuble vasque et carrelage gris à motifs.",
        ar: "حمّام في إحدى شقق إقامة العنبرة بالصويرة: دُشّ خلف حاجز زجاجي، مغسلة بخزانة، وبلاط رمادي مزخرف.",
      },
    },
    {
      key: "g_al_anbra_10",
      nature: "photograph",
      alt: {
        fr: "Balcon d'un appartement d'Al Anbra, à Essaouira : baie coulissante à volet roulant et garde-corps à balustres blancs.",
        ar: "شرفة إحدى شقق إقامة العنبرة بالصويرة: باب زجاجي منزلق بمصراع ملفوف ودرابزين أبيض.",
      },
    },
    {
      key: "g_al_anbra_11",
      nature: "photograph",
      alt: {
        fr: "Cage d'escalier d'un immeuble d'Al Anbra, à Essaouira : marches en marbre, main courante en bois et hublot sur le palier.",
        ar: "درج إحدى عمارات إقامة العنبرة بالصويرة: درجات من الرخام، درابزين خشبي ونافذة دائرية على البسطة.",
      },
    },
  ],
  "al-yassamine": [
    {
      key: "g_al_yassamine_04",
      nature: "photograph",
      sameAs: "hp_al_yassamine",
      alt: {
        fr: "Salon d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira : canapé d'angle à la marocaine, table basse en bois et plafond à moulures.",
        ar: "صالون شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة: أريكة زاوية على الطراز المغربي، طاولة خشبية منخفضة، وسقف بزخارف جبسية.",
      },
    },
    {
      key: "g_al_yassamine_05",
      nature: "photograph",
      alt: {
        fr: "Cuisine d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira : meubles bruns, plan de travail en granit, four encastré et plaque de cuisson.",
        ar: "مطبخ شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة: خزائن بنية، سطح عمل من الغرانيت، فرن مدمج وموقد طبخ.",
      },
    },
    {
      key: "g_al_yassamine_06",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira : lit double, commode en bois clair et porte-fenêtre voilée.",
        ar: "غرفة نوم في شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة: سرير مزدوج، خزانة أدراج بخشب فاتح، وباب زجاجي بستارة.",
      },
    },
    {
      key: "g_al_yassamine_07",
      nature: "photograph",
      alt: {
        fr: "Seconde chambre d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira, aménagée avec un lit simple, un bureau et un pouf.",
        ar: "غرفة ثانية في شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة، مجهّزة بسرير فردي ومكتب وكرسي كيس.",
      },
    },
    {
      key: "g_al_yassamine_08",
      nature: "photograph",
      alt: {
        fr: "Salle de bain d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira : baignoire, meuble vasque sombre et faïence beige à frise noire.",
        ar: "حمّام شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة: حوض استحمام، مغسلة بخزانة داكنة، وبلاط جداري بيج بشريط أسود.",
      },
    },
    {
      key: "g_al_yassamine_01",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Résidence livrée Al Yassamine, à Essaouira : immeubles blancs et sable en R+3, rez-de-chaussée sous portique et pelouse plantée de palmiers.",
        ar: "إقامة الياسمين المُسلَّمة بالصويرة: عمارات بيضاء ورملية من طابق أرضي وثلاثة طوابق، رواق بالطابق الأرضي، ومرج مغروس بالنخيل.",
      },
    },
    {
      key: "g_al_yassamine_02",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Façade de la résidence livrée Al Yassamine, à Essaouira : fenêtres cintrées, panneaux à lames et pelouse plantée d'araucarias et de palmiers.",
        ar: "واجهة إقامة الياسمين المُسلَّمة بالصويرة: نوافذ مقوّسة، ألواح تهوية مُضلَّعة، ومرج مغروس بأشجار الأروكاريا والنخيل.",
      },
    },
    {
      key: "g_al_yassamine_03",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Immeubles de la résidence livrée Al Yassamine, à Essaouira, alignés le long d'une voie bordée de pelouses et de jeunes palmiers.",
        ar: "عمارات إقامة الياسمين المُسلَّمة بالصويرة متتابعة على طول طريق تحفّه مروج ونخيل فتيّ.",
      },
    },
  ],
  "amaia": [
    {
      key: "g_amaia_01",
      nature: "render",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : allée piétonne centrale plantée de palmiers entre deux voies, bordée d'immeubles ocre rose en R+2 avec commerces en rez-de-chaussée.",
        ar: "تصوّر لأمايا بمراكش: ممر راجل مركزي مغروس بالنخيل بين طريقين، تحفّه عمارات وردية مغرة من طابقين ومحلات تجارية بالطابق الأرضي.",
      },
    },
    {
      key: "g_amaia_02",
      nature: "render",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : rond-point avec fontaine à l'entrée d'une avenue bordée de palmiers et d'immeubles aux façades ocre et rouge terre.",
        ar: "تصوّر لأمايا بمراكش: مدار بنافورة عند مدخل شارع تحفّه أشجار النخيل وعمارات بواجهات بلون المغرة والأحمر الترابي.",
      },
    },
    {
      key: "g_amaia_03",
      nature: "render",
      sameAs: "th_amaia",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : rue résidentielle pavée bordée de palmiers et d'arbres, entre des immeubles ocre et rouge terre à balcons.",
        ar: "تصوّر لأمايا بمراكش: شارع سكني مبلّط تصطفّ على جانبيه أشجار النخيل، بين عمارات بلون المغرة والأحمر الترابي ذات شرفات.",
      },
    },
    {
      key: "g_amaia_04",
      nature: "render",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : locaux commerciaux en rez-de-chaussée à parement de pierre claire et rideaux métalliques, le long d'une avenue plantée de palmiers.",
        ar: "تصوّر لأمايا بمراكش: محلات تجارية بالطابق الأرضي بكسوة حجرية فاتحة وستائر معدنية، على امتداد شارع مغروس بالنخيل.",
      },
    },
    {
      key: "g_amaia_05",
      nature: "render",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : jardin intérieur arboré entre les immeubles, allée dallée et aire de jeux pour enfants à l'arrière-plan.",
        ar: "تصوّر لأمايا بمراكش: حديقة داخلية مشجّرة بين العمارات، وممر مبلّط، وفضاء ألعاب للأطفال في الخلفية.",
      },
    },
    {
      key: "g_amaia_06",
      nature: "render",
      alt: {
        fr: "Rendu d'Amaïa, à Marrakech : pelouse avec transats et parasols devant une aire de jeux pour enfants, au pied des immeubles ocre rose.",
        ar: "تصوّر لأمايا بمراكش: مساحة عشبية بكراسي استلقاء ومظلات أمام فضاء ألعاب للأطفال، عند أسفل العمارات الوردية المغرة.",
      },
    },
  ],
  "assafa": [
    {
      key: "g_assafa_01",
      nature: "render",
      sameAs: "hp_assafa",
      alt: {
        fr: "Rendu des immeubles d'Assafa, à Had Soualem : façades blanches et grises sur quatre étages, commerces vitrés en rez-de-chaussée et palmiers le long du trottoir.",
        ar: "تصوّر لعمارات إقامة الصفاء بحد السوالم: واجهات بيضاء ورمادية من أربعة طوابق، ومحلات تجارية بواجهات زجاجية في الطابق الأرضي، ونخيل على امتداد الرصيف.",
      },
    },
    {
      key: "g_assafa_03",
      nature: "photograph",
      sameAs: "tp_assafa",
      alt: {
        fr: "Salon de l'appartement témoin d'Assafa, à Had Soualem : banquettes marocaines bleu-vert en angle, lustre circulaire à pampilles et sol en carrelage effet marbre.",
        ar: "صالون الشقة النموذجية لإقامة الصفاء بحد السوالم: أرائك مغربية زرقاء مخضرّة على شكل زاوية، وثريا دائرية بقطع متدلية، وأرضية من بلاط بمظهر الرخام.",
      },
    },
    {
      key: "g_assafa_04",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin d'Assafa, à Had Soualem, vu vers l'entrée : banquettes face à face, table basse en verre fumé et console blanche surmontée de miroirs.",
        ar: "صالون الشقة النموذجية لإقامة الصفاء بحد السوالم من جهة المدخل: أرائك متقابلة، وطاولة منخفضة من الزجاج المدخّن، وكونسول أبيض تعلوه مرايا.",
      },
    },
    {
      key: "g_assafa_05",
      nature: "photograph",
      alt: {
        fr: "Pièce de l'appartement témoin d'Assafa, à Had Soualem, aménagée en coin salon : canapé modulable beige, coussins orangés et voilage devant la fenêtre.",
        ar: "غرفة في الشقة النموذجية لإقامة الصفاء بحد السوالم مهيّأة كركن جلوس: أريكة بيج من وحدات منفصلة، ووسائد برتقالية، وستارة خفيفة أمام النافذة.",
      },
    },
    {
      key: "g_assafa_06",
      nature: "photograph",
      alt: {
        fr: "Entrée de l'appartement témoin d'Assafa, à Had Soualem : console blanche et miroirs ronds le long du couloir, sol effet marbre et vase haut en céramique.",
        ar: "مدخل الشقة النموذجية لإقامة الصفاء بحد السوالم: كونسول أبيض ومرايا دائرية على امتداد الممر، وأرضية بمظهر الرخام، ومزهرية خزفية طويلة.",
      },
    },
    {
      key: "g_assafa_07",
      nature: "photograph",
      alt: {
        fr: "Cuisine de l'appartement témoin d'Assafa, à Had Soualem : meubles bas en bois, plan de travail gris veiné, crédence en carreaux à motifs et porte vitrée vers l'extérieur.",
        ar: "مطبخ الشقة النموذجية لإقامة الصفاء بحد السوالم: خزائن سفلية خشبية، وسطح عمل رمادي مجزّع، وجدار خلفي من بلاط مزخرف، وباب زجاجي نحو الخارج.",
      },
    },
    {
      key: "g_assafa_08",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin d'Assafa, à Had Soualem : lit double à tête de lit tapissée beige, papier peint à motifs végétaux et sol effet parquet.",
        ar: "غرفة نوم في الشقة النموذجية لإقامة الصفاء بحد السوالم: سرير مزدوج بمسند منجّد بلون بيج، وورق جدران بزخارف نباتية، وأرضية بمظهر الخشب.",
      },
    },
    {
      key: "g_assafa_09",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin d'Assafa, à Had Soualem : lit double, armoire blanche à portes pleines et porte ouverte sur le couloir.",
        ar: "غرفة نوم في الشقة النموذجية لإقامة الصفاء بحد السوالم: سرير مزدوج، وخزانة ملابس بيضاء، وباب مفتوح على الممر.",
      },
    },
    {
      key: "g_assafa_10",
      nature: "photograph",
      alt: {
        fr: "Chambre à lit simple de l'appartement témoin d'Assafa, à Had Soualem : tête de lit grise, linge mauve et coin bureau avec chaise blanche.",
        ar: "غرفة بسرير فردي في الشقة النموذجية لإقامة الصفاء بحد السوالم: مسند سرير رمادي، وأغطية بنفسجية، وركن مكتب بكرسي أبيض.",
      },
    },
    {
      key: "g_assafa_11",
      nature: "photograph",
      alt: {
        fr: "Chambre à lit simple de l'appartement témoin d'Assafa, à Had Soualem : armoire blanche avec étagères ouvertes, bureau suspendu et sol effet parquet.",
        ar: "غرفة بسرير فردي في الشقة النموذجية لإقامة الصفاء بحد السوالم: خزانة بيضاء برفوف مفتوحة، ومكتب معلّق، وأرضية بمظهر الخشب.",
      },
    },
    {
      key: "g_assafa_12",
      nature: "photograph",
      alt: {
        fr: "Salle de bains de l'appartement témoin d'Assafa, à Had Soualem : lavabo sur colonne, miroir rétroéclairé, carrelage gris veiné et douche aux carreaux à motifs.",
        ar: "حمّام الشقة النموذجية لإقامة الصفاء بحد السوالم: مغسلة بعمود، ومرآة بإضاءة خلفية، وبلاط رمادي مجزّع، ودُش بجدار من بلاط مزخرف.",
      },
    },
    {
      key: "g_assafa_02",
      nature: "render",
      alt: {
        fr: "Rendu du rez-de-chaussée commercial d'Assafa, à Had Soualem : vitrines éclairées sous les étages, encadrements gris anthracite autour des fenêtres et trottoir planté d'orangers et de palmiers.",
        ar: "تصوّر للطابق الأرضي التجاري لإقامة الصفاء بحد السوالم: واجهات عرض مضاءة أسفل الطوابق، وإطارات رمادية داكنة حول النوافذ، ورصيف مغروس بأشجار البرتقال والنخيل.",
      },
    },
  ],
  "assalam-tg": [
    {
      key: "g_assalam_tg_04",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin d'Assalam, à Tanger : grand canapé d'angle gris, tables basses rondes en bois, lustre à globes et coin repas.",
        ar: "صالون الشقة النموذجية لإقامة السلام بطنجة: أريكة زاوية رمادية كبيرة، طاولتان منخفضتان مستديرتان من الخشب، ثريا بكرات زجاجية وركن للطعام.",
      },
    },
    {
      key: "g_assalam_tg_05",
      nature: "photograph",
      alt: {
        fr: "Séjour de l'appartement témoin d'Assalam, à Tanger : canapé gris, table à manger ronde en verre et porte-fenêtre ouvrant sur le balcon.",
        ar: "صالة الجلوس في الشقة النموذجية لإقامة السلام بطنجة: أريكة رمادية، طاولة طعام مستديرة من الزجاج وباب زجاجي يُفضي إلى الشرفة.",
      },
    },
    {
      key: "g_assalam_tg_06",
      nature: "photograph",
      alt: {
        fr: "Autre coin du séjour de l'appartement témoin d'Assalam, à Tanger : mur à motif géométrique bleu nuit, canapé en velours bleu, poufs bleu canard et porte-fenêtre sur le balcon.",
        ar: "ركن آخر من صالة الجلوس في الشقة النموذجية لإقامة السلام بطنجة: جدار بزخارف هندسية بالأزرق الداكن، أريكة من المخمل الأزرق، مقاعد صغيرة زرقاء وباب زجاجي نحو الشرفة.",
      },
    },
    {
      key: "g_assalam_tg_07",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin d'Assalam, à Tanger : meubles foncés, plan de travail en granit, plaque de cuisson au gaz et four encastré.",
        ar: "المطبخ المجهّز في الشقة النموذجية لإقامة السلام بطنجة: خزائن داكنة، سطح عمل من الغرانيت، موقد غاز وفرن مدمج.",
      },
    },
    {
      key: "g_assalam_tg_08",
      nature: "photograph",
      alt: {
        fr: "Chambre parentale de l'appartement témoin d'Assalam, à Tanger : lit à tête de lit capitonnée et porte ouverte sur une salle de bain.",
        ar: "غرفة النوم الرئيسية في الشقة النموذجية لإقامة السلام بطنجة: سرير بلوح رأس منجّد وباب مفتوح على حمّام.",
      },
    },
    {
      key: "g_assalam_tg_09",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfants de l'appartement témoin d'Assalam, à Tanger : deux lits simples, bureau blanc et décor mural de montgolfières.",
        ar: "غرفة الأطفال في الشقة النموذجية لإقامة السلام بطنجة: سريران فرديان، مكتب أبيض وملصقات جدارية على شكل مناطيد.",
      },
    },
    {
      key: "g_assalam_tg_10",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin d'Assalam, à Tanger, aménagée avec un canapé bleu clair, une coiffeuse blanche à miroir ovale et un tapis rayé.",
        ar: "غرفة في الشقة النموذجية لإقامة السلام بطنجة، مؤثثة بأريكة زرقاء فاتحة وطاولة زينة بيضاء بمرآة بيضوية وسجادة مخططة.",
      },
    },
    {
      key: "g_assalam_tg_11",
      nature: "photograph",
      alt: {
        fr: "Salle de bain de l'appartement témoin d'Assalam, à Tanger : carrelage métallisé argent et or, meuble vasque suspendu et miroir noir ouvragé.",
        ar: "حمّام الشقة النموذجية لإقامة السلام بطنجة: بلاط بلمسات فضية وذهبية، مغسلة على خزانة معلّقة ومرآة سوداء بإطار مزخرف.",
      },
    },
    {
      key: "g_assalam_tg_12",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau de l'appartement témoin d'Assalam, à Tanger : carrelage à motif d'arabesques, meuble vasque blanc et WC.",
        ar: "حمّام في الشقة النموذجية لإقامة السلام بطنجة: بلاط بنقوش أرابيسك، خزانة مغسلة بيضاء ومرحاض.",
      },
    },
    {
      key: "g_assalam_tg_13",
      nature: "photograph",
      alt: {
        fr: "Baignoire avec rideau de douche dans une salle de bain de l'appartement témoin d'Assalam, à Tanger.",
        ar: "حوض استحمام بستارة في أحد حمّامات الشقة النموذجية لإقامة السلام بطنجة.",
      },
    },
    {
      key: "g_assalam_tg_14",
      nature: "photograph",
      alt: {
        fr: "Terrasse de l'appartement témoin d'Assalam, à Tanger : salon de jardin en résine tressée, gazon synthétique et jardinières, avec vue sur la rue.",
        ar: "تراس الشقة النموذجية لإقامة السلام بطنجة: أثاث خارجي من الراتنج المضفور، عشب اصطناعي وأحواض نباتات، مع إطلالة على الشارع.",
      },
    },
    {
      key: "g_assalam_tg_01",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Résidence livrée Assalam, à Tanger : immeubles alignés le long d'une avenue plantée d'arbres, rez-de-chaussée vitré et immeuble de bureaux à façade de verre.",
        ar: "إقامة السلام المُسلَّمة بطنجة: عمارات ممتدة على طول شارع تصطفّ فيه الأشجار، بطابق أرضي زجاجي، وإلى جانبها بناية مكاتب بواجهة زجاجية.",
      },
    },
    {
      key: "g_assalam_tg_02",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Résidence livrée Assalam, à Tanger : deux immeubles d'habitation encadrant un immeuble de bureaux à façade vitrée verte, drapeau marocain au premier plan.",
        ar: "إقامة السلام المُسلَّمة بطنجة: عمارتان سكنيتان تحيطان ببناية مكاتب ذات واجهة زجاجية خضراء، والعلم المغربي في المقدمة.",
      },
    },
    {
      key: "g_assalam_tg_03",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Angle d'un immeuble de la résidence livrée Assalam, à Tanger, vu en contre-plongée : façade claire et loggias en retrait.",
        ar: "زاوية إحدى عمارات إقامة السلام المُسلَّمة بطنجة في لقطة من الأسفل: واجهة فاتحة اللون وشرفات غائرة.",
      },
    },
  ],
  "bougainvillier": [
    {
      key: "g_bougainvillier_01",
      nature: "photograph",
      alt: {
        fr: "Cour intérieure de la résidence livrée Bougainvillier, à Mohammedia : piscine entourée de palmiers et de massifs fleuris, au pied d'immeubles aux façades beiges.",
        ar: "الفناء الداخلي لإقامة بوغانفيلي المُسلَّمة بالمحمدية: مسبح تحيط به أشجار النخيل وأحواض الزهور، عند أسفل عمارات بواجهات بلون بيج.",
      },
    },
    {
      key: "g_bougainvillier_02",
      nature: "photograph",
      alt: {
        fr: "Allée pavée de la résidence livrée Bougainvillier, à Mohammedia, bordée de pelouses plantées et de lampadaires, entre des immeubles aux façades rosées.",
        ar: "ممر مرصوف داخل إقامة بوغانفيلي المُسلَّمة بالمحمدية، تحفّه مساحات عشبية مغروسة وأعمدة إنارة، بين عمارات بواجهات وردية فاتحة.",
      },
    },
    {
      key: "g_bougainvillier_03",
      nature: "photograph",
      sameAs: "th_bougainvillier",
      alt: {
        fr: "Séjour d'un appartement de Bougainvillier, résidence livrée à Mohammedia : canapés gris, coin lecture, table à manger aux chaises de velours bleu et sol clair brillant.",
        ar: "صالون شقة في بوغانفيلي، إقامة مُسلَّمة بالمحمدية: أرائك رمادية، ركن للقراءة، طاولة طعام بكراسٍ من المخمل الأزرق وأرضية فاتحة لامعة.",
      },
    },
    {
      key: "g_bougainvillier_04",
      nature: "photograph",
      alt: {
        fr: "Séjour d'un appartement de Bougainvillier, résidence livrée à Mohammedia : canapé d'angle gris sous de larges fenêtres voilées, table basse ronde et chaises de velours bleu au premier plan.",
        ar: "صالون شقة في بوغانفيلي، إقامة مُسلَّمة بالمحمدية: أريكة زاوية رمادية تحت نوافذ واسعة بستائر خفيفة، طاولة قهوة مستديرة وكراسٍ من المخمل الأزرق في المقدّمة.",
      },
    },
    {
      key: "g_bougainvillier_05",
      nature: "photograph",
      alt: {
        fr: "Coin salon d'un appartement de Bougainvillier, résidence livrée à Mohammedia : deux fauteuils orange, étagère sombre, lampadaire trépied et plafond à moulures.",
        ar: "ركن جلوس في شقة ببوغانفيلي، إقامة مُسلَّمة بالمحمدية: كرسيان بلون برتقالي، رفّ داكن، مصباح أرضي ثلاثي القوائم وسقف بزخارف جبسية.",
      },
    },
    {
      key: "g_bougainvillier_06",
      nature: "photograph",
      alt: {
        fr: "Cuisine d'un appartement de Bougainvillier, résidence livrée à Mohammedia : plan de travail en granit, meubles taupe, four encastré et hotte murale.",
        ar: "مطبخ شقة في بوغانفيلي، إقامة مُسلَّمة بالمحمدية: سطح عمل من الغرانيت، خزائن بلون رمادي بنّي، فرن مدمج وشفّاط مثبّت على الجدار.",
      },
    },
    {
      key: "g_bougainvillier_07",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement de Bougainvillier, résidence livrée à Mohammedia : lit double, papier peint ocre à motif floral, suspension en rotin et voilages blancs.",
        ar: "غرفة نوم في شقة ببوغانفيلي، إقامة مُسلَّمة بالمحمدية: سرير مزدوج، ورق جدران بلون المغرة بزخارف نباتية، ثريا من الخيزران وستائر بيضاء خفيفة.",
      },
    },
    {
      key: "g_bougainvillier_08",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement de Bougainvillier, résidence livrée à Mohammedia : lit double au linge bleu, mur effet brique blanchie et rideaux vert d'eau.",
        ar: "غرفة نوم في شقة ببوغانفيلي، إقامة مُسلَّمة بالمحمدية: سرير مزدوج بأغطية زرقاء، جدار بمظهر الطوب الأبيض وستائر بلون أخضر فاتح.",
      },
    },
    {
      key: "g_bougainvillier_09",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfant d'un appartement de Bougainvillier, résidence livrée à Mohammedia : lit à barreaux blanc, cheval à bascule rouge et tapis gris à pois.",
        ar: "غرفة أطفال في شقة ببوغانفيلي، إقامة مُسلَّمة بالمحمدية: سرير رضيع أبيض، حصان هزّاز أحمر وزربية رمادية منقّطة.",
      },
    },
    {
      key: "g_bougainvillier_10",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau d'un appartement de Bougainvillier, résidence livrée à Mohammedia : receveur de douche, meuble vasque blanc et murs en mosaïque beige.",
        ar: "حمّام شقة في بوغانفيلي، إقامة مُسلَّمة بالمحمدية: حوض دُشّ، خزانة مغسلة بيضاء وجدران مكسوّة بفسيفساء بلون بيج.",
      },
    },
  ],
  "dyar-al-bahia-2": [
    {
      key: "g_dyar_al_bahia_2_01",
      nature: "render",
      sameAs: "th_dyar_al_bahia",
      alt: {
        fr: "Rendu de Dyar Al Bahia 2, à Témara : immeuble aux façades claires et balcons vitrés, palmiers et place piétonne devant un rez-de-chaussée largement vitré.",
        ar: "تصوّر لإقامة ديار الباهية 2 بتمارة: عمارة بواجهات فاتحة وشرفات زجاجية، ونخيل وساحة للراجلين أمام طابق أرضي بواجهات زجاجية واسعة.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_02",
      nature: "render",
      alt: {
        fr: "Rendu de Dyar Al Bahia 2, à Témara, vu depuis l'angle de la rue : immeubles aux façades claires rythmées de bardage sombre, balcons vitrés et enseigne Aswak Assalam en rez-de-chaussée.",
        ar: "تصوّر لإقامة ديار الباهية 2 بتمارة من زاوية الشارع: عمارات بواجهات فاتحة تتخلّلها كسوة داكنة، وشرفات زجاجية، ولافتة أسواق السلام بالطابق الأرضي.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_03",
      nature: "render",
      alt: {
        fr: "Rendu de Dyar Al Bahia 2, à Témara : une mosquée et son minaret au premier plan, devant les immeubles de la résidence.",
        ar: "تصوّر لإقامة ديار الباهية 2 بتمارة: مسجد بصومعته في المقدّمة، أمام عمارات الإقامة.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_04",
      nature: "render",
      alt: {
        fr: "Rendu de Dyar Al Bahia 2, à Témara : place plantée de palmiers entre deux immeubles, rampe d'accès au parking en sous-sol et enseigne Aswak Assalam en rez-de-chaussée.",
        ar: "تصوّر لإقامة ديار الباهية 2 بتمارة: ساحة يزيّنها النخيل بين عمارتين، ومنحدر الولوج إلى المرأب تحت الأرضي، ولافتة أسواق السلام بالطابق الأرضي.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_05",
      nature: "photograph",
      alt: {
        fr: "Séjour de l'appartement témoin de Dyar Al Bahia 2, à Témara : canapé d'angle clair, table ronde entourée de chaises jaunes et mur tapissé d'un motif de feuillages.",
        ar: "صالون الشقة النموذجية لديار الباهية 2 بتمارة: أريكة زاوية فاتحة اللون، وطاولة مستديرة تحيط بها كراسٍ صفراء، وجدار مكسوّ بورق حائط بنقوش أوراق نباتية.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_06",
      nature: "photograph",
      alt: {
        fr: "Séjour de l'appartement témoin de Dyar Al Bahia 2, à Témara : grand canapé clair et table basse en métal noir, avec le coin repas aux chaises jaunes en arrière-plan.",
        ar: "صالون الشقة النموذجية لديار الباهية 2 بتمارة: أريكة كبيرة فاتحة اللون وطاولة منخفضة من المعدن الأسود، وركن الأكل بكراسيه الصفراء في الخلفية.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_07",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin de Dyar Al Bahia 2, à Témara : meubles façon bois, plan de travail noir, plaque de cuisson, four encastré et crédence en carreaux à motifs, avec une porte vitrée ouvrant sur la terrasse.",
        ar: "المطبخ المجهّز بالشقة النموذجية لديار الباهية 2 بتمارة: خزائن بلون الخشب، وسطح عمل أسود، وموقد وفرن مدمج، وجدار مكسوّ ببلاط مزخرف، مع باب زجاجي يفتح على الشرفة.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_08",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin de Dyar Al Bahia 2, à Témara : lit double à tête de lit grise, papier peint à motifs dorés, console blanche et miroir rond en rotin.",
        ar: "غرفة نوم بالشقة النموذجية لديار الباهية 2 بتمارة: سرير مزدوج بمسند رمادي، وورق حائط بنقوش ذهبية، وطاولة بيضاء ومرآة دائرية من الخيزران.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_09",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin de Dyar Al Bahia 2, à Témara : lit double au linge rayé, papier peint à motifs dorés et placard à portes en bois.",
        ar: "غرفة نوم بالشقة النموذجية لديار الباهية 2 بتمارة: سرير مزدوج بأغطية مخطّطة، وورق حائط بنقوش ذهبية، وخزانة حائطية بأبواب خشبية.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_10",
      nature: "photograph",
      alt: {
        fr: "Chambre à lit simple de l'appartement témoin de Dyar Al Bahia 2, à Témara : lit bleu, tapis bleu, bureau blanc et mur habillé d'un papier peint effet bois.",
        ar: "غرفة بسرير فردي في الشقة النموذجية لديار الباهية 2 بتمارة: سرير أزرق وزربية زرقاء ومكتب أبيض، وجدار مكسوّ بورق حائط يحاكي الخشب.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_11",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfant de l'appartement témoin de Dyar Al Bahia 2, à Témara : lit cabane en bois au linge rose, tapis rond et papier peint coloré à motifs d'arcs-en-ciel et de fraises.",
        ar: "غرفة الأطفال بالشقة النموذجية لديار الباهية 2 بتمارة: سرير خشبي على شكل كوخ بأغطية وردية، وزربية دائرية، وورق حائط ملوّن بنقوش أقواس قزح وحبّات فراولة.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_12",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau de l'appartement témoin de Dyar Al Bahia 2, à Témara : douche à paroi vitrée, faïence beige à rayures façon bois, vasque sur meuble en bois et WC.",
        ar: "حمّام بدوش في الشقة النموذجية لديار الباهية 2 بتمارة: دوش بحاجز زجاجي، وبلاط بيج بخطوط تحاكي الخشب، ومغسلة فوق خزانة خشبية، ومرحاض.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_13",
      nature: "photograph",
      alt: {
        fr: "Toilettes de l'appartement témoin de Dyar Al Bahia 2, à Témara : murs bleus, vasque posée sur un plan en bois, mosaïque murale et WC.",
        ar: "دورة المياه بالشقة النموذجية لديار الباهية 2 بتمارة: جدران زرقاء، ومغسلة فوق سطح خشبي، وفسيفساء جدارية، ومقعد مرحاض.",
      },
    },
    {
      key: "g_dyar_al_bahia_2_14",
      nature: "photograph",
      alt: {
        fr: "Terrasse de l'appartement témoin de Dyar Al Bahia 2, à Témara : deux chaises pliantes blanches, tablette fixée au garde-corps ajouré et végétation derrière la balustrade.",
        ar: "شرفة الشقة النموذجية لديار الباهية 2 بتمارة: كرسيان أبيضان قابلان للطي، وطاولة صغيرة مثبّتة على الدرابزين المخرَّم، ونباتات خلف السياج.",
      },
    },
  ],
  "izdihar": [
    {
      key: "g_izdihar_01",
      nature: "render",
      sameAs: "th_izdihar",
      alt: {
        fr: "Rendu de la résidence Izdihar, à Essaouira : immeubles blancs sur trois niveaux aux encadrements de fenêtres couleur bois, balcons à garde-corps métalliques et palmiers en bord de voie.",
        ar: "تصوّر لإقامة الازدهار بالصويرة: عمارات بيضاء من ثلاثة مستويات بإطارات نوافذ بلون الخشب، وشرفات بحواجز معدنية، ونخيل على حافة الطريق.",
      },
    },
    {
      key: "g_izdihar_02",
      nature: "render",
      alt: {
        fr: "Rendu de la façade sur rue de la résidence Izdihar, à Essaouira : bâtiment blanc sur trois niveaux, fenêtres encadrées de taupe et palmiers alignés le long du trottoir.",
        ar: "تصوّر للواجهة المطلة على الشارع بإقامة الازدهار بالصويرة: مبنى أبيض من ثلاثة مستويات، ونوافذ بإطارات رمادية مائلة إلى البني، ونخيل مصطفّ على طول الرصيف.",
      },
    },
  ],
  "jasmin": [
    {
      key: "g_jasmin_03",
      nature: "photograph",
      sameAs: "hp_jasmin",
      alt: {
        fr: "Séjour de l'appartement témoin de Jasmin, à Mohammedia : grand canapé d'angle crème, table ronde en verre, lustre à globes et voilages pleine hauteur.",
        ar: "صالون الشقة النموذجية في جاسمين بالمحمدية: أريكة زاوية كبيرة بلون كريمي، طاولة مستديرة من الزجاج، ثريا بكرات زجاجية وستائر بكامل الارتفاع.",
      },
    },
    {
      key: "g_jasmin_04",
      nature: "photograph",
      sameAs: "tp_jasmin",
      alt: {
        fr: "Séjour de l'appartement témoin de Jasmin, à Mohammedia : coin repas à table ronde et chaises bouclées, miroir rond et porte d'entrée en bois.",
        ar: "صالون الشقة النموذجية في جاسمين بالمحمدية: ركن طعام بطاولة مستديرة وكراسٍ منجّدة، مرآة دائرية وباب مدخل خشبي.",
      },
    },
    {
      key: "g_jasmin_05",
      nature: "photograph",
      alt: {
        fr: "Cuisine de l'appartement témoin de Jasmin, à Mohammedia : crédence effet marbre blanc, plaque de cuisson à gaz, four encastré et table haute.",
        ar: "مطبخ الشقة النموذجية في جاسمين بالمحمدية: واجهة جدارية بمظهر الرخام الأبيض، موقد غاز، فرن مدمج وطاولة عالية.",
      },
    },
    {
      key: "g_jasmin_06",
      nature: "photograph",
      alt: {
        fr: "Table haute de la cuisine de l'appartement témoin de Jasmin, à Mohammedia : plateau effet marbre, deux tabourets noirs et papier peint à motif de palmes.",
        ar: "الطاولة العالية في مطبخ الشقة النموذجية بجاسمين بالمحمدية: سطح بمظهر الرخام، مقعدان أسودان وورق جدران بزخارف سعف النخيل.",
      },
    },
    {
      key: "g_jasmin_07",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin de Jasmin, à Mohammedia : lit double à tête de lit en velours cuivré, fauteuil bouclé blanc et voilages.",
        ar: "غرفة نوم في الشقة النموذجية بجاسمين بالمحمدية: سرير مزدوج بلوح رأس مخملي نحاسي اللون، كرسي أبيض منجّد وستائر خفيفة.",
      },
    },
    {
      key: "g_jasmin_08",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfants de l'appartement témoin de Jasmin, à Mohammedia : deux lits simples, papier peint illustré, bureau blanc et voilages.",
        ar: "غرفة الأطفال في الشقة النموذجية بجاسمين بالمحمدية: سريران فرديان، ورق جدران مزيّن برسومات، مكتب أبيض وستائر خفيفة.",
      },
    },
    {
      key: "g_jasmin_09",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau de l'appartement témoin de Jasmin, à Mohammedia : WC suspendu, carrelage à motifs bleus et vasque à poser sur un plan effet marbre noir.",
        ar: "حمّام الشقة النموذجية في جاسمين بالمحمدية: مرحاض معلّق، بلاط بزخارف زرقاء ومغسلة فوق سطح بمظهر الرخام الأسود.",
      },
    },
  ],
  "jnane-souss": [
    {
      key: "g_jnane_souss_02",
      nature: "photograph",
      sameAs: "hp_jnane_souss",
      alt: {
        fr: "Salon de l'appartement témoin de Jnane Souss, à Agadir : banquettes marocaines bleu-vert en U, tables basses rondes gigognes et tapis rond sur sol clair.",
        ar: "صالون الشقة النموذجية بإقامة جنان سوس بأكادير: أرائك مغربية بلون أزرق مخضرّ على شكل حرف U، وطاولات منخفضة دائرية متداخلة، وزربية دائرية على أرضية فاتحة.",
      },
    },
    {
      key: "g_jnane_souss_03",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin de Jnane Souss, à Agadir : table basse ronde, meuble télévision en bois et porte en bois donnant sur l'entrée.",
        ar: "صالون الشقة النموذجية بإقامة جنان سوس بأكادير: طاولة منخفضة دائرية، ورفّ تلفاز خشبي، وباب خشبي يؤدي إلى المدخل.",
      },
    },
    {
      key: "g_jnane_souss_04",
      nature: "photograph",
      sameAs: "tp_jnane_souss",
      alt: {
        fr: "Petit salon de l'appartement témoin de Jnane Souss, à Agadir : canapé d'angle écru, coussins moutarde, table ronde blanche et sol effet bois.",
        ar: "الصالون الصغير بالشقة النموذجية بإقامة جنان سوس بأكادير: أريكة زاوية بلون عاجي، ووسائد بلون الخردل، وطاولة دائرية بيضاء، وأرضية بمظهر خشبي.",
      },
    },
    {
      key: "g_jnane_souss_05",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin de Jnane Souss, à Agadir : façades chêne clair, plan de travail en granit noir, crédence en carreaux à motifs et réfrigérateur inox.",
        ar: "المطبخ المجهّز بالشقة النموذجية بإقامة جنان سوس بأكادير: واجهات من خشب البلوط الفاتح، وسطح عمل من الغرانيت الأسود، وجدار ببلاط مزخرف، وثلاجة من الفولاذ المقاوم للصدأ.",
      },
    },
    {
      key: "g_jnane_souss_06",
      nature: "photograph",
      alt: {
        fr: "Buanderie de l'appartement témoin de Jnane Souss, à Agadir : espace carrelé attenant à la cuisine, avec porte et fenêtre en aluminium gris.",
        ar: "غرفة الغسيل بالشقة النموذجية بإقامة جنان سوس بأكادير: فضاء مبلّط ملاصق للمطبخ، بباب ونافذة من الألومنيوم الرمادي.",
      },
    },
    {
      key: "g_jnane_souss_07",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin de Jnane Souss, à Agadir : lit aux coussins rouges, placard en bois, porte vers la salle d'eau et baie coulissante ouvrant sur un balcon meublé.",
        ar: "غرفة نوم بالشقة النموذجية بإقامة جنان سوس بأكادير: سرير بوسائد حمراء، وخزانة خشبية، وباب نحو الحمام، وباب زجاجي منزلق يفتح على شرفة مؤثثة.",
      },
    },
    {
      key: "g_jnane_souss_08",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfants de l'appartement témoin de Jnane Souss, à Agadir : deux lits simples à têtes de lit bleues, linge de lit imprimé et voilages blancs.",
        ar: "غرفة الأطفال بالشقة النموذجية بإقامة جنان سوس بأكادير: سريران فرديان بمسندين أزرقين، وأغطية مطبوعة، وستائر بيضاء خفيفة.",
      },
    },
    {
      key: "g_jnane_souss_09",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau attenante à la chambre de l'appartement témoin de Jnane Souss, à Agadir : douche vitrée, carrelage gris grand format et meuble vasque bois et blanc.",
        ar: "الحمام الملحق بغرفة النوم في الشقة النموذجية بإقامة جنان سوس بأكادير: دُش بحاجز زجاجي، وبلاط رمادي كبير الحجم، وخزانة مغسلة بالخشب والأبيض.",
      },
    },
    {
      key: "g_jnane_souss_10",
      nature: "photograph",
      alt: {
        fr: "Salle de bains de l'appartement témoin de Jnane Souss, à Agadir : douche à l'italienne, mur en carreaux gris à motifs, miroir rond et meuble vasque en bois clair.",
        ar: "حمام الشقة النموذجية بإقامة جنان سوس بأكادير: دُش أرضي، وجدار ببلاط رمادي مزخرف، ومرآة دائرية، وخزانة مغسلة من الخشب الفاتح.",
      },
    },
    {
      key: "g_jnane_souss_11",
      nature: "photograph",
      alt: {
        fr: "Balcon de l'appartement témoin de Jnane Souss, à Agadir : deux fauteuils en métal noir à coussins beiges et guéridon portant une plante grasse.",
        ar: "شرفة الشقة النموذجية بإقامة جنان سوس بأكادير: كرسيان من المعدن الأسود بوسائد بيج، وطاولة صغيرة عليها نبتة عصارية.",
      },
    },
    {
      key: "g_jnane_souss_01",
      nature: "render",
      smallOnly: true,
      alt: {
        fr: "Rendu de la résidence Jnane Souss, à Agadir : immeubles blancs et gris clair à balcons vitrés, vitrines commerciales en rez-de-chaussée le long d'une avenue à terre-plein planté.",
        ar: "تصوّر لإقامة جنان سوس بأكادير: عمارات بيضاء ورمادية فاتحة بشرفات زجاجية، وواجهات محلات تجارية في الطابق الأرضي على طول شارع بجزيرة وسطى مغروسة.",
      },
    },
  ],
  "les-pins-de-maamora": [
    {
      key: "g_les_pins_de_maamora_02",
      nature: "render",
      alt: {
        fr: "Rendu rapproché de la façade des Pins de Maamora, à Sala Al Jadida : balcons, panneaux ajourés à motif géométrique, palmier et vitrines en rez-de-chaussée.",
        ar: "تصوّر مقرّب لواجهة إقامة لي بان دو معمورة بسلا الجديدة: شرفات، ألواح مُخرَّمة بزخارف هندسية، نخلة وواجهات محلات في الطابق الأرضي.",
      },
    },
    {
      key: "g_les_pins_de_maamora_03",
      nature: "photograph",
      alt: {
        fr: "Séjour vide d'un appartement des Pins de Maamora, à Sala Al Jadida : sol carrelé brillant, fenêtre coulissante et portes vers la salle de bain et les autres pièces.",
        ar: "صالون فارغ في شقة بإقامة لي بان دو معمورة بسلا الجديدة: أرضية من البلاط اللامع، نافذة منزلقة وأبواب نحو الحمّام وباقي الغرف.",
      },
    },
    {
      key: "g_les_pins_de_maamora_06",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement des Pins de Maamora, à Sala Al Jadida : placard intégré à portes coulissantes en bois et parquet clair.",
        ar: "غرفة نوم في شقة بإقامة لي بان دو معمورة بسلا الجديدة: خزانة حائطية بأبواب منزلقة خشبية وأرضية خشبية فاتحة.",
      },
    },
    {
      key: "g_les_pins_de_maamora_08",
      nature: "photograph",
      alt: {
        fr: "Vue depuis la fenêtre d'un appartement des Pins de Maamora, à Sala Al Jadida, sur une mosquée à minaret et des immeubles voisins.",
        ar: "إطلالة من نافذة شقة بإقامة لي بان دو معمورة بسلا الجديدة على مسجد بصومعته وعمارات مجاورة.",
      },
    },
    {
      key: "g_les_pins_de_maamora_09",
      nature: "photograph",
      alt: {
        fr: "Parking en sous-sol des Pins de Maamora, à Sala Al Jadida : places marquées au sol et piliers balisés de rouge et de jaune.",
        ar: "المرأب تحت الأرضي لإقامة لي بان دو معمورة بسلا الجديدة: مواقف مُعلَّمة على الأرض وأعمدة بعلامات حمراء وصفراء.",
      },
    },
    {
      key: "g_les_pins_de_maamora_01",
      nature: "render",
      sameAs: "hp_les_pins_de_maamora",
      alt: {
        fr: "Rendu de la façade des Pins de Maamora, à Sala Al Jadida : immeuble R+3 blanc à balcons en retrait, panneaux ajourés et commerces en rez-de-chaussée.",
        ar: "تصوّر لواجهة إقامة لي بان دو معمورة بسلا الجديدة: عمارة بيضاء من صنف R+3 بشرفات غائرة، ألواح مُخرَّمة ومحلات تجارية في الطابق الأرضي.",
      },
    },
    {
      key: "g_les_pins_de_maamora_04",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Cuisine équipée d'un appartement des Pins de Maamora, à Sala Al Jadida : façades blanches laquées, plan de travail noir, plaque de cuisson, four encastré et porte vitrée vers l'extérieur.",
        ar: "مطبخ مجهّز في شقة بإقامة لي بان دو معمورة بسلا الجديدة: واجهات بيضاء لامعة، سطح عمل أسود، موقد طهي، فرن مدمج وباب زجاجي نحو الخارج.",
      },
    },
    {
      key: "g_les_pins_de_maamora_05",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Chambre vide d'un appartement des Pins de Maamora, à Sala Al Jadida : parquet clair et baie coulissante ouvrant sur un balcon.",
        ar: "غرفة نوم فارغة في شقة بإقامة لي بان دو معمورة بسلا الجديدة: أرضية خشبية فاتحة ونافذة منزلقة تُفضي إلى شرفة.",
      },
    },
    {
      key: "g_les_pins_de_maamora_07",
      nature: "photograph",
      smallOnly: true,
      alt: {
        fr: "Salle de bain d'un appartement des Pins de Maamora, à Sala Al Jadida : faïence beige, frise de carreaux décorés, meuble vasque suspendu et miroir.",
        ar: "حمّام شقة بإقامة لي بان دو معمورة بسلا الجديدة: بلاط جداري بيج، شريط من البلاط المزخرف، خزانة مغسلة معلّقة ومرآة.",
      },
    },
  ],
  "massylia": [
    {
      key: "g_massylia_02",
      nature: "photograph",
      sameAs: "hp_massylia",
      alt: {
        fr: "Salon de l'appartement témoin de Massylia, à Agadir : banquettes marocaines terracotta et beiges en angle, grande table basse en noyer et stores jour-nuit sur la fenêtre.",
        ar: "صالون الشقة النموذجية بإقامة ماسيليا بأكادير: أرائك مغربية بلون الطين والبيج على شكل زاوية، وطاولة منخفضة كبيرة من خشب الجوز، وستائر مخطَّطة على النافذة.",
      },
    },
    {
      key: "g_massylia_03",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin de Massylia, à Agadir : table basse carrée en noyer, meuble télévision assorti et porte en bois ouverte sur le couloir.",
        ar: "صالون الشقة النموذجية بإقامة ماسيليا بأكادير: طاولة منخفضة مربعة من خشب الجوز، وخزانة تلفاز مماثلة، وباب خشبي مفتوح على الممر.",
      },
    },
    {
      key: "g_massylia_04",
      nature: "photograph",
      sameAs: "tp_massylia",
      alt: {
        fr: "Second salon de l'appartement témoin de Massylia, à Agadir : banquettes aux motifs géométriques rouges et noirs, table basse en verre et sol effet bois.",
        ar: "الصالون الثاني بالشقة النموذجية بإقامة ماسيليا بأكادير: أرائك بزخارف هندسية حمراء وسوداء، وطاولة منخفضة زجاجية، وأرضية بمظهر خشبي.",
      },
    },
    {
      key: "g_massylia_05",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin de Massylia, à Agadir : façades bois foncé, crédence en carreaux à motifs bleus, four encastré et porte vitrée donnant sur l'extérieur.",
        ar: "المطبخ المجهّز بالشقة النموذجية بإقامة ماسيليا بأكادير: واجهات خشبية داكنة، وجدار ببلاط مزخرف أزرق، وفرن مدمج، وباب زجاجي يطل على فضاء خارجي.",
      },
    },
    {
      key: "g_massylia_06",
      nature: "photograph",
      alt: {
        fr: "Chambre de l'appartement témoin de Massylia, à Agadir : lit à tête de lit tapissée vert d'eau, voilages couleur lin, miroir rond en bois et console murale.",
        ar: "غرفة نوم بالشقة النموذجية بإقامة ماسيليا بأكادير: سرير بمسند مكسوّ بلون أخضر مائي، وستائر بلون الكتان، ومرآة دائرية بإطار خشبي، ورفّ حائطي.",
      },
    },
    {
      key: "g_massylia_07",
      nature: "photograph",
      alt: {
        fr: "Chambre à deux lits de l'appartement témoin de Massylia, à Agadir : têtes de lit moutarde, placard en bois et baie coulissante ouvrant sur un balcon meublé.",
        ar: "غرفة بسريرين في الشقة النموذجية بإقامة ماسيليا بأكادير: مسندا سرير بلون الخردل، وخزانة خشبية، وباب زجاجي منزلق يفتح على شرفة مؤثثة.",
      },
    },
    {
      key: "g_massylia_08",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau et chambre de l'appartement témoin de Massylia, à Agadir, vues depuis le dégagement : meuble vasque en bois, miroir arrondi et lit vert d'eau.",
        ar: "الحمام وغرفة النوم بالشقة النموذجية بإقامة ماسيليا بأكادير كما يبدوان من الممر: خزانة مغسلة خشبية، ومرآة مستديرة الزوايا، وسرير بلون أخضر مائي.",
      },
    },
    {
      key: "g_massylia_09",
      nature: "photograph",
      alt: {
        fr: "Salle de bains de l'appartement témoin de Massylia, à Agadir : douche à l'italienne, mur en carreaux à motifs circulaires, meuble vasque en bois et miroir aux contours arrondis.",
        ar: "حمام الشقة النموذجية بإقامة ماسيليا بأكادير: دُش أرضي، وجدار ببلاط بزخارف دائرية، وخزانة مغسلة خشبية، ومرآة بحواف انسيابية.",
      },
    },
    {
      key: "g_massylia_10",
      nature: "photograph",
      alt: {
        fr: "Seconde salle de bains de l'appartement témoin de Massylia, à Agadir : douche derrière une paroi vitrée, carrelage gris et meuble vasque en bois clair.",
        ar: "الحمام الثاني بالشقة النموذجية بإقامة ماسيليا بأكادير: دُش خلف حاجز زجاجي، وبلاط رمادي، وخزانة مغسلة من الخشب الفاتح.",
      },
    },
    {
      key: "g_massylia_11",
      nature: "photograph",
      alt: {
        fr: "Balcon de l'appartement témoin de Massylia, à Agadir, vu depuis la chambre : deux fauteuils en cordage noir, guéridon et plante en pot devant un bardage à lames verticales.",
        ar: "شرفة الشقة النموذجية بإقامة ماسيليا بأكادير كما تُرى من غرفة النوم: كرسيان من الحبال السوداء، وطاولة صغيرة، ونبتة في أصيص أمام تكسية بألواح عمودية.",
      },
    },
    {
      key: "g_massylia_01",
      nature: "render",
      smallOnly: true,
      alt: {
        fr: "Rendu de la résidence Massylia, à Agadir : immeubles blancs aux encadrements couleur bois, balcons à garde-corps vitrés et commerces en rez-de-chaussée à l'angle d'un carrefour planté d'arbres.",
        ar: "تصوّر لإقامة ماسيليا بأكادير: عمارات بيضاء بإطارات بلون الخشب، وشرفات بحواجز زجاجية، ومحلات تجارية في الطابق الأرضي عند زاوية ملتقى طرق مشجَّر.",
      },
    },
  ],
  "oceane": [
    {
      key: "g_oceane_01",
      nature: "render",
      alt: {
        fr: "Rendu des villas d'Océane, à Sidi Rahal : maisons blanches à étage alignées autour d'une piscine, de pelouses et de haies taillées, avec un espace couvert en bord de bassin.",
        ar: "تصوّر لفيلات أوسيان بسيدي رحال: منازل بيضاء من طابقين مصطفّة حول مسبح ومروج وسياجات نباتية مشذّبة، مع فضاء مسقوف بجانب الحوض.",
      },
    },
    {
      key: "g_oceane_02",
      nature: "render",
      sameAs: "th_oceane",
      alt: {
        fr: "Rendu du jardin commun d'Océane, à Sidi Rahal : allées, massifs arbustifs et piscine au pied des villas à étage.",
        ar: "تصوّر للحديقة المشتركة بأوسيان في سيدي رحال: ممرات وأحواض شجيرات ومسبح عند أقدام الفيلات ذات الطابقين.",
      },
    },
    {
      key: "g_oceane_03",
      nature: "render",
      alt: {
        fr: "Rendu des façades des villas d'Océane, à Sidi Rahal : étages en enduit clair et pierre grise, encadrements à lames de bois et jardinets d'entrée.",
        ar: "تصوّر لواجهات فيلات أوسيان بسيدي رحال: طوابق بطلاء فاتح وحجر رمادي، إطارات بشرائح خشبية وحدائق أمامية صغيرة.",
      },
    },
    {
      key: "g_oceane_04",
      nature: "render",
      alt: {
        fr: "Rendu du séjour d'une villa d'Océane, à Sidi Rahal : grande hauteur sous plafond, sol en marbre blanc, coin repas, salons et cheminée vitrée face aux baies voilées.",
        ar: "تصوّر لصالون فيلا بأوسيان في سيدي رحال: سقف مرتفع، أرضية من الرخام الأبيض، ركن للأكل، جلسات ومدفأة زجاجية أمام نوافذ عالية بستائر.",
      },
    },
    {
      key: "g_oceane_05",
      nature: "render",
      alt: {
        fr: "Rendu du salon d'une villa d'Océane, à Sidi Rahal : canapé arrondi, cheminée vitrée sur socle en marbre noir et baies voilées ouvrant sur la verdure.",
        ar: "تصوّر لصالون فيلا بأوسيان في سيدي رحال: أريكة مستديرة، مدفأة زجاجية على قاعدة من الرخام الأسود، ونوافذ عالية بستائر تطلّ على الخضرة.",
      },
    },
    {
      key: "g_oceane_06",
      nature: "render",
      alt: {
        fr: "Rendu d'une chambre d'une villa d'Océane, à Sidi Rahal : lit à tête de lit en velours vert, papier peint végétal et fauteuil assorti.",
        ar: "تصوّر لغرفة نوم في فيلا بأوسيان في سيدي رحال: سرير برأسية مخملية خضراء، ورق جدران بزخارف نباتية، وكرسي بذراعين متناسق.",
      },
    },
    {
      key: "g_oceane_07",
      nature: "render",
      alt: {
        fr: "Rendu d'une chambre d'une villa d'Océane, à Sidi Rahal, vue vers le dressing : lit en velours vert, penderie en bois éclairée et coiffeuse à miroir rond.",
        ar: "تصوّر لغرفة نوم في فيلا بأوسيان في سيدي رحال باتجاه غرفة الملابس: سرير مخملي أخضر، خزانة خشبية مضاءة، وطاولة زينة بمرآة دائرية.",
      },
    },
    {
      key: "g_oceane_08",
      nature: "render",
      alt: {
        fr: "Rendu du bâtiment de la salle de sport prévue à Océane, à Sidi Rahal : façade vitrée derrière des résilles métalliques perforées et auvent sur poteaux obliques.",
        ar: "تصوّر لمبنى قاعة الرياضة المرتقبة بأوسيان في سيدي رحال: واجهة زجاجية خلف ألواح معدنية مثقّبة ومظلّة على أعمدة مائلة.",
      },
    },
  ],
  "odyssee": [
    {
      key: "g_odyssee_01",
      nature: "render",
      sameAs: "th_odyssee",
      alt: {
        fr: "Rendu d'Odyssée, à Mohammedia : immeubles aux façades blanches et pierre grise, balcons encadrés de bois et végétalisés, palmiers et bancs sur le parvis longeant une large avenue.",
        ar: "تصوّر لإقامة أوديسي بالمحمدية: عمارات بواجهات بيضاء وحجر رمادي، وشرفات بإطارات خشبية تكسوها النباتات، ونخيل ومقاعد على الرصيف المحاذي لشارع عريض.",
      },
    },
    {
      key: "g_odyssee_02",
      nature: "render",
      alt: {
        fr: "Rendu d'Odyssée, à Mohammedia, à la tombée du jour : piscine centrale bordée de transats et de parasols, entre des immeubles aux fenêtres éclairées et des jardins de palmiers.",
        ar: "تصوّر لإقامة أوديسي بالمحمدية عند الغروب: مسبح مركزي تحيط به كراسي الاستلقاء والمظلات، بين عمارات بنوافذ مضاءة وحدائق نخيل.",
      },
    },
  ],
  "odyssee-studios": [
    {
      key: "g_odyssee_studios_01",
      nature: "render",
      alt: {
        fr: "Rendu de la façade d'Odyssée Studios, à Mohammedia : immeuble d'angle aux encadrements bois et parements de pierre, balcons vitrés et palmiers le long de l'avenue.",
        ar: "تصوّر لواجهة أوديسي استوديوهات بالمحمدية: عمارة عند زاوية الشارع بإطارات خشبية وتكسيات حجرية، شرفات زجاجية وأشجار نخيل على طول الشارع.",
      },
    },
    {
      key: "g_odyssee_studios_02",
      nature: "render",
      sameAs: "th_odyssee_studios",
      alt: {
        fr: "Rendu de la piscine d'Odyssée Studios, à Mohammedia : bassin rectangulaire bordé de transats et de parasols, entre des immeubles aux balcons végétalisés.",
        ar: "تصوّر لمسبح أوديسي استوديوهات بالمحمدية: حوض مستطيل تحيط به كراسي الاستلقاء والمظلات، بين عمارات بشرفات مكسوّة بالنباتات.",
      },
    },
  ],
  "patio-verde": [
    {
      key: "g_patio_verde_01",
      nature: "render",
      alt: {
        fr: "Rendu de Patio Verde, à Mohammedia : immeuble d'angle aux façades blanches rehaussées de bois et de pierre grise, balcons vitrés et commerces en rez-de-chaussée.",
        ar: "تصوّر لباتيو فيردي بالمحمدية: عمارة على الزاوية بواجهات بيضاء مزيّنة بالخشب والحجر الرمادي، وشرفات زجاجية، ومحلات تجارية بالطابق الأرضي.",
      },
    },
    {
      key: "g_patio_verde_02",
      nature: "photograph",
      sameAs: "hp_patio_verde",
      alt: {
        fr: "Séjour de l'appartement témoin de Patio Verde, à Mohammedia : canapés en bouclette crème, table basse ronde, plafond à éclairage indirect et baie voilée.",
        ar: "صالون الشقة النموذجية بباتيو فيردي بالمحمدية: أرائك من قماش البوكليه بلون كريمي، وطاولة منخفضة دائرية، وسقف بإضاءة غير مباشرة، ونافذة واسعة بستائر خفيفة.",
      },
    },
    {
      key: "g_patio_verde_03",
      nature: "photograph",
      sameAs: "tp_patio_verde",
      alt: {
        fr: "Séjour de l'appartement témoin de Patio Verde, à Mohammedia, vu vers l'entrée : canapé d'angle, claustra en lames de bois et meuble télé suspendu.",
        ar: "صالون الشقة النموذجية بباتيو فيردي بالمحمدية من جهة المدخل: أريكة زاوية، وحاجز من شرائح خشبية، وخزانة تلفاز معلّقة.",
      },
    },
    {
      key: "g_patio_verde_04",
      nature: "photograph",
      alt: {
        fr: "Coin repas de l'appartement témoin de Patio Verde, à Mohammedia : table ovale noire, chaises en bouclette marron et suspension à globes, séparé du salon par un panneau en bois.",
        ar: "ركن الطعام في الشقة النموذجية بباتيو فيردي بالمحمدية: طاولة بيضوية سوداء، وكراسٍ بنية من قماش البوكليه، وثريا بكرات زجاجية، يفصله عن الصالون حاجز خشبي.",
      },
    },
    {
      key: "g_patio_verde_05",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin de Patio Verde, à Mohammedia : façades bois et taupe, plan de travail noir, comptoir avec tabourets et porte vitrée donnant sur l'extérieur.",
        ar: "المطبخ المجهّز للشقة النموذجية بباتيو فيردي بالمحمدية: واجهات خشبية وأخرى بلون رمادي فاتح، وسطح عمل أسود، وكونتوار بكراسٍ عالية، وباب زجاجي يطل على الخارج.",
      },
    },
    {
      key: "g_patio_verde_06",
      nature: "photograph",
      alt: {
        fr: "Cuisine équipée de l'appartement témoin de Patio Verde, à Mohammedia : évier inox, plaque de cuisson et four encastrés, crédence noire veinée éclairée par un bandeau lumineux.",
        ar: "المطبخ المجهّز للشقة النموذجية بباتيو فيردي بالمحمدية: مغسلة من الفولاذ المقاوم للصدأ، وموقد وفرن مدمجان، وجدار خلفي أسود مجزّع بإضاءة شريطية.",
      },
    },
    {
      key: "g_patio_verde_07",
      nature: "photograph",
      alt: {
        fr: "Suite parentale de l'appartement témoin de Patio Verde, à Mohammedia : tête de lit en velours vert, papier peint à palmes, console noire et baie voilée.",
        ar: "الجناح الرئيسي للشقة النموذجية بباتيو فيردي بالمحمدية: مسند سرير من المخمل الأخضر، وورق جدران بأوراق النخيل، وكونسول أسود، ونافذة واسعة بستائر خفيفة.",
      },
    },
    {
      key: "g_patio_verde_08",
      nature: "photograph",
      alt: {
        fr: "Suite parentale de l'appartement témoin de Patio Verde, à Mohammedia : salle de bains attenante avec vasque à poser et miroir rétroéclairé, ouverte sur la chambre et sa coiffeuse.",
        ar: "الجناح الرئيسي للشقة النموذجية بباتيو فيردي بالمحمدية: حمّام ملحق بمغسلة فوق السطح ومرآة بإضاءة خلفية، ينفتح على غرفة النوم وطاولة الزينة.",
      },
    },
    {
      key: "g_patio_verde_09",
      nature: "photograph",
      alt: {
        fr: "Dressing de la suite parentale de l'appartement témoin de Patio Verde, à Mohammedia : rangements en bois éclairés par des bandeaux lumineux et portant noir.",
        ar: "غرفة الملابس في الجناح الرئيسي للشقة النموذجية بباتيو فيردي بالمحمدية: رفوف خشبية بإضاءة شريطية، وعلّاقة ملابس سوداء.",
      },
    },
    {
      key: "g_patio_verde_10",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfants de l'appartement témoin de Patio Verde, à Mohammedia : deux lits simples, papier peint à montgolfières et baie vitrée ouvrant sur l'extérieur.",
        ar: "غرفة الأطفال في الشقة النموذجية بباتيو فيردي بالمحمدية: سريران فرديان، وورق جدران بمناطيد هوائية، وباب زجاجي واسع يفتح على الخارج.",
      },
    },
    {
      key: "g_patio_verde_11",
      nature: "photograph",
      alt: {
        fr: "Chambre d'enfants de l'appartement témoin de Patio Verde, à Mohammedia : bureau blanc, placard en bois à portes coulissantes et lits jumeaux.",
        ar: "غرفة الأطفال في الشقة النموذجية بباتيو فيردي بالمحمدية: مكتب أبيض، وخزانة خشبية بأبواب منزلقة، وسريران متجاوران.",
      },
    },
    {
      key: "g_patio_verde_12",
      nature: "photograph",
      alt: {
        fr: "Salle de bains de l'appartement témoin de Patio Verde, à Mohammedia : carrelage gris, vasque à poser sur meuble en bois à plan noir et miroir rétroéclairé.",
        ar: "حمّام الشقة النموذجية بباتيو فيردي بالمحمدية: بلاط رمادي، ومغسلة فوق خزانة خشبية بسطح أسود، ومرآة بإضاءة خلفية.",
      },
    },
    {
      key: "g_patio_verde_13",
      nature: "photograph",
      alt: {
        fr: "Salle d'eau de l'appartement témoin de Patio Verde, à Mohammedia : murs beiges, vasque à poser sur plan noir, miroir rétroéclairé et WC.",
        ar: "حمّام بجدران بيج في الشقة النموذجية بباتيو فيردي بالمحمدية: مغسلة فوق سطح أسود، ومرآة بإضاءة خلفية، ومرحاض.",
      },
    },
  ],
  "riad-garden-i": [
    {
      key: "rg1_DSC08588",
      nature: "photograph",
      alt: {
        fr: "Chambre d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : lit en velours rouille, parquet à chevrons et porte-fenêtre sur balcon.",
        ar: "غرفة نوم في شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: سرير من المخمل بلون الصدأ، باركيه بنقشة متعرّجة وباب زجاجي نحو الشرفة.",
      },
    },
    {
      key: "rg1_DSC08632",
      nature: "photograph",
      alt: {
        fr: "Façade d'un immeuble de la résidence livrée Riad Garden I, à Marrakech : enduit ocre rose, balcons, claustras et arbres le long de l'allée.",
        ar: "واجهة إحدى عمارات إقامة رياض غاردن 1 المُسلَّمة بمراكش: طلاء وردي مغرّي، شرفات ومشربيات، وأشجار على طول الممر.",
      },
    },
    {
      key: "rg1_DSC08446",
      nature: "photograph",
      alt: {
        fr: "Cuisine d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : façades vert d'eau et bois, plaque de cuisson, four encastré, réfrigérateur rétro et table haute.",
        ar: "مطبخ شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: واجهات بالأخضر المائي والخشب، موقد، فرن مدمج، ثلاجة بطراز كلاسيكي وطاولة عالية.",
      },
    },
    {
      key: "rg1_DSC08579",
      nature: "photograph",
      alt: {
        fr: "Chambre à deux lits simples d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : têtes de lit jaune moutarde, parquet à chevrons et baie vitrée.",
        ar: "غرفة بسريرين فرديين في شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: ألواح رأس بلون الخردل، باركيه بنقشة متعرّجة ونافذة زجاجية واسعة.",
      },
    },
    {
      key: "rg1_DSC08442",
      nature: "photograph",
      alt: {
        fr: "Salle de bain d'un appartement de la résidence livrée Riad Garden I, à Marrakech : douche ouverte avec colonne, WC suspendu, meuble vasque en bois et miroir aux angles arrondis.",
        ar: "حمّام شقة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: دوش مفتوح بعمود استحمام، مرحاض معلّق، خزانة مغسلة خشبية ومرآة بحواف مستديرة.",
      },
    },
    {
      key: "rg1_DSC08476",
      nature: "photograph",
      alt: {
        fr: "Aire de jeux de la résidence livrée Riad Garden I, à Marrakech : toboggan, cabane en bois et pelouse plantée de palmiers et d'oliviers.",
        ar: "فضاء ألعاب الأطفال بإقامة رياض غاردن 1 المُسلَّمة بمراكش: زحليقة، كوخ خشبي ومرجة خضراء تتخللها أشجار النخيل والزيتون.",
      },
    },
    {
      key: "rg1_DSC08548",
      nature: "photograph",
      alt: {
        fr: "Salon d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : canapé d'angle clair, pouf orange, coin repas et baie vitrée ouverte sur une terrasse meublée.",
        ar: "صالون شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: أريكة زاوية فاتحة، مقعد برتقالي، ركن طعام ونافذة زجاجية مفتوحة على تراس مؤثث.",
      },
    },
    {
      key: "rg1_DSC08601",
      nature: "photograph",
      alt: {
        fr: "Chambre et salle de bain attenante d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : parquet à chevrons, meuble vasque en bois et miroir rond.",
        ar: "غرفة نوم وحمّام ملحق بها في شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: باركيه بنقشة متعرّجة، مغسلة على خزانة خشبية ومرآة مستديرة.",
      },
    },
    {
      key: "rg1_DSC08344",
      nature: "photograph",
      alt: {
        fr: "Séjour d'un appartement meublé de la résidence livrée Riad Garden I, à Marrakech : table à manger en marbre, canapés aux formes arrondies et baie vitrée sur la terrasse.",
        ar: "صالة الجلوس في شقة مؤثثة بإقامة رياض غاردن 1 المُسلَّمة بمراكش: طاولة طعام رخامية، أرائك بأشكال دائرية ونافذة زجاجية واسعة تُطل على التراس.",
      },
    },
    {
      key: "rg1_DSC00924",
      nature: "photograph",
      alt: {
        fr: "Piscine de la résidence livrée Riad Garden I, à Marrakech, bordée de palmiers et d'immeubles ocre rose à balcons.",
        ar: "مسبح إقامة رياض غاردن 1 المُسلَّمة بمراكش، تحيط به أشجار النخيل وعمارات بلون وردي مغرّي ذات شرفات.",
      },
    },
  ],
};
