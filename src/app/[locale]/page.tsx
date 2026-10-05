import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BudgetFinder } from "@/components/home-v2/BudgetFinder";
import { Film } from "@/components/home-v2/Film";
import { Flagship } from "@/components/home-v2/Flagship";
import { Heritage } from "@/components/home-v2/Heritage";
import { MapSection } from "@/components/home-v2/MapSection";
import { ProofCompare } from "@/components/home-v2/ProofCompare";
import { Services } from "@/components/home-v2/Services";
import { Showcase } from "@/components/home-v2/Showcase";
import { CtaBand } from "@/components/v2";
import type { MediaRef } from "@/data/types";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

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
 * Home, v2.
 *
 * The page is a walk, then a case. It opens by taking the visitor *into* Riad
 * Garden II — street, façade, courtyard, salon — on a film driven by their own
 * scroll; then says who built it and for how long; then shows the flagship,
 * proves the promise against a delivered building, opens the whole portfolio
 * across Morocco, and ends on the two things the site exists to produce: a
 * budget answer and a visit.
 *
 * Sections declare the ground they sit on with `data-tone` and paint none of
 * it themselves — the wrapper paints it, feathered from the tone before it
 * (see GROUNDS in globals.css). The ramp below alternates dark and light so the
 * page breathes instead of cutting.
 */

/** The close follows four Riad Garden I interiors, so it steps outside: the
 *  delivered residence itself, pool and façades, instead of a fifth room. */
const CLOSING_MEDIA: MediaRef = {
  key: "rg1_DSC00924",
  nature: "photograph",
  alt: {
    fr: "La piscine de Riad Garden I livrée, entourée de bâtiments ocre rose et de palmiers.",
    ar: "مسبح رياض غاردن 1 بعد التسليم، تحيط به مبانٍ وردية مغرة ونخيل.",
  },
};
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <div data-tone="ink">
        <Film locale={locale} />
      </div>
      <div data-tone="ink">
        <Heritage locale={locale} />
      </div>
      <div data-tone="paper">
        <Flagship locale={locale} />
      </div>
      <div data-tone="ink">
        <ProofCompare locale={locale} />
      </div>
      <div data-tone="paper">
        <Showcase locale={locale} />
      </div>
      <div data-tone="sand">
        <MapSection locale={locale} />
      </div>
      <div data-tone="ink">
        <BudgetFinder locale={locale} />
      </div>
      <div data-tone="paper">
        <Services locale={locale} />
      </div>
      <div data-tone="ink">
        <CtaBand locale={locale} media={CLOSING_MEDIA} />
      </div>
    </>
  );
}
