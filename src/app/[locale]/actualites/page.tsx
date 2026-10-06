import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelFilms } from "@/components/news/ChannelFilms";
import { Featured } from "@/components/news/Featured";
import { NewsList } from "@/components/news/NewsList";
import { NewsMasthead } from "@/components/news/NewsMasthead";
import { CtaBand } from "@/components/v2";
import { news } from "@/content/news";
import { getProject, projects } from "@/data/projects";
import { isLocale } from "@/i18n/config";

/** The lead story. Everything else en lancement goes in the grid. */
const FEATURED = "riad-garden-ii";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = news[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${locale}/actualites`,
      languages: { fr: "/fr/actualites", ar: "/ar/actualites" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription },
  };
}

/**
 * Actualités & lancements.
 *
 * The site has no article pages, so nothing here pretends to be one: every
 * item is either a programme currently "en lancement" (linking to its real
 * project page) or a piece of company news from the client's own key dates
 * (linking to /a-propos). No item carries a date the source does not give.
 */
export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const launches = projects.filter((p) => p.status === "en-lancement");
  const featured = getProject(FEATURED);
  const rest = launches.filter((p) => p.slug !== featured?.slug);
  const cities = new Set(launches.map((p) => p.cityId)).size;

  return (
    <>
      <div data-tone="paper">
        <NewsMasthead locale={locale} launches={launches.length} cities={cities} />
        {featured && <Featured locale={locale} project={featured} />}
      </div>
      <div data-tone="paper">
        <NewsList locale={locale} launches={rest} />
      </div>
      <div data-tone="paper">
        <ChannelFilms locale={locale} />
      </div>
      {/* Toned paper, not ink: the band is an opaque photograph, so the ground
          under it is never seen — but an ink tone would start darkening the
          ground a screen early, under the last row of cards. */}
      <div data-tone="paper">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
