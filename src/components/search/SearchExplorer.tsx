"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useMemo } from "react";
import { Figure } from "@/components/media/Figure";
import { MoroccoMap } from "./MoroccoMap";
import { AMENITY_LABELS } from "@/components/project/LocationAndAmenities";
import { getCity } from "@/data/cities";
import { AMENITIES, SEGMENTS, type Amenity, type Segment } from "@/data/types";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import { maxAffordablePrice } from "@/lib/credit";
import {
  DEFAULT_DEPOSIT,
  fromSearchParams,
  search,
  toSearchParams,
  type FacetKey,
  type Filters,
} from "@/lib/filter";
import { formatMonthly, formatPrice, formatSurfaceRange, statusColor, statusLabel } from "@/lib/format";

const SEGMENT_LABELS: Record<Segment, { fr: string; ar: string }> = {
  economique: { fr: "Économique", ar: "اقتصادي" },
  "moyen-standing": { fr: "Moyen standing", ar: "متوسط" },
  "haut-standing": { fr: "Haut standing", ar: "راقٍ" },
  terrain: { fr: "Lots de terrain", ar: "بقع أرضية" },
  commercial: { fr: "Locaux commerciaux", ar: "محلات تجارية" },
  bureaux: { fr: "Plateaux de bureaux", ar: "طوابق مكاتب" },
};

const BUDGET_MIN = 2000;
const BUDGET_MAX = 20000;

/**
 * The search as a destination.
 *
 * All state lives in the query string, pushed with `scroll: false` so adjusting
 * a filter never yanks the page back to the top. That makes every search a
 * shareable link, makes the back button work the way people expect, and means
 * the server can render the first paint of a shared URL with the right results
 * already in place.
 */
