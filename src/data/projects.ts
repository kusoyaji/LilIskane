import { galleries } from "./galleries.ts";
import type { MediaRef, Project, ProofPair } from "./types";

/**
 * The portfolio, shaped exactly like the CMS payload the components expect:
 * all twenty-three programmes published on liliskane.com.
 *
 * Every address, surface range, height, price, amenity list and status label
 * was checked against the client's own fiche (review round 2 found v1's
 * values contradicted half of them, and corrected them). Galleries are the
 * client's own pictures, curated (`./galleries.ts`). Riad Garden II is the one
 * programme modelled in full depth — plans, both Matterport tours, the proof
 * set and the camera move. Where the client's fiche is silent (delivery years,
 * per-plan prices), the field is empty rather than guessed.
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
    kinds: ["appartement"],
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
    gallery: galleries["riad-garden-i"],
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
    gallery: galleries["amaia"],
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
    gallery: galleries["oceane"],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [{ label: { fr: "Centre de Sidi Rahal", ar: "وسط سيدي رحال" }, minutes: 5, mode: "drive" }],
  },

  {
    id: "191",
    slug: "oceane-r1",
    // No-break space before the dash: it must not open the second line of a wrapped card title.
    name: { fr: "Océane R+1 — lots de terrain", ar: "أوسيان R+1 — بقع أرضية" },
    cityId: "sidi-rahal",
    neighbourhood: { fr: "Route d'Azemmour", ar: "طريق أزمور" },
    lat: 33.4716,
    lng: -7.957,
    segment: "terrain",
    status: "en-construction",
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
    kinds: ["appartement"],
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
    gallery: galleries["odyssee"],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "220",
    slug: "odyssee-studios",
    name: { fr: "Odyssée Studios", ar: "أوديسي استوديوهات" },
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
      ar: "استوديوهات من 38 إلى 47 م² ضمن مشروع أوديسي، بصالون وغرفة منفصلة ومطبخ مجهّز وشرفة.",
    },
    hero: {
      key: "th_odyssee_studios",
      nature: "render",
      alt: {
        fr: "Odyssée Studios à Mohammedia : piscine centrale bordée de transats et de parasols, entre des immeubles aux façades claires.",
        ar: "أوديسي استوديوهات بالمحمدية: مسبح مركزي تحيط به كراسي الاستلقاء والمظلات، بين عمارات بواجهات فاتحة.",
      },
    },
    gallery: galleries["odyssee-studios"],
    proof: [],
    tours: [],
    typologies: [
      {
        id: "studio",
        label: { fr: "Studio", ar: "استوديو" },
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
    gallery: galleries["assalam-tg"],
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
    gallery: galleries["bougainvillier"],
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
        fr: "Rendu de la résidence Izdihar, à Essaouira : immeubles blancs sur trois niveaux aux encadrements de fenêtres couleur bois, palmiers sur une pelouse en bord de voie.",
        ar: "تصوّر لإقامة الازدهار بالصويرة: عمارات بيضاء من ثلاثة مستويات بإطارات نوافذ بلون الخشب، ونخيل على عشب بمحاذاة الطريق.",
      },
    },
    gallery: galleries["izdihar"],
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
    name: { fr: "Dyar Al Bahia 2", ar: "ديار الباهية 2" },
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
        ar: "عمارات ديار الباهية 2 بتمارة، واجهات بيضاء وشرفات.",
      },
    },
    gallery: galleries["dyar-al-bahia-2"],
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
            ar: "عمارات ديار الباهية 2 بتمارة، واجهات بيضاء وشرفات.",
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
    status: "en-construction",
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
    status: "en-construction",
    kinds: ["lot"],
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
    // Client: "Livraison immédiate", no promotion. The fiche contradicts
    // itself: its description says lots "de 330 à 550 m²", its spec block
    // "Superficie min : 474 m² / max : 618 m²". Surfaces follow the spec block,
    // as for every other programme (Youssoufia's 120 and 147 m² are spec-block
    // figures too), and it is the conservative choice: the derived smallest-lot
    // price can only be too high, never undercut the client. Open question in
    // docs/DEMO.md.
    status: "livre",
    readyNow: true,
    kinds: ["lot"],
    price: { amount: 4600, unit: "per-sqm", minimumLotSqm: 474 },
    surfaceMin: 474,
    surfaceMax: 618,
    bedroomsMin: 0,
    bedroomsMax: 0,
    floors: null,
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["mosquee", "ecoles", "commerces", "espaces-verts", "piscine", "centre-commercial"],
    summary: {
      fr: "Lots de villas viabilisés et équipés, en bande ou isolés, à bâtir en R+1 avec sous-sol, face à la mosquée Mohammed VI. Livraison immédiate.",
      ar: "بقع فيلات مجهّزة، متلاصقة أو مستقلة، للبناء بطابق أرضي وطابق علوي مع طابق تحت أرضي، قبالة مسجد محمد السادس. تسليم فوري.",
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

  /* ---------------------------------------------------------------------------
   * The nine programmes on liliskane.com that v1 left out, from their fiches:
   * address, surfaces, height, price, amenities and the client's own status
   * label. Map pins are the client's own (read from each fiche's map).
   * ------------------------------------------------------------------------ */
  {
    id: "180",
    slug: "assafa",
    name: { fr: "Assafa", ar: "الصفاء" },
    cityId: "had-soualem",
    neighbourhood: { fr: "Boulevard Mohammed VI", ar: "شارع محمد السادس" },
    lat: 33.41567,
    lng: -7.863575,
    segment: "economique",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 250000, unit: "total" },
    surfaceMin: 55,
    surfaceMax: 65,
    bedroomsMin: 3,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["mosquee","centre-commercial","commerces","ascenseur"],
    summary: {
      fr: "Assafa est située sur le boulevard Mohammed VI, au cœur de Had Soualem, à dix minutes des plages de Sidi Rahal. Ses immeubles en R+4 avec ascenseurs accueillent des appartements de 55 à 65 m², avec salon, trois chambres, cuisine avec buanderie et salle de bains.",
      ar: "تقع إقامة الصفاء على شارع محمد السادس، في قلب حد السوالم، على بعد عشر دقائق من شواطئ سيدي رحال. وتضم عماراتها المكوّنة من طابق أرضي وأربعة طوابق والمجهّزة بمصاعد شققاً من 55 إلى 65 م²، بصالون وثلاث غرف ومطبخ مع غرفة غسيل وحمّام.",
    },
    hero: {
      key: "hp_assafa",
      nature: "render",
      alt: {
        fr: "Rendu des immeubles d'Assafa, à Had Soualem : façades blanches et grises sur quatre étages, commerces vitrés en rez-de-chaussée et palmiers le long du trottoir.",
        ar: "تصوّر لعمارات إقامة الصفاء بحد السوالم: واجهات بيضاء ورمادية من أربعة طوابق، ومحلات تجارية بواجهات زجاجية في الطابق الأرضي، ونخيل على امتداد الرصيف.",
      },
    },
    gallery: galleries["assafa"],
    proof: [],
    tours: [
      {
        id: "assafa-temoin",
        label: { fr: "Appartement témoin — 4 pièces", ar: "شقة نموذجية — صالون وثلاث غرف" },
        matterportId: "qvszE14omLR",
        ofDelivered: false,
        poster: {
          key: "tp_assafa",
          nature: "photograph",
          alt: {
            fr: "Salon de l'appartement témoin d'Assafa, à Had Soualem : banquettes marocaines bleu-vert en angle, lustre circulaire à pampilles et sol en carrelage effet marbre.",
            ar: "صالون الشقة النموذجية لإقامة الصفاء بحد السوالم: أرائك مغربية زرقاء مخضرّة على شكل زاوية، وثريا دائرية بقطع متدلية، وأرضية من بلاط بمظهر الرخام.",
          },
        },
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "186",
    slug: "massylia",
    name: { fr: "Massylia", ar: "ماسيليا" },
    cityId: "agadir",
    neighbourhood: { fr: "Avenue Laayoune, Tassila", ar: "شارع العيون، تاسيلا" },
    lat: 30.3857,
    lng: -9.5337,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 1045000, unit: "total" },
    surfaceMin: 80,
    surfaceMax: 96,
    bedroomsMin: 3,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["piscine","mosquee","ecoles","parking-sous-sol","espaces-verts","commerces","centre-commercial","aires-de-jeux","ascenseur"],
    summary: {
      fr: "Résidence en R+5 à Tassila, dans l'extension du quartier Al Houda, à l'entrée d'Agadir en venant de Marrakech, avec piscines, espaces verts et ascenseurs. Appartements de 3 chambres de 80 à 96 m², avec balcons, salon, cuisine équipée et deux salles de bains.",
      ar: "إقامة في عمارات من طابق أرضي وخمسة طوابق بتاسيلا، في امتداد حي الهدى عند مدخل أكادير من جهة مراكش، تضم مسابح ومساحات خضراء ومصاعد. شقق بثلاث غرف نوم من 80 إلى 96 م²، مع شرفات وصالون ومطبخ مجهّز وحمّامين.",
    },
    hero: {
      key: "hp_massylia",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin de Massylia, à Agadir : banquettes marocaines terracotta et beiges en angle, grande table basse en noyer et stores jour-nuit sur la fenêtre.",
        ar: "صالون الشقة النموذجية بإقامة ماسيليا بأكادير: أرائك مغربية بلون الطين والبيج على شكل زاوية، وطاولة منخفضة كبيرة من خشب الجوز، وستائر مخطَّطة على النافذة.",
      },
    },
    gallery: galleries["massylia"],
    proof: [],
    tours: [
      {
        id: "massylia-temoin",
        label: { fr: "Appartement témoin — 80 m²", ar: "شقة نموذجية — 80 م²" },
        matterportId: "YqEQdUUCqBC",
        ofDelivered: false,
        poster: {
          key: "tp_massylia",
          nature: "photograph",
          alt: {
            fr: "Second salon de l'appartement témoin de Massylia, à Agadir : banquettes aux motifs géométriques rouges et noirs, table basse en verre et sol effet bois.",
            ar: "الصالون الثاني بالشقة النموذجية بإقامة ماسيليا بأكادير: أرائك بزخارف هندسية حمراء وسوداء، وطاولة منخفضة زجاجية، وأرضية بمظهر خشبي.",
          },
        },
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "188",
    slug: "jnane-souss",
    name: { fr: "Jnane Souss", ar: "جنان سوس" },
    cityId: "agadir",
    neighbourhood: { fr: "Avenue Laayoune, Tassila", ar: "شارع العيون، تاسيلا" },
    lat: 30.384672,
    lng: -9.534688,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 770000, unit: "total" },
    surfaceMin: 70,
    surfaceMax: 91,
    bedroomsMin: 3,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["mosquee","ecoles","parking-sous-sol","espaces-verts","commerces","centre-commercial","ascenseur"],
    summary: {
      fr: "Résidence en immeubles R+5 à Tassila, dans l'extension du quartier Al Houda à Agadir, proche des commerces, des transports et des plages, avec ascenseurs et parkings souterrains. Appartements de 3 chambres de 70 à 91 m², avec balcon, salon, cuisine équipée et buanderie, deux salles de bains et toilettes de service.",
      ar: "إقامة في عمارات من طابق أرضي وخمسة طوابق بتاسيلا، في امتداد حي الهدى بأكادير، قريبة من المتاجر ووسائل النقل والشواطئ، ومجهّزة بمصاعد ومرائب تحت أرضية. شقق بثلاث غرف نوم من 70 إلى 91 م²، مع شرفة وصالون ومطبخ مجهّز وغرفة غسيل وحمّامين ومرحاض للخدمة.",
    },
    hero: {
      key: "hp_jnane_souss",
      nature: "photograph",
      alt: {
        fr: "Salon de l'appartement témoin de Jnane Souss, à Agadir : banquettes marocaines bleu-vert en U, tables basses rondes gigognes et tapis rond sur sol clair.",
        ar: "صالون الشقة النموذجية بإقامة جنان سوس بأكادير: أرائك مغربية بلون أزرق مخضرّ على شكل حرف U، وطاولات منخفضة دائرية متداخلة، وزربية دائرية على أرضية فاتحة.",
      },
    },
    gallery: galleries["jnane-souss"],
    proof: [],
    tours: [
      {
        id: "jnane-souss-temoin",
        label: { fr: "Appartement témoin — 82 m²", ar: "شقة نموذجية — 82 م²" },
        matterportId: "htjuMq1UjPr",
        ofDelivered: false,
        poster: {
          key: "tp_jnane_souss",
          nature: "photograph",
          alt: {
            fr: "Petit salon de l'appartement témoin de Jnane Souss, à Agadir : canapé d'angle écru, coussins moutarde, table ronde blanche et sol effet bois.",
            ar: "الصالون الصغير بالشقة النموذجية بإقامة جنان سوس بأكادير: أريكة زاوية بلون عاجي، ووسائد بلون الخردل، وطاولة دائرية بيضاء، وأرضية بمظهر خشبي.",
          },
        },
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "189",
    slug: "al-anbar",
    name: { fr: "Al Anbar", ar: "العنبر" },
    cityId: "marrakech",
    neighbourhood: { fr: "M'Hamid Sud", ar: "المحاميد الجنوبية" },
    lat: 31.579312,
    lng: -8.046941,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 545000, unit: "total" },
    surfaceMin: 60,
    surfaceMax: 122,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+4",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["aires-de-jeux","centre-commercial","commerces","espaces-verts","mosquee","parking-sous-sol","terrains-de-sport","ascenseur"],
    summary: {
      fr: "Résidence en R+4 à M'Hamid Sud, à Marrakech, dotée d'ascenseurs et d'un parking en sous-sol, à une dizaine de minutes de l'avenue Mohammed VI. Elle propose des appartements et des duplex de 60 à 122 m², de deux à trois chambres avec salon et cuisine équipée, dans un projet éligible au programme d'aide directe au logement.",
      ar: "إقامة من طابق أرضي وأربعة طوابق بحي المحاميد الجنوبية بمراكش، مجهّزة بمصاعد ومرأب تحت أرضي، على بعد نحو عشر دقائق من شارع محمد السادس. تضمّ شققًا وشقق دوبلكس من 60 إلى 122 م²، من غرفتين إلى ثلاث غرف مع صالون ومطبخ مجهّز، ضمن مشروع مؤهَّل لبرنامج الدعم المباشر للسكن.",
    },
    hero: {
      key: "hp_al_anbar",
      nature: "render",
      alt: {
        fr: "Rendu de la résidence Al Anbar, à Marrakech, vue depuis un carrefour : immeubles ocre rose aux fenêtres à ferronnerie et petits balcons, palmiers et passage piéton au premier plan.",
        ar: "تصوّر لإقامة العنبر بمراكش من أحد ملتقيات الطرق: عمارات بلون المغرة الوردية بنوافذ ذات مشبّكات حديدية وشرفات صغيرة، ونخيل وممرّ للراجلين في المقدّمة.",
      },
    },
    gallery: galleries["al-anbar"],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "210",
    slug: "al-anbra",
    name: { fr: "Al Anbra", ar: "العنبرة" },
    cityId: "essaouira",
    neighbourhood: { fr: "Al Ghazoua", ar: "الغزوة" },
    lat: 31.453728,
    lng: -9.733704,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 595000, unit: "total" },
    surfaceMin: 52,
    surfaceMax: 111,
    bedroomsMin: 1,
    bedroomsMax: 3,
    floors: "R+3",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["piscine","espaces-verts","aires-de-jeux","mosquee","ecoles","commerces"],
    summary: {
      fr: "À Al Ghazoua, au cœur du programme Essaouira El Jadida et à quelques minutes de la médina, Al Anbra est une résidence en R+3 dont les ouvertures donnent sur une piscine et des espaces verts. Ses appartements de 52 à 111 m² comptent une à trois chambres, dont une suite parentale avec dressing et salle de bain privative, ainsi qu'une cuisine équipée.",
      ar: "في الغزوة، في قلب مشروع الصويرة الجديدة وعلى بُعد دقائق من المدينة العتيقة، تقوم إقامة العنبرة على طابق أرضي وثلاثة طوابق، وتنفتح نوافذها على مسبح ومساحات خضراء. تضمّ شققها، من 52 إلى 111 م²، من غرفة إلى ثلاث غرف، منها جناح أبوي بغرفة ملابس وحمّام خاص، إلى جانب مطبخ مجهّز.",
    },
    hero: {
      key: "hp_al_anbra",
      nature: "photograph",
      alt: {
        fr: "Entrée d'un immeuble d'Al Anbra, à Essaouira : façades beige et sable rythmées de persiennes et de hublots, allée pavée et plantations récentes.",
        ar: "مدخل إحدى عمارات إقامة العنبرة بالصويرة: واجهات بلون البيج والرمل تتخللها شرائح تهوية ونوافذ دائرية، وممرّ مرصوف ونباتات حديثة الغرس.",
      },
    },
    gallery: galleries["al-anbra"],
    // The badge says "En cours de construction"; the client's photographs show finished flats.
    galleryNote: {
      fr: "Photographies d'appartements achevés, présentées à titre indicatif — non contractuelles.",
      ar: "صور لشقق مكتملة الإنجاز، مقدَّمة على سبيل الاستئناس — غير تعاقدية.",
    },
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "77",
    slug: "al-yassamine",
    name: { fr: "Al Yassamine", ar: "الياسمين" },
    cityId: "essaouira",
    neighbourhood: { fr: "Al Ghazoua", ar: "الغزوة" },
    lat: 31.452654,
    lng: -9.734583,
    segment: "moyen-standing",
    status: "livre",
    readyNow: true,
    kinds: ["appartement"],
    price: { amount: 586000, unit: "total" },
    surfaceMin: 77,
    surfaceMax: 142,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+3",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["espaces-verts","mosquee","ecoles","commerces"],
    summary: {
      fr: "À Al Ghazoua, à 7 km d'Essaouira et près des plages, Al Yassamine est une résidence livrée d'immeubles en R+3 implantés au milieu de larges espaces verts, avec des espaces communs aménagés et sécurisés. Ses appartements de 77 à 142 m², disponibles immédiatement, comptent deux ou trois chambres, deux salles de bain et une cuisine. Projet éligible au programme d'aide directe au logement.",
      ar: "في الغزوة، على بُعد 7 كلم من الصويرة وعلى مقربة من الشواطئ، تضمّ إقامة الياسمين المُسلَّمة عمارات من طابق أرضي وثلاثة طوابق وسط مساحات خضراء واسعة، مع فضاءات مشتركة مهيّأة ومؤمَّنة. شققها، من 77 إلى 142 م²، متاحة فوراً، وتضمّ غرفتين أو ثلاث غرف وحمّامين ومطبخاً. مشروع مؤهَّل لبرنامج الدعم المباشر للسكن.",
    },
    hero: {
      key: "hp_al_yassamine",
      nature: "photograph",
      alt: {
        fr: "Salon d'un appartement meublé de la résidence livrée Al Yassamine, à Essaouira : canapé d'angle à la marocaine, table basse en bois et plafond à moulures.",
        ar: "صالون شقة مؤثثة بإقامة الياسمين المُسلَّمة بالصويرة: أريكة زاوية على الطراز المغربي، طاولة خشبية منخفضة، وسقف بزخارف جبسية.",
      },
    },
    gallery: galleries["al-yassamine"],
    proof: [],
    tours: [],
    typologies: [],
    nearby: [],
  },

  {
    id: "179",
    slug: "jasmin",
    name: { fr: "Jasmin", ar: "جاسمين" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Bd Sidi Mohammed Ben Abdellah, route côtière", ar: "شارع سيدي محمد بن عبد الله، الطريق الساحلية" },
    lat: 33.689406,
    lng: -7.402682,
    segment: "moyen-standing",
    status: "en-construction",
    readySoon: true,
    kinds: ["appartement"],
    price: { amount: 732000, unit: "total" },
    surfaceMin: 70,
    surfaceMax: 154,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+5",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["centre-commercial","spa","espaces-verts","mosquee","parking-sous-sol","terrains-de-sport","aires-de-jeux","ecoles","commerces"],
    summary: {
      fr: "Résidence en R+5 sur le boulevard Sidi Mohammed Ben Abdellah, à cinq minutes du grand parc et des plages de Mohammedia. Elle propose des appartements de 70 à 154 m², avec séjour, deux ou trois chambres, cuisine équipée, salle de bains et WC, ainsi qu'un parking en sous-sol et des espaces verts aménagés dans un cadre sécurisé.",
      ar: "إقامة من طابق أرضي وخمسة طوابق على شارع سيدي محمد بن عبد الله، على بُعد خمس دقائق من المنتزه الكبير وشواطئ المحمدية. تضم شققاً من 70 إلى 154 م² بصالون وغرفتين أو ثلاث غرف ومطبخ مجهّز وحمّام ومرحاض، إلى جانب مرآب تحت أرضي ومساحات خضراء مهيّأة في إطار آمن.",
    },
    hero: {
      key: "hp_jasmin",
      nature: "photograph",
      alt: {
        fr: "Séjour de l'appartement témoin de Jasmin, à Mohammedia : grand canapé d'angle crème, table ronde en verre, lustre à globes et voilages pleine hauteur.",
        ar: "صالون الشقة النموذجية في جاسمين بالمحمدية: أريكة زاوية كبيرة بلون كريمي، طاولة مستديرة من الزجاج، ثريا بكرات زجاجية وستائر بكامل الارتفاع.",
      },
    },
    gallery: galleries["jasmin"],
    proof: [],
    tours: [
      {
        id: "jasmin-temoin",
        label: { fr: "Appartement témoin 76 m²", ar: "شقة نموذجية 76 م²" },
        matterportId: "jqeL68ktXZK",
        ofDelivered: false,
        poster: {
          key: "tp_jasmin",
          nature: "photograph",
          alt: {
            fr: "Séjour de l'appartement témoin de Jasmin, à Mohammedia : coin repas à table ronde et chaises bouclées, miroir rond et porte d'entrée en bois.",
            ar: "صالون الشقة النموذجية في جاسمين بالمحمدية: ركن طعام بطاولة مستديرة وكراسٍ منجّدة، مرآة دائرية وباب مدخل خشبي.",
          },
        },
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "192",
    slug: "patio-verde",
    name: { fr: "Patio Verde", ar: "باتيو فيردي" },
    cityId: "mohammedia",
    neighbourhood: { fr: "Avenue Hassan II, rue d'Agadir", ar: "شارع الحسن الثاني، زنقة أكادير" },
    lat: 33.687831,
    lng: -7.401695,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement","studio"],
    price: { amount: 607000, unit: "total" },
    surfaceMin: 46,
    surfaceMax: 130,
    bedroomsMin: 1,
    bedroomsMax: 2,
    floors: "R+5",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["centre-commercial","spa","espaces-verts","parking-sous-sol","ecoles","commerces","mosquee","terrains-de-sport","ascenseur"],
    summary: {
      fr: "Sur l'avenue Hassan II à Mohammedia, Patio Verde réunit des immeubles en R+5 avec ascenseurs et parking en sous-sol. Studios de 46 à 83 m² avec balcon, et appartements de 88 à 130 m² à deux chambres, dont une suite parentale avec salle de bains et dressing.",
      ar: "على شارع الحسن الثاني بالمحمدية، تضم إقامة باتيو فيردي عمارات من طابق أرضي وخمسة طوابق مجهّزة بمصاعد ومرأب تحت أرضي. استوديوهات من 46 إلى 83 م² بشرفات، وشقق من 88 إلى 130 م² بغرفتين، إحداهما جناح رئيسي بحمّام وغرفة ملابس.",
    },
    hero: {
      key: "hp_patio_verde",
      nature: "photograph",
      alt: {
        fr: "Séjour de l'appartement témoin de Patio Verde, à Mohammedia : canapés en bouclette crème, table basse ronde, plafond à éclairage indirect et baie voilée.",
        ar: "صالون الشقة النموذجية بباتيو فيردي بالمحمدية: أرائك من قماش البوكليه بلون كريمي، وطاولة منخفضة دائرية، وسقف بإضاءة غير مباشرة، ونافذة واسعة بستائر خفيفة.",
      },
    },
    gallery: galleries["patio-verde"],
    proof: [],
    tours: [
      {
        id: "patio-verde-temoin",
        label: { fr: "Appartement témoin — 95 m²", ar: "شقة نموذجية — 95 م²" },
        matterportId: "5XxiaEBrAZT",
        ofDelivered: false,
        poster: {
          key: "tp_patio_verde",
          nature: "photograph",
          alt: {
            fr: "Séjour de l'appartement témoin de Patio Verde, à Mohammedia, vu vers l'entrée : canapé d'angle, claustra en lames de bois et meuble télé suspendu.",
            ar: "صالون الشقة النموذجية بباتيو فيردي بالمحمدية من جهة المدخل: أريكة زاوية، وحاجز من شرائح خشبية، وخزانة تلفاز معلّقة.",
          },
        },
      },
    ],
    typologies: [],
    nearby: [],
  },

  {
    id: "79",
    slug: "les-pins-de-maamora",
    name: { fr: "Les Pins de Maamora", ar: "لي بان دو معمورة" },
    cityId: "sala-al-jadida",
    neighbourhood: { fr: "Avenue Lalla Meryem, zone villas", ar: "شارع للا مريم، منطقة الفيلات" },
    lat: 33.998633,
    lng: -6.735781,
    segment: "moyen-standing",
    status: "en-construction",
    kinds: ["appartement"],
    price: { amount: 850000, unit: "total" },
    surfaceMin: 72,
    surfaceMax: 97,
    bedroomsMin: 2,
    bedroomsMax: 3,
    floors: "R+3",
    deliveryYear: null,
    deliveredYear: null,
    amenities: ["commerces","ecoles","mosquee","parking-sous-sol","aires-de-jeux","piscine","ascenseur"],
    summary: {
      fr: "Immeubles R+3 de moyen standing aux abords de la forêt, avenue Lalla Meryem à Sala Al Jadida, avec un ascenseur desservant le parking en sous-sol et un rez-de-chaussée commercial. Les appartements de 72 à 97 m² comptent deux à trois chambres, dont une suite parentale avec salle de bain, et une cuisine équipée avec buanderie.",
      ar: "عمارات من طابق أرضي وثلاثة طوابق، من فئة السكن المتوسط، على مشارف الغابة بشارع للا مريم في سلا الجديدة، بمصعد يصل إلى المرأب تحت الأرضي وطابق أرضي تجاري. شقق من 72 إلى 97 م²، من غرفتين إلى ثلاث غرف، منها جناح أبوي بحمّام خاص، ومطبخ مجهّز مع غرفة غسيل.",
    },
    hero: {
      key: "hp_les_pins_de_maamora",
      nature: "render",
      alt: {
        fr: "Rendu de la façade des Pins de Maamora, à Sala Al Jadida : immeuble R+3 blanc à balcons en retrait, panneaux ajourés et commerces en rez-de-chaussée.",
        ar: "تصوّر لواجهة إقامة لي بان دو معمورة بسلا الجديدة: عمارة بيضاء من طابق أرضي وثلاثة طوابق بشرفات غائرة، ألواح مُخرَّمة ومحلات تجارية في الطابق الأرضي.",
      },
    },
    gallery: galleries["les-pins-de-maamora"],
    // The badge says "En cours de construction"; the client's photographs show finished flats.
    galleryNote: {
      fr: "Photographies d'appartements achevés, présentées à titre indicatif — non contractuelles.",
      ar: "صور لشقق مكتملة الإنجاز، مقدَّمة على سبيل الاستئناس — غير تعاقدية.",
    },
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
