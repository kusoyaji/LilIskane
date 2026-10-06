import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeSearchProvider } from "@/components/home-search/context";
import { HomeResults } from "@/components/home-search/HomeResults";
import { SearchHero } from "@/components/home-search/SearchHero";
import { BudgetFinder } from "@/components/home-v2/BudgetFinder";
import { MapSection } from "@/components/home-v2/MapSection";
import { company } from "@/data/company";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { buildDocs } from "@/lib/search/docs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: { absolute: t.meta.homeTitle },
    description: t.meta.homeDescription,
    openGraph: {
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      type: "website",
    },
  };
}

/**
 * Home — the search page.
 *
 * For real estate the home is where the search starts, so this page is only
 * that: one result set with three ways in — by words (the concierge field in
 * the hero), by place (the map), by monthly payment (the budget finder) — and
 * the answer, as the programme cards. Every tool writes into the same search
 * state (home-search/context.tsx, fed here with the locale's search index), so
 * the hero's count, the results, the map and the budget always agree.
 *
 * The story the old home told (the film, the heritage, the flagship, the
 * render-versus-photograph proof, the services) lives on /a-propos, on
 * /projets/riad-garden-ii and on /guide-achat.
 *
 * Sections declare the ground they sit on with `data-tone` (see GROUNDS in
 * globals.css): ink → paper → sand → ink, every join involving ink a hard cut.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <HomeSearchProvider locale={locale} docs={buildDocs(locale)}>
      <div data-tone="ink">
        <SearchHero locale={locale} founded={company.founded} />
      </div>
      <div data-tone="paper">
        <HomeResults locale={locale} />
      </div>
      <div data-tone="sand">
        <MapSection locale={locale} />
      </div>
      <div data-tone="ink">
        <BudgetFinder locale={locale} />
      </div>
    </HomeSearchProvider>
  );
}
