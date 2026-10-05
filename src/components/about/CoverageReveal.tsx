"use client";

import { useEffect, useRef } from "react";

/**
 * Draws the guarantee bars out to their length when the chart first comes into
 * view. The server render already shows every bar at its true length; this only
 * *arms* the animation (collapses them) once it knows it can also release it,
 * so a reader without JavaScript or with reduced motion sees the finished chart.
 */
export function CoverageReveal({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.armed = "true";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.in = "true";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
