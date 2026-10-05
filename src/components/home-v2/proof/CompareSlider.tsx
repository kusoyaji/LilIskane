"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Figure } from "@/components/media/Figure";
import type { ResolvedMediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import s from "./ProofCompare.module.css";

export type ComparePair = {
  id: string;
  label: string;
  caption: string;
  render: ResolvedMediaRef;
  photograph: ResolvedMediaRef;
  source: string;
  sourceYear?: string;
};

type Copy = {
  drag: string;
  renderTag: string;
  renderNote: string;
  deliveryWord: string;
  realTag: string;
  realNote: string;
  sliderLabel: string;
  sliderValue: string;
  pairsLabel: string;
  legal: string;
};

const SIZES = "(min-width: 64rem) 96vw, 100vw";

/**
 * The drag-to-compare frame.
 *
 * The seam is drawn with transforms only. The render sits in a clipping box
 * that is *translated* so its inline-end edge lands on the seam, and the image
 * inside is counter-translated by the same amount so it stays put — the same
 * visual as animating `clip-path`, but composited instead of repainted on every
 * pointer move. The position lives in one CSS custom property written straight
 * to the frame, so dragging never re-renders React (and never re-renders the
 * images).
 *
 * The render always occupies the *start* side: left in French, right in
 * Arabic, which is also what the copy above says. `--dir` flips the
 * translations; nothing else in the stylesheet needs to know the direction.
 *
 * Input: mouse jumps the seam on press and drags; touch only drags (with
 * `touch-action: pan-y`, a vertical swipe still scrolls the page, and the
 * browser cancels our pointer rather than fighting it); the knob is a real
 * `role="slider"` with arrow keys, Shift for big steps, Home/End.
 */
export function CompareSlider({
  locale,
  pairs,
  initialId,
  renderName,
  renderYear,
  copy,
}: {
  locale: Locale;
  pairs: ComparePair[];
  initialId: string;
  renderName: string;
  renderYear: string;
  copy: Copy;
  countLabel?: string;
}) {
  const rtl = locale === "ar";
  const frameId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const touched = useRef(false);
  const sweep = useRef<number | null>(null);

  const [activeId, setActiveId] = useState(
    pairs.some((p) => p.id === initialId) ? initialId : pairs[0]!.id,
  );
  // Pairs whose images have been asked for. The active one always is; the
  // others are warmed when a chip is hovered or focused, so a click during the
  // meeting swaps instantly instead of waiting on a 2560px download.
  const [warm, setWarm] = useState<string[]>([]);
  const [hinted, setHinted] = useState(false);

  const pair = pairs.find((p) => p.id === activeId) ?? pairs[0]!;

  const apply = useCallback(
    (value: number) => {
      const v = Math.min(100, Math.max(0, value));
      pos.current = v;
      const frame = frameRef.current;
      const knob = knobRef.current;
      if (frame) {
        frame.style.setProperty("--p", v.toFixed(2));
        frame.dataset.edge = v < 14 ? "start" : v > 86 ? "end" : "";
      }
      if (knob) {
        const n = Math.round(v);
        knob.setAttribute("aria-valuenow", String(n));
        knob.setAttribute("aria-valuetext", copy.sliderValue.replace("{n}", String(n)));
      }
    },
    [copy.sliderValue],
  );

  const stopSweep = useCallback(() => {
    if (sweep.current !== null) cancelAnimationFrame(sweep.current);
    sweep.current = null;
  }, []);

  const interact = useCallback(() => {
    touched.current = true;
    stopSweep();
    setHinted(true);
  }, [stopSweep]);

  /** Seam position from a pointer, measured from the start edge. */
  const fromPointer = useCallback(
    (clientX: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const box = frame.getBoundingClientRect();
      const frac = (clientX - box.left) / box.width;
      apply((rtl ? 1 - frac : frac) * 100);
    },
    [apply, rtl],
  );

  useEffect(() => {
    apply(pos.current);
  }, [apply]);

  // One demonstration sweep the first time the frame is properly in view, so
  // the room sees that it moves before anyone has touched it. Skipped under
  // reduced motion, and abandoned the instant someone takes hold of the seam.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || touched.current) return;
        io.disconnect();
        const keys = [50, 80, 22, 50];
        const seg = 760;
        const t0 = performance.now() + 350;
        const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const tick = (now: number) => {
          if (touched.current) return;
          const t = Math.max(0, now - t0);
          const i = Math.min(keys.length - 2, Math.floor(t / seg));
          const local = Math.min(1, (t - i * seg) / seg);
          apply(keys[i]! + (keys[i + 1]! - keys[i]!) * ease(local));
          if (t < seg * (keys.length - 1)) {
            sweep.current = requestAnimationFrame(tick);
          } else {
            sweep.current = null;
          }
        };
        sweep.current = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(frame);
    return () => {
      io.disconnect();
      stopSweep();
    };
  }, [apply, stopSweep]);

  const dragging = useRef<number | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    interact();
    dragging.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    frameRef.current?.setAttribute("data-dragging", "true");
    if (event.pointerType === "mouse") fromPointer(event.clientX);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    fromPointer(event.clientX);
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    dragging.current = null;
    frameRef.current?.removeAttribute("data-dragging");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    // Arrow keys move the seam the way the arrow points on screen; the value
    // is "share of the frame showing the render", measured from the start side.
    const physical = rtl ? -1 : 1;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = pos.current + step * physical;
        break;
      case "ArrowLeft":
        next = pos.current - step * physical;
        break;
      case "ArrowUp":
      case "PageUp":
        next = pos.current + (event.key === "PageUp" ? 10 : step);
        break;
      case "ArrowDown":
      case "PageDown":
        next = pos.current - (event.key === "PageDown" ? 10 : step);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 100;
        break;
    }
    if (next === null) return;
    event.preventDefault();
    interact();
    apply(next);
  };

  const choose = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    interact();
    apply(50);
  };

  const warmUp = (id: string) => {
    if (id === activeId) return;
    setWarm((list) => (list.includes(id) ? list : [...list, id]));
  };

  return (
    <div className={s.stageWrap}>
      <div className={s.stage} data-reveal="media">
        <div
          id={frameId}
          ref={frameRef}
          className={s.frame}
          style={{ ["--p" as string]: "50", ["--dir" as string]: rtl ? "-1" : "1" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="group"
          aria-label={`${pair.label} — ${copy.sliderLabel}`}
        >
          {/* Warmed pairs: laid out, invisible, so their files are already in
              cache when chosen. */}
          {warm
            .filter((id) => id !== activeId)
            .map((id) => {
              const w = pairs.find((p) => p.id === id);
              if (!w) return null;
              return (
                <div key={`warm-${id}`} className={s.warm} aria-hidden>
                  <Figure ref_={w.photograph} locale={locale} sizes={SIZES} className={s.img} />
                  <Figure ref_={w.render} locale={locale} sizes={SIZES} className={s.img} />
                </div>
              );
            })}

          <div key={`photo-${pair.id}`} className={`${s.layer} ${s.swap}`}>
            <Figure ref_={pair.photograph} locale={locale} sizes={SIZES} className={s.img} />
          </div>

          <div className={s.clipOuter}>
            <div key={`render-${pair.id}`} className={`${s.clipInner} ${s.swap}`}>
              <Figure ref_={pair.render} locale={locale} sizes={SIZES} className={s.img} />
            </div>
          </div>

          <div aria-hidden className={s.scrim} />

          <div className={`${s.tag} ${s.tagRender}`}>
            <span className={`u-eyebrow ${s.tagKicker}`}>{copy.renderTag}</span>
            <span className={s.tagName}>
              {renderName}
              {renderYear && (
                <span className={s.tagMeta}>
                  {" "}
                  · {copy.deliveryWord} {renderYear}
                </span>
              )}
            </span>
            <span className={s.tagNote}>{copy.renderNote}</span>
          </div>

          <div className={`${s.tag} ${s.tagReal}`}>
            <span className={`u-eyebrow ${s.tagKicker} ${s.tagKickerReal}`}>{copy.realTag}</span>
            <span className={s.tagName}>
              {pair.source}
              {pair.sourceYear && <span className={s.tagMeta}> · {pair.sourceYear}</span>}
            </span>
            <span className={s.tagNote}>{copy.realNote}</span>
          </div>

          <div className={s.seamLayer}>
            <div aria-hidden className={s.seam} />
            <div
              ref={knobRef}
              className={s.knob}
              role="slider"
              tabIndex={0}
              aria-label={copy.sliderLabel}
              aria-controls={frameId}
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext={copy.sliderValue.replace("{n}", "50")}
              onKeyDown={onKeyDown}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden focusable="false">
                <path
                  d="M10 8l-6 6 6 6M18 8l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={s.knobHint} data-hidden={hinted || undefined}>
                {copy.drag}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`u-shell ${s.below}`}>
        <div role="tablist" aria-label={copy.pairsLabel} className={s.chips}>
          {pairs.map((p, index) => {
            const selected = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={frameId}
                className={`u-press ${s.chip}`}
                data-active={selected || undefined}
                onClick={() => choose(p.id)}
                onPointerEnter={() => warmUp(p.id)}
                onFocus={() => warmUp(p.id)}
              >
                <span className={s.chipIndex} aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
        <div className={s.captionBlock}>
          <p className={s.caption} aria-live="polite">
            {pair.caption}
          </p>
          <p className={s.legal}>{copy.legal}</p>
        </div>
      </div>
    </div>
  );
}
