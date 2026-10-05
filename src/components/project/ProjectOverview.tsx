import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Arrow } from "@/components/v2";
import { getCity } from "@/data/cities";
import type { Project } from "@/data/types";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { KIND_LABELS, projectCopy, SEGMENT_LABELS, STATUS_LABELS } from "@/content/projects";
import { formatPrice } from "@/lib/format";
import { LandPlan } from "./LandPlan";
import { heroMode, year } from "./view";
import s from "./ProjectOverview.module.css";

/**
 * "About this programme": the summary set large, as a statement rather than
 * a paragraph, beside a short spec sheet. Where the programme is one phase of
 * a larger one, the other phase is linked — on Riad Garden II that link is the
 * whole argument (the first phase is delivered, two hundred metres away).
 */
export function ProjectOverview({
  locale,
  project,
  sibling,
}: {
  locale: Locale;
  project: Project;
  /** The other phase of the same programme, when there is one. */
  sibling?: { project: Project; relation: "previous" | "next" };
}) {
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const city = getCity(project.cityId);

  const statusLine = project.readyNow
    ? `${STATUS_LABELS[project.status][locale]} · ${c.readyNow}`
    : project.deliveryYear
      ? `${STATUS_LABELS[project.status][locale]} · ${c.delivery(year(project.deliveryYear))}`
      : STATUS_LABELS[project.status][locale];

  const rows = [
    { label: c.ficheCity, value: city.name[locale] },
    { label: c.ficheNeighbourhood, value: project.neighbourhood[locale] },
    { label: c.ficheSegment, value: SEGMENT_LABELS[project.segment][locale] },
    { label: c.ficheKinds, value: project.kinds.map((k) => KIND_LABELS[k][locale]).join(" · ") },
    { label: c.ficheStatus, value: statusLine },
    {
      label: project.price.unit === "per-sqm" ? c.perSqm : c.fichePrice,
      value: formatPrice(project.price, locale),
    },
  ];

  const siblingMode = sibling ? heroMode(sibling.project.hero.key, sibling.project.segment) : null;

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="overview-title">
      <div className={s.grid}>
        <div className={s.lead}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }} id="overview-title">
            {c.overviewEyebrow}
          </p>
          <p className={`u-display-tight u-enter ${s.statement}`}>{project.summary[locale]}</p>

          {sibling && (
            <Link href={`/${locale}/projets/${sibling.project.slug}`} className={`u-enter ${s.sibling}`}>
              <span className={s.siblingMedia}>
                {siblingMode === "land" ? (
                  <span className={s.siblingPlan}>
                    <LandPlan minLabel="" maxLabel="" />
                  </span>
                ) : (
                  <Figure
                    ref_={sibling.project.hero}
                    locale={locale}
                    sizes="10rem"
                    ratio="4 / 3"
                    className={s.siblingImg}
                  />
                )}
              </span>
              <span className={s.siblingText}>
                <span className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                  {sibling.relation === "previous" ? c.previousPhase : c.nextPhase}
                </span>
                <span className={`u-display-tight ${s.siblingName}`}>{sibling.project.name[locale]}</span>
                <span className={s.siblingMeta}>
                  {sibling.project.readyNow
                    ? c.readyNow
                    : sibling.project.deliveryYear
                      ? c.delivery(year(sibling.project.deliveryYear))
                      : STATUS_LABELS[sibling.project.status][locale]}
                </span>
              </span>
              <span className={s.siblingArrow}>
                <Arrow />
              </span>
            </Link>
          )}
        </div>

        <aside className={`u-enter ${s.fiche}`} aria-label={c.ficheTitle}>
          <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
            {c.ficheTitle}
          </p>
          <dl className={s.rows}>
            {rows.map((row) => (
              <div key={row.label} className={s.row}>
                <dt className={s.rowLabel}>{row.label}</dt>
                <dd className={`u-numeric ${s.rowValue}`}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={s.currency}>{t.project.legalPrices}</p>
        </aside>
      </div>
    </section>
  );
}
