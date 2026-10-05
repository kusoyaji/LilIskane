import { CreditSimulator } from "@/components/project/CreditSimulator";
import { Lattice } from "@/components/v2";
import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import s from "./Guide.module.css";

/** A round, mid-range figure to start from; the reader replaces it at once. */
const BASE_PRICE = 1_000_000;

/**
 * Step 3's instrument, full width, on ink — the anchor the home page links
 * to (`#simulateur`).
 *
 * `CreditSimulator` was written for a project page and opens with that page's
 * own heading ("Votre mensualité pour ce projet" / pre-filled with Riad
 * Garden II's price), which would be wrong here. The component is shared and
 * not ours to change, so its intro block is hidden by this stage's stylesheet
 * and replaced with a heading that fits a general guide. The calculator,
 * results and disclaimer are untouched.
 */
export function SimulatorStage({ locale }: { locale: Locale }) {
  const t = guide[locale].sim;
  return (
    <div id="simulateur" className={s.sim} role="region" aria-labelledby="simulateur-titre">
      <Lattice />
      <div className={`u-shell ${s.simHead}`}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)" }}>
          {t.eyebrow}
        </p>
        <h2 id="simulateur-titre" className={`u-display ${s.simTitle}`} data-reveal="mask">
          <span className="reveal-inner">{t.title}</span>
        </h2>
        <p className={`u-enter ${s.simLead}`}>{t.lead}</p>
      </div>
      <div className={s.simEmbed}>
        <CreditSimulator locale={locale} basePrice={BASE_PRICE} typologies={[]} />
      </div>
    </div>
  );
}
