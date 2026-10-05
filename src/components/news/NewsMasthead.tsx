import Link from "next/link";
import { Stat } from "@/components/v2";
import { news } from "@/content/news";
import { shared } from "@/content/shared";
import type { Locale } from "@/i18n/config";
import s from "./news.module.css";

/**
 * The page opening: a masthead rather than a hero image, because the first
 * image on this page is the featured launch directly beneath it — two hero
 * images stacked would make neither one the lead.
 *
 * Both figures are counted from `projects.ts` by the page, never typed in.
 */
export function NewsMasthead({ locale, launches, cities }: { locale: Locale; launches: number; cities: number }) {
  const t = news[locale];
  return (
    <section className={s.masthead}>
      <div className="u-shell">
        <nav aria-label={locale === "ar" ? "مسار التصفح" : "Fil d'Ariane"} className={`u-eyebrow u-enter ${s.crumbs}`}>
          <Link href={`/${locale}`}>{shared[locale].home}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{t.crumb}</span>
        </nav>

        <div className={s.mastGrid}>
          <h1 className={`u-display ${s.mastTitle}`} data-reveal="mask">
            <span className="reveal-inner">{t.title}</span>
          </h1>
          <div>
            <p className={`u-enter ${s.mastLead}`}>{t.lead}</p>
            <div className={`u-enter ${s.mastStats}`}>
              <Stat value={launches} label={t.statLaunches(launches)} locale={locale} duration={1100} />
              <Stat value={cities} label={t.statCities(cities)} locale={locale} duration={1100} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
