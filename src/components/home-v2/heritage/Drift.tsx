"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/motion/gsap";

/**
 * Slides its content along the inline axis while it crosses the viewport —
 * a slow, scrubbed drift that gives a monumental figure the sense of being
 * passed rather than printed. Mirrors in RTL. Transform only; nothing happens
 * under reduced motion.
 */
export function Drift({
  children,
  from = 6,
  to = -6,
  className,
}: {
  children: React.ReactNode;
  /** xPercent at the moment the element enters from below (LTR). */
  from?: number;
  /** xPercent as it leaves at the top (LTR). */
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const dir = document.documentElement.dir === "rtl" ? -1 : 1;
      const tween = gsap.fromTo(
        el,
        { xPercent: from * dir },
        {
          xPercent: to * dir,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, [from, to]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
