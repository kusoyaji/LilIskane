import { company } from "@/data/company";
import { getProject } from "@/data/projects";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { filmCopy } from "@/content/home-opening";
import { shared } from "@/content/shared";
import { LinkButton } from "@/components/v2";
import { FilmScrub } from "./film/FilmScrub";
import s from "./film/Film.module.css";

/**
 * The opening act: a walk into Riad Garden II, driven by the visitor's scroll.
 *
 * The section is a tall track with a sticky, full-viewport stage inside it.
 * Scroll position through the track is one number, and that number drives
 * everything on the stage: the film's playhead (street → façade → courtyard →
 * terrace → salon), the three text beats that crossfade over it, and the
 * chapter rail along the bottom. The words always describe the frame on screen.
 *
 * All of the type is rendered here, on the server, so the first screen —
 * poster frame, "Chaabi Lil Iskane", "depuis 1948" — is in the HTML and
 * readable before any script runs. The client child only adds the video and
 * the choreography on top.
 *
 * Under reduced motion the track collapses to its content: no pin, the poster
 * as a still, and all three beats laid out in reading order.
 */
/**
 * The opening's own encodes, cut from the 1920×1080 master rather than the
 * 720p files the project page shares: full HD for wide screens, and a
 * portrait centre crop for phones — where only the middle third of a
 * landscape frame is ever on screen, so a phone now gets ~600 source pixels
 * across instead of ~330. Both keep a keyframe every 5 frames so they scrub.
 */
const OPENING = {
  mp4: "/video/film/opening.mp4",
  mp4Portrait: "/video/film/opening-portrait.mp4",
  poster: "/video/film/opening-poster.jpg",
  posterPortrait: "/video/film/opening-poster-portrait.jpg",
} as const;

/** Same breakpoint as the stage's own mobile rules. */
const PHONE = "(max-width: 47.99rem)";
const WIDE = "(min-width: 48rem)";

export function Film({ locale }: { locale: Locale }) {
  const project = getProject("riad-garden-ii");
  if (!project?.cinematic || !project.deliveryYear) return null;

  const t = filmCopy[locale];
  const year = isolateRun(String(project.deliveryYear), locale);
  const founded = isolateRun(String(company.founded), locale);
  const place = project.neighbourhood[locale];

  return (
    <section className={s.film} data-nav-media aria-labelledby="film-title">
      {/* The poster is the first screen's image: preload the one this viewport
          will paint, at high priority, so it lands with the type rather than
          after it. React hoists these into <head>. */}
      <link rel="preload" as="image" href={OPENING.poster} media={WIDE} fetchPriority="high" />
      <link rel="preload" as="image" href={OPENING.posterPortrait} media={PHONE} fetchPriority="high" />
      <FilmScrub
        src={OPENING.mp4}
        srcSmall={OPENING.mp4Portrait}
        poster={OPENING.poster}
        posterSmall={OPENING.posterPortrait}
        phoneQuery={PHONE}
        alt={t.videoAlt}
      >
        <div className={s.overlay} data-overlay>
          <div className={`u-shell ${s.beats}`}>
            {/* Beat 1 — who. The brand and the year, readable in the first
                frame before anything has moved. */}
            <div className={`${s.beat} ${s.beatOne}`} data-beat="0">
              <p className={`u-eyebrow ${s.eyebrow}`}>{t.beat1Eyebrow}</p>
              <h1 id="film-title" className={`u-display ${s.brand}`}>
                <span className={s.brandName}>{company.name[locale]}</span>
                <span className={s.brandSince}>{t.since(founded)}</span>
              </h1>
              <p className={s.lead}>{t.beat1Lead(formatNumber(company.experienceYears, locale))}</p>
            </div>

            {/* Beat 2 — where. Lands as the camera enters the courtyard. */}
            <div className={s.beat} data-beat="1">
              <p className={`u-eyebrow ${s.eyebrow}`}>{t.beat2Eyebrow}</p>
              <h2 className={`u-display ${s.title}`}>{t.beat2Title}</h2>
              <p className={s.lead}>{t.beat2Lead(place)}</p>
            </div>

            {/* Beat 3 — the home, and the way in. */}
            <div className={s.beat} data-beat="2">
              <p className={`u-eyebrow ${s.eyebrow}`}>{t.beat3Eyebrow}</p>
              <h2 className={`u-display ${s.title}`}>{t.beat3Title}</h2>
              <p className={s.lead}>{t.beat3Lead(year)}</p>
              <div className={s.actions}>
                <LinkButton href={`/${locale}/projets/riad-garden-ii`} variant="light">
                  {t.ctaProject}
                </LinkButton>
                <LinkButton href={`/${locale}/projets`} variant="outline">
                  {shared[locale].allProjects}
                </LinkButton>
              </div>
            </div>
          </div>

          <div className={`u-shell ${s.foot}`}>
            <ol className={s.chapters} aria-hidden>
              {t.chapters.map((label, i) => (
                <li key={label} className={s.chapter}>
                  <span className={s.chapterHead}>
                    <span className={`u-numeric ${s.chapterNum}`}>{`0${i + 1}`}</span>
                    <span className={s.chapterLabel}>{label}</span>
                  </span>
                  <span className={s.chapterTrack}>
                    <span className={s.chapterFill} data-chapter={i} />
                  </span>
                </li>
              ))}
            </ol>
            <p className={s.note}>{t.note(year)}</p>
          </div>
        </div>

        <div className={s.cue} data-cue aria-hidden>
          <span className={s.cueLabel}>{t.scrollCue}</span>
          <span className={s.cueLine}>
            <span className={s.cueDot} />
          </span>
        </div>
      </FilmScrub>
    </section>
  );
}