export function SearchExplorer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const budgetId = useId();

  const filters = useMemo(() => fromSearchParams(new URLSearchParams(params.toString())), [params]);
  const result = useMemo(() => search(filters), [filters]);

  const update = useCallback(
    (next: Partial<Filters>) => {
      const merged = { ...filters, ...next };
      const query = toSearchParams(merged).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const ceiling = filters.budget ? maxAffordablePrice(filters.budget, filters.deposit) : null;
  const hasFilters =
    filters.budget !== null ||
    filters.city !== null ||
    filters.segments.length > 0 ||
    filters.amenities.length > 0 ||
    filters.bedrooms !== null;

  const relaxedLabel = (facet: FacetKey): string =>
    ({
      budget: t.search.relaxedBudget,
      city: t.search.relaxedCity,
      surfaceMin: t.search.relaxedSurface,
      bedrooms: t.search.relaxedBedrooms,
      amenities: t.search.relaxedAmenities,
      segments: t.search.segment,
      statuses: t.search.status,
    })[facet];

  return (
    <div className="u-shell" style={{ paddingBlock: "calc(var(--nav-h) + 3rem) 5rem" }}>
      <header className="max-w-[46ch]">
        <h1 className="u-display" style={{ fontSize: "var(--text-display)" }}>
          {t.search.title}
        </h1>
        <p className="u-body mt-5" style={{ color: "var(--color-ink-soft)" }}>
          {t.search.intro}
        </p>
      </header>

      <div className="mt-12 grid gap-x-14 gap-y-12 lg:grid-cols-[20rem_1fr] lg:items-start">
        {/* ---------------------------------------------------------------- */}
        <aside
          aria-label={t.search.filters}
          className="flex flex-col gap-9 lg:sticky"
          style={{ top: "calc(var(--nav-h) + 2rem)" }}
        >
          <div>
            <label htmlFor={budgetId} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
              {t.search.budget}
            </label>
            <output htmlFor={budgetId} className="u-display-tight u-numeric mt-3 block" style={{ fontSize: "var(--text-title)" }}>
              {filters.budget ? (
                <>
                  {formatNumber(filters.budget, locale)}{" "}
                  <span style={{ fontSize: "0.5em", letterSpacing: "0.06em" }}>{t.common.perMonth}</span>
                </>
              ) : (
                <span style={{ color: "var(--color-ink-mute)" }}>—</span>
              )}
            </output>
            <input
              id={budgetId}
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={250}
              value={filters.budget ?? BUDGET_MAX}
              onChange={(event) => update({ budget: Number(event.target.value) })}
              className="qualifier-range mt-3 w-full"
            />
            {ceiling && (
              <p className="u-numeric mt-1" style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}>
                {t.project.monthlyFrom} {formatNumber(Math.round(ceiling / 10000) * 10000, locale)}{" "}
                {t.common.currency}
              </p>
            )}
          </div>

          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
              {t.search.segment}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SEGMENTS.map((segment) => {
                const on = filters.segments.includes(segment);
                return (
                  <button
                    key={segment}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ segments: toggle(filters.segments, segment) })}
                    className="u-eyebrow inline-flex min-h-11 items-center rounded-full px-4 py-2.5 u-press"
                    style={{
                      background: on ? "var(--color-ink)" : "transparent",
                      color: on ? "var(--color-paper)" : "var(--color-ink-soft)",
                      border: `1px solid ${on ? "var(--color-ink)" : "color-mix(in oklab, var(--color-ink) 20%, transparent)"}`,
                    }}
                  >
                    {SEGMENT_LABELS[segment][locale]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
              {t.search.bedrooms}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((count) => {
                const on = filters.bedrooms === count;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ bedrooms: on ? null : count })}
                    className="u-eyebrow u-numeric inline-flex min-h-11 items-center rounded-full px-4 py-2.5 u-press"
                    style={{
                      background: on ? "var(--color-ink)" : "transparent",
                      color: on ? "var(--color-paper)" : "var(--color-ink-soft)",
                      border: `1px solid ${on ? "var(--color-ink)" : "color-mix(in oklab, var(--color-ink) 20%, transparent)"}`,
                    }}
                  >
                    {formatNumber(count, locale)}+
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
              {t.search.amenities}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const on = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ amenities: toggle(filters.amenities, amenity) })}
                    className="rounded-full px-3.5 py-2 u-press"
                    style={{
                      fontSize: "var(--text-small)",
                      background: on ? "var(--color-ochre-deep)" : "transparent",
                      color: on ? "var(--color-paper)" : "var(--color-ink-soft)",
                      border: `1px solid ${on ? "var(--color-ochre-deep)" : "color-mix(in oklab, var(--color-ink) 18%, transparent)"}`,
                    }}
                  >
                    {AMENITY_LABELS[amenity as Amenity][locale]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {hasFilters && (
            <button
              type="button"
              onClick={() =>
                update({
                  budget: null,
                  city: null,
                  segments: [],
                  amenities: [],
                  bedrooms: null,
                  surfaceMin: null,
                  statuses: [],
                  deposit: DEFAULT_DEPOSIT,
                })
              }
              className="u-eyebrow self-start underline underline-offset-4"
              style={{ color: "var(--color-ochre-deep)" }}
            >
              {t.search.clear}
            </button>
          )}
        </aside>

        {/* ---------------------------------------------------------------- */}
        <div>
          <div className="mb-8" style={{ background: "var(--color-paper-warm)", padding: "1.5rem" }}>
            <MoroccoMap
              locale={locale}
              results={result.projects}
              activeCity={filters.city}
              onSelectCity={(city) => update({ city })}
            />
          </div>

          <div
            className="flex flex-wrap items-baseline justify-between gap-4 pb-6"
            style={{ borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)" }}
          >
            <p aria-live="polite" className="u-display-tight u-numeric" style={{ fontSize: "var(--text-title)" }}>
              {formatNumber(result.projects.length, locale)}{" "}
              {result.projects.length === 1 ? t.search.result : t.search.results}
            </p>
          </div>

          {/* When nothing matched exactly we say which constraint we widened,
              rather than showing an empty page or silently ignoring input. */}
          {result.relaxed.length > 0 && (
            <p
              role="status"
              className="mt-6 p-5"
              style={{ background: "var(--color-paper-warm)", color: "var(--color-ink-soft)" }}
            >
              {t.search.noResults} {t.search.relaxedNotice}{" "}
              <strong style={{ color: "var(--color-ochre-deep)" }}>
                {result.relaxed.map(relaxedLabel).join(", ")}
              </strong>{" "}
              {t.search.relaxedSuffix}
            </p>
          )}

          <ul className="mt-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {result.projects.map((project) => (
              <li
                key={project.id}
                style={{ borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)" }}
              >
                <Link
                  href={`/${locale}/projets/${project.slug}`}
                  className="group grid gap-x-7 gap-y-4 py-7 sm:grid-cols-[13rem_1fr]"
                >
                  <div className="u-enter overflow-hidden" data-reveal="media" style={{ background: "var(--color-paper-warm)" }}>
                    <Figure
                      ref_={project.hero}
                      locale={locale}
                      sizes="(min-width: 40rem) 13rem, 92vw"
                      ratio="4 / 3"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h2 className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
                        {project.name[locale]}
                      </h2>
                      <p className="u-eyebrow" style={{ color: statusColor(project) }}>
                        {statusLabel(project, locale)}
                      </p>
                    </div>

                    <p className="u-eyebrow mt-2" style={{ color: "var(--color-ink-mute)" }}>
                      {getCity(project.cityId).name[locale]} — {project.neighbourhood[locale]}
                    </p>

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
                      <p className="u-numeric" style={{ fontSize: "var(--text-lead)" }}>
                        {t.common.from} {formatPrice(project.price, locale)}
                      </p>
                      <p className="u-numeric" style={{ color: "var(--color-ochre-deep)" }}>
                        {formatMonthly(project.price, locale)}
                      </p>
                      <p className="u-numeric" style={{ color: "var(--color-ink-mute)" }}>
                        {formatSurfaceRange(project, locale)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
