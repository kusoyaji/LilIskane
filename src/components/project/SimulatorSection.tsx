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
 * `CreditSimulator` is used unchanged, but its built-in introduction names
 * Riad Garden II whatever page it is on. Here that introduction is replaced by
 * one written from the programme's own name and entry price; the instrument
 * below it is untouched.
 */
export function SimulatorSection({ locale, project }: { locale: Locale; project: Project }) {
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const base = effectiveTotal(project.price);
  const price = `${formatNumber(base, locale)} ${t.common.currency}`;
  const land = project.price.unit === "per-sqm";

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
        <CreditSimulator locale={locale} basePrice={base} typologies={project.typologies} />
      </div>
    </div>
  );
}
