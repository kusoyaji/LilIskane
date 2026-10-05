import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactBooking } from "@/components/contact/ContactBooking";
import { DataNotice } from "@/components/contact/DataNotice";
import type { BienType, CityOption, ProjectPrefill } from "@/components/contact/model";
import { VisitUs } from "@/components/contact/VisitUs";
import { contact } from "@/content/contact";
import { cities, cityById } from "@/data/cities";
import { getProject } from "@/data/projects";
import type { Segment } from "@/data/types";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = contact[locale].meta;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { fr: "/fr/contact", ar: "/ar/contact" },
    },
    openGraph: { title: t.title, description: t.description },
  };
}

/** Project segment → the form's "type de bien". Commercial and offices have no residential category. */
const TYPE_OF: Partial<Record<Segment, BienType>> = {
  economique: "economique",
  "moyen-standing": "moyen-standing",
  "haut-standing": "haut-standing",
  terrain: "terrain",
};

/**
 * /contact — the conversion page. `?projet=<slug>` (from any project page)
 * pre-selects that programme's city and category and names it on the form;
 * the project is resolved here, on the server, so the client receives four
 * strings rather than the portfolio.
 */
export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;

  const sp = await searchParams;
  const slug = typeof sp.projet === "string" ? sp.projet : undefined;
  const project = slug ? getProject(slug) : undefined;

  const prefill: ProjectPrefill | null = project
    ? {
        slug: project.slug,
        name: project.name[typedLocale],
        cityId: project.cityId,
        cityName: cityById.get(project.cityId)?.name[typedLocale] ?? "",
        type: TYPE_OF[project.segment] ?? null,
      }
    : null;

  const collator = new Intl.Collator(typedLocale === "ar" ? "ar" : "fr");
  const cityOptions: CityOption[] = cities
    .map((c) => ({ id: c.id, name: c.name[typedLocale] }))
    .sort((a, b) => collator.compare(a.name, b.name));

  return (
    <>
      <ContactBooking locale={typedLocale} cities={cityOptions} prefill={prefill} />
      <VisitUs locale={typedLocale} />
      <DataNotice locale={typedLocale} />
    </>
  );
}
