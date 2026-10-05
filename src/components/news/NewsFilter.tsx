"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/components/motion/gsap";
import s from "./news.module.css";

export type NewsFilterId = "all" | "launch" | "company";

/**
 * Category chips over a server-rendered grid.
 *
 * The cards themselves stay server components: they arrive here as children
 * and are hidden by a `data-filter` attribute in CSS, so this island ships no
 * programme data at all — only labels, counts and one piece of state.
 *
 * Changing the filter moves cards up and down the page, which invalidates the
 * scroll reveals' trigger positions, so ScrollTrigger is refreshed after each
 * change; cards whose trigger is now above the fold play in immediately.
 */
export function NewsFilter({
  heading,
  label,
  options,
  announcements,
  children,
}: {
  heading: React.ReactNode;
  label: string;
  options: { id: NewsFilterId; label: string; count: number }[];
  announcements: Record<NewsFilterId, string>;
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState<NewsFilterId>("all");
  const [touched, setTouched] = useState(false);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!touched) return;
    // Once the reader filters, the cards stop being a scroll reveal: every
    // pending reveal inside the grid is completed and its trigger dropped, so
    // a card that moves into view is never left waiting at opacity 0 for a
    // trigger position that no longer exists. The CSS entrance on the grid
    // takes over from here. Everything else on the page is re-measured.
    const el = grid.current;
    if (el) {
      ScrollTrigger.getAll().forEach((st) => {
        const target = st.trigger;
        if (target instanceof Element && el.contains(target)) {
          st.animation?.progress(1);
          st.kill();
        }
      });
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [filter, touched]);

  return (
    <>
      <div className={s.listHead}>
        {heading}
        <div role="group" aria-label={label} className={`u-enter ${s.chips}`}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              className={s.chip}
              aria-pressed={filter === o.id}
              onClick={() => {
                setTouched(true);
                setFilter(o.id);
              }}
            >
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="u-visually-hidden" aria-live="polite">
        {touched ? announcements[filter] : ""}
      </p>
      <div ref={grid} className={s.grid} data-filter={filter} data-touched={touched ? "" : undefined}>
        {children}
      </div>
    </>
  );
}
