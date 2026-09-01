"use client";

import { useId, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ProofPair } from "@/data/types";

type Props = {
  locale: Locale;
  pairs: ProofPair[];
};

/**
 * The full comparison set, under the user's control.
 *
 * The home page drives its single pairing from scroll. Here there are seven,
 * and someone deciding whether to spend twenty years of credit should be able
 * to hold the comparison still, drag it back and forth, and take their time —
 * so the divider is a real control rather than a consequence of scrolling.
 *
 * It is an `<input type="range">` under the styling. That is not laziness: it
 * gives arrow-key and Home/End control, a real value announced to screen
 * readers, and correct touch behaviour, none of which a div with pointer
 * handlers would have without reimplementing all of it badly.
 */
export function ProofGallery({ locale, pairs }: Props) {
  const t = getDictionary(locale);
  const sliderId = useId();
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(50);

  const pair = pairs[index];
  if (!pair) return null;

  return (
    <section
      aria-labelledby="proof-gallery-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4rem, 9vw, 7rem)" }}
    >
      <div className="max-w-[52ch]">
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
          {t.project.proofEyebrow}
        </p>
        <h2
          id="proof-gallery-title"
          className="u-display u-enter mt-5"
          data-reveal="mask"
          data-step="1"
          style={{ fontSize: "var(--text-display)" }}
        >
          <span className="reveal-inner">{t.project.proofTitle}</span>
        </h2>
        <p className="u-body u-enter mt-6" data-step="2" style={{ color: "var(--color-ink-soft)" }}>
          {t.project.proofBody}
        </p>
      </div>

      <div className="mt-12">
        <div
          className="compare relative overflow-hidden"
          style={{ ["--x" as string]: `${position}%`, background: "var(--color-paper-warm)" }}
        >
          <Figure
            key={`${pair.id}-render`}
            ref_={pair.render}
            locale={locale}
            sizes="(min-width: 64rem) 90vw, 100vw"
            ratio="16 / 9"
            className="h-full w-full object-cover"
          />

          <div className="compare__photo absolute inset-0">
            <Figure
              key={`${pair.id}-photo`}
              ref_={pair.photograph}
              locale={locale}
              sizes="(min-width: 64rem) 90vw, 100vw"
              ratio="16 / 9"
              className="h-full w-full object-cover"
            />
          </div>

          <div aria-hidden className="compare__seam" />

          <label htmlFor={sliderId} className="u-visually-hidden">
            {t.project.proofToggle}
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className="compare__range absolute inset-0 h-full w-full"
            aria-valuetext={`${position}% ${t.project.proofReal}`}
          />

          <span
            className="u-eyebrow pointer-events-none absolute bottom-4 start-4 rounded-full px-4 py-2"
            style={{ background: "color-mix(in oklab, var(--color-ink) 78%, transparent)", color: "var(--color-paper)" }}
          >
            {t.project.proofRender}
          </span>
          <span
            className="u-eyebrow u-numeric pointer-events-none absolute bottom-4 end-4 rounded-full px-4 py-2"
            style={{ background: "var(--color-ochre-deep)", color: "var(--color-paper)" }}
          >
            {t.project.proofReal} — {pair.sourceProject[locale]}, {pair.sourceYear}
          </span>
        </div>

        <p className="mt-4" style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}>
          {pair.caption[locale]}
        </p>

        {/* Which room you are comparing. Labelled as a tab set so the
            relationship to the frame above is announced, not implied. */}
        <div
          role="tablist"
          aria-label={t.project.proofEyebrow}
          className="mt-6 flex flex-wrap gap-2"
        >
          {pairs.map((item, itemIndex) => {
            const selected = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setIndex(itemIndex);
                  setPosition(50);
                }}
                className="u-eyebrow inline-flex min-h-11 items-center rounded-full px-4 py-2.5 u-press"
                style={{
                  background: selected ? "var(--color-ink)" : "transparent",
                  color: selected ? "var(--color-paper)" : "var(--color-ink-soft)",
                  border: `1px solid ${selected ? "var(--color-ink)" : "color-mix(in oklab, var(--color-ink) 20%, transparent)"}`,
                }}
              >
                {item.shortLabel[locale]}
              </button>
            );
          })}
        </div>
      </div>

      <p
        className="u-body mt-10"
        style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}
      >
        {t.project.legalRenders}
      </p>
    </section>
  );
}
