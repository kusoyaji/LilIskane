import Link from "next/link";
import { Arrow } from "@/components/v2";
import { getDictionary } from "@/i18n";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { CREDIT_DEFAULTS } from "@/lib/credit";
import { projectCopy } from "@/content/projects";
import { formatMonthly, formatPrice, formatRange } from "@/lib/format";
import type { Typology } from "@/data/types";
import s from "./Typologies.module.css";

/**
 * The plans, each priced on its own.
 *
 * "À partir de" is honest but incomplete — it tells you the cheapest unit
 * exists, not what the one you want costs. So every typology is a card with
 * its own surface, price and estimated monthly payment, set as large as the
 * headline price was, and availability only where it is a known fact.
 */
export function Typologies({
  locale,
  typologies,
  slug,
}: {
  locale: Locale;
  typologies: Typology[];
  /** Programme slug, for the "ask for the plan" link. */
  slug?: string;
}) {
  if (typologies.length === 0) return null;
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const single = typologies.length === 1;

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="typologies-title">
      <header className={s.head}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
          {c.typologiesEyebrow}
        </p>
        <h2 id="typologies-title" className={`u-display ${s.title}`} data-reveal="mask">
          <span className="reveal-inner">{c.typologiesTitle}</span>
        </h2>
        <p className={`u-enter ${s.lead}`}>{c.typologiesLead}</p>
      </header>

      <ul className={s.grid} data-single={single || undefined}>
        {typologies.map((typology, index) => {
          const units = typology.unitsAvailable;
          const scarce = units !== null && units <= 4;
          const rooms =
            typology.kind === "studio"
              ? c.studio
              : `${formatNumber(typology.bedrooms, locale)} ${c.bedroomsWord(typology.bedrooms)}`;
          return (
            <li key={typology.id} className={`u-enter ${s.card}`} data-step={String(Math.min(index + 1, 4))}>
              <div className={s.cardTop}>
                <span className={`u-numeric ${s.index}`}>{isolateRun(String(index + 1).padStart(2, "0"), locale)}</span>
                {units !== null && (
                  <span className={`u-eyebrow ${s.units}`} data-scarce={scarce || undefined}>
                    {scarce
                      ? c.lastUnits(units, formatNumber(units, locale))
                      : c.available(units, formatNumber(units, locale))}
                  </span>
                )}
              </div>

              <div className={s.cardMain}>
                <p className={`u-eyebrow ${s.rooms}`}>{rooms}</p>
                <h3 className={`u-display-tight ${s.label}`}>{typology.label[locale]}</h3>
                <p className={`u-numeric ${s.surface}`}>
                  {formatRange(typology.surfaceMin, typology.surfaceMax, locale)}
                  <span className={s.unit}> {t.common.sqm}</span>
                </p>
              </div>

              <dl className={s.money}>
                <div>
                  <dt className={s.moneyLabel}>{c.fromPrice}</dt>
                  <dd className={`u-numeric ${s.price}`}>{formatPrice(typology.price, locale)}</dd>
                </div>
                <div>
                  <dt className={s.moneyLabel}>{c.monthlyEst}</dt>
                  <dd className={`u-numeric ${s.monthly}`}>{formatMonthly(typology.price, locale)}</dd>
                </div>
              </dl>

              <div className={s.compo}>
                <p className={s.moneyLabel}>{c.composition}</p>
                <p className={s.compoText}>{typology.composition[locale]}</p>
              </div>

              {slug && (
                <Link href={`/${locale}/contact?projet=${slug}`} className={`u-eyebrow ${s.ask}`}>
                  <span>{c.askPlan}</span>
                  <Arrow />
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <p className={s.note}>
        {c.pricesNote(
          formatNumber(CREDIT_DEFAULTS.years, locale),
          isolateRun(`${String(Math.round(CREDIT_DEFAULTS.annualRate * 1000) / 10).replace(".", ",")} %`, locale),
          isolateRun(`${Math.round(CREDIT_DEFAULTS.minDepositRatio * 100)} %`, locale),
        )}
      </p>
    </section>
  );
}
