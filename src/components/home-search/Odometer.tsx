"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { currentTranslate, glideFrom, reducedMotion } from "./motion";
import s from "./Odometer.module.css";

/** A column-count change glides the figure and the words beside it (transform only). */
const SHIFT_MS = 240;

/**
 * A count whose digits roll like an odometer instead of jumping: each digit
 * is a column 0–9 seen through a one-line window, moved by `transform` only
 * (~240 ms, ease-out).
 *
 * When the number of digits changes (23 → 2, 2 → 23) the figure's width
 * changes with it. Nothing snaps: a digit that goes is lifted out of the
 * flow where it stood and fades up and out; a digit that arrives fades in;
 * the digits that stay — and the element right after the figure (the words
 * "programmes · dans 3 villes" in the hero) — are played from where they
 * stood to their new place (FLIP, measured, so it is right in RTL as well).
 *
 * The rolling columns are decoration (aria-hidden); the real number is in the
 * text for assistive tech and copy-paste. Digits are Latin in both languages
 * (the site's numbering), in an LTR isolate so an Arabic sentence around them
 * cannot reorder them. Reduced motion: every change is instant.
 */
export function Odometer({
  value,
  className,
  ...rest
}: { value: number; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  // A leading digit that goes (23 → 2) fades out where it stood instead of vanishing.
  const [prev, setPrev] = useState(digits);
  const [gone, setGone] = useState<{ id: number; digits: number[] } | null>(null);
  if (prev.join("") !== digits.join("")) {
    setPrev(digits);
    if (digits.length < prev.length) setGone({ id: Date.now(), digits: prev.slice(0, prev.length - digits.length) });
    else if (gone) setGone(null);
  }
  useEffect(() => {
    if (!gone) return;
    const timer = window.setTimeout(() => setGone(null), 160);
    return () => window.clearTimeout(timer);
  }, [gone]);

  /* ---------------------------------------------------------- FLIP ---- */
  const odoRef = useRef<HTMLSpanElement>(null);
  const goneRef = useRef<HTMLSpanElement>(null);
  /** Page x of the leading digit, the units digit and the element after the figure, after the last commit. */
  const placed = useRef<{ lead: number; units: number; follow: number | null; n: number } | null>(null);
  const length = digits.length;
  useLayoutEffect(() => {
    const odo = odoRef.current;
    const cols = odo?.querySelectorAll<HTMLElement>(`.${s.digits} > .${s.col}`);
    if (!odo || !cols?.length) return;
    const follow = odo.nextElementSibling as HTMLElement | null;
    const now = {
      lead: pageX(cols[0]),
      units: pageX(cols[cols.length - 1]),
      follow: follow ? pageX(follow) : null,
      n: cols.length,
    };
    const was = placed.current;
    placed.current = now;
    if (!was || was.n === now.n) return;
    // The digit(s) that went: out of the flow, at the place the old leading digit had.
    const goneEl = goneRef.current;
    if (goneEl) goneEl.style.left = `${was.lead - pageX(odo, false)}px`;
    if (reducedMotion()) return;
    const dx = was.units - now.units;
    // The digits that stayed are the last ones (keyed from the units).
    for (let i = Math.max(0, cols.length - was.n); i < cols.length; i++) {
      glideFrom(cols[i], dx + currentTranslate(cols[i]).x, 0, SHIFT_MS);
    }
    if (follow && was.follow !== null) glideFrom(follow, was.follow - now.follow! + currentTranslate(follow).x, 0, SHIFT_MS);
  }, [length]);
  // The page re-flowing on its own (a resize, fonts): remember the new places, nothing glides.
  useEffect(() => {
    const odo = odoRef.current;
    if (!odo) return;
    const ro = new ResizeObserver(() => {
      const cols = odo.querySelectorAll<HTMLElement>(`.${s.digits} > .${s.col}`);
      if (!cols.length || !placed.current || placed.current.n !== cols.length) return;
      const follow = odo.nextElementSibling as HTMLElement | null;
      placed.current = { lead: pageX(cols[0]), units: pageX(cols[cols.length - 1]), follow: follow ? pageX(follow) : null, n: cols.length };
    });
    ro.observe(odo.parentElement ?? odo);
    return () => ro.disconnect();
  }, []);

  return (
    <span ref={odoRef} className={`${s.odo} ${className ?? ""}`} dir="ltr" {...rest}>
      <span className="u-visually-hidden">{digits.join("")}</span>
      {gone && (
        <span ref={goneRef} key={gone.id} className={s.gone} aria-hidden>
          {gone.digits.map((d, i) => (
            <span key={i} className={s.col}>
              <span className={s.reel} style={{ transform: `translateY(${-d * 10}%)` }}>
                {DIGITS.map((n) => (
                  <span key={n} className={s.digit}>
                    {n}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </span>
      )}
      <span className={s.digits} aria-hidden>
        {/* Keyed from the right (units, tens…), so a new leading digit is the one that mounts. */}
        {digits.map((d, i) => (
          <Column key={digits.length - 1 - i} digit={d} late={mounted.current} />
        ))}
      </span>
    </span>
  );
}

/** An element's layout x on the page (any running transform taken out). */
function pageX(el: HTMLElement, layout = true): number {
  return el.getBoundingClientRect().left + window.scrollX - (layout ? currentTranslate(el).x : 0);
}

/** One digit window. `late`: mounted after the first paint (9 → 10), so it fades in. */
function Column({ digit, late }: { digit: number; late: boolean }) {
  const [isNew] = useState(late);
  return (
    <span className={s.col} data-new={isNew || undefined}>
      <span className={s.reel} style={{ transform: `translateY(${-digit * 10}%)` }}>
        {DIGITS.map((n) => (
          <span key={n} className={s.digit}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

const DIGITS = "0123456789".split("");
