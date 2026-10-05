"use client";

import { useEffect, useState } from "react";
import s from "./Guide.module.css";

export type IndexStep = { n: number; short: string; phase: 0 | 1 | 2 };

/**
 * The guide's spine, as a reader-tracking index.
 *
 * Desktop: a sticky column listing all eight steps grouped by phase, with a
 * rule that fills as the reader advances. Mobile: a slim sticky bar under the
 * header saying where you are ("03 / 08 · Préparer le financement").
 *
 * The page renders one index per chapter (the simulator interlude sits
 * between them), so the active step is decided from every step on the page,
 * not only the ones in this chapter — both instances always agree.
 *
 * Only `transform` is animated (the progress rule), and the highlight is a
 * colour change, so nothing here moves under reduced motion.
 */
export function StepIndex({
  steps,
  phases,
  label,
  stepWord,
  simulateLabel,
  simulateAbove = false,
}: {
  steps: IndexStep[];
  phases: [string, string, string];
  label: string;
  stepWord: string;
  simulateLabel: string;
  /** The second chapter sits below the simulator, so its shortcut points up. */
  simulateAbove?: boolean;
}) {
  const [active, setActive] = useState(0);
  const total = steps.length;

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const nodes = document.querySelectorAll<HTMLElement>("[data-guide-step]");
      const line = window.innerHeight * 0.42;
      let current = 0;
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= line) current = Number(node.dataset.guideStep) - 1;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const progress = (active + 1) / total;
  const current = steps[active] ?? steps[0];

  return (
    <>
      {/* Mobile and tablet: where am I. */}
      <div className={s.bar} aria-hidden>
        <div className={s.barRow}>
          <span className={s.barCount} dir="ltr">
            {pad(current.n)}
            <span className={s.barTotal}> / {pad(total)}</span>
          </span>
          <span className={s.barTitle}>{current.short}</span>
        </div>
        <span className={s.barTrack}>
          <span className={s.barFill} style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>

      {/* Desktop: the whole path, with the reader's position on it. */}
      <nav className={s.index} aria-label={label}>
        <p className="u-eyebrow" style={{ color: "var(--color-ochre-deep)" }}>
          {label}
        </p>
        <div className={s.indexBody}>
          <span className={s.indexTrack} aria-hidden>
            <span className={s.indexFill} style={{ transform: `scaleY(${progress})` }} />
          </span>
          <ol className={s.indexPhases}>
            {phases.map((phase, p) => (
              <li key={phase}>
                <p className={s.indexPhase}>{phase}</p>
                <ol className={s.indexList}>
                  {steps
                    .filter((step) => step.phase === p)
                    .map((step) => {
                      const on = step.n - 1 === active;
                      const done = step.n - 1 < active;
                      return (
                        <li key={step.n}>
                          <a
                            href={`#etape-${step.n}`}
                            className={[s.indexLink, on ? s.indexOn : "", done ? s.indexDone : ""].join(" ")}
                            aria-current={on ? "step" : undefined}
                          >
                            <span className={s.indexNum} dir="ltr">
                              {pad(step.n)}
                            </span>
                            <span>
                              <span className="u-visually-hidden">
                                {stepWord} {step.n} —{" "}
                              </span>
                              {step.short}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                </ol>
              </li>
            ))}
          </ol>
        </div>
        <a href="#simulateur" className={s.indexCta}>
          <span>{simulateLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false" style={simulateAbove ? { transform: "rotate(180deg)" } : undefined}>
            <path d="M12 4v15M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </nav>
    </>
  );
}
