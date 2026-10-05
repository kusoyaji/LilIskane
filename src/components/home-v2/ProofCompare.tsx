import { getProject } from "@/data/projects";
import type { MediaRef, ResolvedMediaRef } from "@/data/types";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { LinkButton } from "@/components/v2";
import { fill, proofCopy } from "@/content/home-portfolio";
import { CompareSlider, type ComparePair } from "./proof/CompareSlider";
import s from "./proof/ProofCompare.module.css";

const resolve = (ref: MediaRef, locale: Locale): ResolvedMediaRef => ({
  key: ref.key,
  nature: ref.nature,
  alt: ref.alt[locale],
});

/**
 * Le rendu et le réel — the site's sharpest argument, made with the visitor's
 * own hand.
 *
 * A render of Riad Garden II and a photograph of the same space in Riad Garden
 * I, delivered two hundred metres away, share one frame; the visitor drags the
 * seam between them. Nothing is asserted that the visitor cannot check with
 * their own eyes, which is the whole point of putting it in the hand rather
 * than in a caption.
 *
 * Server component: every string is resolved here, so the client slider
 * receives seven pairs in one language and nothing else.
 */
export function ProofCompare({ locale }: { locale: Locale }) {
  const t = proofCopy[locale];
  const project = getProject("riad-garden-ii");
  if (!project || project.proof.length === 0) return null;

  const pairs: ComparePair[] = project.proof.map((pair) => ({
    id: pair.id,
    label: pair.shortLabel[locale],
    caption: pair.caption[locale],
    render: resolve(pair.render, locale),
    photograph: resolve(pair.photograph, locale),
    source: pair.sourceProject[locale],
    sourceYear: isolateRun(String(pair.sourceYear), locale),
  }));

  const first = project.proof[0]!;
  const renderYear = project.deliveryYear ? isolateRun(String(project.deliveryYear), locale) : "";
  const lead = fill(t.lead, {
    render: project.name[locale],
    year: renderYear,
    source: first.sourceProject[locale],
    sourceYear: isolateRun(String(first.sourceYear), locale),
  });

  return (
    <section className={s.section} data-nav-media aria-labelledby="proof-compare-title">
      <div className={`u-shell ${s.head}`}>
        <div className={s.headTitle}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)" }}>
            {t.eyebrow}
          </p>
          <h2 id="proof-compare-title" className={`u-display ${s.title}`} data-reveal="mask">
            <span className="reveal-inner">
              {t.titleA} <em className={s.titleAccent}>{t.titleB}</em>
            </span>
          </h2>
        </div>
        <div className={s.headAside}>
          <p className={`u-enter ${s.lead}`}>{lead}</p>
          <div className="u-enter">
            <LinkButton href={`/${locale}/projets/${project.slug}`} variant="outline">
              {t.seeProject}
            </LinkButton>
          </div>
        </div>
      </div>

      <CompareSlider
        locale={locale}
        pairs={pairs}
        initialId="piscine"
        renderName={project.name[locale]}
        renderYear={renderYear}
        copy={{
          drag: t.drag,
          renderTag: t.renderTag,
          renderNote: t.renderNote,
          deliveryWord: t.deliveryWord,
          realTag: t.realTag,
          realNote: t.realNote,
          sliderLabel: t.sliderLabel,
          sliderValue: t.sliderValue,
          pairsLabel: t.pairsLabel,
          legal: t.legal,
        }}
        countLabel={formatNumber(pairs.length, locale)}
      />
    </section>
  );
}
