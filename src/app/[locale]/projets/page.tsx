import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SearchExplorer } from "@/components/search/SearchExplorer";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.search.title, description: t.search.intro };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // useSearchParams needs a Suspense boundary so the shell can be statically
  // rendered and only the filtered view waits on the query string.
  return (
    <Suspense fallback={<div style={{ minBlockSize: "60svh" }} />}>
      <SearchExplorer locale={locale} />
    </Suspense>
  );
}
