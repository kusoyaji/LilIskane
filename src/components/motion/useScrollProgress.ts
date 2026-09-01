"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  /** Where in the element's travel the progress starts and ends, 0–1. */
  from?: number;
  to?: number;
  /** CSS custom property to write on the element. */
  property?: string;
  /**
   * `"viewport"` measures the element crossing the whole viewport — right for a
   * block that reveals as it passes.
   *
   * `"pinned"` measures only the stretch during which a sticky child is held,
   * which is the correct frame of reference for a section with `position:
   * sticky` inside it. Getting this wrong is subtle and costly: with the
   * viewport measure, a pinned section's progress reaches roughly 0.7 by the
   * time the pin releases, so any animation mapped to it silently never
   * completes — an image that should finish full-bleed stops at 89%.
   */
  mode?: "viewport" | "pinned";
};

/**
 * Writes the element's scroll progress into a CSS custom property.
 *
 * The value is written straight to a custom property rather than into React
 * state on purpose: re-rendering a component sixty times a second to animate an
 * opacity is how scroll effects come to jank on the mid-range Android this site
 * is budgeted for. Here React renders once, and the only per-frame work is a
 * single `setProperty` on one element, with the actual compositing left to CSS.
 *
 * Returns nothing — consumers read `var(--p)` in their styles.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { from = 0, to = 1, property = "--p", mode = "viewport" }: Options = {},
) {
  const frame = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Under reduced motion we write nothing at all and attach no listener, so
    // the stylesheet's own value for the property wins. That lets a component
    // define its reduced-motion end state in CSS — typically both frames shown
    // side by side rather than one hidden behind the other — instead of being
    // pinned to whatever the animation's first frame happened to be.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const update = () => {
      frame.current = 0;
      const rect = element.getBoundingClientRect();

      let travelled: number;
      if (mode === "pinned") {
        // Only the stretch a sticky child is actually held for.
        const distance = rect.height - window.innerHeight;
        if (distance <= 0) return;
        travelled = -rect.top / distance;
      } else {
        const distance = rect.height + window.innerHeight;
        if (distance <= 0) return;
        travelled = (window.innerHeight - rect.top) / distance;
      }

      const scaled = (travelled - from) / (to - from || 1);
      element.style.setProperty(property, String(Math.min(1, Math.max(0, scaled))));
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, from, to, property, mode]);
}
