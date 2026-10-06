import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/v2";
import { ProjectCard } from "@/components/search/ProjectCard";
import { MapPanel } from "@/components/search/MapPanel";
import { SearchHero } from "@/components/search/SearchHero";
import { SmartQuery } from "@/components/search/SmartQuery";
import { statusFacetLabel } from "@/components/search/labels";
import { SearchControls, type Facet } from "@/components/search/SearchControls";
import { SearchMap, type MapCity } from "@/components/search/SearchMap";
import { PendingRegion, SearchShell } from "@/components/search/SearchShell";
import s from "@/components/search/search.module.css";
import { cityById } from "@/data/cities";
import { toListItems } from "@/data/list";
import { projects } from "@/data/projects";
import { AMENITIES, SEGMENTS, STATUSES } from "@/data/types";
import { formatNumber, isLocale, isolateRun, type Locale } from "@/i18n/config";
import { AMENITY_LABELS, SEGMENT_LABELS, searchCopy } from "@/content/projects";
import {
  facetCount,
  fromSearchParams,
  hasStatusFacet,
  isActive,
  search,
  STATUS_FACETS,
  toQueryString,
  type FacetKey,
} from "@/lib/filter";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = searchCopy[locale];
  const cities = new Set(projects.map((p) => p.cityId)).size;
  return {
    title: c.heroEyebrow,
    description: c.heroLead(formatNumber(projects.length, locale), formatNumber(cities, locale)),
    alternates: { canonical: `/${locale}/projets`, languages: { fr: "/fr/projets", ar: "/ar/projets" } },
  };
}

/**
 * /projets — the portfolio as a destination.
 *
 * Filtering runs here, on the server, with `src/lib/filter.ts` (URL parsing,
 * facet counts and the never-zero relaxation), so the browser receives
 * rendered cards and a few kilobytes of controls rather than the portfolio.
 * The controls rewrite the URL and this page renders again. There is no
 * Suspense boundary: the whole page hydrates in one pass, which is what fixes
 * v1's hydration mismatch (the scroll choreography was styling the suspended
 * list before React had hydrated it).
 */
export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const c = searchCopy[typedLocale];

  // Status values offered as chips: those some programme has — minus "Livré"
  // while every delivered programme is also "Livraison immédiate" (the client's
  // own label for them), where it would only be a redundant subset.
  const offeredStatuses = STATUS_FACETS.filter(
    (st) =>
      projects.some((p) => hasStatusFacet(p, st)) &&
      !(st === "livre" && projects.filter((p) => p.status === "livre").every((p) => p.readyNow)),
  );
  // A stale or hand-made URL may carry a status no chip offers, or a city id
  // that is not one; dropping them here keeps the relaxation from widening a
  // filter the visitor cannot see.
  const parsed = fromSearchParams(await searchParams);
  const filters = {
    ...parsed,
    cities: parsed.cities.filter((id) => cityById.has(id)),
    statuses: parsed.statuses.filter((st) => (offeredStatuses as readonly string[]).includes(st)),
  };
  const result = search(filters);
  const query = toQueryString(filters);
  const items = toListItems(result.projects, typedLocale);

  // The relaxation walks a fixed order and records every facet it stepped
  // past, set or not. Only the ones the visitor actually chose were widened.
  const widened = result.relaxed.filter((facet) => isActive(filters, facet));

  const count = (facet: FacetKey, predicate: Parameters<typeof facetCount>[2]) =>
    facetCount(filters, facet, predicate);

  const cityIds = [...new Set(projects.map((p) => p.cityId))];
  const mapCities: MapCity[] = cityIds
    .map((id) => cityById.get(id))
    .filter((city) => city !== undefined)
    .map((city) => ({
      id: city.id,
      name: city.name[typedLocale],
      lat: city.lat,
      lng: city.lng,
      count: count("city", (p) => p.cityId === city.id),
      total: projects.filter((p) => p.cityId === city.id).length,
    }));

  const cityFacets: Facet[] = [...mapCities]
    .sort((a, b) => a.name.localeCompare(b.name, typedLocale))
    .map((city) => ({ value: city.id, label: city.name, count: city.count }));

  // Segments with no programme at all are not offered (commercial, bureaux).
  const segmentFacets: Facet[] = SEGMENTS.filter((seg) => projects.some((p) => p.segment === seg)).map(
    (seg) => ({ value: seg, label: SEGMENT_LABELS[seg][typedLocale], count: count("segments", (p) => p.segment === seg) }),
  );
  const statusFacets: Facet[] = offeredStatuses.map((st) => ({
    value: st,
    label: statusFacetLabel(st, typedLocale),
    count: count("statuses", (p) => hasStatusFacet(p, st)),
  }));
  const bedroomFacets: Facet[] = [1, 2, 3, 4].map((n) => ({
    value: String(n),
    label: isolateRun(`${n}+`, typedLocale),
    count: count("bedrooms", (p) => p.bedroomsMax >= n),
  }));
  const amenityFacets: Facet[] = AMENITIES.filter((a) => projects.some((p) => p.amenities.includes(a))).map(
    (a) => ({
      value: a,
      label: AMENITY_LABELS[a][typedLocale],
      count: count("amenities", (p) => p.amenities.includes(a)),
    }),
  );

  return (
    <>
      <div data-tone="paper">
        <SearchHero
          locale={typedLocale}
          eyebrow={c.heroEyebrow}
          title={c.heroTitle}
          lead={c.heroLead(formatNumber(projects.length, typedLocale), formatNumber(cityIds.length, typedLocale))}
          actions={<SmartQuery locale={typedLocale} />}
        />
      </div>

      <div data-tone="paper">
        <section id="recherche" className={`u-shell ${s.section}`} aria-label={c.filtersTitle}>
          <SearchShell query={query}>
            <div className={s.layout}>
              <aside className={s.mapCol}>
                <MapPanel locale={typedLocale}>
                  <SearchMap locale={typedLocale} cities={mapCities} />
                </MapPanel>
              </aside>

              <div className={s.listCol}>
                <SearchControls
                  locale={typedLocale}
                  cities={cityFacets}
                  segments={segmentFacets}
                  bedrooms={bedroomFacets}
                  statuses={statusFacets}
                  amenities={amenityFacets}
                />

                <PendingRegion className={s.results}>
                  <div className={s.resultsHead}>
                    <p aria-live="polite" className={`u-numeric ${s.count}`}>
                      {c.results(items.length, formatNumber(items.length, typedLocale))}
                    </p>
                  </div>

                  {/* Nothing matched exactly: say which constraint was widened
                      rather than showing an empty page. */}
                  {widened.length > 0 && (
                    <p role="status" className={s.relaxed}>
                      <strong>{c.noExact}</strong> {c.relaxedPrefix}{" "}
                      <em>
                        {new Intl.ListFormat(typedLocale, { type: "conjunction" }).format(
                          widened.map((facet) => c.relaxed[facet]),
                        )}
                      </em>{" "}
                      {c.relaxedSuffix}
                    </p>
                  )}

                  <ul className={s.grid}>
                    {items.map((item, index) => (
                      <li key={item.slug} className={s.gridItem} style={{ ["--i" as string]: Math.min(index, 8) }}>
                        <ProjectCard
                          locale={typedLocale}
                          item={item}
                          priority={index < 2}
                          sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 92vw"
                        />
                      </li>
                    ))}
                  </ul>
                </PendingRegion>
              </div>
            </div>
          </SearchShell>
        </section>
      </div>

      <div data-tone="paper">
        <CtaBand locale={typedLocale} title={c.ctaTitle} body={c.ctaBody} />
      </div>
    </>
  );
}
