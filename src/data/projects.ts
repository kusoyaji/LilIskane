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
 * Riad Garden II — the flagship. Renders, off-plan, en lancement.
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
 * space in Riad Garden I, the finished phase on the same avenue — same architect, same
 * contractor, same specification. This is the argument the site is built on.
 */
const rg2Proof: ProofPair[] = [
  {
    id: "facade",
    shortLabel: { fr: "Façade", ar: "الواجهة" },
    sourceProject: { fr: "Riad Garden I", ar: "رياض غاردن 1" },
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
    deliveryYear: null,
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
    ],
    summary: {
      fr: "Deuxième tranche de Riad Garden, sur l'avenue Mohammed VI. Appartements de 2 et 3 chambres en R+2, avec parking en sous-sol, piscine et jardins plantés. La première tranche, sur la même avenue, est déjà livrée.",
      ar: "الشطر الثاني من رياض غاردن، على شارع محمد السادس. شقق بغرفتين أو ثلاث غرف في عمارات من طابق أرضي وطابقين، مع مرآب تحت أرضي ومسبح وحدائق مغروسة. أما الشطر الأول، على الشارع نفسه، فقد سُلّم بالفعل.",
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
        id: "temoin-rg1",
        // The client labels this Matterport "Visite Témoin 2 Chambres, Salon":
        // a furnished show flat in the delivered phase, not an owner's home.
        label: {
          fr: "Appartement témoin — Riad Garden I, livré",
          ar: "شقة نموذجية — رياض غاردن 1، مُسلَّم",
        },
        matterportId: "aRgKUGQrgkF",
        poster: {
          key: "rg1_DSC08548",
          nature: "photograph",
          alt: {
            fr: "Séjour de l'appartement témoin de Riad Garden I, meublé, pouf terracotta et téléviseur mural.",
            ar: "صالون الشقة النموذجية برياض غاردن 1، مؤثثة، مقعد طيني اللون وتلفاز مثبّت على الجدار.",
          },
        },
        ofDelivered: true,
      },
    ],
    // The client publishes one composition ("Salon - 2 Chambres - Cuisine
    // équipée - 2 SDB - Balcons et Terrasses"), one surface range (84–116 m²)
    // and two show flats, "Visite Témoin 2 Chambres" and "3 Chambres". v1's
    // Types A–D, their per-type surfaces, prices and stock were invented.
    // The 3-bedroom plan carries no published price: amount 0 never equals the
    // entry price, so the plan card reads "Prix sur demande".
    typologies: [
      {
        id: "2ch",
        label: { fr: "Salon et 2 chambres", ar: "صالون وغرفتان" },
        kind: "appartement",
        surfaceMin: 84,
        surfaceMax: 116,
        bedrooms: 2,
        price: { amount: 1830000, unit: "total" },
        composition: {
          fr: "Salon, 2 chambres, cuisine équipée, 2 salles de bains, balcons et terrasses",
          ar: "صالون، غرفتان، مطبخ مجهّز، حمّامان، شرفات وتراسات",
        },
        unitsAvailable: null,
      },
      {
        id: "3ch",
        label: { fr: "Salon et 3 chambres", ar: "صالون وثلاث غرف" },
        kind: "appartement",
        surfaceMin: 84,
        surfaceMax: 116,
        bedrooms: 3,
        price: { amount: 0, unit: "total" },
        composition: {
          fr: "Appartement témoin visitable en 360°",
          ar: "شقة نموذجية قابلة للزيارة بتقنية 360°",
        },
        unitsAvailable: null,
      },
    ],
    // The client gives no walking or driving times; its only proximity claim
    // is "à côté du plus grand mall d'Afrique", carried by the location copy.
    nearby: [],
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
    status: "en-promotion",
    kinds: ["appartement"],
    price: { amount: 2450000, unit: "total" },
    surfaceMin: 101,
    surfaceMax: 190,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+2",
    deliveryYear: null,
    deliveredYear: null,
    // Client's own label: "En promotion · Livraison immédiate".
    readyNow: true,
    // Client: "En promotion · Remise 6%".
    remisePct: 6,
    amenities: [
      "piscine",
      "espaces-verts",
      "commerces",
      "centre-commercial",
      "spa",
      "parking-sous-sol",
      "vue-montagne",
    ],
    summary: {
      fr: "Première tranche, livrée. Des appartements sont disponibles en livraison immédiate, à partir de 2 450 000 DH ; ils se visitent sur place ou en 360°.",
      ar: "الشطر الأول، مُسلَّم. شقق متاحة بتسليم فوري، ابتداءً من 2 450 000 درهم، يمكن زيارتها في عين المكان أو بتقنية 360 درجة.",
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
        id: "temoin-2ch",
        // Client: "Visite Témoin 2 Chambres, Salon".
        label: { fr: "Appartement témoin — 2 chambres", ar: "شقة نموذجية — غرفتان" },
        matterportId: "aRgKUGQrgkF",
        poster: {
          key: "rg1_DSC08548",
          nature: "photograph",
          alt: {
            fr: "Séjour de l'appartement témoin de Riad Garden I, meublé.",
            ar: "صالون الشقة النموذجية برياض غاردن 1، مؤثثة.",
          },
        },
        ofDelivered: true,
      },
      {
        id: "temoin-3ch",
        // Client: "Visite Témoin 3 Chambres, Salon".
        label: { fr: "Appartement témoin — 3 chambres", ar: "شقة نموذجية — ثلاث غرف" },
        matterportId: "LdA3dxyG6dA",
        poster: {
          key: "rg1_DSC08601",
          nature: "photograph",
          alt: {
            fr: "Chambre et salle d'eau attenante de l'appartement témoin de Riad Garden I.",
            ar: "غرفة نوم وحمام ملحق بها في الشقة النموذجية برياض غاردن 1.",
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
    kinds: ["appartement"],
    price: { amount: 1130000, unit: "total" },
    surfaceMin: 72,
    surfaceMax: 110,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+2",
    deliveryYear: null,
    deliveredYear: null,
    amenities: [
      "piscine",
      "espaces-verts",
      "mosquee",
      "commerces",
      "centre-commercial",
      "parking-sous-sol",
      "ascenseur",
      "aires-de-jeux",
      "vue-montagne",
    ],
    summary: {
      fr: "Sur la route d'Amezmiz, à dix minutes de l'avenue Mohammed VI. Appartements de 2 et 3 chambres en R+2, piscines et jardins paysagers.",
      ar: "على طريق أمزميز، على بعد عشر دقائق من شارع محمد السادس. شقق بغرفتين أو ثلاث غرف في عمارات من طابق أرضي وطابقين، مسابح وحدائق مهيّأة.",
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
    ],
  },

  {
    id: "190",
    slug: "oceane",
    name: { fr: "Océane", ar: "أوسيان" },
    cityId: "sidi-rahal",
    neighbourhood: { fr: "Route d'Azemmour", ar: "طريق أزمور" },
    // Sidi Rahal Chatai, on the coast (OpenStreetMap). Was -7.43 — 48 km
    // inland, which put a beachfront programme in the countryside.
    lat: 33.4716,
    lng: -7.957,
    segment: "haut-standing",
    status: "en-lancement",
    // Client fiche: "Type de logement : Villa", pavillons of 158 m² (min = max)
    // in R+1, salon, séjour, 2 chambres with terraces.
    kinds: ["villa"],
    price: { amount: 1962000, unit: "total" },
    surfaceMin: 158,
    surfaceMax: 158,
    bedroomsMin: 2,
    bedroomsMax: 2,
    floors: "R+1",
    deliveryYear: null,
    deliveredYear: null,
    amenities: [
      "plage",
      "vue-mer",
      "piscine",
      "espaces-verts",
      "spa",
      "centre-commercial",
      "aires-de-jeux",
      "terrains-de-sport",
    ],
    summary: {
      fr: "À 5 minutes du centre de Sidi Rahal, en bordure immédiate de la mer : des pavillons de 158 m² en R+1, avec un salon lumineux ouvert sur la piscine ou le jardin et deux chambres prolongées de terrasses.",
      ar: "على بعد 5 دقائق من وسط سيدي رحال، على حافة البحر مباشرة: فيلات من 158 م² بطابق أرضي وطابق علوي، بصالون مضيء ينفتح على المسبح أو الحديقة، وغرفتين تمتدّ كل منهما إلى تراس.",
    },
    hero: {
      key: "th_oceane",
      nature: "render",
      alt: {
        fr: "Pavillons d'Océane à Sidi Rahal, toitures basses et terrasses ouvertes, près de la mer.",
        ar: "فيلات أوسيان بسيدي رحال، أسقف منخفضة وتراسات مفتوحة، قرب البحر.",
      },
    },
    gallery: [],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [{ label: { fr: "Centre de Sidi Rahal", ar: "وسط سيدي رحال" }, minutes: 5, mode: "drive" }],
  },

  {
    id: "191",
    slug: "oceane-r1",
    name: { fr: "Océane R+1 — lots de terrain", ar: "أوسيان R+1 — بقع أرضية" },
    cityId: "sidi-rahal",
    neighbourhood: { fr: "Route d'Azemmour", ar: "طريق أزمور" },
    lat: 33.4716,
    lng: -7.957,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot"],
    price: { amount: 4500, unit: "per-sqm", minimumLotSqm: 168 },
    surfaceMin: 168,
    surfaceMax: 379,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: null,
    // Client label: "Livraison imminente".
    readySoon: true,
    amenities: ["plage", "piscine", "espaces-verts", "centre-commercial", "aires-de-jeux", "terrains-de-sport"],
    summary: {
      fr: "Lots pour villas isolées ou jumelées, de 168 à 379 m², à bâtir en R+1, à 5 minutes du centre de Sidi Rahal, en bordure de mer. Livraison imminente.",
      ar: "بقع لفيلات مستقلة أو متلاصقة، من 168 إلى 379 م²، للبناء بطابق أرضي وطابق علوي، على بعد 5 دقائق من وسط سيدي رحال، على حافة البحر. تسليم وشيك.",
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
    nearby: [{ label: { fr: "Centre de Sidi Rahal", ar: "وسط سيدي رحال" }, minutes: 5, mode: "drive" }],
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
    kinds: ["appartement", "local-commercial"],
    price: { amount: 1010000, unit: "total" },
    surfaceMin: 73,
    surfaceMax: 111,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: null,
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
      fr: "Sur l'avenue Hassan II, une résidence haut standing en R+5 avec ascenseurs, piscine, allées piétonnes et parking en sous-sol : appartements de 2 à 3 chambres, de 73 à 111 m², avec 2 salles de bains et buanderie, commerces en rez-de-chaussée.",
      ar: "على شارع الحسن الثاني، إقامة راقية من طابق أرضي وخمسة طوابق بمصاعد ومسبح وممرات للراجلين ومرآب تحت أرضي: شقق من غرفتين إلى ثلاث، من 73 إلى 111 م²، بحمّامين وغرفة غسيل، ومحلات تجارية بالطابق الأرضي.",
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
    deliveryYear: null,
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
        fr: "Odyssée Studios à Mohammedia : piscine centrale bordée de transats et de parasols, entre des immeubles aux façades claires.",
        ar: "أوديسي ستوديوهات بالمحمدية: مسبح مركزي تحيط به كراسي الاستلقاء والمظلات، بين عمارات بواجهات فاتحة.",
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
    neighbourhood: { fr: "Avenue Moulay Ismaïl", ar: "شارع مولاي إسماعيل" },
    lat: 35.7412,
    lng: -5.8203,
    segment: "moyen-standing",
    status: "en-promotion",
    kinds: ["appartement"],
    price: { amount: 1760000, unit: "total" },
    surfaceMin: 182,
    surfaceMax: 213,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+8",
    deliveryYear: null,
    deliveredYear: null,
    // Client's own label: "En promotion · Livraison immédiate".
    readyNow: true,
    // Client: "En promotion · Remise 6%".
    remisePct: 6,
    amenities: ["parking-sous-sol", "spa", "commerces", "centre-commercial"],
    summary: {
      fr: "Au cœur de Tanger, avenue Moulay Ismaïl, près de la place Jamia Al Arabia : appartements et duplex de 182 à 213 m² dans un complexe mixte avec centres d'affaires et centre commercial, parking sur deux niveaux en sous-sol. Livraison immédiate.",
      ar: "في قلب طنجة، بشارع مولاي إسماعيل قرب ساحة الجامعة العربية: شقق ودوبلكس من 182 إلى 213 م² ضمن مركّب مختلط يضم مركزَي أعمال ومركزاً تجارياً، مع مرآب من مستويين تحت الأرض. تسليم فوري.",
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
    tours: [
      {
        id: "temoin",
        // Client: "Visite Immersive Témoin 150m²".
        label: { fr: "Appartement témoin — 150 m²", ar: "شقة نموذجية — 150 م²" },
        matterportId: "9oWTZCGuoXG",
        poster: {
          key: "th_assalam_tg",
          nature: "photograph",
          alt: {
            fr: "Appartement témoin d'Assalam à Tanger : séjour meublé, sol clair et grande baie vitrée.",
            ar: "شقة نموذجية بالسلام طنجة: صالون مؤثث، أرضية فاتحة، ونافذة زجاجية كبيرة.",
          },
        },
        // An "appartement témoin" is a show flat, so this is not a tour of a
        // delivered unit. There is no still framed at the tour's opening
        // camera position yet, so the programme hero stands in — requested in
        // MEDIA-REQUESTS.md.
        ofDelivered: false,
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "160",
    slug: "bougainvillier",
    name: { fr: "Bougainvillier", ar: "بوغانفيلي" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Entrée sud, route côtière", ar: "المدخل الجنوبي، الطريق الساحلية" },
    lat: 33.6944,
    lng: -7.3627,
    segment: "moyen-standing",
    status: "en-promotion",
    kinds: ["appartement"],
    price: { amount: 700000, unit: "total" },
    surfaceMin: 70,
    surfaceMax: 155,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: null,
    deliveredYear: null,
    // Client's own label: "En promotion · Livraison immédiate".
    readyNow: true,
    // Client: "En promotion · Remise 3%".
    remisePct: 3,
    amenities: [
      "piscine",
      "parking-sous-sol",
      "spa",
      "espaces-verts",
      "mosquee",
      "ecoles",
      "centre-commercial",
      "terrains-de-sport",
      "commerces",
      "ascenseur",
    ],
    summary: {
      fr: "À l'entrée sud de Mohammedia, à quelques minutes des plages et de la gare, à 15 minutes de Casablanca : appartements de 2 à 3 chambres avec balcons, autour d'une grande piscine. Livraison immédiate.",
      ar: "عند المدخل الجنوبي للمحمدية، على بعد دقائق من الشواطئ والمحطة و15 دقيقة من الدار البيضاء: شقق من غرفتين إلى ثلاث بشرفات، حول مسبح كبير. تسليم فوري.",
    },
    hero: {
      key: "th_bougainvillier",
      nature: "photograph",
      alt: {
        fr: "Séjour d'un appartement de Bougainvillier à Mohammedia : sol en marbre clair, salle à manger aux chaises de velours bleu, lustre et grandes baies.",
        ar: "صالون شقة في بوغانفيلي بالمحمدية: أرضية رخامية فاتحة، ركن طعام بكراسٍ من المخمل الأزرق، ثريا ونوافذ واسعة.",
      },
    },
    gallery: [],
    proof: [],
    tours: [
      {
        id: "temoin",
        // Client: "Visite Immersive Témoin 80m²".
        label: { fr: "Appartement témoin — 80 m²", ar: "شقة نموذجية — 80 م²" },
        matterportId: "B5HfsowjF9b",
        poster: {
          key: "th_bougainvillier",
          nature: "photograph",
          alt: {
            fr: "Séjour d'un appartement de Bougainvillier à Mohammedia : sol en marbre clair, salle à manger aux chaises de velours bleu, lustre et grandes baies.",
            ar: "صالون شقة في بوغانفيلي بالمحمدية: أرضية رخامية فاتحة، ركن طعام بكراسٍ من المخمل الأزرق، ثريا ونوافذ واسعة.",
          },
        },
        // Show flat, not a delivered unit. Poster is the programme hero for
        // want of an opening-frame still — requested in MEDIA-REQUESTS.md.
        ofDelivered: false,
      },
    ],
    typologies: [],
    nearby: [{ label: { fr: "Casablanca", ar: "الدار البيضاء" }, minutes: 15, mode: "drive" }],
  },

  {
    id: "218",
    slug: "izdihar",
    name: { fr: "Izdihar", ar: "الازدهار" },
    cityId: "essaouira",
    neighbourhood: { fr: "Al Ghazoua, route d'Agadir", ar: "الغزوة، طريق أكادير" },
    lat: 31.5152,
    lng: -9.7492,
    segment: "moyen-standing",
    status: "en-lancement",
    kinds: ["appartement"],
    price: { amount: 485000, unit: "total" },
    surfaceMin: 54,
    surfaceMax: 92,
    bedroomsMin: 2,
    bedroomsMax: 2,
    floors: "R+2",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "espaces-verts"],
    summary: {
      fr: "À Al Ghazoua, à 10 minutes du centre d'Essaouira, entre océan et nature : appartements de 2 chambres, de 54 à 92 m², en R+2. Projet éligible au programme d'aide directe au logement.",
      ar: "بالغزوة، على بعد 10 دقائق من وسط الصويرة، بين المحيط والطبيعة: شقق بغرفتين من 54 إلى 92 م²، في عمارات من طابق أرضي وطابقين. مشروع مؤهَّل لبرنامج الدعم المباشر للسكن.",
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
      { label: { fr: "Centre d'Essaouira", ar: "وسط الصويرة" }, minutes: 10, mode: "drive" },
    ],
  },

  {
    id: "161",
    slug: "dyar-al-bahia-2",
    name: { fr: "Dyar Al Bahia 2", ar: "ديار البهية 2" },
    cityId: "temara",
    neighbourhood: { fr: "Al Massira II, avenue Lalla Meriem", ar: "المسيرة 2، شارع للا مريم" },
    // Client: "au cœur de la ville de Temara" — the Témara centroid, not
    // Harhoura on the coast.
    lat: 33.9287,
    lng: -6.9067,
    segment: "moyen-standing",
    status: "en-lancement",
    kinds: ["appartement"],
    price: { amount: 830000, unit: "total" },
    surfaceMin: 70,
    surfaceMax: 94,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["parking-sous-sol", "commerces", "mosquee", "centre-commercial", "ascenseur", "espaces-verts"],
    summary: {
      fr: "Au cœur de Témara, à 5 minutes de Rabat : appartements de 2 à 3 chambres, de 70 à 94 m², avec balcon et terrasse, ouverts sur des patios plantés. Immeubles en R+4 avec ascenseur et parking en sous-sol.",
      ar: "في قلب تمارة، على بعد 5 دقائق من الرباط: شقق من غرفتين إلى ثلاث، من 70 إلى 94 م²، بشرفة وتراس، تطلّ على فناءات خضراء. عمارات من طابق أرضي وأربعة طوابق بمصعد ومرآب تحت أرضي.",
    },
    hero: {
      key: "th_dyar_al_bahia",
      nature: "render",
      alt: {
        fr: "Immeubles de Dyar Al Bahia 2 à Témara, façades blanches et balcons.",
        ar: "عمارات ديار البهية 2 بتمارة، واجهات بيضاء وشرفات.",
      },
    },
    gallery: [],
    proof: [],
    tours: [
      {
        id: "temoin",
        // Client: "Visite Immersive Témoin 77m²".
        label: { fr: "Appartement témoin — 77 m²", ar: "شقة نموذجية — 77 م²" },
        matterportId: "hiNnb5TZFkM",
        poster: {
          key: "th_dyar_al_bahia",
          nature: "render",
          alt: {
            fr: "Immeubles de Dyar Al Bahia 2 à Témara, façades blanches et balcons.",
            ar: "عمارات ديار البهية 2 بتمارة، واجهات بيضاء وشرفات.",
          },
        },
        // Still en lancement: nothing in this programme is delivered, so the
        // tour is necessarily a show flat.
        ofDelivered: false,
      },
    ],
    typologies: [],
    nearby: [{ label: { fr: "Rabat", ar: "الرباط" }, minutes: 5, mode: "drive" }],
  },

  {
    id: "175",
    slug: "al-youssoufia-r2",
    name: { fr: "Al Youssoufia R+2", ar: "اليوسفية R+2" },
    cityId: "had-soualem",
    neighbourhood: { fr: "Boulevard Mohammed VI", ar: "شارع محمد السادس" },
    lat: 33.4201,
    lng: -7.8446,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot"],
    price: { amount: 3450, unit: "per-sqm", minimumLotSqm: 120 },
    surfaceMin: 120,
    surfaceMax: 140,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: null,
    // Client label: "Livraison imminente".
    readySoon: true,
    amenities: ["mosquee", "commerces", "centre-commercial", "aires-de-jeux"],
    summary: {
      fr: "Lots de terrain viabilisés de 120 à 140 m², d'une ou deux façades, pour maisons individuelles en sous-sol + RDC + 2 étages, sur le boulevard Mohammed VI à Had Soualem. Livraison imminente.",
      ar: "بقع أرضية مجهّزة من 120 إلى 140 م²، بواجهة أو واجهتين، لبناء منازل فردية (طابق تحت أرضي وطابق أرضي وطابقان)، على شارع محمد السادس بحد السوالم. تسليم وشيك.",
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
    neighbourhood: { fr: "Boulevard Mohammed VI", ar: "شارع محمد السادس" },
    lat: 33.4188,
    lng: -7.8479,
    segment: "terrain",
    status: "en-lancement",
    kinds: ["lot", "local-commercial"],
    price: { amount: 4950, unit: "per-sqm", minimumLotSqm: 147 },
    surfaceMin: 147,
    surfaceMax: 173,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: null,
    // Client label: "Livraison imminente".
    readySoon: true,
    amenities: ["mosquee", "commerces", "centre-commercial", "aires-de-jeux"],
    summary: {
      fr: "Lots de terrain viabilisés de 147 à 173 m², pour immeubles en sous-sol + RDC commercial ou résidentiel + 3 étages, sur le boulevard Mohammed VI à Had Soualem. Livraison imminente.",
      ar: "بقع أرضية مجهّزة من 147 إلى 173 م²، لبناء عمارات (طابق تحت أرضي وطابق أرضي تجاري أو سكني وثلاثة طوابق)، على شارع محمد السادس بحد السوالم. تسليم وشيك.",
    },
    hero: {
      key: "th_lots",
      nature: "photograph",
      alt: {
        fr: "Lots du lotissement Al Youssoufia à Had Soualem, voirie tracée et lots bornés.",
        ar: "بقع تجزئة اليوسفية بحد السوالم، طرق مهيأة وبقع محدّدة.",
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
    neighbourhood: { fr: "Avenue Lalla Meryem, zone villas", ar: "شارع للا مريم، منطقة الفيلات" },
    lat: 34.0043,
    lng: -6.7412,
    segment: "terrain",
    // Client: "Livraison immédiate", no promotion. Lots of 330 to 550 m² per
    // the client's description (its spec line says 474–618 m²: to confirm
    // with the client; the description's range is used until then).
    status: "livre",
    readyNow: true,
    kinds: ["lot"],
    price: { amount: 4600, unit: "per-sqm", minimumLotSqm: 330 },
    surfaceMin: 330,
    surfaceMax: 550,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "espaces-verts", "piscine", "centre-commercial"],
    summary: {
      fr: "Lots de villas viabilisés et équipés, de 330 à 550 m², en bande ou isolés, à bâtir en R+1 avec sous-sol, face à la mosquée Mohammed VI. Livraison immédiate.",
      ar: "بقع فيلات مجهّزة من 330 إلى 550 م²، متلاصقة أو مستقلة، للبناء بطابق أرضي وطابق علوي مع طابق تحت أرضي، قبالة مسجد محمد السادس. تسليم فوري.",
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
