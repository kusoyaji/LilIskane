/**
 * French dictionary — the source of truth for the string shape.
 * `src/i18n/ar.ts` is typed against this, so a missing Arabic key is a build error.
 */
export const fr = {
  meta: {
    homeTitle: "Chaabi Lil Iskane — Promoteur immobilier au Maroc",
    homeDescription:
      "Appartements, bureaux et terrains dans 15 villes du Maroc. Voyez ce que nous construisons, et ce que nous avons déjà livré.",
    projectDescription:
      "Riad Garden II, Marrakech. Appartements 2 et 3 chambres de 84 à 116 m², à partir de 1 830 000 DH. Visite virtuelle disponible.",
  },

  nav: {
    skip: "Aller au contenu",
    home: "Accueil",
    projects: "Nos projets",
    about: "Chaabi Lil Iskane",
    guide: "Guide d'achat",
    news: "Actualités",
    contact: "Contact",
    menu: "Menu",
    close: "Fermer",
    callUs: "Nous appeler",
    phone: "05 20 39 34 00",
    phoneHref: "tel:+212520393400",
    language: "Langue",
    switchTo: "العربية",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },

  common: {
    from: "à partir de",
    currency: "DH",
    perMonth: "DH/mois",
    sqm: "m²",
    rooms: "chambres",
    delivered: "Livré",
    launching: "En lancement",
    promotion: "En promotion",
    soldOut: "Complet",
    seeProject: "Voir le projet",
    seeAll: "Voir tous les projets",
    projects: "projets",
    project: "projet",
    city: "ville",
    cities: "villes",
    loading: "Chargement",
  },

  home: {
    /* The hero states the thesis outright. Every competitor presents a render as
       though it were a photograph; saying the quiet part out loud, then paying it
       off immediately with delivered work, is the whole argument of the site. */
    heroLine1: "Ce bâtiment",
    heroLine2: "n'existe pas encore.",
    heroProofLine1: "Celui-ci,",
    heroProofLine2: "nous l'avons livré.",
    /* Generalised when the hero began cycling four cities: the old copy named
       Riad Garden I outright, which stopped being true the moment the ground
       changed to Mohammedia. The specific pairing is made two sections down,
       where the proof stage can actually show it. */
    heroBody:
      "Chacune de ces images est un rendu. Ce qui suit est ce que nous avons livré au même endroit, photographié tel quel. C'est la seule garantie qui vaut quelque chose quand on achète sur plan.",
    /* The switcher completes a sentence rather than labelling a filter. */
    heroSwitchLead: "Vivre à",
    heroSwitchLabel: "Choisir une ville",
    heroRenderPrefix: "Rendu —",
    heroDelivery: "livraison",
    heroScroll: "Faire défiler",
    heroPhotoLabel: "Photographie — Riad Garden I, livré 2023",

    recordEyebrow: "Notre bilan",
    recordTitle: "Quarante ans de livraisons",
    recordBody:
      "Depuis les années 1980, dans 15 villes, du logement économique au haut standing. Un promoteur se juge sur ce qu'il a remis aux familles, pas sur ce qu'il annonce.",
    recordHomes: "logements livrés",
    recordCities: "villes",
    recordYears: "ans d'activité",

    qualifierEyebrow: "Trouver votre logement",
    qualifierTitle: "Commencez par ce que vous payez chaque mois.",
    qualifierBody:
      "C'est le chiffre qui décide, pas le prix affiché. Réglez votre mensualité et votre apport, nous vous montrons ce qui est réellement à votre portée.",
    qualifierBudget: "Mensualité maximale",
    qualifierDeposit: "Apport disponible",
    qualifierCity: "Ville",
    qualifierAllCities: "Toutes les villes",
    qualifierResults: "Voir les",
    qualifierResultsSuffix: "projets",
    qualifierNone: "Aucun projet à cette mensualité",
    qualifierRelaxed: "Aucun projet à cette mensualité. Voici les plus proches.",
    qualifierEstimate: "Estimation sur 20 ans à 4,5 %. Non contractuel.",

    /* The film that opens the page. It follows the hero's claim — "this
       building does not exist yet" — so it speaks about the thing being built
       rather than about the portfolio. */
    filmEyebrow: "Riad Garden II — Marrakech",
    filmTitle: "Traversez-le avant qu'il sorte de terre.",
    filmCaption:
      "Le mouvement suit votre défilement : vous n'attendez pas la vidéo, vous la conduisez. Chaque plan est le rendu du programme en cours de construction.",

    expandTitle: "Quinze villes. Un seul métier.",
    expandAlt:
      "Travelling à travers un patio résidentiel : bassin central, façades en pierre claire et pergolas de bois sous la lumière de fin de journée.",
    expandCaption:
      "Du studio de 38 m² à Mohammedia à la villa de Marrakech, c'est le même bureau d'études, le même contrôle de chantier, la même garantie.",
    portfolioEyebrow: "Le portefeuille",
    portfolioTitle: "Quinze villes, d'Al Hoceima à Essaouira.",
    portfolioBody:
      "Chaque ville, chaque programme, chaque prix. Survolez une ville pour la voir.",

    rangeEyebrow: "L'amplitude",
    rangeTitle: "485 000 DH à Essaouira. 2 450 000 DH à Marrakech.",
    rangeBody:
      "Le même bureau d'études, le même contrôle de chantier, la même garantie décennale. Un appartement économique n'est pas un projet au rabais — c'est le même métier, à un autre prix.",

    simulatorEyebrow: "Financement",
    simulatorTitle: "Ce que vous paierez, avant de vous déplacer.",
    simulatorBody:
      "Le calcul complet, sans inscription et sans rappel commercial. Vous repartez avec un chiffre.",
    simulatorCta: "Ouvrir le simulateur",
  },

  project: {
    backToProjects: "Tous les projets",
    statusLabel: "Statut",
    deliveryLabel: "Livraison",
    priceLabel: "Prix",
    fromPrice: "À partir de",
    monthlyFrom: "soit environ",
    bookVisit: "Réserver une visite",
    callBack: "Être rappelé",
    callNow: "Appeler maintenant",

    sequenceEyebrow: "Le site",
    sequenceTitle: "De la rue au salon.",
    sequenceCaption1: "L'allée centrale et les commerces de pied d'immeuble.",
    sequenceCaption2: "Les jardins intérieurs, protégés de la rue.",
    sequenceCaption3: "La piscine et les espaces partagés.",

    tourEyebrow: "Visite immersive",
    tourTitle: "Entrez dans l'appartement.",
    tourBody:
      "Déplacez-vous librement dans l'appartement témoin, pièce par pièce. Rien n'est masqué : les volumes, les hauteurs sous plafond et les vues sont ceux que vous aurez.",
    tourStart: "Entrer dans la visite",
    tourLoading: "Ouverture de la visite",
    tour2br: "Témoin 2 chambres",
    tour3br: "Témoin 3 chambres",
    tourDelivered: "Appartement livré — Riad Garden I",
    tourDataWarning:
      "La visite charge environ 15 Mo. En 4G, préférez le Wi-Fi si vous le pouvez.",
    tourExit: "Quitter la visite",

    proofEyebrow: "Le rendu et le réel",
    proofTitle: "Voici ce que nous avons livré la dernière fois.",
    proofBody:
      "À gauche, l'image de synthèse de Riad Garden II. À droite, la photographie du même espace à Riad Garden I, remis aux propriétaires en 2023. Nous vous laissons comparer.",
    proofRender: "Rendu",
    proofReal: "Livré",
    proofToggle: "Comparer rendu et livré",
    proofShowing: "Affichage :",

    typologiesEyebrow: "Les appartements",
    typologiesTitle: "Quatre plans, deux orientations.",
    typologySurface: "Surface",
    typologyRooms: "Chambres",
    typologyPrice: "À partir de",
    typologyMonthly: "Mensualité estimée",
    typologyAvailable: "disponibles",
    typologyLast: "dernières unités",

    locationEyebrow: "L'emplacement",
    locationTitle: "Sur la route d'Amezmiz, à Chrifia.",
    locationBody:
      "À 10 minutes de l'avenue Mohammed VI et du Golf Al Maaden, à l'écart du bruit mais dans la ville.",
    locationDrive: "en voiture",
    locationWalk: "à pied",

    amenitiesEyebrow: "Sur place",
    amenitiesTitle: "Ce qui est compris.",

    simulatorTitle: "Votre mensualité pour ce projet.",
    simulatorBody:
      "Prérempli avec le prix de départ de Riad Garden II. Modifiez l'apport et la durée pour voir votre chiffre.",

    contactEyebrow: "Prendre rendez-vous",
    contactTitle: "Venez voir l'appartement témoin.",
    contactBody:
      "Un conseiller vous accueille sur site, du lundi au samedi. Aucun engagement, aucune relance automatique.",

    legalRenders:
      "Les images de synthèse ont un caractère d'ambiance et ne sont pas contractuelles. Les photographies présentées comme livrées ont été prises à Riad Garden I, programme achevé du même promoteur.",
    legalPrices:
      "Prix indiqués à partir de, hors frais de notaire et d'enregistrement, susceptibles d'évoluer.",
  },

  search: {
    title: "Nos projets",
    intro: "15 villes, du logement économique au haut standing.",
    filters: "Filtres",
    clear: "Tout effacer",
    apply: "Appliquer",
    results: "résultats",
    result: "résultat",
    budget: "Mensualité",
    deposit: "Apport",
    city: "Ville",
    segment: "Standing",
    typology: "Type de bien",
    bedrooms: "Chambres",
    surface: "Surface",
    status: "Disponibilité",
    amenities: "Équipements",
    noResults: "Aucun projet ne correspond exactement.",
    relaxedNotice: "Nous avons élargi",
    relaxedSuffix: "pour vous montrer les projets les plus proches.",
    relaxedBudget: "la mensualité",
    relaxedCity: "la ville",
    relaxedSurface: "la surface",
    relaxedBedrooms: "le nombre de chambres",
    relaxedAmenities: "les équipements",
    resetAll: "Repartir de zéro",
    mapView: "Carte",
    listView: "Liste",
    sortBy: "Trier",
    sortPrice: "Prix croissant",
    sortSurface: "Surface décroissante",
    sortDelivery: "Livraison la plus proche",
    shareSearch: "Copier le lien de cette recherche",
    shareCopied: "Lien copié",
  },

  simulator: {
    title: "Simulateur de crédit",
    price: "Prix du bien",
    deposit: "Apport",
    duration: "Durée",
    rate: "Taux",
    years: "ans",
    monthly: "Mensualité",
    total: "Coût total du crédit",
    borrowed: "Montant emprunté",
    interest: "Intérêts",
    insurance: "Assurance estimée",
    depositTooLow: "L'apport habituel est d'au moins 10 % du prix.",
    disclaimer:
      "Simulation indicative, hors assurance obligatoire et frais de dossier. Le taux réel dépend de votre banque et de votre dossier.",
  },

  form: {
    name: "Nom complet",
    phone: "Téléphone",
    email: "E-mail",
    city: "Vous habitez",
    abroad: "Je réside à l'étranger",
    message: "Votre message",
    messagePlaceholder: "Une question sur les plans, le financement, la livraison…",
    preferredDate: "Date de visite souhaitée",
    submitVisit: "Réserver la visite",
    submitCallback: "Demander un rappel",
    required: "obligatoire",
    optional: "facultatif",
    errorName: "Indiquez votre nom pour que le conseiller sache qui accueillir.",
    errorPhone: "Un numéro joignable est nécessaire pour confirmer le rendez-vous.",
    errorPhoneFormat: "Ce numéro ne semble pas valide. Vérifiez les chiffres.",
    errorEmail: "Cette adresse e-mail semble incomplète.",
    successTitle: "C'est noté.",
    successBody:
      "Un conseiller vous rappelle sous 24 heures ouvrées. Vous pouvez aussi nous joindre directement.",
    privacy:
      "Vos coordonnées servent à traiter cette demande et peuvent être utilisées pour vous informer de nos programmes. Vous pouvez vous y opposer à tout moment.",
  },

  footer: {
    address: "239 Boulevard Mohammed V, Casablanca",
    hours: "Lundi — Samedi, 9h à 18h",
    company: "Chaabi Lil Iskane",
    group: "Groupe Ynna",
    sitemap: "Plan du site",
    legal: "Mentions légales",
    privacy: "Données personnelles",
    rights: "Tous droits réservés",
  },
} as const;

/**
 * Widens every literal string produced by `as const` back to `string`, while
 * keeping the key structure intact.
 *
 * Without this, `Dictionary` would require the Arabic file to contain the
 * French sentences verbatim. With it, a missing or misspelled key is still a
 * build error — which is the actual guarantee we want: the Arabic build cannot
 * silently fall back to French or render `undefined`.
 */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof fr>;
