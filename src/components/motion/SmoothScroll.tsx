"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";

/**
 * Weighted scrolling, and the single clock that everything scroll-driven runs on.
 *
 * Two things happen here and the second is the important one.
 *
 * **Lenis** interpolates the wheel's step function so the page carries momentum
 * and settles rather than snapping. It scrolls the *window* natively rather
 * than transforming a wrapper, which is why `position: sticky` still pins and
 * `getBoundingClientRect()` still tells the truth — a transformed wrapper would
 * become the containing block for every fixed and sticky descendant and quietly
 * break every pinned stage on the site.
 *
 * **The bridge** then hands Lenis and ScrollTrigger a shared timebase:
 *
 *   - `lenis.on('scroll', ScrollTrigger.update)` — ScrollTrigger recomputes on
 *     Lenis' interpolated position rather than on the browser's raw scroll
 *     event. Without this the two disagree by however far the easing is behind
 *     the input, and pinned sections visibly lag the content they pin.
 *   - `gsap.ticker.add(...)` drives `lenis.raf` — one requestAnimationFrame loop
 *     for the whole document instead of two competing ones. Two loops means two
 *     layout reads per frame and a guaranteed order-of-operations race between
 *     "where Lenis thinks we are" and "where ScrollTrigger thinks we are".
 *   - `lagSmoothing(0)` — GSAP's default lag smoothing silently jumps the
 *     timeline forward after a slow frame to keep wall-clock time. That is right
 *     for a timed animation and wrong for a scroll-linked one, where the only
 *     correct position is the one the user scrolled to.
 *
 * Both are switched off entirely under `prefers-reduced-motion`: no Lenis
 * instance is created, so the browser's own scrolling is untouched rather than
 * wrapped in a disabled abstraction. ScrollTrigger still runs — sections must
 * still resolve to their end state — but on native scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Plugin registration happens at import time in `./gsap`, not here — child
    // effects run before parent effects, so registering in this layout-level
    // component would leave every section below it creating tweens against an
    // unregistered plugin.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      /**
       * `lerp`, not `duration`. A duration-based scroll restarts a fixed-length
       * animation on every wheel event, so a run of detents reads as a series
       * of short moves stitched together. A lerp eases toward a continuously
       * updated target instead, so consecutive detents accumulate into one
       * unbroken glide that keeps moving after the wheel stops.
       *
       * 0.08 is the low end of usable — below about 0.06 the page travels far
       * enough after input to read as lag rather than momentum.
       */
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      // Touch keeps its native, platform-tuned momentum. A JS approximation is
      // worse on the device class this site is budgeted for.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Pin spacers and section heights are only correct once fonts and images
    // have settled; a refresh on load prevents every pinned section starting
    // life a few hundred pixels out.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return null;
}
