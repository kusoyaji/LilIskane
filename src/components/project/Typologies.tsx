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
 * The plans: surface, composition, and a price only where Chaabi publishes one.
 *
 * The client publishes a single figure per programme — its entry price. That
 * figure appears on the plan it belongs to, with its estimated monthly
 * payment; every other plan says "price on request" and leads to an adviser.
 * Per-plan prices and stock counts are not shown: they are not published, and
 * putting modelled figures on the page would commit the client to them.
 */
export function Typologies({
  locale,
  typologies,
  slug,
  entryPrice,
}: {
  locale: Locale;
  typologies: Typology[];
  /** Programme slug, for the "ask for the plan" link. */
  slug?: string;
  /**
   * The programme's published entry price (`project.price.amount`). Only the
   * plan carrying exactly this price shows a figure; omit it and none do.
   */
  entryPrice?: number;
}) {
  if (typologies.length === 0) return null;
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const single = typologies.length === 1;
  const bedrooms = typologies.map((typology) => typology.bedrooms);
  const title = c.typologiesTitle({
    minBedrooms: Math.min(...bedrooms),
    maxBedrooms: Math.max(...bedrooms),
    studioOnly: typologies.every((typology) => typology.kind === "studio"),
  });

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="typologies-title">
      <header className={s.head}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
          {c.typologiesEyebrow}
        </p>
        <h2 id="typologies-title" className={`u-display ${s.title}`} data-reveal="mask">
          <span className="reveal-inner">{title}</span>
        </h2>
        <p className={`u-enter ${s.lead}`}>{c.typologiesLead}</p>
      </header>

      <ul className={s.grid} data-single={single || undefined}>
        {typologies.map((typology, index) => {
          const published = entryPrice !== undefined && typology.price.amount === entryPrice;
          const rooms =
            typology.kind === "studio"
              ? c.studio
              : `${formatNumber(typology.bedrooms, locale)} ${c.bedroomsWord(typology.bedrooms)}`;
          return (
            <li key={typology.id} className={`u-enter ${s.card}`} data-step={String(Math.min(index + 1, 4))}>
              <div className={s.cardTop}>
                <span className={`u-numeric ${s.index}`}>{isolateRun(String(index + 1).padStart(2, "0"), locale)}</span>
              </div>

              <div className={s.cardMain}>
                <p className={`u-eyebrow ${s.rooms}`}>{rooms}</p>
                <h3 className={`u-display-tight ${s.label}`}>{typology.label[locale]}</h3>
                <p className={`u-numeric ${s.surface}`}>
                  {formatRange(typology.surfaceMin, typology.surfaceMax, locale)}
                  <span className={s.unit}> {t.common.sqm}</span>
                </p>
              </div>

              {published ? (
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
              ) : (
                <div className={s.money}>
                  <p className={`${s.price} ${s.onRequest}`}>{c.priceOnRequest}</p>
                </div>
              )}

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
