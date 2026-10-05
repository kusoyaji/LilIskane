import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import s from "./Guide.module.css";

/**
 * The whole path at a glance, set directly under the ink hero on the same
 * ground: three phases, eight numbered steps, each a link to its block. It
 * completes the opening screen (which otherwise ended on an empty strip) and
 * is the table of contents for a page that is meant to be come back to.
 */
export function StepOverview({ locale }: { locale: Locale }) {
  const t = guide[locale];
  const pad = (n: number) => String(n).padStart(2, "0");
  const numbered = t.steps.map((step, i) => ({ ...step, n: i + 1 }));

  return (
    <nav className={s.overview} aria-label={t.index.label} data-nav-media="">
      <ol className={`u-shell ${s.overviewPhases}`}>
        {t.phases.map((phase, p) => {
          const items = numbered.filter((step) => step.phase === p);
          return (
            <li key={phase} className={s.overviewPhase} style={{ ["--count" as string]: items.length }}>
              <p className={`u-eyebrow u-enter ${s.overviewPhaseLabel}`}>{phase}</p>
              <ol className={s.overviewList}>
                {items.map((step) => (
                  <li key={step.n} className="u-enter">
                    <a href={`#etape-${step.n}`} className={s.overviewLink}>
                      <span className={s.overviewNum} dir="ltr">
                        {pad(step.n)}
                      </span>
                      <span className={s.overviewTitle}>{step.short}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
