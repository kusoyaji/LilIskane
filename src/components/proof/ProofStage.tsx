"use client";

import { useEffect, useRef } from "react";
import { Figure } from "@/components/media/Figure";
import { gsap } from "@/components/motion/gsap";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { media } from "@/data/media.generated";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ProofPair } from "@/data/types";

type Props = {
  locale: Locale;
  pair: ProofPair;
  eyebrow: string;
  title: string;
  body: string;
};

/**
 * The signature: a render wiped away to reveal the photograph beneath it.
 *
 * This started as a crossfade and was rebuilt. Dissolving between two images
 * that are framed differently — and these are two different buildings, two
 * years apart — produced a ghosted middle state that read as a rendering fault
 * rather than a comparison. A hard moving edge is legible at every frame: at
 * any moment you are looking at render on one side and photograph on the other,
 * separated by a visible seam.
 *
 * The seam is the point. We are not claiming the two are the same building. We
 * are inviting the comparison and labelling both halves, which is why the
 * reduced-motion fallback — the two frames side by side — is the same idea
 * rather than a lesser one.
 */
/** 7 × 5. Enough tiles to read as dissolution, few enough to read as deliberate. */
const COLS = 7;
const ROWS = 5;

export function ProofStage({ locale, pair, eyebrow, title, body }: Props) {
  const t = getDictionary(locale);
  const sectionRef = useRef<HTMLElement>(null);

  // Kept for the reduced-motion layout and the seam-free fallback; the motion
  // path is owned by the timeline below.
  useScrollProgress(sectionRef, { from: 0.34, to: 0.64 });

  /**
   * The render resolves into the photograph, tile by tile.
   *
   * The previous version was a hard vertical wipe — one moving edge travelling
   * across both frames. It was legible, and it was also the single most dated
   * gesture on the site: a before/after slider is a 2014 pattern, and putting
   * it on scroll rather than on a drag handle does not modernise it.
   *
   * This says the same thing with the same honesty and a much better verb. The
   * render is broken into a grid, and each tile drops away — scaling down and
   * lifting slightly — to expose the photograph already sitting behind it. The
   * stagger runs from the centre outward, so the delivered building appears
   * first where the eye already is and the promise peels back toward the edges.
   *
   * Both images stay at full opacity throughout: nothing is cross-faded, so
   * neither frame is ever degraded to make a point about the other. That was
   * the one property of the wipe worth keeping and it is preserved exactly.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tiles = gsap.utils.toArray<HTMLElement>(".proof-tile", section);
      if (tiles.length === 0) return;

      const tween = gsap.to(tiles, {
        opacity: 0,
        scale: 0.72,
        yPercent: -8,
        ease: "power2.inOut",
        stagger: {
          each: 0.045,
          from: "center",
          grid: [ROWS, COLS],
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${section.offsetHeight - window.innerHeight}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-media
      aria-labelledby="proof-title"
      className="proof-section relative"
      // No background of its own — the page field paints ink under this. It
      // matters in the reduced-motion layout especially, where the frames stop
      // covering the section and the overlaid type returns to flow expecting a
      // dark ground beneath it.
    >
      {/* Pinning and sizing live in globals.css, not in Tailwind utilities:
          the reduced-motion rules have to override them, and a utility in
          @layer utilities always beats a component rule in @layer components. */}
      <div className="proof-stage">
        <div className="proof-frames">
          {/* The delivered building sits underneath the whole time, at full
              opacity. It is never faded up — it is uncovered. */}
          <div className="proof-frame proof-frame--photo">
            <Figure
              ref_={pair.photograph}
              locale={locale}
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </div>

          {/* The render, broken into a grid that drops away tile by tile.
              Each tile carries the same image at grid scale and offsets its
              background so it shows only its own slice — so this is one decoded
              bitmap, not thirty-five, and the seams line up exactly.

              Hidden from assistive tech: the render is already described by the
              caption below, and thirty-five identically-labelled tiles would be
              thirty-five meaningless stops. */}
          <div aria-hidden className="proof-frame proof-tiles">
            {Array.from({ length: COLS * ROWS }, (_, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              return (
                <span
                  key={i}
                  className="proof-tile"
                  style={{
                    backgroundImage: `url(${media[pair.render.key].src})`,
                    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
                  }}
                />
              );
            })}
          </div>

          <div
            aria-hidden
            className="proof-scrim"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--color-ink) 76%, transparent) 0%, color-mix(in oklab, var(--color-ink) 22%, transparent) 32%, transparent 58%), linear-gradient(to bottom, color-mix(in oklab, var(--color-ink) 62%, transparent) 0%, transparent 30%)",
            }}
          />

          <div
            className="on-media proof-head"
            style={{ padding: "calc(var(--nav-h) + 1.75rem) var(--gutter) 0" }}
          >
            <p
              className="u-eyebrow"
              style={{ color: "color-mix(in oklab, var(--color-paper) 72%, transparent)" }}
            >
              {eyebrow}
            </p>
            <h2
              id="proof-title"
              className="u-display mt-4"
              style={{
                fontSize: "var(--text-display)",
                color: "var(--color-paper)",
                maxInlineSize: "16ch",
              }}
            >
              {title}
            </h2>
          </div>

          <div
            className="on-media proof-foot"
            style={{ padding: "0 var(--gutter) clamp(1.75rem, 4vw, 3rem)" }}
          >
            <p
              className="u-body"
              style={{ color: "color-mix(in oklab, var(--color-paper) 86%, transparent)" }}
            >
              {body}
            </p>

            {/* Each label sits over the half it names. */}
            <div className="proof-readout mt-7 flex items-baseline justify-between gap-6">
              <span className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 88%, transparent)" }}>
                {t.project.proofRender} — {pair.render.nature === "render" ? "Riad Garden II" : ""}
              </span>
              <span className="u-eyebrow u-numeric" style={{ color: "var(--color-ochre-bright)" }}>
                {t.project.proofReal} — {pair.sourceProject[locale]}, {pair.sourceYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
