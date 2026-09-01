"use client";

import { useRef } from "react";
import { Figure } from "@/components/media/Figure";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import type { Locale } from "@/i18n/config";
import type { MediaRef } from "@/data/types";

type Frame = { media: MediaRef; caption: string };

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  frames: Frame[];
};

/**
 * A camera path: the allée, then the gardens, then the pool.
 *
 * Each frame holds the viewport while the one beneath it comes up, so scrolling
 * reads as moving through the site rather than past a column of pictures. The
 * transition is a scale-and-fade rather than a slide, because a slide reads as
 * a carousel and a carousel reads as a page element — the point here is that
 * you are the one moving.
 *
 * Frames after the first are lazy: on a phone the later images are fetched as
 * the sequence is entered, not on page load.
 *
 * Reduced motion turns the whole thing into a captioned vertical sequence of
 * the same photographs in the same order. Nothing is lost but the interpolation.
 */
export function SequenceStage({ locale, eyebrow, title, frames }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollProgress(sectionRef, { from: 0.18, to: 0.84 });

  const count = frames.length;

  return (
    <section
      ref={sectionRef}
      data-nav-media
      aria-labelledby="sequence-title"
      className="sequence-section relative"
      style={{
        background: "var(--color-ink)",
        // One extra viewport of travel per frame after the first.
        ["--frames" as string]: count,
      }}
    >
      {/* Pinning and sizing live in globals.css so the reduced-motion rules can
          override them — see the note in ProofStage. */}
      <div className="sequence-stage">
        {frames.map((frame, index) => (
          <div
            key={frame.media.key}
            className="sequence-frame"
            style={{ ["--i" as string]: index }}
          >
            <Figure
              ref_={frame.media}
              locale={locale}
              sizes="100vw"
              priority={index === 0}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--color-ink) 78%, transparent) 0%, color-mix(in oklab, var(--color-ink) 18%, transparent) 38%, transparent 62%)",
              }}
            />
            <p
              className="sequence-caption u-body"
              style={{
                padding: "0 var(--gutter) clamp(2rem, 5vw, 3.5rem)",
                color: "color-mix(in oklab, var(--color-paper) 90%, transparent)",
              }}
            >
              {frame.caption}
            </p>
          </div>
        ))}

        <div
          className="on-media sequence-head"
          style={{ padding: "calc(var(--nav-h) + 1.75rem) var(--gutter) 0" }}
        >
          <p className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
            {eyebrow}
          </p>
          <h2
            id="sequence-title"
            className="u-display mt-4"
            style={{ fontSize: "var(--text-display)", color: "var(--color-paper)", maxInlineSize: "14ch" }}
          >
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}
