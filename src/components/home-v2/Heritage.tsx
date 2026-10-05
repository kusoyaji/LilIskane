import { company, milestones } from "@/data/company";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { heritageCopy } from "@/content/home-opening";
import { Lattice, LinkButton, Stat } from "@/components/v2";
import { YouTubeFilm } from "@/components/v2/YouTubeFilm";
import { corporateFilm } from "@/data/films";
import { Drift } from "./heritage/Drift";
import s from "./heritage/Heritage.module.css";

const FILM: Record<Locale, { eyebrow: string; title: string }> = {
  fr: { eyebrow: "Le film institutionnel", title: "Plus de soixante-quinze ans, en quelques minutes." },
  ar: { eyebrow: "الفيلم المؤسساتي", title: "أكثر من خمسة وسبعين عاماً، في دقائق." },
};

/** The four dates shown on the home strip; the full ten live on /a-propos. */
const KEY_YEARS = [2000, 2003, 2013, 2025];

/**
 * The client's milestone texts carry grouped figures written with an ordinary
 * space ("11 000"). In an Arabic paragraph that space is bidi-neutral and the
 * two groups swap ("000 11"), so each grouped figure is isolated as one run.
 */
function isolateFigures(text: string, locale: Locale): string {
  return text.replace(/\d{1,3}(?:[  ]\d{3})+/g, (run) =>
    // No-break too, so a line never splits a figure in two.
    isolateRun(run.replace(/ /g, " "), locale),
  );
}

/**
 * Who built it, and for how long.
 *
 * The film ends inside a salon; this is the step back. On the same ink, with
 * the moucharabieh lattice as the only ornament, it states the company's
 * authority in its own figures — every one from `src/data/company.ts`, none
 * rounded or embellished. The founding year is set as architecture rather than
 * as a statistic: a single figure the width of the page, drifting slowly as it
 * is passed.
 */
export function Heritage({ locale }: { locale: Locale }) {
  const t = heritageCopy[locale];
  const founding = milestones.find((m) => m.year === company.founded);
  const keyMilestones = KEY_YEARS.map((year) => milestones.find((m) => m.year === year)).filter(
    (m): m is (typeof milestones)[number] => Boolean(m),
  );

  return (
    <section className={s.heritage} aria-labelledby="heritage-title">
      <div aria-hidden className={s.navZone} data-nav-media />
      <Lattice />

      <div className={`u-shell ${s.inner}`}>
        {/* ---- statement ---------------------------------------------------- */}
        <header className={s.head}>
          <div className={s.headMain}>
            <p className={`u-eyebrow u-enter ${s.eyebrow}`}>
              {company.name[locale]} · {company.group[locale]}
            </p>
            <h2 id="heritage-title" className={`u-display ${s.title}`} data-reveal="mask">
              <span className="reveal-inner">{t.title(formatNumber(company.experienceYears, locale))}</span>
            </h2>
          </div>

          <div className={s.headAside}>
            <p className={`u-enter ${s.lead}`}>{t.lead}</p>
            <div className={`u-enter ${s.range}`}>
              <p className={`u-eyebrow ${s.rangeLabel}`}>{t.rangeLabel}</p>
              <ul className={s.rangeList}>
                {t.range.map((item) => (
                  <li key={item} className={s.rangeItem}>
                    <span aria-hidden className={s.rangeMark} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="u-enter">
              <LinkButton href={`/${locale}/a-propos`} variant="light">
                {t.link}
              </LinkButton>
            </div>
          </div>
        </header>

        {/* ---- the founding year, as architecture --------------------------- */}
        <div className={s.founded}>
          <Drift className={s.yearWrap} from={4} to={-4}>
            <p className={`u-display ${s.year}`} data-reveal="mask" aria-describedby="heritage-founded">
              <span className="reveal-inner">{isolateRun(String(company.founded), locale)}</span>
            </p>
          </Drift>
          <div className={`u-enter ${s.foundedText}`}>
            <p className={`u-eyebrow ${s.eyebrow}`}>{t.foundedLabel}</p>
            {founding && (
              <p id="heritage-founded" className={s.foundedBody}>
                {isolateFigures(founding.body[locale], locale)}
              </p>
            )}
          </div>
        </div>

        {/* ---- the figures -------------------------------------------------- */}
        <ul className={s.stats}>
          <li className={`u-enter ${s.statCell}`}>
            <Stat value={company.experienceYears} prefix="+" label={t.statYears} locale={locale} />
          </li>
          <li className={`u-enter ${s.statCell}`}>
            <Stat value={company.citiesCount} label={t.statCities} locale={locale} />
          </li>
          <li className={`u-enter ${s.statCell}`}>
            <Stat
              value={company.essaouira.units}
              label={t.statUnits(formatNumber(company.essaouira.hectares, locale))}
              locale={locale}
            />
          </li>
          <li className={`u-enter ${s.statCell}`}>
            <Stat value={company.isoSince} plain label={t.statIso} locale={locale} />
          </li>
        </ul>

        {/* ---- key dates ---------------------------------------------------- */}
        <div className={s.timeline}>
          <p className={`u-eyebrow u-enter ${s.eyebrow}`}>{t.milestonesLabel}</p>
          <ol className={s.milestones}>
            {keyMilestones.map((m) => (
              <li key={m.year} className={`u-enter ${s.milestone}`}>
                <span aria-hidden className={s.tick} />
                <span className={`u-numeric ${s.mYear}`}>{isolateRun(String(m.year), locale)}</span>
                <h3 className={s.mTitle}>{m.title[locale]}</h3>
                <p className={s.mBody}>{isolateFigures(m.body[locale], locale)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ---- the corporate film, in the page's language -------------------- */}
        <div className={s.film}>
          <div className={`u-enter ${s.filmText}`}>
            <p className={`u-eyebrow ${s.eyebrow}`}>{FILM[locale].eyebrow}</p>
            <p className={s.filmTitle}>{FILM[locale].title}</p>
          </div>
          <div className={s.filmPlayer} data-reveal="media">
            <YouTubeFilm
              locale={locale}
              youtubeId={corporateFilm.youtubeId[locale]}
              title={corporateFilm.title[locale]}
              poster={corporateFilm.poster!}
              sizes="(min-width: 64rem) 60vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
