"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import s from "./Flagship.module.css";

/**
 * A row of rooms that drifts sideways as the page is scrolled past it.
 *
 * Not pinned: the strip travels exactly its own overflow while it crosses the
 * viewport, so the first room is flush with the column as it arrives and the
 * last is flush with the far edge as it leaves — the reader keeps scrolling
 * down and the apartment slides by. The distance is measured, never guessed,
 * and re-measured on resize.
 *
 * On phones, and under reduced motion, there is no drift: the row is a
 * native horizontal scroller with snap points, which is what a thumb expects.
 */
export function Strip({ children, label }: { children: React.ReactNode; label: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 48rem)", () => {
      viewport.dataset.drift = "true";
      const rtl = document.documentElement.dir === "rtl";
      const shift = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      const tween = gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => (rtl ? shift() : -shift()),
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            start: "top 82%",
            end: "bottom 12%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        delete viewport.dataset.drift;
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={viewportRef} className={s.stripViewport} role="region" aria-label={label} tabIndex={0}>
      <ul ref={trackRef} className={s.stripTrack}>
        {children}
      </ul>
    </div>
  );
}
