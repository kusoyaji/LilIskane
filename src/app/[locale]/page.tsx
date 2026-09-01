import { notFound } from "next/navigation";
import { DepthInterstitial } from "@/components/home/DepthInterstitial";
import { Hero, type HeroSlide } from "@/components/home/Hero";
import { PortfolioIndex } from "@/components/home/PortfolioIndex";
import { Qualifier } from "@/components/home/Qualifier";
import { RangeArgument } from "@/components/home/RangeArgument";
import { Record } from "@/components/home/Record";
import { ExpandingVideo } from "@/components/motion/ExpandingVideo";
import { ProofStage } from "@/components/proof/ProofStage";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { cityById } from "@/data/cities";
import { HERO_SLUGS, OPENING_IMAGE } from "@/data/heroCities";
import { getProject } from "@/data/projects";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const flagship = getProject("riad-garden-ii");
  if (!flagship) notFound();

  const facadePair = flagship.proof.find((p) => p.id === "facade");
  // The pool pairing carries the argument best: same subject, same angle, one
  // rendered and one photographed two years apart.
  const poolPair = flagship.proof.find((p) => p.id === "piscine");
  if (!facadePair || !poolPair) notFound();

  // Composed on the server so the hero ships no data layer of its own — it
  // receives four resolved slides and nothing else.
  const slides: HeroSlide[] = HERO_SLUGS.flatMap((slug) => {
    const project = getProject(slug);
    const city = project && cityById.get(project.cityId);
    if (!project || !city) return [];

    return [
      {
        slug: project.slug,
        city: city.name[locale],
        disclosure: `${t.home.heroRenderPrefix} ${project.name[locale]}${
          project.deliveryYear ? ` — ${t.home.heroDelivery} ${project.deliveryYear}` : ""
        }`,
        cta: `${t.common.seeProject} — ${project.name[locale]}`,
        href: `/${locale}/projets/${project.slug}`,
        // The flagship opens on the courtyard image, which the film section
        // below then grows out of. Every other city keeps its own render.
        media: slug === HERO_SLUGS[0] ? OPENING_IMAGE : project.hero,
      } satisfies HeroSlide,
    ];
  });

  if (slides.length === 0) notFound();

  return (
    <>
      <Hero locale={locale} slides={slides} />

      {/* Immediately after the hero, and deliberately so. The hero is a still
          frame of the courtyard; this grows the film out of that same frame, so
          the first thing scrolling does is open the page into motion rather than
          scroll past a picture to reach it. The two share one asset, which is
          what makes it read as one descent instead of a cut.

          It is a separate section rather than part of the hero because the hero
          must stay the fastest thing on the page: a static, priority-loaded
          image carrying the LCP, with no video competing for that first paint. */}
      <div data-tone="ink">
        <ExpandingVideo
          locale={locale}
          src="/video/atrium.mp4"
          srcSmall="/video/atrium-sm.mp4"
          poster="/video/atrium-poster.jpg"
          altText={t.home.expandAlt}
          backdrop={OPENING_IMAGE}
          eyebrow={t.home.filmEyebrow}
          title={t.home.filmTitle}
          caption={t.home.filmCaption}
        />
      </div>

      {/* From here down, sections declare the ground they want and paint none
          of it themselves — see the field note in globals.css. The ramp is
          deliberate: ink under the hero, warming through the proof stage into
          paper for the reading sections, and back to ink for the index, so the
          page darkens and lifts twice rather than cutting between blocks. */}
      <div data-tone="ink">
        <ProofStage
          locale={locale}
          pair={poolPair}
          eyebrow={t.project.proofEyebrow}
          title={`${t.home.heroProofLine1} ${t.home.heroProofLine2}`}
          body={t.project.proofBody}
        />
      </div>

      <div data-tone="warm">
        <Record locale={locale} />
      </div>

      <div data-tone="paper">
        <Qualifier locale={locale} />
      </div>

      {/* The hinge into the portfolio: fragments at four distances drifting past
          a line of type that holds still. It carries the range of the work
          without asking anyone to study four small pictures, and it is where the
          page finally breathes before the index. */}
      <DepthInterstitial
        locale={locale}
        eyebrow={t.home.portfolioEyebrow}
        title={t.home.expandTitle}
      />

      <div data-tone="ink">
        <PortfolioIndex locale={locale} />
      </div>

      <div data-tone="paper">
        <RangeArgument locale={locale} />
      </div>
    </>
  );
}
