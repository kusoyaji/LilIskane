"use client";

import { Figure } from "@/components/media/Figure";
import { Depth, DepthField } from "@/components/motion/Depth";
import { DEPTH_PLATES } from "@/data/interstitial";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
};

/**
 * The breathing space between the reading half of the page and the portfolio.
 *
 * Not a gallery. A gallery asks to be read — equal tiles, equal weight, each one
 * a thing you study in turn. This is meant to be *passed through*: four
 * fragments at four distances, drifting at four rates, with a line of type
 * holding still in the middle of them. It carries the range of the work without
 * asking anyone to examine four small pictures.
 *
 * Three layers of motion, deliberately stacked, because any one of them alone
 * reads as static:
 *
 *   - **Drift.** Each plate translates at a rate set by its depth. The effect is
 *     entirely in the *difference* between rates; four plates moving at similar
 *     speeds read as one sheet sliding.
 *   - **Arrival.** Each plate settles out of scale and up from below as it
 *     enters, staggered, so the field assembles rather than appearing.
 *   - **Response.** Hovering lifts the plate, pushes into the image, and brings
 *     up its label.
 *
 * That third layer was missing entirely in the first version — the plates
 * carried `pointer-events: none`, which made hover impossible rather than merely
 * unstyled. Interactivity is the difference between a backdrop and a surface you
 * believe you could touch.
 *
 * The whole band shares one scroll subscription; each plate multiplies that one
 * value by its own depth. A listener per image is how this technique becomes the
 * jank it exists to avoid.
 */
export function DepthInterstitial({ locale, eyebrow, title }: Props) {
  return (
    <DepthField tone="warm" className="interstitial">
      {/* Type leads, then the field. Centring the heading inside the plates is
          what pushed them to the edges and opened the hole in the middle. */}
      <div className="interstitial__type">
        <p className="u-eyebrow" style={{ color: "var(--color-ochre-deep)" }}>
          {eyebrow}
        </p>
        <h2
          className="u-display u-enter mt-5"
          data-reveal="mask"
          data-step="1"
          style={{ fontSize: "var(--text-display)" }}
        >
          <span className="reveal-inner">{title}</span>
        </h2>
      </div>

      <div className="interstitial__plates">
        {DEPTH_PLATES.map((plate, index) => (
          <Depth key={plate.media.key} depth={plate.depth} className="interstitial__plate">
            <figure
              className="interstitial__card u-enter"
              data-step={index + 1}
              style={{ ["--tilt" as string]: `${plate.tilt}deg` }}
            >
              <span className="interstitial__crop">
                <Figure
                  ref_={plate.media}
                  locale={locale}
                  sizes="(min-width: 64rem) 24vw, 46vw"
                  className="h-full w-full object-cover"
                />
              </span>
              <figcaption className="u-eyebrow interstitial__label">
                {plate.label[locale]}
              </figcaption>
            </figure>
          </Depth>
        ))}
      </div>

    </DepthField>
  );
}
