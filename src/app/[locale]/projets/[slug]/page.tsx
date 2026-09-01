import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/project/BookingForm";
import { CinematicSequence } from "@/components/project/CinematicSequence";
import { CreditSimulator } from "@/components/project/CreditSimulator";
import { LocationAndAmenities } from "@/components/project/LocationAndAmenities";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProofGallery } from "@/components/project/ProofGallery";
import { SequenceStage } from "@/components/project/SequenceStage";
import { TourCards } from "@/components/project/TourCards";
import { Typologies } from "@/components/project/Typologies";
import { getCity } from "@/data/cities";
import { getProject, projects } from "@/data/projects";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { effectiveTotal, formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = getProject(slug);
  if (!project) return {};

  const t = getDictionary(locale);
  const city = getCity(project.cityId);
  const title = `${project.name[locale]} — ${city.name[locale]}`;

  return {
    title,
    description: `${project.summary[locale]} ${t.common.from} ${formatPrice(project.price, locale)}.`,
    alternates: {
      canonical: `/${locale}/projets/${slug}`,
      languages: { fr: `/fr/projets/${slug}`, ar: `/ar/projets/${slug}` },
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;

  const project = getProject(slug);
  if (!project) notFound();

  const t = getDictionary(typedLocale);

  // The camera path: street, then gardens, then the pool. Falls back to
  // whatever gallery imagery exists for the lighter-weight programmes.
  const sequenceSource = [
    project.gallery.find((m) => m.key.includes("Commerce")),
    project.gallery.find((m) => m.key.includes("jardin")),
    project.gallery.find((m) => m.key.includes("TypeB")),
  ].filter(Boolean);

  const frames = (sequenceSource.length === 3 ? sequenceSource : project.gallery.slice(0, 3)).map(
    (media, index) => ({
      media: media!,
      caption: [
        t.project.sequenceCaption1,
        t.project.sequenceCaption2,
        t.project.sequenceCaption3,
      ][index],
    }),
  );

  return (
    <>
      <ProjectHero locale={typedLocale} project={project} />

      {/* Where a camera move exists it replaces the still sequence outright —
          the stills were only ever standing in for the move. Projects without
          footage keep the cross-faded frames. */}
      {project.cinematic ? (
        <CinematicSequence
          locale={typedLocale}
          cinematic={project.cinematic}
          eyebrow={t.project.sequenceEyebrow}
          title={t.project.sequenceTitle}
          captions={[
            t.project.sequenceCaption1,
            t.project.sequenceCaption2,
            t.project.sequenceCaption3,
          ]}
          altText={project.hero.alt[typedLocale]}
        />
      ) : (
        frames.length > 1 && (
          <SequenceStage
            locale={typedLocale}
            eyebrow={t.project.sequenceEyebrow}
            title={t.project.sequenceTitle}
            frames={frames}
          />
        )
      )}

      {/* Cards rather than one embedded room: the set is visible before you
          commit to any of it, and no WebGL context exists until you open one.
          The full-bleed `VirtualTour` it replaces is kept in the tree for now —
          it is the reference implementation of the on-approach iframe dissolve
          and is worth reading before changing the loading behaviour here. */}
      {project.tours.length > 0 && <TourCards locale={typedLocale} tours={project.tours} />}

      {project.proof.length > 0 && <ProofGallery locale={typedLocale} pairs={project.proof} />}

      <Typologies locale={typedLocale} typologies={project.typologies} />

      <LocationAndAmenities
        locale={typedLocale}
        nearby={project.nearby}
        amenities={project.amenities}
        title={t.project.locationTitle}
        body={t.project.locationBody}
      />

      <CreditSimulator
        locale={typedLocale}
        basePrice={effectiveTotal(project.price)}
        typologies={project.typologies}
      />

      <BookingForm locale={typedLocale} />
    </>
  );
}
