import { LinkButton, SectionHeading } from "@/components/v2";
import { about } from "@/content/about";
import { guarantees } from "@/data/company";
import { formatNumber, type Locale } from "@/i18n/config";
import { CoverageReveal } from "./CoverageReveal";
import s from "./about.module.css";

/** The longest guarantee sets the scale, so the decennial bar fills the track. */
const SPAN = Math.max(...guarantees.map((g) => g.years));
/** Axis labels: the start, each guarantee's own end, and nothing in between. */
const TICKS = Array.from(new Set([0, ...guarantees.map((g) => g.years)]));

/**
 * Garanties — 1, 2 and 10 years, drawn to scale.
 *
 * Three numbers in three boxes say "there are guarantees". The same three as
 * bars on one ten-year axis say what they actually mean to a buyer: the first
 * two are short, and the one that covers the structure runs five times longer
 * than the next. The chart is the argument, so it is the section.
 */
export function Guarantees({ locale }: { locale: Locale }) {
  const t = about[locale].guarantees;

  return (
    <section className={s.guarantees}>
      <div className="u-shell">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <CoverageReveal className={s.chart}>
          <p className={`u-eyebrow ${s.chartLabel}`}>{t.scale}</p>
          <ol className={s.rows}>
            {guarantees.map((g) => (
              <li key={g.years} className={s.row} style={{ "--p": g.years / SPAN } as React.CSSProperties}>
                <p className={s.rowNum}>
                  <span className={`u-display u-numeric ${s.rowFigure}`}>{formatNumber(g.years, locale)}</span>
                  <span className={s.rowUnit}>{g.years > 1 ? t.years : t.year}</span>
                </p>
                <div className={s.rowText}>
                  <h3 className={s.rowTitle}>{g.title[locale]}</h3>
                  <p className={s.rowBody}>{g.body[locale]}</p>
                </div>
                <div className={s.track} aria-hidden>
                  <span className={s.fill} />
                </div>
              </li>
            ))}
          </ol>
          <div className={s.axis} aria-hidden>
            {TICKS.map((tick) => (
              <span key={tick} className={s.tick} style={{ insetInlineStart: `${(tick / SPAN) * 100}%` }}>
                <span className={`u-numeric ${s.tickLabel}`}>{formatNumber(tick, locale)}</span>
              </span>
            ))}
          </div>
        </CoverageReveal>

        <div className={s.sav}>
          <p className={`u-enter ${s.savText}`}>{t.sav}</p>
          <div className="u-enter">
            <LinkButton href={`/${locale}/guide-achat`} variant="primary">
              {t.guide}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
