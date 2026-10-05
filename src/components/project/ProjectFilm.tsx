import { SectionHeading } from "@/components/v2";
import { YouTubeFilm } from "@/components/v2/YouTubeFilm";
import type { Film } from "@/data/films";
import type { Project } from "@/data/types";
import type { Locale } from "@/i18n/config";
import s from "./ProjectFilm.module.css";

const COPY: Record<Locale, { eyebrow: string; title: string; source: string }> = {
  fr: {
    eyebrow: "Le film",
    title: "La résidence, en mouvement.",
    source: "Film publié par Chaabi Lil Iskane sur sa chaîne YouTube.",
  },
  ar: {
    eyebrow: "الفيلم",
    title: "الإقامة، بالصورة المتحركة.",
    source: "فيلم نشرته الشعبي للإسكان على قناتها في يوتيوب.",
  },
};

/** The programme's own film, from the client's channel, behind our poster. */
export function ProjectFilm({ locale, project, film }: { locale: Locale; project: Project; film: Film }) {
  const c = COPY[locale];
  return (
    <section className={`u-shell ${s.section}`} aria-label={`${c.eyebrow} — ${film.title[locale]}`}>
      <SectionHeading eyebrow={c.eyebrow} title={c.title} />
      <div className={s.player} data-reveal="media">
        <YouTubeFilm
          locale={locale}
          youtubeId={film.youtubeId[locale]}
          title={film.title[locale]}
          poster={film.poster ?? project.hero}
          caption={`${film.title[locale]} · ${c.source}`}
        />
      </div>
    </section>
  );
}
