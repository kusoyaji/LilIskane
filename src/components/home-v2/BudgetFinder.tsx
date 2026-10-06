import type { ReactNode } from "react";
import { Figure } from "@/components/media/Figure";
import { SectionHeading } from "@/components/v2";
import { Lattice } from "@/components/v2/Lattice";
import { budgetCopy } from "@/content/home-conversion";
import { toListItems } from "@/data/list";
import { projects } from "@/data/projects";
import { formatNumber, type Locale } from "@/i18n/config";
import { CREDIT_DEFAULTS } from "@/lib/credit";
import { BudgetFinderClient, type FinderItem } from "./budget/BudgetFinderClient";
import s from "./budget/BudgetFinder.module.css";

function percent(value: number, locale: Locale): string {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-MA-u-nu-latn" : "fr-FR", { maximumFractionDigits: 2 }).format(
    value * 100,
  );
  return locale === "ar" ? `⁦${n}⁩` : n;
}

/**
 * Budget finder — "start from your monthly payment".
 *
 * Server wrapper: projects the portfolio down to the six fields the finder
 * draws (via `toListItems`, so the inactive language never ships), and renders
 * every thumbnail here so the media manifest stays out of the client bundle.
 * The client child only does arithmetic and picks which thumbnails to show.
 *
 * It is one of the home's three ways into the search: it counts within the
 * current search (home-search/context.tsx), and its button sets its ceiling
 * on the results instead of leaving the page — the count it shows is the
 * count the results show after the click.
 */
export function BudgetFinder({ locale }: { locale: Locale }) {
  const t = budgetCopy[locale];
  const list = toListItems(projects, locale);

  const items: FinderItem[] = list.map((p) => ({
    slug: p.slug,
    name: p.name,
    cityName: p.cityName,
    price: p.price,
    isPlot: p.segment === "terrain",
    isRender: p.hero.nature === "render",
  }));

  // Land programmes' heroes are clip-art signposts (see DESIGN-V2 §8): they get
  // a typographic tile instead of their picture.
  const thumbs: Record<string, ReactNode> = {};
  for (const p of list) {
    thumbs[p.slug] =
      p.segment === "terrain" ? (
        <span key={p.slug} className={s.plotTile} aria-hidden>
          <span className={s.plotWord}>{t.plot}</span>
          {p.price.unit === "per-sqm" && p.price.minimumLotSqm ? (
            <span className={`${s.plotSize} u-numeric`}>
              {formatNumber(p.price.minimumLotSqm, locale)} m²
            </span>
          ) : null}
        </span>
      ) : (
        <Figure key={p.slug} ref_={p.hero} locale={locale} sizes="112px" className={s.thumbImg} />
      );
  }

  const basis = t.basis
    .replace("{rate}", percent(CREDIT_DEFAULTS.annualRate, locale))
    .replace("{ins}", percent(CREDIT_DEFAULTS.insuranceAnnualRate, locale));

  return (
    <section className={s.section} data-nav-media aria-labelledby="budget-finder-title">
      <Lattice cell={32} />
      <div className="u-shell">
        <div className={s.head}>
          <div id="budget-finder-title">
            <SectionHeading eyebrow={t.eyebrow} title={t.title} eyebrowColor="var(--color-ochre-bright)" />
          </div>
          <p className={`u-enter ${s.lead}`}>{t.lead}</p>
        </div>

        <BudgetFinderClient locale={locale} copy={t} items={items} thumbs={thumbs} />

        <div className={`u-enter ${s.fine}`}>
          <p>{t.disclaimer}</p>
          <p>{basis}</p>
        </div>
      </div>
    </section>
  );
}
