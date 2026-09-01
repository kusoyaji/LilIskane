"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { MediaRef } from "@/data/types";

export type HeroSlide = {
  slug: string;
  /** The switcher's label, and the only word in the sentence that changes. */
  city: string;
  /** The non-contractual disclosure, already composed for this programme. */
  disclosure: string;
  cta: string;
  href: string;
  media: MediaRef;
};

type Props = {
  locale: Locale;
  slides: HeroSlide[];
};

/**
 * The thesis, held still, while the country moves underneath it.
 *
 * The headline never moves and never changes — it is the claim the entire site
 * is built to pay off, and letting it animate or swap would make it read as
 * copy rather than as a statement. What changes is the ground: four programmes
 * in four cities, each of them a render, crossfading behind a sentence that
 * stays exactly where it is.
 *
 * The switcher is driven by click, not by scroll. That distinction matters
 * here: an earlier hero dissolved a render into a photograph as you scrolled
 * and had to be cut, because the type sits at the foot of the viewport and the
 * payoff had already scrolled past before it finished. Anything scroll-driven
 * in this section inherits that bug. A control the visitor operates does not —
 * it fires when they are looking at it, by definition.
 *
 * Only the first frame is in the document on load. The other three mount the
 * moment the visitor reaches for the switcher — a pointer entering it, a key
 * focusing it, or a tap — and not before. Warming them speculatively on idle
 * was measured at roughly 900 KB of full-bleed imagery fetched for every
 * visitor, the large majority of whom never touch the control; paying that on
 * approach instead means the cost falls on the people who actually switch.
 * Because `onPointerEnter` fires before the click that follows it, a mouse user
 * has the frame decoded by the time they commit; a touch user meets a single
 * short crossfade over the blur placeholder on their first tap.
 */
export function Hero({ locale, slides }: Props) {
  const t = getDictionary(locale);
  const [index, setIndex] = useState(0);
  const [warm, setWarm] = useState(false);

  const heat = useCallback(() => setWarm(true), []);

  // The media holds back as the page leaves it, so the type slides away over a
  // frame that is still settling rather than the whole screen moving as one
  // sheet. This is the parallax that makes weighted scrolling *visible* —
  // interpolated scroll on a rigid page is felt but barely seen, because
  // nothing on screen reports the difference.
  const sectionRef = useRef<HTMLElement>(null);
  useScrollProgress(sectionRef, { property: "--hero-p" });

  const active = slides[index] ?? slides[0];

  return (
    <section
      ref={sectionRef}
      data-nav-media
      data-tone="ink"
      className="hero"
      aria-labelledby="hero-title"
    >
      <div className="hero__frames">
        {slides.map((slide, i) =>
          i === 0 || warm ? (
            <div
              key={slide.slug}
              className="hero__frame"
              data-active={i === index || undefined}
              // Only the visible frame is exposed; four stacked alt texts would
              // otherwise all be read out in order.
              aria-hidden={i !== index || undefined}
              // The inactive frames must not be reachable or paintable as
              // content once they are behind — they are a background, not a
              // gallery.
              inert={i !== index}
            >
              <Figure
                ref_={slide.media}
                locale={locale}
                sizes="100vw"
                priority={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null,
        )}
      </div>

      <div aria-hidden className="hero__scrim" />

      <div className="on-media hero__type">
        {/* The switcher sits in the eyebrow slot and completes a sentence:
            "Vivre à Marrakech". Making the control read as language rather than
            as a row of filter chips is the difference between a hero and a
            product page. */}
        <div className="hero__switch u-enter">
          <span className="u-eyebrow hero__switch-lead">{t.home.heroSwitchLead}</span>

          <div className="hero__switch-options" role="group" aria-label={t.home.heroSwitchLabel}>
            {slides.map((slide, i) => (
              <button
                key={slide.slug}
                type="button"
                // Warm on the same gesture that selects, so a direct tap with
                // no preceding hover still mounts the target frame. `heat` runs
                // first; the frame is in the tree in the same render that makes
                // it active, and crossfades up over its blur placeholder.
                onClick={() => {
                  heat();
                  setIndex(i);
                }}
                onPointerEnter={heat}
                onFocus={heat}
                aria-pressed={i === index}
                className="u-eyebrow u-press hero__switch-option"
                data-active={i === index || undefined}
              >
                {slide.city}
              </button>
            ))}
          </div>
        </div>

        <h1
          id="hero-title"
          className="u-display u-enter mt-5"
          data-reveal="mask"
          data-step="1"
          style={{ fontSize: "var(--text-mega)", color: "var(--color-paper)" }}
        >
          <span className="reveal-inner">
            {t.home.heroLine1}
            <br />
            {t.home.heroLine2}
          </span>
        </h1>

        <div
          className="u-enter mt-10 grid gap-x-12 gap-y-8 pt-8 lg:grid-cols-[minmax(0,44ch)_auto] lg:items-end lg:justify-between"
          data-step="2"
          style={{
            borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 28%, transparent)",
          }}
        >
          <div>
            <p
              className="u-body"
              style={{ color: "color-mix(in oklab, var(--color-paper) 88%, transparent)" }}
            >
              {t.home.heroBody}
            </p>

            {/* The disclosure names the programme currently on screen, so it
                stays true as the ground changes. Announced politely rather than
                silently swapped — the sentence it belongs to is the legal one. */}
            <p
              className="u-eyebrow mt-6"
              aria-live="polite"
              style={{ color: "color-mix(in oklab, var(--color-paper) 64%, transparent)" }}
            >
              {active.disclosure}
            </p>
          </div>

          <Link
            href={active.href}
            className="u-eyebrow justify-self-start rounded-full px-8 py-4 u-press lg:justify-self-end"
            style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
          >
            {active.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
