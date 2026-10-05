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
 * `CreditSimulator` is introduced by this stage's own heading, so its built-in
 * project-page intro is switched off with `intro={false}`.
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
        <CreditSimulator locale={locale} basePrice={BASE_PRICE} typologies={[]} intro={false} />
      </div>
    </div>
  );
}
