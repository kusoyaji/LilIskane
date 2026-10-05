import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Arrow, LinkButton } from "@/components/v2";
import { getCity } from "@/data/cities";
import type { Project } from "@/data/types";
import { news } from "@/content/news";
import { formatPrice, formatSurfaceRange } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import s from "./news.module.css";

/**
 * The lead story: the programme being launched, as large as the page allows.
 *
 * The render is labelled as a render. Beneath the facts sits the one piece of
 * evidence a launch can offer — the earlier phase, photographed after
 * delivery — so the lead story carries its own proof.
 */
export function Featured({ locale, project, previous }: { locale: Locale; project: Project; previous?: Project }) {
  const t = news[locale];
  const city = getCity(project.cityId).name[locale];

  const facts: { label: string; value: string }[] = [
    { label: t.surfaces, value: formatSurfaceRange(project, locale) },
    // Not isolated: in Arabic the run is "2 أو 3", and it must read right to left.
    { label: t.bedrooms, value: t.bedroomsValue(project.bedroomsMin, project.bedroomsMax) },
  ];
  if (project.deliveryYear) facts.push({ label: t.delivery, value: String(project.deliveryYear) });
  if (project.tours.length > 0) facts.push({ label: t.tours, value: t.toursValue(project.tours.length) });

  return (
    <section className={s.featured} aria-labelledby="featured-title">
      <div className={`u-shell ${s.featGrid}`}>
        <div className={s.featFigure}>
          <div className={s.featMedia} data-reveal="media">
            <Figure
              ref_={project.hero}
              locale={locale}
              priority
              sizes="(min-width: 64rem) 62vw, 100vw"
              className="h-full w-full object-cover"
            />
            <span className={`u-eyebrow ${s.badge}`}>
              <span aria-hidden className={s.badgeDot} />
              {t.featuredBadge}
            </span>
            {project.hero.nature === "render" && <span className={`${s.note} ${s.featNoteTop}`}>{t.renderNote}</span>}
          </div>
          {previous && previous.readyNow && (
            <div className={`u-enter ${s.previous}`}>
              <div className={s.prevThumb}>
                <Figure ref_={previous.hero} locale={locale} sizes="112px" className="h-full w-full object-cover" />
              </div>
              <div>
                <span className={`u-eyebrow ${s.prevTag}`}>{t.photoNote}</span>
                <p className={s.prevText}>{t.previousPhase(previous.name[locale])}</p>
                <Link href={`/${locale}/projets/${previous.slug}`} className={s.prevLink}>
                  <span>{t.seePrevious(previous.name[locale])}</span>
                  <Arrow />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className={s.featText}>
          <p className={`u-eyebrow u-enter ${s.featEyebrow}`}>
            <span>{t.launch}</span>
            <span aria-hidden>·</span>
            <span>{city}</span>
          </p>
          <h2 id="featured-title" className={`u-display ${s.featTitle}`} data-reveal="mask">
            <span className="reveal-inner">{project.name[locale]}</span>
          </h2>
          <p className={`u-enter ${s.featPlace}`}>{project.neighbourhood[locale]}</p>
          <p className={`u-enter ${s.featSummary}`}>{project.summary[locale]}</p>

          <p className={`u-enter ${s.featPrice}`}>
            <span className="u-eyebrow">{t.fromLabel}</span>
            <span className={s.featPriceValue}>{formatPrice(project.price, locale)}</span>
          </p>

          <dl className={`u-enter ${s.facts}`}>
            {facts.map((f) => (
              <div key={f.label} className={s.fact}>
                <dt className="u-eyebrow">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={`u-enter ${s.featActions}`}>
            <LinkButton href={`/${locale}/projets/${project.slug}`}>{t.discover}</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
