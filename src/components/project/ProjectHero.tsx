import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { getCity } from "@/data/cities";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import {
  formatMonthly,
  formatPrice,
  formatRange,
  formatSurfaceRange,
  statusColor,
  statusLabel,
} from "@/lib/format";
import type { Project } from "@/data/types";

/**
 * Arrival. The price is above the fold and is not negotiable.
 *
 * The whole page is built to end in a booked visit, and the fastest way to lose
 * someone is to make them hunt for what it costs. So the price, the monthly
 * equivalent, the surface range, the storey count and the delivery year are all
 * visible before any scrolling, alongside the two things that convert: the
 * phone number and the visit form.
 */
export function ProjectHero({ locale, project }: { locale: Locale; project: Project }) {
  const t = getDictionary(locale);
  const city = getCity(project.cityId);

  const facts = [
    { label: t.project.typologySurface, value: formatSurfaceRange(project, locale) },
    { label: t.common.rooms, value: formatRange(project.bedroomsMin, project.bedroomsMax, locale) },
    ...(project.floors ? [{ label: "Type", value: project.floors }] : []),
    // Years are printed raw. Running them through the number formatter groups
    // the digits and turns 2027 into "2 027".
    ...(project.deliveryYear
      ? [{ label: t.project.deliveryLabel, value: String(project.deliveryYear) }]
      : []),
    ...(project.deliveredYear
      ? [{ label: t.common.delivered, value: String(project.deliveredYear) }]
      : []),
  ];

  return (
    <section data-nav-media className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--color-ink)" }}>
        <Figure
          ref_={project.hero}
          locale={locale}
          sizes="100vw"
          priority
          className="h-full w-full object-cover"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, color-mix(in oklab, var(--color-ink) 84%, transparent) 0%, color-mix(in oklab, var(--color-ink) 48%, transparent) 30%, color-mix(in oklab, var(--color-ink) 12%, transparent) 60%, transparent 82%)",
        }}
      />

      <div
        className="on-media relative"
        style={{ padding: "var(--gutter)", paddingBlockEnd: "clamp(2rem, 4vw, 3rem)" }}
      >
        <nav aria-label={t.project.backToProjects}>
          <Link
            href={`/${locale}/projets`}
            className="u-eyebrow inline-flex min-h-11 items-center gap-2"
            style={{ color: "color-mix(in oklab, var(--color-paper) 72%, transparent)" }}
          >
            ← {t.project.backToProjects}
          </Link>
        </nav>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <p className="u-eyebrow" style={{ color: statusColor(project, true) }}>
            {statusLabel(project, locale)}
          </p>
          <p className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 78%, transparent)" }}>
            {city.name[locale]} — {project.neighbourhood[locale]}
          </p>
        </div>

        <h1
          className="u-display u-enter mt-4"
          data-reveal="mask"
          data-step="1"
          style={{ fontSize: "var(--text-mega)", color: "var(--color-paper)" }}
        >
          <span className="reveal-inner">{project.name[locale]}</span>
        </h1>

        <div
          className="u-enter mt-9 grid gap-x-12 gap-y-8 pt-8 lg:grid-cols-[auto_1fr_auto] lg:items-end"
          data-step="2"
          style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 28%, transparent)" }}
        >
          <div>
            <p className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 70%, transparent)" }}>
              {t.project.fromPrice}
            </p>
            <p
              className="u-display-tight u-numeric mt-3"
              style={{ fontSize: "var(--text-title)", color: "var(--color-paper)" }}
            >
              {formatPrice(project.price, locale)}
            </p>
            <p
              className="u-numeric mt-2"
              style={{
                fontSize: "var(--text-small)",
                color: "color-mix(in oklab, var(--color-paper) 76%, transparent)",
              }}
            >
              {t.project.monthlyFrom} {formatMonthly(project.price, locale)}
            </p>
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-5">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt
                  className="u-eyebrow"
                  style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}
                >
                  {fact.label}
                </dt>
                <dd className="u-numeric mt-2" style={{ color: "var(--color-paper)" }}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#visite"
              className="u-eyebrow rounded-full px-7 py-4 u-press"
              style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              {t.project.bookVisit}
            </Link>
            <a
              href={t.nav.phoneHref}
              className="u-eyebrow u-numeric rounded-full px-7 py-4 u-press"
              style={{
                color: "var(--color-paper)",
                border: "1px solid color-mix(in oklab, var(--color-paper) 45%, transparent)",
              }}
            >
              {t.nav.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
