import type { MediaRef, Project, ProofPair } from "./types";

/**
 * Mock portfolio, shaped exactly like the CMS payload the components expect.
 *
 * Prices, cities, surfaces, storey counts and amenity lists are taken from
 * liliskane.com as published. Riad Garden II is modelled in full depth — every
 * typology, both Matterport tours, the complete proof set — because it is the
 * page being built. The other thirteen carry enough to stress the components:
 * a 514x293 thumbnail beside an 8000px one, a four-character name beside a
 * twenty-character one, 485 000 DH beside 2 450 000 DH, and land priced per m².
 */

/* -----------------------------------------------------------------------------
 * Riad Garden II — the flagship. Renders, off-plan, delivery 2027.
 * -------------------------------------------------------------------------- */

const rg2Gallery: MediaRef[] = [
  {
    key: "rg2_Ext_Cam_c1_jardin_1",
    nature: "render",
    alt: {
      fr: "Façade en pierre claire de Riad Garden II vue depuis l'allée piétonne, balcons en surplomb protégés par des claustras en losange, palmiers et massifs plantés au premier plan.",
      ar: "واجهة رياض غاردن 2 بالحجر الفاتح من الممر الراجل، شرفات بارزة تحجبها مشربيات معيّنة الشكل، ونخيل ومساحات مغروسة في المقدمة.",
    },
  },
  {
    key: "rg2_TypeB_3",
    nature: "render",
    alt: {
      fr: "La piscine centrale de Riad Garden II entourée de bâtiments ocre rose, transats sous parasols, familles marchant sur les allées dallées.",
      ar: "المسبح المركزي لرياض غاردن 2 تحيط به مبانٍ بلون وردي مغرة، كراسي استلقاء تحت المظلات، وعائلات تتنزّه على الممرات المبلّطة.",
    },
  },
  {
    key: "rg2_Ext_Cam_A1_Commerce_1",
    nature: "render",
    alt: {
      fr: "Les commerces en rez-de-chaussée de Riad Garden II le long de l'allée plantée, vitrines abritées sous les balcons des étages.",
      ar: "المحلات التجارية بالطابق الأرضي لرياض غاردن 2 على طول الممر المغروس، واجهات زجاجية تحميها شرفات الطوابق العليا.",
    },
  },
  {
    key: "rg2_Sejour_v2",
    nature: "render",
    alt: {
      fr: "Séjour d'un appartement Riad Garden II : baies vitrées toute hauteur donnant sur les palmiers, canapés crème, table basse en noyer, plaid bordeaux.",
      ar: "صالون شقة برياض غاردن 2: نوافذ زجاجية بكامل الارتفاع تطل على النخيل، أرائك بلون كريمي، طاولة منخفضة من خشب الجوز، وغطاء عنابي.",
    },
  },
  {
    key: "rg2_Chambre_Parentale_",
    nature: "render",
    alt: {
      fr: "Chambre parentale de Riad Garden II, tête de lit velours rose terracotta, parquet chevron, portes-fenêtres ouvrant sur une terrasse plantée.",
      ar: "غرفة النوم الرئيسية برياض غاردن 2، مسند سرير من المخمل الوردي الطيني، أرضية خشبية بنقشة السنبلة، وأبواب زجاجية تفتح على شرفة مغروسة.",
    },
  },
  {
    key: "rg2_Chambre_Enfants",
    nature: "render",
    alt: {
      fr: "Chambre d'enfants de Riad Garden II avec deux lits jumeaux, rangements intégrés et fenêtre donnant sur les jardins.",
      ar: "غرفة أطفال برياض غاردن 2 بسريرين متجاورين، خزائن مدمجة، ونافذة تطل على الحدائق.",
    },
  },
  {
    key: "rg2_Cuisine_v2",
    nature: "render",
    alt: {
      fr: "Cuisine équipée de Riad Garden II, façades bois clair, plan de travail en pierre, ouverture sur le séjour.",
      ar: "مطبخ مجهّز برياض غاردن 2، واجهات خشبية فاتحة، سطح عمل حجري، وانفتاح على الصالون.",
    },
  },
  {
    key: "rg2_SDB_V2",
    nature: "render",
    alt: {
      fr: "Salle de bains de Riad Garden II, vasque suspendue en chêne, miroir rond, douche à l'italienne carrelée pleine hauteur.",
      ar: "حمام برياض غاردن 2، مغسلة معلّقة من خشب البلوط، مرآة دائرية، ودُش أرضي مبلّط بكامل الارتفاع.",
    },
  },
];

/**
 * The seven pairings. Each render is matched to a photograph of the equivalent
 * space in Riad Garden I, the finished phase 200 m away — same architect, same
 * contractor, same specification. This is the argument the site is built on.
 */
