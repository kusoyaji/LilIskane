"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { Lattice } from "@/components/v2";
import { isolateRun, type Locale } from "@/i18n/config";
import s from "./Chronology.module.css";

export type ChronoEntry = { year: number; chapter: string; title: string; body: string };

/** Scroll distance given to each date, as a fraction of the viewport height. */
const STEP = 0.62;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Dates clés — the ten milestones as pages turned by the reader's own scroll.
 *
 * The stage pins for the length of the history. A four-digit year the size of
 * the screen rolls like a mechanical counter from one date to the next (each
 * digit is a reel of 0–9 moved by `transform` only), while the chapter, title
 * and text of that date rise into place and the previous one leaves upward.
 * A rail of all ten years runs along the floor; its fill is the reader's exact
 * position in the history, and every year on it is a button that jumps there.
 *
 * Server render and reduced motion get the same content as a plain ordered
 * list — year, chapter, title, text — so nothing depends on the pin to be read.
 * The pinned layout is switched on only inside the
 * `(prefers-reduced-motion: no-preference)` branch of `gsap.matchMedia()`.
 */
export function Chronology({
  locale,
  entries,
  eyebrow,
  title,
  jump,
  of,
}: {
  locale: Locale;
  entries: ChronoEntry[];
  eyebrow: string;
  title: string;
  jump: string;
  of: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const n = entries.length;

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      setPinned(true);
      return () => setPinned(false);
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const stage = stageRef.current;
    if (!stage) return;

    const st = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * STEP * n)}`,
      pin: stage,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const i = Math.min(n - 1, Math.floor(self.progress * n));
        setActive((prev) => (prev === i ? prev : i));
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    triggerRef.current = st;
    // The pin spacer changes the height of everything below it; every trigger
    // created before this one (reveals, the closing band's parallax) has to be
    // remeasured or it fires a full history-length early.
    ScrollTrigger.refresh();

    return () => {
      st.kill();
      triggerRef.current = null;
      ScrollTrigger.refresh();
    };
  }, [pinned, n]);

  const goTo = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = st.start + ((i + 0.5) / n) * (st.end - st.start);
    window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
    setActive(i);
  };

  const year = String(entries[active]?.year ?? "");
  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <section className={s.chrono} data-mode={pinned ? "pinned" : "static"} data-nav-media aria-labelledby="chrono-title">
      <div ref={stageRef} className={s.stage}>
        <Lattice />
        <div className={`u-shell ${s.frame}`}>
          <header className={s.head}>
            <div className={s.headText}>
              <p className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
                {eyebrow}
              </p>
              <h2 id="chrono-title" className={`u-display ${s.title}`} data-reveal="mask">
                <span className="reveal-inner">{title}</span>
              </h2>
            </div>
            {pinned && (
              <p className={`u-numeric ${s.count}`} aria-hidden>
                <span dir="ltr">{pad(active + 1)}</span>
                <span className={s.countOf}>{of}</span>
                <span dir="ltr">{pad(n)}</span>
              </p>
            )}
          </header>

          {pinned && (
            <div className={`u-display ${s.year}`} aria-hidden dir="ltr">
              {year.split("").map((digit, k) => (
                <span key={k} className={s.reelWindow}>
                  <span
                    className={s.reel}
                    style={{ transform: `translateY(${-Number(digit) * 10}%)`, transitionDelay: `${k * 55}ms` }}
                  >
                    {DIGITS.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
              ))}
            </div>
          )}

          <ol className={s.list}>
            {entries.map((entry, i) => (
              <li
                key={entry.year}
                className={s.item}
                data-state={pinned ? (i < active ? "past" : i === active ? "active" : "next") : undefined}
              >
                <p className={`u-display u-numeric ${s.itemYear}`}>{isolateRun(String(entry.year), locale)}</p>
                <div className={s.itemText}>
                  <p className={`u-eyebrow ${s.chapter}`}>{entry.chapter}</p>
                  <h3 className={s.itemTitle}>{entry.title}</h3>
                  <p className={s.itemBody}>{entry.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {pinned && (
            <nav className={s.rail} aria-label={eyebrow}>
              <span className={s.track} aria-hidden>
                <span ref={fillRef} className={s.fill} />
              </span>
              <ol className={s.railList}>
                {entries.map((entry, i) => (
                  <li key={entry.year}>
                    <button
                      type="button"
                      className={s.railBtn}
                      aria-label={`${jump} ${entry.year}`}
                      aria-current={i === active ? "step" : undefined}
                      onClick={() => goTo(i)}
                    >
                      <span className={s.railTick} aria-hidden />
                      <span className={`u-numeric ${s.railYear}`}>{entry.year}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
