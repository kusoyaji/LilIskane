"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { cities } from "@/data/cities";
import { projects } from "@/data/projects";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { effectiveTotal, formatPrice, statusColor, statusLabel } from "@/lib/format";

/**
 * The portfolio as a geographic index, not a card grid.
 *
 * Fourteen programmes across nine cities is exactly the size at which a grid of
 * thumbnails stops being navigable: every card looks alike, nothing is ranked,
 * and the only way to find anything is to read all of it. So the primary
 * structure is the country — cities set as display type, ordered by how much is
 * actually available in each — and imagery appears on demand rather than all at
 * once.
 *
 * The preview is driven by hover *and* focus, so a keyboard user gets exactly
 * the same behaviour by tabbing. On small screens the preview is dropped
 * entirely and each row becomes a link carrying its own summary — a hover
 * preview on a touchscreen is a preview nobody sees.
 */
export function PortfolioIndex({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const grouped = useMemo(() => {
    return cities
      .map((city) => {
        const items = projects
          .filter((p) => p.cityId === city.id)
          .sort((a, b) => effectiveTotal(a.price) - effectiveTotal(b.price));
        return { city, items };
      })
      .filter((group) => group.items.length > 0)
      .sort((a, b) => b.items.length - a.items.length);
  }, []);

  const [activeCity, setActiveCity] = useState(grouped[0]?.city.id ?? "");
  const active = grouped.find((group) => group.city.id === activeCity) ?? grouped[0];

  return (
    <section
      aria-labelledby="portfolio-title"
      // Ink comes from the page field now, so the index no longer cuts against
      // the section above it. The text colour stays here: it belongs to the
      // content, not to the ground.
      style={{
        color: "var(--color-paper)",
        paddingBlock: "clamp(4.5rem, 10vw, 8rem)",
      }}
    >
      <div className="u-shell">
        <div className="max-w-[46ch]">
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)" }}>
            {t.home.portfolioEyebrow}
          </p>
          <h2
            id="portfolio-title"
            className="u-display u-enter mt-5"
            data-reveal="mask"
            data-step="1"
            style={{ fontSize: "var(--text-display)" }}
          >
            <span className="reveal-inner">{t.home.portfolioTitle}</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {grouped.map((group) => {
              const isActive = group.city.id === active?.city.id;
              const cheapest = group.items[0];

              return (
                <li
                  key={group.city.id}
                  onMouseEnter={() => setActiveCity(group.city.id)}
                  style={{
                    borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 18%, transparent)",
                  }}
                >
                  <Link
                    href={`/${locale}/projets?ville=${group.city.id}`}
                    onFocus={() => setActiveCity(group.city.id)}
                    className="group flex items-baseline justify-between gap-6 py-5"
                  >
                    <span className="flex items-baseline gap-4">
                      {/* Marks which row the preview belongs to. An earlier
                          version dimmed every inactive row instead, which made
                          the whole list read as disabled whenever the active
                          city had scrolled out of view. */}
                      <span
                        aria-hidden
                        className="block h-px transition-all duration-300"
                        style={{
                          inlineSize: isActive ? "2rem" : "0.75rem",
                          background: isActive ? "var(--color-ochre-bright)" : "color-mix(in oklab, var(--color-paper) 35%, transparent)",
                        }}
                      />
                      <span className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
                        {group.city.name[locale]}
                      </span>
                      <span
                        className="u-eyebrow u-numeric"
                        style={{ color: "color-mix(in oklab, var(--color-paper) 60%, transparent)" }}
                      >
                        {formatNumber(group.items.length, locale)}
                      </span>
                    </span>

                    <span
                      className="u-eyebrow u-numeric hidden shrink-0 sm:block"
                      style={{ color: "color-mix(in oklab, var(--color-paper) 70%, transparent)" }}
                    >
                      {t.common.from} {formatPrice(cheapest.price, locale)}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li
              style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 18%, transparent)" }}
            >
              <Link
                href={`/${locale}/projets`}
                className="u-eyebrow inline-block py-6"
                style={{ color: "var(--color-ochre-bright)" }}
              >
                {t.common.seeAll} →
              </Link>
            </li>
          </ul>

          {/* Preview. Hidden below lg because hover has no meaning on touch, and
              a preview that requires hover is dead weight on a phone. */}
          <div className="hidden lg:block">
            <div className="sticky" style={{ top: "calc(var(--nav-h) + 2rem)" }}>
              {active && (
                <>
                  <div className="u-enter overflow-hidden" data-reveal="media" style={{ background: "var(--color-ink-soft)" }}>
                    <Figure
                      key={active.items[0].hero.key}
                      ref_={active.items[0].hero}
                      locale={locale}
                      sizes="(min-width: 64rem) 40vw, 100vw"
                      ratio="4 / 3"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <ul className="mt-6 flex flex-col" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {active.items.map((project) => (
                      <li
                        key={project.id}
                        className="flex items-baseline justify-between gap-5 py-3"
                        style={{
                          borderBlockEnd:
                            "1px solid color-mix(in oklab, var(--color-paper) 14%, transparent)",
                        }}
                      >
                        <Link
                          href={`/${locale}/projets/${project.slug}`}
                          className="u-press"
                        >
                          {project.name[locale]}
                        </Link>
                        <span className="flex shrink-0 items-baseline gap-4">
                          <span className="u-eyebrow" style={{ color: statusColor(project, true) }}>
                            {statusLabel(project, locale)}
                          </span>
                          <span
                            className="u-numeric"
                            style={{
                              fontSize: "var(--text-small)",
                              color: "color-mix(in oklab, var(--color-paper) 72%, transparent)",
                            }}
                          >
                            {formatPrice(project.price, locale)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
