import { SectionHeading } from "@/components/v2";
import { YouTubeFilm } from "@/components/v2/YouTubeFilm";
import { corporateFilm, essaouiraFilm } from "@/data/films";
import type { Locale } from "@/i18n/config";
import s from "./Films.module.css";

const COPY: Record<
  Locale,
  { eyebrow: string; title: string; lead: string; corporate: string; essaouira: string }
> = {
  fr: {
    eyebrow: "En film",
    title: "Notre histoire, racontée par l'image.",
    lead: "Le film institutionnel de Chaabi Lil Iskane, et celui d'Essaouira El Jadida, la ville nouvelle engagée en 2000.",
    corporate: "Film institutionnel",
    essaouira: "Essaouira El Jadida · 2000",
  },
  ar: {
    eyebrow: "بالفيلم",
    title: "قصتنا، تحكيها الصورة.",
    lead: "الفيلم المؤسساتي للشعبي للإسكان، وفيلم الصويرة الجديدة، المدينة الجديدة التي انطلقت سنة 2000.",
    corporate: "الفيلم المؤسساتي",
    essaouira: "الصويرة الجديدة · 2000",
  },
};

/**
 * The client's two institutional films, in the language of the page: the
 * corporate film has a French and an Arabic cut, so each locale plays its own.
 */
export function Films({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="films-title">
      <div className={s.head}>
        <SectionHeading eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      </div>
      <div className={s.grid}>
        <div className={s.main} data-reveal="media">
          <YouTubeFilm
            locale={locale}
            youtubeId={corporateFilm.youtubeId[locale]}
            title={corporateFilm.title[locale]}
            poster={corporateFilm.poster!}
            eyebrow={c.corporate}
            sizes="(min-width: 64rem) 62vw, 100vw"
          />
        </div>
        <div className={s.side} data-reveal="media">
          <YouTubeFilm
            locale={locale}
            youtubeId={essaouiraFilm.youtubeId[locale]}
            title={essaouiraFilm.title[locale]}
            poster={essaouiraFilm.poster!}
            eyebrow={c.essaouira}
            sizes="(min-width: 64rem) 30vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
