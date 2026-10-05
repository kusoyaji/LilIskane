"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";

/**
 * Lets a section's content leave in step with the page ground turning.
 *
 * The ground is one fixed layer (`Field`) that blends to the next section's
 * tone while that section's top travels from 70% to 50% of the viewport. Type
 * set for the outgoing ground (paper text on ink, ink text on paper) stops
 * reading the moment the ground starts to turn — which is why these joins used
 * to carry half a screen of empty padding: the content had to be gone before
 * the blend began. Fading the content out across the same window lets the
 * padding drop to a normal section margin; the words dissolve as the ground
 * turns instead of sitting illegibly on a half-blended olive.
 *
 * Opacity only. Under reduced motion the field snaps at the midline instead of
 * blending, so the content snaps out at the same line.
 */
export function Handoff({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // The toned wrapper's bottom is exactly where the next ground begins.
    const ground = el?.closest<HTMLElement>("[data-tone]") ?? el?.parentElement;
    if (!el || !ground) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(
        el,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "power1.in",
          scrollTrigger: {
            trigger: ground,
            start: "bottom 72%",
            end: "bottom 50%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Keyed off the start line alone, so a stale end (the page growing
      // after the trigger measured it) can never bring the content back.
      const apply = (self: ScrollTrigger) => gsap.set(el, { opacity: self.scroll() >= self.start ? 0 : 1 });
      const st = ScrollTrigger.create({
        trigger: ground,
        start: "bottom 50%",
        end: "max",
        onUpdate: apply,
        onToggle: apply,
        onRefresh: apply,
      });
      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
