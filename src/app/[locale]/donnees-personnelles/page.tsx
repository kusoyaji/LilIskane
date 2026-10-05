import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalDocs } from "@/content/legal";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const doc = legalDocs.privacy[locale];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: {
      canonical: `/${locale}/donnees-personnelles`,
      languages: { fr: "/fr/donnees-personnelles", ar: "/ar/donnees-personnelles" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalDocument locale={locale} page="privacy" />;
}
