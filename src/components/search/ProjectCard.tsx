import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { LandPlan } from "@/components/project/LandPlan";
import { heroMode, statusTone, year } from "@/components/project/view";
import type { ProjectListItem } from "@/data/list";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { projectCopy, STATUS_LABELS } from "@/content/projects";
import { formatMonthly, formatPrice, formatRange } from "@/lib/format";
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
      ? [`${formatRange(item.bedroomsMin, item.bedroomsMax, locale)} ${c.bedroomsWord(item.bedroomsMax).toLowerCase()}`]
      : []),
    item.readyNow
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
            <span className="u-eyebrow">{STATUS_LABELS[item.status][locale]}</span>
          </span>
          {!land && item.hero.nature === "render" && <span className={s.note}>{c.renderShort}</span>}
        </div>

        <div className={s.body}>
          <p className={`u-eyebrow ${s.place}`}>
            {item.cityName} <span aria-hidden>·</span> {item.neighbourhood}
          </p>
          <h3 className={`u-display-tight ${s.name}`}>{item.name}</h3>

          <div className={s.priceRow}>
            <p className={s.priceLabel}>{land ? c.perSqm : c.fromPrice}</p>
            <p className={`u-numeric ${s.price}`}>{formatPrice(item.price, locale)}</p>
            <p className={`u-numeric ${s.monthly}`}>
              {c.monthlyApprox} {formatMonthly(item.price, locale)}
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
