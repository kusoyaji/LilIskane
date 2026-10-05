import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalDocs } from "@/content/legal";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const doc = legalDocs.mentions[locale];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: {
      canonical: `/${locale}/mentions-legales`,
      languages: { fr: "/fr/mentions-legales", ar: "/ar/mentions-legales" },
    },
  };
}

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalDocument locale={locale} page="mentions" />;
}
