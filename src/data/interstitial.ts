import type { MediaRef } from "./types";

/**
 * The scattered field between the reading half of the page and the portfolio.
 *
 * All four are now 2560px placeholders from Unsplash — free for commercial use,
 * no attribution required — replacing the 282–730px client files that were
 * here. Those were too small to survive a retina screen (the worst was upscaled
 * 2.2×) and, more damagingly, they did not belong to each other: a 2005-era
 * aerial next to a contemporary lobby reads as a stock grab rather than a body
 * of work. Provenance is recorded in `MEDIA-PLACEHOLDERS.md`; every one of these
 * is meant to be swapped for Chaabi's own photography before launch.
 *
 * `depth` is how far from the viewer each one sits, 0–1. The values are spread
 * rather than clustered, because the effect is entirely in the *difference*
 * between rates — four images moving at 0.4, 0.45, 0.5 and 0.55 read as one
 * flat sheet sliding, which is the failure mode this is meant to avoid.
 */
export type DepthPlate = {
  media: MediaRef;
  /** 0 = pinned to the page, 1 = nearest the viewer and moving most. */
  depth: number;
  /**
   * Placement within the band, as percentages.
   *
   * Plates are kept out of the centre channel (roughly 36–64%) because the
   * heading sits there. An earlier arrangement let them drift across it and the
   * result was a photograph parked on top of the word it was meant to
   * illustrate — the composition read as broken rather than layered.
   */
  x: number;
  y: number;
  /** Rendered width as a viewport percentage. */
  w: number;
  /** A degree or two of tilt, so the field reads as placed rather than gridded. */
  tilt: number;
  /** Short label revealed on hover. */
  label: { fr: string; ar: string };
};

export const DEPTH_PLATES: DepthPlate[] = [
  {
    media: {
      key: "st_salon_warm",
      nature: "photograph",
      alt: {
        fr: "Séjour aux tons chauds : fauteuils en cuir fauve, cheminée en pierre claire et lumière rasante de fin de journée.",
        ar: "صالون بألوان دافئة: كراسي جلدية بلون بنّي فاتح، ومدفأة بحجر فاتح، وضوء مائل في آخر النهار.",
      },
    },
    depth: 0.78,
    x: 3,
    y: 6,
    w: 30,
    tilt: -1.5,
    label: { fr: "Les intérieurs", ar: "الفضاءات الداخلية" },
  },
  {
    media: {
      key: "st_villa_pool_dusk",
      nature: "photograph",
      alt: {
        fr: "Villa contemporaine au crépuscule, bassin en premier plan et relief montagneux à l'arrière-plan.",
        ar: "فيلا معاصرة عند الغسق، حوض ماء في المقدمة وتضاريس جبلية في الخلفية.",
      },
    },
    depth: 0.22,
    x: 66,
    y: 2,
    w: 31,
    tilt: 1,
    label: { fr: "Les extérieurs", ar: "الفضاءات الخارجية" },
  },
  {
    media: {
      key: "st_courtyard_screens",
      nature: "photograph",
      alt: {
        fr: "Patio traditionnel : claustras de bois ajourés filtrant la lumière sur des murs à la chaux rose.",
        ar: "فناء تقليدي: مشربيات خشبية مخرّمة ترشّح الضوء على جدران مطليّة بالجير الوردي.",
      },
    },
    depth: 0.52,
    x: 7,
    y: 58,
    w: 25,
    tilt: 1.8,
    label: { fr: "Le patio", ar: "الفناء" },
  },
  {
    media: {
      key: "st_facade_beige",
      nature: "photograph",
      alt: {
        fr: "Façade d'immeuble en béton beige sous un ciel dégagé, balcons filants et brise-soleil.",
        ar: "واجهة عمارة من الخرسانة البيج تحت سماء صافية، بشرفات ممتدة وكاسرات للشمس.",
      },
    },
    depth: 0.95,
    x: 70,
    y: 64,
    w: 23,
    tilt: -2,
    label: { fr: "Front de rue", ar: "واجهة الشارع" },
  },
];
