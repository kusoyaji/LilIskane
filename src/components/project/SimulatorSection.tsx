import { CreditSimulator } from "./CreditSimulator";
import type { Project } from "@/data/types";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import { effectiveTotal } from "@/lib/format";
import s from "./SimulatorSection.module.css";

/**
 * The shared credit simulator, introduced for *this* programme.
 *
 * Introduced from the programme's own name and entry price; the simulator's
 * built-in project-page intro is switched off with `intro={false}`.
 */
export function SimulatorSection({ locale, project }: { locale: Locale; project: Project }) {
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const base = effectiveTotal(project.price);
  const price = `${formatNumber(base, locale)} ${t.common.currency}`;
  const land = project.price.unit === "per-sqm";
  // Only plans whose price Chaabi publishes (the entry price) can preset the
  // simulator; a chip per plan would otherwise reveal unpublished prices. One
  // such plan is the default already, so it needs no picker.
  const published = project.typologies.filter((typology) => typology.price.amount === project.price.amount);

  return (
    <div className={s.wrap} data-nav-media>
      <div className={`u-shell ${s.head}`}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)" }}>
          {c.simulatorEyebrow}
        </p>
        <h2 className={`u-display ${s.title}`} data-reveal="mask">
          <span className="reveal-inner">{c.simulatorTitle(project.name[locale])}</span>
        </h2>
        <p className={`u-enter ${s.body}`}>{land ? c.simulatorBodyLand(price) : c.simulatorBody(price)}</p>
      </div>
      <div className={s.instrument}>
        <CreditSimulator locale={locale} basePrice={base} typologies={published.length > 1 ? published : []} intro={false} />
      </div>
    </div>
  );
}
