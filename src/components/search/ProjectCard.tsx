import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { LandPlan } from "@/components/project/LandPlan";
import { heroMode, statusTone, year } from "@/components/project/view";
import type { ProjectListItem } from "@/data/list";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { projectCopy, readyNowLine, statusText } from "@/content/projects";
import { effectiveTotal, formatMonthly, formatPrice, formatRange } from "@/lib/format";
import s from "./ProjectCard.module.css";

/**
 * One programme as a card: the picture large, then the price, then the facts.
 *
 * Server-rendered from the locale-scoped list projection, so a grid of these
 * costs no client JavaScript. Land gets its drawn plan instead of a photograph;
 * renders say they are renders.
 */
export function ProjectCard({
  locale,
  item,
  priority = false,
  sizes = "(min-width: 64rem) 30rem, 92vw",
}: {
  locale: Locale;
  item: ProjectListItem;
  priority?: boolean;
  sizes?: string;
}) {
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const land = heroMode(item.hero.key, item.segment) === "land";
  const sqm = t.common.sqm;

  const specs = [
    `${formatRange(item.surfaceMin, item.surfaceMax, locale)} ${sqm}`,
    ...(item.bedroomsMax > 0
      ? [c.bedroomsRange(item.bedroomsMin, item.bedroomsMax, formatRange(item.bedroomsMin, item.bedroomsMax, locale))]
      : []),
    readyNowLine(item)
      ? c.readyNow
      : item.deliveryYear
        ? c.delivery(year(item.deliveryYear))
        : null,
  ].filter(Boolean) as string[];

  return (
    <article className={s.card} data-city={item.cityId}>
      <Link href={`/${locale}/projets/${item.slug}`} className={s.link}>
        <div className={`${s.media} ${land ? s.mediaLand : ""}`}>
          {land ? (
            <div className={s.land}>
              <div className={s.landPlan}>
                <LandPlan
                  minLabel={`${formatNumber(item.surfaceMin, locale)} ${sqm}`}
                  maxLabel={`${formatNumber(item.surfaceMax, locale)} ${sqm}`}
                />
              </div>
            </div>
          ) : (
            <Figure ref_={item.hero} locale={locale} sizes={sizes} priority={priority} className={s.img} />
          )}

          <span className={s.status}>
            <span className={s.dot} style={{ background: statusTone(item.status, true) }} aria-hidden />
            <span className="u-eyebrow">{statusText(item, locale)}</span>
          </span>
          {!land && item.hero.nature === "render" && <span className={s.note}>{c.renderShort}</span>}
        </div>

        <div className={s.body}>
          <p className={`u-eyebrow ${s.place}`}>
            {item.cityName} <span aria-hidden>·</span> {item.neighbourhood}
          </p>
          <div className={s.nameRow}>
            <h3 className={`u-display-tight ${s.name}`}>{item.name}</h3>
            {/* "Voir": the whole card is the link; the arrow says so, and travels on hover / focus. */}
            <svg className={s.go} width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className={s.priceRow}>
            <p className={s.priceLabel}>{land ? c.perSqm : c.fromPrice}</p>
            <p className={`u-numeric ${s.price}`}>{formatPrice(item.price, locale)}</p>
            <p className={`u-numeric ${s.monthly} ${item.price.unit === "per-sqm" ? s.monthlyLand : ""}`}>
              {item.price.unit === "per-sqm"
                ? c.landLot(
                    `${formatNumber(item.price.minimumLotSqm ?? item.surfaceMin, locale)} ${sqm}`,
                    `${formatNumber(effectiveTotal(item.price), locale)} ${t.common.currency}`,
                    formatMonthly(item.price, locale),
                  )
                : `${c.monthlyApprox} ${formatMonthly(item.price, locale)}`}
            </p>
          </div>

          <p className={`u-numeric ${s.specs}`}>
            {specs.map((spec, index) => (
              <span key={spec}>
                {index > 0 && (
                  <span aria-hidden className={s.sep}>
                    ·
                  </span>
                )}
                {spec}
              </span>
            ))}
          </p>
        </div>
      </Link>
    </article>
  );
}
