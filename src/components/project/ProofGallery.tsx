"use client";

import { useId, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ProofPair } from "@/data/types";
import st from "./ProofGallery.module.css";

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
    <section aria-labelledby="proof-gallery-title" className={`u-shell ${st.section}`}>
      <header className={st.head}>
        <div className={st.headText}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {t.project.proofEyebrow}
          </p>
          <h2 id="proof-gallery-title" className={`u-display ${st.title}`} data-reveal="mask">
            <span className="reveal-inner">{t.project.proofTitle}</span>
          </h2>
        </div>
        <p className={`u-enter ${st.lead}`}>{t.project.proofBody}</p>
      </header>

      {/* Which room you are comparing — a numbered index rather than pills. */}
      <div role="tablist" aria-label={t.project.proofEyebrow} className={st.tabs}>
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
              className={st.tab}
            >
              <span className={`u-numeric ${st.tabIndex}`}>{String(itemIndex + 1).padStart(2, "0")}</span>
              <span>{item.shortLabel[locale]}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`compare relative overflow-hidden ${st.frame}`}
        style={{ ["--x" as string]: `${position}%` }}
      >
        <Figure
          key={`${pair.id}-render`}
          ref_={pair.render}
          locale={locale}
          sizes="(min-width: 96rem) 88rem, 100vw"
          ratio="16 / 9"
          className="h-full w-full object-cover"
        />

        <div className="compare__photo absolute inset-0">
          <Figure
            key={`${pair.id}-photo`}
            ref_={pair.photograph}
            locale={locale}
            sizes="(min-width: 96rem) 88rem, 100vw"
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

        <span className={`u-eyebrow ${st.chip} ${st.chipRender}`}>{t.project.proofRender}</span>
        <span className={`u-eyebrow u-numeric ${st.chip} ${st.chipReal}`}>
          {t.project.proofReal} — {pair.sourceProject[locale]}, {pair.sourceYear}
        </span>
      </div>

      <div className={st.foot}>
        <p className={st.caption}>{pair.caption[locale]}</p>
        <p className={st.legal}>{t.project.legalRenders}</p>
      </div>
    </section>
  );
}
