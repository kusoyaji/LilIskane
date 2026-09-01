import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { formatMonthly, formatPrice, formatRange } from "@/lib/format";
import type { Typology } from "@/data/types";

/**
 * The plans, priced individually.
 *
 * "À partir de" is honest but incomplete — it tells you the cheapest unit
 * exists, not what the one you want costs. Every typology carries its own price
 * and its own monthly figure, so nobody discovers at the sales office that the
 * three-bedroom is four hundred thousand dirhams above the headline.
 *
 * Rendered as a table because it is one: four rows compared across the same
 * five columns. On narrow screens the same markup restacks into labelled
 * blocks rather than scrolling sideways.
 */
export function Typologies({ locale, typologies }: { locale: Locale; typologies: Typology[] }) {
  const t = getDictionary(locale);
  if (typologies.length === 0) return null;

  return (
    <section
      aria-labelledby="typologies-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4rem, 9vw, 7rem)" }}
    >
      <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
        {t.project.typologiesEyebrow}
      </p>
      <h2
        id="typologies-title"
        className="u-display u-enter mt-5"
        data-reveal="mask"
        data-step="1"
        style={{ fontSize: "var(--text-display)" }}
      >
        <span className="reveal-inner">{t.project.typologiesTitle}</span>
      </h2>

      <ul className="mt-12 flex flex-col" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {typologies.map((typology, index) => (
          <li
            key={typology.id}
            className="u-enter grid gap-x-8 gap-y-4 py-7 md:grid-cols-[1.6fr_repeat(3,_1fr)_auto] md:items-baseline"
            data-step={String(Math.min(index + 1, 4))}
            style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)" }}
          >
            <div>
              <h3 className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
                {typology.label[locale]}
              </h3>
              <p className="mt-2" style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}>
                {typology.composition[locale]}
              </p>
            </div>

            <div>
              <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {t.project.typologySurface}
              </p>
              <p className="u-numeric mt-2">
                {formatRange(typology.surfaceMin, typology.surfaceMax, locale)} {t.common.sqm}
              </p>
            </div>

            <div>
              <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {t.project.typologyPrice}
              </p>
              <p className="u-numeric mt-2">{formatPrice(typology.price, locale)}</p>
            </div>

            <div>
              <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {t.project.typologyMonthly}
              </p>
              <p className="u-numeric mt-2">{formatMonthly(typology.price, locale)}</p>
            </div>

            {/* Scarcity, only where it is a fact. No countdowns, no "3 people
                are viewing this" — the availability is either known or absent. */}
            <p
              className="u-eyebrow u-numeric md:text-end"
              style={{
                color:
                  typology.unitsAvailable !== null && typology.unitsAvailable <= 4
                    ? "var(--color-ochre-deep)"
                    : "var(--color-ink-mute)",
              }}
            >
              {typology.unitsAvailable === null
                ? ""
                : typology.unitsAvailable <= 4
                  ? `${formatNumber(typology.unitsAvailable, locale)} ${t.project.typologyLast}`
                  : `${formatNumber(typology.unitsAvailable, locale)} ${t.project.typologyAvailable}`}
            </p>
          </li>
        ))}
      </ul>

      <p
        className="mt-8"
        style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)", maxInlineSize: "62ch" }}
      >
        {t.project.legalPrices}
      </p>
    </section>
  );
}
