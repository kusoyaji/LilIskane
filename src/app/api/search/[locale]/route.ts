import { NextResponse } from "next/server";
import { isLocale, LOCALES } from "@/i18n/config";
import { buildDocs } from "@/lib/search/docs";

/**
 * The search index, one static JSON file per locale, generated at build.
 * The overlay fetches it the first time search is wanted (hover, focus or
 * the keyboard shortcut), so no page pays for it up front.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return NextResponse.json({ error: "unknown locale" }, { status: 404 });
  return NextResponse.json(buildDocs(locale));
}
