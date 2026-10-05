import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chronology } from "@/components/about/Chronology";
import { Guarantees } from "@/components/about/Guarantees";
import { NextChapter } from "@/components/about/NextChapter";
import { Seals } from "@/components/about/Seals";
import { Values } from "@/components/about/Values";
import { Who } from "@/components/about/Who";
import s from "@/components/about/about.module.css";
import { CtaBand, PageHero } from "@/components/v2";
import { about } from "@/content/about";
import { milestones } from "@/data/company";
import { isLocale, isolateRun, type Locale } from "@/i18n/config";

/**
 * Grouped figures inside running text ("11 000") must never break across a
 * line, and in Arabic must stay one left-to-right run or the groups reorder.
 */
const keepNumbers = (text: string, locale: Locale) =>
  text.replace(/\d{1,3}(?:[ \u00a0\u202f]\d{3})+/g, (run) => isolateRun(run.replace(/[ \u202f]/g, "\u00a0"), locale));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = about[locale];
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: { canonical: `/${locale}/a-propos`, languages: { fr: "/fr/a-propos", ar: "/ar/a-propos" } },
    openGraph: { title: t.metaTitle, description: t.metaDescription },
  };
}

/**
 * À propos — "Chaabi Lil Iskane" in the navigation.
 *
 * The page is built for the people who wrote the history it tells, so it reads
 * as a record rather than a brochure: who the company is and what it builds,
 * then the ten dates as the centrepiece (a pinned year counter turned by the
 * reader's own scroll), then what it stands for, what third parties have
 * certified, and what every buyer is guaranteed. Every figure is read from
 * `src/data/company.ts` — none is typed into a component.
 *
 * One dark ground only, the chronology, and it is entered and left behind a
 * full-bleed photograph (Riad Garden I as delivered; Riad Garden II as
 * launched), so the Field changes colour behind an image, never behind text.
 * Every other ground is light, so their blends are invisible.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = about[locale];

  // Only what the client component draws crosses to the browser: one language,
  // plain strings.
  const entries = milestones.map((m) => ({
    year: m.year,
    chapter: t.chrono.chapters[m.year] ?? "",
    title: m.title[locale],
    body: keepNumbers(m.body[locale], locale),
  }));

  return (
    <>
      <div data-tone="paper" className={s.heroWrap}>
        <PageHero
          locale={locale}
          variant="media"
          eyebrow={t.hero.eyebrow}
          title={t.hero.title}
          lead={t.hero.lead}
          crumb={t.crumb}
          media={{
            key: "rg1_DSC00924",
            nature: "photograph",
            alt: {
              fr: "La piscine de Riad Garden I livrée, entourée de bâtiments ocre rose et de palmiers, sous un ciel dégagé.",
              ar: "مسبح رياض غاردن 1 بعد التسليم، تحيط به مبانٍ وردية مغرة ونخيل، تحت سماء صافية.",
            },
          }}
        />
        <p className={`u-eyebrow ${s.heroCaption}`}>{t.hero.caption}</p>
      </div>

      <div data-tone="paper">
        <Who locale={locale} />
      </div>

      <div data-tone="ink">
        <Chronology
          locale={locale}
          entries={entries}
          eyebrow={t.chrono.eyebrow}
          title={t.chrono.title}
          jump={t.chrono.jump}
          of={t.chrono.of}
        />
        <NextChapter locale={locale} />
      </div>

      <div data-tone="paper">
        <Values locale={locale} />
      </div>

      <div data-tone="sand">
        <Seals locale={locale} />
      </div>

      <div data-tone="paper">
        <Guarantees locale={locale} />
      </div>

      {/* The band is an opaque photograph; its wrapper keeps the light ground
          so the guarantees above never sit on a half-blended colour. */}
      <div data-tone="paper">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
