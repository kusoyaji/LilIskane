"use client";

import { useRef } from "react";
import { Figure } from "@/components/media/Figure";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import type { Locale } from "@/i18n/config";
import type { MediaRef } from "@/data/types";

type Props = {
  locale: Locale;
  media: MediaRef;
  eyebrow: string;
  title: string;
  caption?: string;
};

/**
 * A photograph that grows from a tile into the whole screen as you scroll.
 *
 * The mechanic is a single `scale`. The frame is laid out full-bleed from the
 * start and begins *scaled down* to 26%, so growth costs no layout and no
 * repaint — one composited transform, which is why it holds 60fps on a phone
 * where an animated width/height would not.
 *
 * The type scales on the same progress but on a shallower ramp, so it grows
 * more slowly than the image and appears to sit further away — the parallax is
 * in the rate difference, not in a second scroll calculation. Its colour flips
 * from ink to paper only in the last third, at the point the photograph has
 * actually covered the ground beneath it.
 *
 * This is the transition between two sections rather than a section of its own:
 * it starts on limestone paper, resolves to full-bleed image, and hands over to
 * the dark portfolio index. Nothing is announced; the page simply arrives
 * somewhere else.
 */
export function ExpandingFrame({ locale, media, eyebrow, title, caption }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  // Measured against the pinned travel, and completing at 0.86 of it so the
  // photograph holds full-bleed for a beat before the pin releases. Without
  // that hold it reaches full size exactly as it starts leaving, which reads
  // as the growth being cut off.
  useScrollProgress(sectionRef, { mode: "pinned", to: 0.86 });

  return (
    <section ref={sectionRef} className="expand-section" aria-labelledby="expand-title">
      <div className="expand-stage">
        <div className="expand-frame">
          <Figure ref_={media} locale={locale} sizes="100vw" className="h-full w-full object-cover" />
          {/* Only fades in once the frame is large enough for type to sit on it. */}
          <div aria-hidden className="expand-scrim" />
        </div>

        <div className="expand-type">
          <p className="u-eyebrow expand-eyebrow">{eyebrow}</p>
          <h2 id="expand-title" className="u-display expand-title">
            {title}
          </h2>
          {caption && <p className="expand-caption u-body">{caption}</p>}
        </div>
      </div>
    </section>
  );
}
