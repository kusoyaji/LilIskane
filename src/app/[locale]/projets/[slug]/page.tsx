import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/v2";
import { Amenities } from "@/components/project/Amenities";
import { CinematicSequence } from "@/components/project/CinematicSequence";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectLocation } from "@/components/project/ProjectLocation";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProofGallery } from "@/components/project/ProofGallery";
import { RelatedProjects } from "@/components/project/RelatedProjects";
import { SimulatorSection } from "@/components/project/SimulatorSection";
import { TourCards } from "@/components/project/TourCards";
import { Typologies } from "@/components/project/Typologies";
import { getCity, cityById } from "@/data/cities";
import { toListItems } from "@/data/list";
import { getProject, projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { projectCopy, STATUS_LABELS } from "@/content/projects";
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

/** The other phase of the same programme, in either direction. */
function siblingOf(project: Project): { project: Project; relation: "previous" | "next" } | undefined {
  if (project.previousPhaseSlug) {
    const previous = getProject(project.previousPhaseSlug);
    if (previous) return { project: previous, relation: "previous" };
  }
  const next = projects.find((p) => p.previousPhaseSlug === project.slug);
  return next ? { project: next, relation: "next" } : undefined;
}

/**
 * Three programmes worth seeing next: same city first, then the same
 * standing, then the closest price — so a buyer looking at a 485 000 DH flat
 * is not sent to a 2.4 M DH one.
 */
function relatedTo(project: Project, exclude: Set<string>): Project[] {
  const price = effectiveTotal(project.price);
  const ranked = projects
    .filter((p) => p.slug !== project.slug && !exclude.has(p.slug))
    .map((p) => ({
      p,
      score:
        (p.cityId === project.cityId ? 4 : 0) +
        (p.segment === project.segment ? 2 : 0) +
        (p.status !== "livre" ? 0.5 : 0),
      distance: Math.abs(Math.log(effectiveTotal(p.price) / price)),
    }))
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .map(({ p }) => p);

  // Never three land programmes in a row: three drawn plans side by side read
  // as a placeholder, and a land buyer is often weighing a flat as well.
  const picked: Project[] = [];
  for (const candidate of ranked) {
    if (picked.length === 3) break;
    const land = picked.filter((p) => p.segment === "terrain").length;
    if (candidate.segment === "terrain" && land >= 2) continue;
    picked.push(candidate);
  }
  return picked;
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
  const c = projectCopy[typedLocale];
  const sibling = siblingOf(project);
  const related = toListItems(
    relatedTo(project, new Set(sibling ? [sibling.project.slug] : [])),
    typedLocale,
  );

  const otherCities = [...new Set(projects.map((p) => p.cityId))]
    .filter((id) => id !== project.cityId)
    .map((id) => cityById.get(id))
    .filter((city) => city !== undefined)
    .map((city) => ({ id: city.id, lat: city.lat, lng: city.lng }));

  const sameCity = projects
    .filter((p) => p.cityId === project.cityId && p.slug !== project.slug)
    .map((p) => ({
      slug: p.slug,
      name: p.name[typedLocale],
      status: p.deliveredYear
        ? c.delivered(String(p.deliveredYear))
        : p.deliveryYear
          ? c.delivery(String(p.deliveryYear))
          : STATUS_LABELS[p.status][typedLocale],
    }));

  const allToursDelivered = project.tours.length > 0 && project.tours.every((tour) => tour.ofDelivered);
  // The proof set already shows every render of the flagship; the gallery is
  // for programmes whose pictures are not shown anywhere else on the page.
  const gallery = project.proof.length > 0 ? [] : project.gallery;

  // Dark sections (hero, film, simulator, closing band) paint their own
  // ground and are tagged as paper, so the field only ever blends between the
  // light tones. Letting it blend paper into ink darkened the tail of every
  // light section while its dark type was still on screen.
  return (
    <>
      <div data-tone="paper">
        <ProjectHero locale={typedLocale} project={project} />
      </div>

      {/* The camera move replaces stills outright where it exists. */}
      {project.cinematic && (
        <div data-tone="paper">
          <CinematicSequence
            locale={typedLocale}
            cinematic={project.cinematic}
            eyebrow={t.project.sequenceEyebrow}
            title={t.project.sequenceTitle}
            captions={[t.project.sequenceCaption1, t.project.sequenceCaption2, t.project.sequenceCaption3]}
            altText={project.hero.alt[typedLocale]}
            note={c.renderNote}
          />
        </div>
      )}

      <div data-tone="paper">
        <ProjectOverview locale={typedLocale} project={project} sibling={sibling} />
      </div>

      {gallery.length > 0 && (
        <div data-tone="paper">
          <ProjectGallery locale={typedLocale} images={gallery} />
        </div>
      )}

      {project.typologies.length > 0 && (
        <div data-tone="warm">
          <Typologies
            locale={typedLocale}
            typologies={project.typologies}
            slug={project.slug}
            entryPrice={project.price.amount}
          />
        </div>
      )}

      {project.tours.length > 0 && (
        <div data-tone="paper">
          <TourCards
            locale={typedLocale}
            tours={project.tours}
            body={allToursDelivered ? c.toursBodyDelivered : undefined}
            renderNote={c.renderShort}
          />
        </div>
      )}

      {project.proof.length > 0 && (
        <div data-tone="paper">
          <ProofGallery locale={typedLocale} pairs={project.proof} />
        </div>
      )}

      <div data-tone="warm">
        <Amenities locale={typedLocale} amenities={project.amenities} />
      </div>

      <div data-tone="paper">
        <ProjectLocation
          locale={typedLocale}
          project={project}
          otherCities={otherCities}
          sameCity={sameCity}
        />
      </div>

      <div data-tone="paper">
        <SimulatorSection locale={typedLocale} project={project} />
      </div>

      <div data-tone="paper">
        <RelatedProjects locale={typedLocale} items={related} />
      </div>

      <div data-tone="paper">
        {/* Land programmes have no building to show, and a picture of one
            under the programme's name would promise what a plot does not
            deliver. They close on a generic line over the default band image
            (a delivered Riad Garden I room, never a stock photograph). */}
        <CtaBand
          locale={typedLocale}
          title={
            project.segment === "terrain" ? c.ctaTitleLand : c.ctaTitle(project.name[typedLocale])
          }
          href={`/${typedLocale}/contact?projet=${project.slug}`}
        />
      </div>
    </>
  );
}
