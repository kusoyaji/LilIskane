import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Conventions } from "@/components/guide/Conventions";
import { FinancingDetail } from "@/components/guide/FinancingDetail";
import { GuaranteeBand } from "@/components/guide/GuaranteeBand";
import { Pillars } from "@/components/guide/Pillars";
import { SimulatorStage } from "@/components/guide/SimulatorStage";
import { StepChapter } from "@/components/guide/StepChapter";
import { StepOverview } from "@/components/guide/StepOverview";
import { CtaBand, LinkButton, PageHero } from "@/components/v2";
import { guide } from "@/content/guide";
import { shared } from "@/content/shared";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = guide[locale].meta;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${locale}/guide-achat`,
      languages: { fr: "/fr/guide-achat", ar: "/ar/guide-achat" },
    },
  };
}

/**
 * Guide d'achat — the client's buying guide, financing page and conventions
 * page as one path.
 *
 * The eight steps are the spine. They run in two chapters around the credit
 * simulator, because financing is step 3 and the simulator is the one thing
 * on this page a buyer can *do*; it gets the full width rather than a column.
 * After the last step (handover) come the legal guarantees (which run from
 * the réception des travaux, per the client's own text),
 * then the conventions, then the visit.
 *
 * Grounds alternate ink / paper / warm / sand so the long read has rhythm.
 */
export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = guide[locale];

  return (
    <>
      {/* The three ink stages (hero, simulator, guarantees) paint their own
          ground and take no part in the Field blend: blending paper into ink
          across a full viewport turned the steps beside them a muddy olive and
          made the sticky index unreadable. The Field only blends the light
          grounds here; ink meets paper on a clean edge. */}
      <div>
        <PageHero
          locale={locale}
          variant="ink"
          crumb={t.crumb}
          eyebrow={t.hero.eyebrow}
          title={t.hero.title}
          lead={t.hero.lead}
          actions={
            <>
              <LinkButton href="#simulateur" variant="light">
                {t.hero.simulate}
              </LinkButton>
              <LinkButton href={`/${locale}/contact`} variant="outline">
                {shared[locale].bookVisit}
              </LinkButton>
            </>
          }
        />
        <StepOverview locale={locale} />
      </div>

      <div data-tone="paper">
        <Pillars locale={locale} />
      </div>

      {/* Not a <div>: the choreography batches entrances per top-level div, and
          each step must reveal on its own as the reader reaches it. */}
      <article data-tone="paper">
        <StepChapter locale={locale} from={1} to={3} />
      </article>

      <div data-nav-media>
        <SimulatorStage locale={locale} />
      </div>

      <article data-tone="warm">
        <FinancingDetail locale={locale} />
      </article>

      <article data-tone="paper">
        <StepChapter locale={locale} from={4} to={8} simulateAbove />
      </article>

      <div data-nav-media>
        <GuaranteeBand locale={locale} />
      </div>

      <div data-tone="sand">
        <Conventions locale={locale} />
      </div>

      <CtaBand locale={locale} title={t.cta.title} body={t.cta.body} />
    </>
  );
}
