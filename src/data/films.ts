import { galleries } from "./galleries";
import type { GalleryRef, Localized } from "./types";

/**
 * Films from the client's own YouTube channel
 * (youtube.com/channel/UCJc9VddeHiZgkZCvW6HPh6Q), matched to programmes by
 * the titles the client gave them.
 *
 * Posters are ours, never YouTube's thumbnail: five of the client's programme
 * thumbnails print an "à partir de" price over the picture, and a page must
 * not show a second price beside the fiche's. Where `poster` is absent the
 * programme's own hero is used.
 */
export type Film = {
  /** Per language where the client published both cuts; otherwise the same id twice. */
  youtubeId: Localized;
  title: Localized;
  poster?: GalleryRef;
};

/** The client's channel, as linked from the footer. */
export const YOUTUBE_CHANNEL = "https://www.youtube.com/channel/UCJc9VddeHiZgkZCvW6HPh6Q";

const same = (id: string): Localized => ({ fr: id, ar: id });

/** A named picture from a programme's curated gallery. */
const still = (slug: string, key: string): GalleryRef | undefined =>
  galleries[slug]?.find((image) => image.key === key);

/** The institutional film, published in French and Arabic cuts. */
export const corporateFilm: Film = {
  youtubeId: { fr: "vJnihXhG298", ar: "XhpXfzyfYUE" },
  title: {
    fr: "Plus de 75 ans d'engagement immobilier au Maroc",
    ar: "أكثر من 75 سنة من الالتزام في مجال العقار بالمغرب",
  },
  poster: {
    key: "yt_eRqSNZToeig",
    nature: "photograph",
    alt: {
      fr: "Image du film institutionnel : un père pousse sa fille sur une balançoire, dans le jardin d'une résidence.",
      ar: "لقطة من الفيلم المؤسساتي: أب يدفع ابنته على أرجوحة في حديقة إحدى الإقامات.",
    },
  },
};

/** Essaouira El Jadida — the new town begun in 2000. */
export const essaouiraFilm: Film = {
  youtubeId: same("LNZ-H3M0mH0"),
  title: {
    fr: "Essaouira El Jadida, une ville nouvelle signée Chaabi Lil Iskane",
    ar: "الصويرة الجديدة، مدينة جديدة من إنجاز الشعبي للإسكان",
  },
  poster: {
    key: "yt_LNZ-H3M0mH0",
    nature: "photograph",
    alt: {
      fr: "Image du film : la Skala et le port d'Essaouira, vus du ciel.",
      ar: "لقطة من الفيلم: سقالة الصويرة ومرساها من الجو.",
    },
  },
};

/** The channel's 2026 round-up of current programmes. */
export const projects2026Film: Film = {
  youtubeId: same("-HLsqhzvkZU"),
  title: { fr: "Les projets Chaabi Lil Iskane 2026", ar: "مشاريع الشعبي للإسكان 2026" },
  poster: {
    key: "yt_-HLsqhzvkZU",
    nature: "photograph",
    alt: {
      fr: "Image du film : une chambre d'appartement témoin de Riad Garden, à Marrakech, lit bleu et grande baie sur la terrasse.",
      ar: "لقطة من الفيلم: غرفة نوم في شقة نموذجية برياض غاردن بمراكش، سرير أزرق ونافذة واسعة على التراس.",
    },
  },
};

/** One film per programme, the most recent the client published for it. */
export const programmeFilms: Record<string, Film> = {
  massylia: {
    youtubeId: same("WiLwJAOET94"),
    title: { fr: "Résidence Massylia, Agadir", ar: "إقامة ماسيليا، أكادير" },
    poster: still("massylia", "g_massylia_11"),
  },
  jasmin: {
    youtubeId: same("VflrEotKegQ"),
    title: { fr: "Résidence Jasmin, Mohammedia", ar: "إقامة جاسمين، المحمدية" },
    poster: still("jasmin", "g_jasmin_07"),
  },
  "patio-verde": {
    youtubeId: same("Rume346og84"),
    title: { fr: "Résidence Patio Verde, Mohammedia", ar: "إقامة باتيو فيردي، المحمدية" },
    poster: still("patio-verde", "g_patio_verde_07"),
  },
  "jnane-souss": {
    youtubeId: same("b05PjtQ356I"),
    title: { fr: "Résidence Jnane Souss, Agadir", ar: "إقامة جنان سوس، أكادير" },
    poster: still("jnane-souss", "g_jnane_souss_11"),
  },
  assafa: {
    youtubeId: same("2xmK0DtZRLA"),
    title: { fr: "Assafa, Had Soualem", ar: "إقامات الصفاء، حد السوالم" },
    poster: still("assafa", "g_assafa_05"),
  },
  "al-anbar": {
    youtubeId: { fr: "T0UwMahYDsY", ar: "EHbpIq5VrN0" },
    title: { fr: "Résidence Al Anbar, Marrakech", ar: "إقامة العنبر، مراكش" },
    poster: still("al-anbar", "g_al_anbar_02"),
  },
  izdihar: {
    youtubeId: same("IN_Zai55Hsc"),
    title: { fr: "Résidence Izdihar, Essaouira", ar: "إقامة الازدهار، الصويرة" },
    poster: still("izdihar", "g_izdihar_02"),
  },
  "dyar-al-bahia-2": {
    youtubeId: same("kr7c_UtBAl4"),
    title: { fr: "Dyar Al Bahia II, Témara", ar: "ديار البهية 2، تمارة" },
    poster: still("dyar-al-bahia-2", "g_dyar_al_bahia_2_05"),
  },
  "assalam-tg": {
    youtubeId: same("lf76xBbqo9c"),
    title: { fr: "Résidence Assalam, Tanger", ar: "إقامة السلام، طنجة" },
    poster: still("assalam-tg", "g_assalam_tg_14"),
  },
  bougainvillier: {
    youtubeId: same("V2QKwEjWugM"),
    title: { fr: "Résidence Bougainvillier, Mohammedia", ar: "إقامة بوغانفيلي، المحمدية" },
    poster: still("bougainvillier", "g_bougainvillier_05"),
  },
};