const rg2Proof: ProofPair[] = [
  {
    id: "facade",
    shortLabel: { fr: "Façade", ar: "الواجهة" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: {
      fr: "La façade et ses claustras, en image de synthèse puis construite.",
      ar: "الواجهة ومشربياتها، في التصميم ثم بعد البناء.",
    },
    render: rg2Gallery[0],
    photograph: {
      key: "rg1_DSC08632",
      nature: "photograph",
      alt: {
        fr: "Photographie de la façade livrée de Riad Garden I : enduit ocre rose, claustras en béton ajouré identiques au rendu, arbres plantés déjà développés.",
        ar: "صورة للواجهة المُسلَّمة برياض غاردن 1: طلاء وردي مغرة، مشربيات خرسانية مفرّغة مطابقة للتصميم، وأشجار مغروسة اكتمل نموها.",
      },
    },
  },
  {
    id: "piscine",
    shortLabel: { fr: "Piscine", ar: "المسبح" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: {
      fr: "La piscine et les bâtiments qui l'entourent.",
      ar: "المسبح والمباني المحيطة به.",
    },
    render: rg2Gallery[1],
    photograph: {
      key: "rg1_DSC00924",
      nature: "photograph",
      alt: {
        fr: "Photographie de la piscine livrée de Riad Garden I, eau turquoise, façades ocre rose et palmiers arrivés à maturité.",
        ar: "صورة للمسبح المُسلَّم برياض غاردن 1، ماء فيروزي، واجهات وردية مغرة، ونخيل بلغ اكتماله.",
      },
    },
  },
  {
    id: "sejour",
    shortLabel: { fr: "Séjour", ar: "الصالون" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: { fr: "Le séjour et sa hauteur sous plafond.", ar: "الصالون وارتفاع سقفه." },
    render: rg2Gallery[3],
    photograph: {
      key: "rg1_DSC08344",
      nature: "photograph",
      alt: {
        fr: "Photographie du séjour livré de Riad Garden I : sol grand format clair, baie vitrée sur la terrasse, table ronde et fauteuils arrondis.",
        ar: "صورة للصالون المُسلَّم برياض غاردن 1: بلاط فاتح كبير الحجم، نافذة زجاجية على الشرفة، طاولة دائرية وكراسي منحنية.",
      },
    },
  },
  {
    id: "chambre",
    shortLabel: { fr: "Chambre parentale", ar: "غرفة النوم الرئيسية" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: {
      fr: "La chambre parentale et son parquet chevron.",
      ar: "غرفة النوم الرئيسية وأرضيتها بنقشة السنبلة.",
    },
    render: rg2Gallery[4],
    photograph: {
      key: "rg1_DSC08588",
      nature: "photograph",
      alt: {
        fr: "Photographie de la chambre livrée de Riad Garden I : lit en velours terracotta, parquet chevron posé, rideaux en lin et lumière traversante.",
        ar: "صورة لغرفة النوم المُسلَّمة برياض غاردن 1: سرير من المخمل الطيني، أرضية خشبية بنقشة السنبلة، ستائر كتانية وضوء نافذ.",
      },
    },
  },
  {
    id: "chambre-enfants",
    shortLabel: { fr: "Chambre enfants", ar: "غرفة الأطفال" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: { fr: "La seconde chambre.", ar: "الغرفة الثانية." },
    render: rg2Gallery[5],
    photograph: {
      key: "rg1_DSC08579",
      nature: "photograph",
      alt: {
        fr: "Photographie de la chambre d'enfants livrée de Riad Garden I, deux lits à têtes de lit jaune safran, parquet chevron et fenêtre sur les jardins.",
        ar: "صورة لغرفة الأطفال المُسلَّمة برياض غاردن 1، سريران بمساند صفراء زعفرانية، أرضية خشبية ونافذة على الحدائق.",
      },
    },
  },
  {
    id: "cuisine",
    shortLabel: { fr: "Cuisine", ar: "المطبخ" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: { fr: "La cuisine équipée.", ar: "المطبخ المجهّز." },
    render: rg2Gallery[6],
    photograph: {
      key: "rg1_DSC08446",
      nature: "photograph",
      alt: {
        fr: "Photographie de la cuisine livrée de Riad Garden I : façades vert amande et bois, électroménager encastré, comptoir avec tabourets.",
        ar: "صورة للمطبخ المُسلَّم برياض غاردن 1: واجهات بلون أخضر لوزي وخشب، أجهزة مدمجة، وطاولة مرتفعة بكراسي.",
      },
    },
  },
  {
    id: "sdb",
    shortLabel: { fr: "Salle de bains", ar: "الحمام" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    sourceYear: 2023,
    caption: { fr: "La salle de bains.", ar: "الحمام." },
    render: rg2Gallery[7],
    photograph: {
      key: "rg1_DSC08442",
      nature: "photograph",
      alt: {
        fr: "Photographie de la salle de bains livrée de Riad Garden I : meuble vasque en chêne, miroir, douche à l'italienne et carrelage beige pleine hauteur.",
        ar: "صورة للحمام المُسلَّم برياض غاردن 1: خزانة مغسلة من البلوط، مرآة، دُش أرضي وبلاط بيج بكامل الارتفاع.",
      },
    },
  },
];

/* -------------------------------------------------------------------------- */

/**
 * Segment values follow the client's own type pages on liliskane.com, not
 * price coherence. `izdihar` at 485 000 DH sits in moyen-standing and
 * `odyssee-studios` at 555 000 DH sits in haut-standing because that is how
 * Chaabi markets them. Segment is commercial positioning; if you want to slice
 * the portfolio by what a buyer can afford, filter on price, not on this field.
 *
 * One consequence worth knowing before you assume it is a bug: `economique`
 * contains a single programme. `src/lib/filter.ts` lists `segments` among its
 * relaxable facets, so a thin facet degrades rather than dead-ends.
 */
export const projects: Project[] = [
  {
    id: "209",
    slug: "riad-garden-ii",
    name: { fr: "Riad Garden II", ar: "رياض غاردن 2" },
    cityId: "marrakech",
    neighbourhood: { fr: "Avenue Mohammed VI, Agdal", ar: "شارع محمد السادس، أكدال" },
    lat: 31.6104,
    lng: -7.9902,
    segment: "haut-standing",
    status: "en-lancement",
    kinds: ["appartement", "local-commercial"],
    price: { amount: 1830000, unit: "total" },
    surfaceMin: 84,
    surfaceMax: 116,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+2",
    deliveryYear: 2027,
    deliveredYear: null,
    previousPhaseSlug: "riad-garden-i",
    amenities: [
      "piscine",
      "mosquee",
      "commerces",
      "centre-commercial",
      "spa",
      "parking-sous-sol",
      "ascenseur",
      "espaces-verts",
      "vue-montagne",
      "securite",
    ],
    summary: {
      fr: "Deuxième tranche de Riad Garden, sur l'avenue Mohammed VI. Appartements de 2 et 3 chambres en R+2, avec parking en sous-sol, piscine et jardins plantés. La première tranche a été livrée en 2023, à deux cents mètres.",
      ar: "الشطر الثاني من رياض غاردن، على شارع محمد السادس. شقق بغرفتين أو ثلاث غرف في بناية من طابقين، مع مرآب تحت أرضي ومسبح وحدائق مغروسة. سُلّم الشطر الأول سنة 2023 على بعد مائتي متر.",
    },
    hero: rg2Gallery[0],
    gallery: rg2Gallery,
    proof: rg2Proof,
    // Generated from the four reference frames in media-refs/. Travels street →
    // facade → courtyard → terrace and rests at the threshold of the salon.
    cinematic: {
      mp4: "/video/sequence.mp4",
      mp4Small: "/video/sequence-sm.mp4",
      poster: "/video/sequence-poster.jpg",
      durationSeconds: 10,
    },
    tours: [
      {
        id: "temoin-2ch",
        label: { fr: "Appartement témoin — 2 chambres", ar: "شقة نموذجية — غرفتان" },
        matterportId: "9jQtE4FR8W7",
        poster: rg2Gallery[3],
        ofDelivered: false,
      },
      {
        id: "temoin-3ch",
        label: { fr: "Appartement témoin — 3 chambres", ar: "شقة نموذجية — ثلاث غرف" },
        matterportId: "FnpxMXeVga9",
        poster: rg2Gallery[4],
        ofDelivered: false,
      },
      {
        id: "livre-rg1",
        label: {
          fr: "Appartement livré — Riad Garden I",
          ar: "شقة مُسلَّمة — رياض غاردن 1",
        },
        matterportId: "aRgKUGQrgkF",
        poster: {
          key: "rg1_DSC08548",
          nature: "photograph",
          alt: {
            fr: "Séjour d'un appartement livré de Riad Garden I, meublé et occupé, pouf terracotta et téléviseur mural.",
            ar: "صالون شقة مُسلَّمة برياض غاردن 1، مؤثثة ومسكونة، مقعد طيني اللون وتلفاز مثبّت على الجدار.",
          },
        },
        ofDelivered: true,
      },
    ],
    typologies: [
      {
        id: "t2-a",
        label: { fr: "Type A — 2 chambres", ar: "النوع أ — غرفتان" },
        kind: "appartement",
        surfaceMin: 84,
        surfaceMax: 92,
        bedrooms: 2,
        price: { amount: 1830000, unit: "total" },
        composition: {
          fr: "Séjour, 2 chambres, cuisine équipée, 2 salles de bains, balcon",
          ar: "صالون، غرفتان، مطبخ مجهّز، حمامان، شرفة",
        },
        unitsAvailable: 14,
      },
      {
        id: "t2-b",
        label: { fr: "Type B — 2 chambres, terrasse", ar: "النوع ب — غرفتان مع شرفة" },
        kind: "appartement",
        surfaceMin: 92,
        surfaceMax: 98,
        bedrooms: 2,
        price: { amount: 1985000, unit: "total" },
        composition: {
          fr: "Séjour, 2 chambres, cuisine équipée, 2 salles de bains, terrasse plantée",
          ar: "صالون، غرفتان، مطبخ مجهّز، حمامان، شرفة مغروسة",
        },
        unitsAvailable: 6,
      },
      {
        id: "t3-c",
        label: { fr: "Type C — 3 chambres", ar: "النوع ج — ثلاث غرف" },
        kind: "appartement",
        surfaceMin: 104,
        surfaceMax: 110,
        bedrooms: 3,
        price: { amount: 2240000, unit: "total" },
        composition: {
          fr: "Séjour, 3 chambres, cuisine équipée, 2 salles de bains, 2 balcons",
          ar: "صالون، ثلاث غرف، مطبخ مجهّز، حمامان، شرفتان",
        },
        unitsAvailable: 9,
      },
      {
        id: "t3-d",
        label: { fr: "Type D — 3 chambres, angle", ar: "النوع د — ثلاث غرف، زاوية" },
        kind: "appartement",
        surfaceMin: 110,
        surfaceMax: 116,
        bedrooms: 3,
        price: { amount: 2390000, unit: "total" },
        composition: {
          fr: "Séjour double orientation, 3 chambres, cuisine équipée, 3 salles de bains, terrasse d'angle",
          ar: "صالون بواجهتين، ثلاث غرف، مطبخ مجهّز، ثلاثة حمامات، شرفة زاوية",
        },
        unitsAvailable: 3,
      },
    ],
    nearby: [
      { label: { fr: "Avenue Mohammed VI", ar: "شارع محمد السادس" }, minutes: 4, mode: "drive" },
      { label: { fr: "Golf Al Maaden", ar: "غولف الماعدن" }, minutes: 10, mode: "drive" },
      { label: { fr: "Médina de Marrakech", ar: "مدينة مراكش العتيقة" }, minutes: 15, mode: "drive" },
      { label: { fr: "Aéroport Ménara", ar: "مطار المنارة" }, minutes: 18, mode: "drive" },
      { label: { fr: "École primaire", ar: "مدرسة ابتدائية" }, minutes: 6, mode: "walk" },
      { label: { fr: "Mosquée", ar: "مسجد" }, minutes: 3, mode: "walk" },
    ],
  },

  {
    id: "95",
    slug: "riad-garden-i",
    name: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
    cityId: "marrakech",
    neighbourhood: { fr: "Avenue Mohammed VI, Agdal", ar: "شارع محمد السادس، أكدال" },
    lat: 31.6089,
    lng: -7.9925,
    segment: "haut-standing",
    status: "livre",
    kinds: ["appartement"],
    price: { amount: 2450000, unit: "total" },
    surfaceMin: 96,
    surfaceMax: 148,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+2",
    deliveryYear: null,
    deliveredYear: 2023,
    amenities: [
      "piscine",
      "mosquee",
      "commerces",
      "parking-sous-sol",
      "ascenseur",
      "espaces-verts",
      "vue-montagne",
      "securite",
    ],
    summary: {
      fr: "Première tranche, livrée en 2023 et entièrement occupée. Elle sert de référence à Riad Garden II : mêmes équipes, mêmes finitions, et un appartement visitable en 360°.",
      ar: "الشطر الأول، سُلّم سنة 2023 ومسكون بالكامل. يُتّخذ مرجعاً لرياض غاردن 2: نفس الفرق، نفس التشطيبات، وشقة يمكن زيارتها بتقنية 360 درجة.",
    },
    hero: {
      key: "rg1_DSC00924",
      nature: "photograph",
      alt: {
        fr: "La piscine de Riad Garden I livrée, entourée de bâtiments ocre rose et de palmiers, sous un ciel dégagé.",
        ar: "مسبح رياض غاردن 1 بعد التسليم، تحيط به مبانٍ وردية مغرة ونخيل، تحت سماء صافية.",
      },
    },
    gallery: rg2Proof.map((p) => p.photograph),
    proof: [],
    tours: [
      {
        id: "livre",
        label: { fr: "Appartement livré", ar: "شقة مُسلَّمة" },
        matterportId: "aRgKUGQrgkF",
        poster: {
          key: "rg1_DSC08548",
          nature: "photograph",
          alt: {
            fr: "Séjour d'un appartement livré de Riad Garden I, meublé et occupé.",
            ar: "صالون شقة مُسلَّمة برياض غاردن 1، مؤثثة ومسكونة.",
          },
        },
        ofDelivered: true,
      },
      {
        id: "livre-2",
        label: { fr: "Second appartement livré", ar: "شقة مُسلَّمة ثانية" },
        matterportId: "LdA3dxyG6dA",
        poster: {
          key: "rg1_DSC08601",
          nature: "photograph",
          alt: {
            fr: "Chambre et salle d'eau attenante d'un appartement livré de Riad Garden I.",
            ar: "غرفة نوم وحمام ملحق بها في شقة مُسلَّمة برياض غاردن 1.",
          },
        },
        ofDelivered: true,
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "211",
    slug: "amaia",
    name: { fr: "Amaïa", ar: "أمايا" },
    cityId: "marrakech",
    neighbourhood: { fr: "Route d'Amezmiz, Chrifia", ar: "طريق أمزميز، الشريفية" },
    lat: 31.5231,
    lng: -8.0714,
    segment: "haut-standing",
    status: "en-lancement",
    kinds: ["appartement", "local-commercial"],
    price: { amount: 1130000, unit: "total" },
    surfaceMin: 72,
    surfaceMax: 110,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+2",
    deliveryYear: 2028,
    deliveredYear: null,
    amenities: [
      "piscine",
      "espaces-verts",
      "mosquee",
      "ecoles",
      "commerces",
      "parking-sous-sol",
      "aires-de-jeux",
      "vue-montagne",
    ],
    summary: {
      fr: "Sur la route d'Amezmiz, à dix minutes de l'avenue Mohammed VI. Appartements de 2 et 3 chambres en R+2, piscines et jardins paysagers.",
      ar: "على طريق أمزميز، على بعد عشر دقائق من شارع محمد السادس. شقق بغرفتين أو ثلاث غرف في بناية من طابقين، مسابح وحدائق مهيّأة.",
    },
    hero: {
      key: "th_amaia",
      nature: "render",
      alt: {
        fr: "Vue d'ensemble d'Amaïa : allée centrale plantée de palmiers bordée d'immeubles ocre rose en R+2, commerces en rez-de-chaussée.",
        ar: "منظر عام لأمايا: ممر مركزي مغروس بالنخيل تحفّه عمارات وردية مغرة من طابقين، ومحلات تجارية بالطابق الأرضي.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [
      { label: { fr: "Avenue Mohammed VI", ar: "شارع محمد السادس" }, minutes: 10, mode: "drive" },
      { label: { fr: "Centre de Marrakech", ar: "وسط مراكش" }, minutes: 20, mode: "drive" },
    ],
  },

  {
    id: "190",
    slug: "oceane",
    name: { fr: "Océane", ar: "أوسيان" },
    cityId: "sidi-rahal",
    neighbourhood: { fr: "Front de mer", ar: "الواجهة البحرية" },
    lat: 33.4692,
    lng: -7.4301,
    segment: "haut-standing",
    status: "en-promotion",
    kinds: ["appartement", "villa"],
    price: { amount: 1962000, unit: "total" },
    surfaceMin: 78,
    surfaceMax: 165,
    bedroomsMin: 2,
    bedroomsMax: 4,
    floors: "R+2",
    deliveryYear: 2026,
    deliveredYear: null,
    amenities: ["plage", "vue-mer", "piscine", "espaces-verts", "securite", "commerces"],
    summary: {
      fr: "Bungalows et appartements en front de mer à Sidi Rahal, avec accès direct à la plage et piscine collective.",
      ar: "بنغالوهات وشقق على الواجهة البحرية بسيدي رحال، مع ولوج مباشر إلى الشاطئ ومسبح جماعي.",
    },
    hero: {
      key: "th_oceane",
      nature: "render",
      alt: {
        fr: "Bungalows d'Océane à Sidi Rahal, toitures basses et terrasses ouvertes sur la pinède, à quelques pas de la plage.",
        ar: "بنغالوهات أوسيان بسيدي رحال، أسقف منخفضة وشرفات مفتوحة على غابة الصنوبر، على بعد خطوات من الشاطئ.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [{ label: { fr: "Plage", ar: "الشاطئ" }, minutes: 3, mode: "walk" }],
  },

  {
    id: "191",
    slug: "oceane-r1",
    name: { fr: "Océane R+1 — lots de terrain", ar: "أوسيان R+1 — بقع أرضية" },
    cityId: "sidi-rahal",
    neighbourhood: { fr: "Sidi Rahal Plage", ar: "شاطئ سيدي رحال" },
    lat: 33.4671,
    lng: -7.4348,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot"],
    price: { amount: 4500, unit: "per-sqm", minimumLotSqm: 120 },
    surfaceMin: 120,
    surfaceMax: 320,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: 2026,
    deliveredYear: null,
    amenities: ["plage", "vue-mer", "securite"],
    summary: {
      fr: "Lots viabilisés constructibles en R+1, à proximité immédiate de la plage de Sidi Rahal.",
      ar: "بقع أرضية مجهّزة قابلة للبناء في طابق واحد فوق الأرضي، على مقربة مباشرة من شاطئ سيدي رحال.",
    },
    hero: {
      key: "th_lots",
      nature: "photograph",
      alt: {
        fr: "Lotissement viabilisé Chaabi : voirie tracée, bordures posées et bornes de délimitation des lots.",
        ar: "تجزئة مجهّزة للشعبي: طرق مهيأة، أرصفة موضوعة، وعلامات تحديد البقع.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "219",
    slug: "odyssee",
    name: { fr: "Odyssée", ar: "أوديسي" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Avenue Hassan II", ar: "شارع الحسن الثاني" },
    lat: 33.6871,
    lng: -7.3862,
    segment: "haut-standing",
    status: "en-lancement",
    kinds: ["appartement", "local-commercial", "plateau-bureau"],
    price: { amount: 1010000, unit: "total" },
    surfaceMin: 62,
    surfaceMax: 118,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: 2027,
    deliveredYear: null,
    amenities: [
      "centre-commercial",
      "mosquee",
      "ecoles",
      "commerces",
      "piscine",
      "parking-sous-sol",
      "ascenseur",
      "aires-de-jeux",
      "terrains-de-sport",
      "spa",
    ],
    summary: {
      fr: "Programme mixte sur l'avenue Hassan II : logements, plateaux de bureaux et commerces en rez-de-chaussée, avec centre commercial intégré.",
      ar: "برنامج مختلط على شارع الحسن الثاني: سكن، طوابق مكاتب، ومحلات تجارية بالطابق الأرضي، مع مركز تجاري مدمج.",
    },
    hero: {
      key: "th_odyssee",
      nature: "render",
      alt: {
        fr: "Immeubles Odyssée à Mohammedia, volumes blancs en R+5 avec balcons filants et commerces vitrés en rez-de-chaussée.",
        ar: "عمارات أوديسي بالمحمدية، كتل بيضاء من خمسة طوابق بشرفات ممتدة ومحلات زجاجية بالطابق الأرضي.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "220",
    slug: "odyssee-studios",
    name: { fr: "Odyssée Studios", ar: "أوديسي ستوديوهات" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Avenue Hassan II, rue d'Agadir", ar: "شارع الحسن الثاني، زنقة أكادير" },
    lat: 33.6858,
    lng: -7.3841,
    segment: "haut-standing",
    status: "en-lancement",
    kinds: ["studio"],
    price: { amount: 555000, unit: "total" },
    surfaceMin: 38,
    surfaceMax: 47,
    bedroomsMin: 1,
    bedroomsMax: 1,
    floors: "R+5",
    deliveryYear: 2027,
    deliveredYear: null,
    amenities: [
      "centre-commercial",
      "mosquee",
      "ecoles",
      "commerces",
      "piscine",
      "parking-sous-sol",
      "ascenseur",
      "aires-de-jeux",
      "terrains-de-sport",
      "spa",
    ],
    summary: {
      fr: "Studios de 38 à 47 m² dans le programme Odyssée, avec séjour, chambre séparée, cuisine équipée et balcon.",
      ar: "ستوديوهات من 38 إلى 47 م² ضمن برنامج أوديسي، بصالون وغرفة منفصلة ومطبخ مجهّز وشرفة.",
    },
    hero: {
      key: "th_odyssee_studios",
      nature: "render",
      alt: {
        fr: "Studio Odyssée : séjour compact ouvert sur le balcon, cuisine équipée en enfilade et chambre séparée.",
        ar: "ستوديو أوديسي: صالون صغير مفتوح على الشرفة، مطبخ مجهّز متتابع، وغرفة منفصلة.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [
      {
        id: "studio",
        label: { fr: "Studio", ar: "ستوديو" },
        kind: "studio",
        surfaceMin: 38,
        surfaceMax: 47,
        bedrooms: 1,
        price: { amount: 555000, unit: "total" },
        composition: {
          fr: "Séjour, 1 chambre, cuisine équipée, 1 salle de bains, balcon",
          ar: "صالون، غرفة، مطبخ مجهّز، حمام، شرفة",
        },
        unitsAvailable: 22,
      },
    ],
    nearby: [],
  },

  {
    id: "72",
    slug: "assalam-tg",
    name: { fr: "Assalam TG", ar: "السلام طنجة" },
    cityId: "tanger",
    neighbourhood: { fr: "Route de Rabat", ar: "طريق الرباط" },
    lat: 35.7412,
    lng: -5.8203,
    segment: "moyen-standing",
    status: "en-promotion",
    kinds: ["appartement"],
    price: { amount: 1760000, unit: "total" },
    surfaceMin: 88,
    surfaceMax: 142,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: null,
    deliveredYear: 2021,
    amenities: ["vue-mer", "piscine", "parking-sous-sol", "ascenseur", "espaces-verts", "securite"],
    summary: {
      fr: "Appartements livrés à Tanger, avec vue sur le détroit depuis les étages hauts et appartement témoin visitable.",
      ar: "شقق مُسلَّمة بطنجة، بإطلالة على المضيق من الطوابق العليا وشقة نموذجية قابلة للزيارة.",
    },
    hero: {
      key: "th_assalam_tg",
      nature: "photograph",
      alt: {
        fr: "Appartement témoin livré d'Assalam à Tanger : séjour meublé, sol clair et grande baie vitrée.",
        ar: "شقة نموذجية مُسلَّمة بالسلام طنجة: صالون مؤثث، أرضية فاتحة، ونافذة زجاجية كبيرة.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "160",
    slug: "bougainvillier",
    name: { fr: "Bougainvillier", ar: "بوغانفيلي" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Alia", ar: "العالية" },
    lat: 33.6944,
    lng: -7.3627,
    segment: "moyen-standing",
    status: "en-promotion",
    kinds: ["appartement"],
    price: { amount: 700000, unit: "total" },
    surfaceMin: 58,
    surfaceMax: 96,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: null,
    deliveredYear: 2022,
    amenities: ["espaces-verts", "mosquee", "ecoles", "commerces", "aires-de-jeux", "ascenseur"],
    summary: {
      fr: "Appartements familiaux à Alia, livrés et disponibles immédiatement, à proximité des écoles et des commerces du quartier.",
      ar: "شقق عائلية بالعالية، مُسلَّمة ومتاحة فوراً، بالقرب من مدارس الحي ومحلاته التجارية.",
    },
    hero: {
      key: "th_bougainvillier",
      nature: "photograph",
      alt: {
        fr: "Résidence Bougainvillier à Mohammedia : façades claires en R+4 ordonnées autour d'espaces verts plantés.",
        ar: "إقامة بوغانفيلي بالمحمدية: واجهات فاتحة من أربعة طوابق منتظمة حول مساحات خضراء مغروسة.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "218",
    slug: "izdihar",
    name: { fr: "Izdihar", ar: "الازدهار" },
    cityId: "essaouira",
    neighbourhood: { fr: "Quartier Al Massira", ar: "حي المسيرة" },
    lat: 31.5152,
    lng: -9.7492,
    segment: "moyen-standing",
    status: "en-lancement",
    kinds: ["appartement"],
    price: { amount: 485000, unit: "total" },
    surfaceMin: 52,
    surfaceMax: 78,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+3",
    deliveryYear: 2027,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "espaces-verts", "aires-de-jeux"],
    summary: {
      fr: "Le programme le plus accessible du portefeuille, à Essaouira. Appartements de 2 et 3 chambres, à quinze minutes de la médina et du port.",
      ar: "أكثر برامج المحفظة في المتناول، بالصويرة. شقق بغرفتين أو ثلاث غرف، على بعد خمس عشرة دقيقة من المدينة العتيقة والميناء.",
    },
    hero: {
      key: "th_izdihar",
      nature: "render",
      alt: {
        fr: "Résidence Izdihar à Essaouira : immeubles blancs à volets bleus organisés autour d'une cour plantée.",
        ar: "إقامة الازدهار بالصويرة: عمارات بيضاء بمصاريع زرقاء منتظمة حول فناء مغروس.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [
      { label: { fr: "Médina d'Essaouira", ar: "مدينة الصويرة العتيقة" }, minutes: 15, mode: "drive" },
    ],
  },

  {
    id: "161",
    slug: "dyar-al-bahia-2",
    name: { fr: "Dyar Al Bahia 2", ar: "ديار البهية 2" },
    cityId: "temara",
    neighbourhood: { fr: "Harhoura", ar: "الهرهورة" },
    lat: 33.9169,
    lng: -6.9312,
    segment: "moyen-standing",
    status: "en-lancement",
    kinds: ["appartement"],
    price: { amount: 830000, unit: "total" },
    surfaceMin: 64,
    surfaceMax: 104,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: 2026,
    deliveredYear: null,
    amenities: ["vue-mer", "plage", "mosquee", "ecoles", "commerces", "ascenseur", "espaces-verts"],
    summary: {
      fr: "Deuxième tranche à Harhoura, entre Rabat et Témara, à quelques minutes de la côte.",
      ar: "الشطر الثاني بالهرهورة، بين الرباط وتمارة، على بعد دقائق من الساحل.",
    },
    hero: {
      key: "th_dyar_al_bahia",
      nature: "render",
      alt: {
        fr: "Immeubles de Dyar Al Bahia 2 à Harhoura, façades blanches et balcons orientés vers l'océan.",
        ar: "عمارات ديار البهية 2 بالهرهورة، واجهات بيضاء وشرفات موجّهة نحو المحيط.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "175",
    slug: "al-youssoufia-r2",
    name: { fr: "Al Youssoufia R+2", ar: "اليوسفية R+2" },
    cityId: "had-soualem",
    neighbourhood: { fr: "Al Youssoufia", ar: "اليوسفية" },
    lat: 33.4201,
    lng: -7.8446,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot"],
    price: { amount: 3450, unit: "per-sqm", minimumLotSqm: 90 },
    surfaceMin: 90,
    surfaceMax: 240,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: 2026,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "securite"],
    summary: {
      fr: "Lots de terrain viabilisés constructibles en R+2 à Had Soualem, sur l'axe Casablanca — El Jadida.",
      ar: "بقع أرضية مجهّزة قابلة للبناء في طابقين فوق الأرضي بحد السوالم، على محور الدار البيضاء — الجديدة.",
    },
    hero: {
      key: "th_lots",
      nature: "photograph",
      alt: {
        fr: "Lotissement viabilisé d'Al Youssoufia : voirie et réseaux posés, lots bornés prêts à construire.",
        ar: "تجزئة اليوسفية المجهّزة: طرق وشبكات منجزة، وبقع محدّدة جاهزة للبناء.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "176",
    slug: "al-youssoufia-r3",
    name: { fr: "Al Youssoufia R+3", ar: "اليوسفية R+3" },
    cityId: "had-soualem",
    neighbourhood: { fr: "Al Youssoufia", ar: "اليوسفية" },
    lat: 33.4188,
    lng: -7.8479,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot", "local-commercial"],
    price: { amount: 4950, unit: "per-sqm", minimumLotSqm: 110 },
    surfaceMin: 110,
    surfaceMax: 300,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: 2026,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "securite"],
    summary: {
      fr: "Lots constructibles en R+3 avec commerce autorisé en rez-de-chaussée, sur les axes principaux du lotissement.",
      ar: "بقع قابلة للبناء في ثلاثة طوابق مع ترخيص للتجارة بالطابق الأرضي، على المحاور الرئيسية للتجزئة.",
    },
    hero: {
      key: "th_lots",
      nature: "photograph",
      alt: {
        fr: "Lots d'angle du lotissement Al Youssoufia, en bordure d'axe principal.",
        ar: "بقع زاويّة بتجزئة اليوسفية، على حافة محور رئيسي.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "143",
    slug: "al-maamora-r1",
    name: { fr: "Al Maamora R+1", ar: "المعمورة R+1" },
    cityId: "sala-al-jadida",
    neighbourhood: { fr: "Al Maamora", ar: "المعمورة" },
    lat: 34.0043,
    lng: -6.7412,
    segment: "terrain",
    status: "en-promotion",
    kinds: ["lot"],
    price: { amount: 4600, unit: "per-sqm", minimumLotSqm: 100 },
    surfaceMin: 100,
    surfaceMax: 260,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: 2024,
    amenities: ["mosquee", "ecoles", "commerces", "espaces-verts"],
    summary: {
      fr: "Lots viabilisés livrés à Sala Al Jadida, constructibles en R+1, disponibles immédiatement.",
      ar: "بقع مجهّزة مُسلَّمة بسلا الجديدة، قابلة للبناء في طابق فوق الأرضي، متاحة فوراً.",
    },
    hero: {
      key: "th_maamora",
      nature: "photograph",
      alt: {
        fr: "Lotissement Al Maamora livré à Sala Al Jadida, rues aménagées et premières constructions en cours.",
        ar: "تجزئة المعمورة المُسلَّمة بسلا الجديدة، شوارع مهيأة وأولى البناءات في طور الإنجاز.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },
];

export const projectBySlug = new Map(projects.map((p) => [p.slug, p]));

export function getProject(slug: string): Project | undefined {
  return projectBySlug.get(slug);
}

/** Company-level figures used in the home page argument. */
export const companyRecord = {
  homesDelivered: 40000,
  cities: 15,
  yearsActive: 40,
} as const;
