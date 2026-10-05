import { Lattice, LinkButton, SectionHeading, Stat } from "@/components/v2";
import { milestones } from "@/data/company";
import { isolateRun, type Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import s from "./Guide.module.css";

/**
 * What the bank looks at, and what to compare — the client's "Financement"
 * page, set as figures and lists rather than paragraphs. The three figures
 * (33 %, 40 %, 2 %) are the only numbers in the client's text and are quoted
 * with the client's own hedges ("certaines banques", "en général").
 */
export function FinancingDetail({ locale }: { locale: Locale }) {
  const t = guide[locale].finance;
  const pct = locale === "fr" ? " %" : "٪";
  const aid = milestones.find((m) => m.year === 2024);

  return (
    <div className={`u-shell ${s.finance}`}>
      {/* Several sections, not one: entrances are batched per section, and
          this is a long read — each part should arrive as it is reached. */}
      <section className={s.financeHead} aria-labelledby="financement-titre">
        <div id="financement-titre">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
        </div>
        <p className={`u-enter ${s.financeLead}`}>{t.lead}</p>
      </section>

      <section className={s.ratios} aria-label={t.title}>
        <div className={`u-enter ${s.ratio}`}>
          <Stat value={33} suffix={pct} label={t.ratioLow} locale={locale} />
        </div>
        <div className={`u-enter ${s.ratio}`}>
          <Stat value={40} suffix={pct} label={t.ratioHigh} locale={locale} />
        </div>
      </section>

      <section className={s.criteria} aria-label={t.criteriaTitle}>
        <p className={`u-enter ${s.criteriaTitle}`}>{t.criteriaTitle}</p>
        <ol className={s.criteriaList}>
          {t.criteria.map((item, i) => (
            <li key={item} className="u-enter">
              <span className={s.criteriaNum} dir="ltr" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={s.compare} aria-labelledby="cout-total-titre">
        <div className={s.compareText}>
          <h3 id="cout-total-titre" className={`u-display u-enter ${s.compareTitle}`}>{t.compareTitle}</h3>
          <p className={`u-enter u-body ${s.compareBody}`}>{t.compareBody}</p>
          <div className={`u-enter ${s.check} ${s.checkOnWarm}`}>
            <p className={`u-eyebrow ${s.checkTitle}`}>{t.checkTitle}</p>
            <ul className={s.checkList}>
              {t.checks.map((item) => (
                <li key={item}>
                  <svg className={s.checkMark} width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`u-enter ${s.early}`}>
          <Stat value={2} suffix={pct} label={t.earlyLabel} locale={locale} />
        </div>
      </section>

      {aid && (
        <section className={s.aid} aria-labelledby="aide-titre">
          <Lattice />
          <span className={`u-enter ${s.aidYear}`} dir="ltr">
            {aid.year}
          </span>
          <div className={`u-enter ${s.aidText}`}>
            <p className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
              {t.aidEyebrow}
            </p>
            <h3 id="aide-titre" className={`u-display ${s.aidTitle}`}>{t.aidTitle}</h3>
            <p className={s.aidBody}>{t.aidBody(isolateRun(String(aid.year), locale))}</p>
          </div>
          <div className={`u-enter ${s.aidAction}`}>
            <LinkButton href={`/${locale}/contact`} variant="light">
              {t.aidCta}
            </LinkButton>
          </div>
        </section>
      )}
    </div>
  );
}
