import Link from "next/link";
import { Arrow, SectionHeading } from "@/components/v2";
import { YouTubeFilm } from "@/components/v2/YouTubeFilm";
import { programmeFilms, projects2026Film, YOUTUBE_CHANNEL, type Film } from "@/data/films";
import { getProject } from "@/data/projects";
import type { Locale } from "@/i18n/config";
import s from "./ChannelFilms.module.css";

const COPY: Record<Locale, { eyebrow: string; title: string; lead: string; programme: string; channel: string }> = {
  fr: {
    eyebrow: "Sur notre chaîne",
    title: "Les derniers films.",
    lead: "Les programmes en images, tels que Chaabi Lil Iskane les présente sur sa chaîne YouTube.",
    programme: "Voir le programme",
    channel: "Toute la chaîne YouTube",
  },
  ar: {
    eyebrow: "على قناتنا",
    title: "أحدث الأفلام.",
    lead: "المشاريع بالصورة، كما تقدّمها الشعبي للإسكان على قناتها في يوتيوب.",
    programme: "عرض المشروع",
    channel: "القناة كاملة على يوتيوب",
  },
};

/** Newest first, as published on the channel. */
const RECENT = ["massylia", "al-anbar", "dyar-al-bahia-2"] as const;

/**
 * The channel's most recent films — the 2026 round-up, then the latest
 * programme films — each linked to its programme when that page exists.
 * An even grid on purpose: the posters are 1280px YouTube frames and go soft
 * if one is stretched across the page.
 */
export function ChannelFilms({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const items: { film: Film; slug?: string }[] = [
    { film: projects2026Film },
    ...RECENT.map((slug) => ({ film: programmeFilms[slug], slug })),
  ];

  return (
    <section className={`u-shell ${s.section}`} aria-label={c.eyebrow}>
      <div className={s.head}>
        <SectionHeading eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        <a className={`u-enter ${s.channel}`} href={YOUTUBE_CHANNEL} target="_blank" rel="noreferrer">
          {c.channel}
          <Arrow />
        </a>
      </div>

      <ul className={s.grid}>
        {items.map(({ film, slug }) => {
          const project = slug ? getProject(slug) : undefined;
          const poster = film.poster ?? project?.hero;
          if (!poster) return null;
          return (
            <li key={film.youtubeId.fr} className={s.item} data-reveal="media">
              <YouTubeFilm
                locale={locale}
                youtubeId={film.youtubeId[locale]}
                title={film.title[locale]}
                poster={poster}
                caption={film.title[locale]}
                sizes="(min-width: 48rem) 45vw, 100vw"
              />
              {project && (
                <Link className={s.more} href={`/${locale}/projets/${project.slug}`}>
                  {c.programme}
                  <Arrow />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
