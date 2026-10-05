"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import type { Locale } from "@/i18n/config";
import s from "./Showcase.module.css";

export type FilterChip = { id: string; label: string; count: string };

/**
 * The portfolio rail: segment filter + horizontal pan.
 *
 * On a wide screen with motion allowed, the stage pins and vertical scroll
 * drives the track sideways (the TourCards technique: the distance is the
 * track's measured overflow, re-measured on refresh, so the last card lands
 * flush as the pin releases whatever the filter leaves on screen). Everywhere
 * else — phones, tablets, reduced motion — the track is a native horizontal
 * scroller with snap points, which is what a thumb expects and what a pin
 * would only fight.
 *
 * Filtering never re-renders a card: the cards are server markup passed in as
 * children, and a filter only toggles their `hidden` attribute. The visible
 * index ("01", "02"…) is a CSS counter, so it renumbers itself for free.
 */
export function ShowcaseRail({
  locale,
  chips,
  filterLabel,
  scrollHint,
  head,
  children,
}: {
  locale: Locale;
  chips: FilterChip[];
  filterLabel: string;
  scrollHint: string;
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [filter, setFilter] = useState("all");
  const first = useRef(true);

  const setProgress = (p: number) => {
    const bar = barRef.current;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p)).toFixed(4)})`;
  };

  // Pinned pan, wide screens with motion only.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
      section.dataset.pinned = "true";
      const rtl = document.documentElement.dir === "rtl";
      const shift = () => Math.max(0, track.scrollWidth - track.clientWidth);

      const pan = gsap.to(track, {
        x: () => (rtl ? shift() : -shift()),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // A little less scroll than pan: fourteen programmes should not
          // cost six screens of wheel.
          end: () => `+=${Math.max(1, shift() * 0.8)}`,
          pin: stage,
          anticipatePin: 1,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });
      triggerRef.current = pan.scrollTrigger ?? null;
      ScrollTrigger.refresh();

      return () => {
        triggerRef.current = null;
        pan.scrollTrigger?.kill();
        pan.kill();
        gsap.set(track, { clearProps: "transform" });
        delete section.dataset.pinned;
      };
    });
    return () => mm.revert();
  }, []);

  // Native scroller progress (phones, reduced motion).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = () => {
      if (sectionRef.current?.dataset.pinned) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      setProgress(max > 0 ? Math.abs(viewport.scrollLeft) / max : 0);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  // Apply the filter.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const shown: HTMLElement[] = [];
    items.forEach((item) => {
      const seg = item.dataset.segment;
      const visible = filter === "all" || seg === "end" || seg === filter;
      item.hidden = !visible;
      if (visible) shown.push(item);
    });

    if (first.current) {
      first.current = false;
      return;
    }

    const trigger = triggerRef.current;
    if (trigger) {
      const wasInside = window.scrollY > trigger.start;
      ScrollTrigger.refresh();
      if (wasInside) window.scrollTo({ top: trigger.start, behavior: "instant" as ScrollBehavior });
    } else {
      viewportRef.current?.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
      setProgress(0);
    }

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.slice(0, 5).forEach((item, i) => {
        item.animate(
          [
            { opacity: 0, transform: "translateY(28px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 520, delay: i * 55, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" },
        );
      });
    }
  }, [filter]);

  // Keyboard: in the pinned pan the track is moved by transform and the
  // viewport clips, so a focused card can sit off-screen. Move the page to the
  // scroll position that brings it into view instead.
  const onFocusIn = (event: React.FocusEvent<HTMLUListElement>) => {
    const trigger = triggerRef.current;
    const track = trackRef.current;
    if (!trigger || !track) return;
    const item = (event.target as HTMLElement).closest("li");
    if (!item) return;
    const shift = track.scrollWidth - track.clientWidth;
    if (shift <= 0) return;
    const rtl = document.documentElement.dir === "rtl";
    const pad = parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
    const fromStart = rtl ? track.clientWidth - (item.offsetLeft + item.offsetWidth) : item.offsetLeft;
    const progress = Math.min(1, Math.max(0, (fromStart - pad) / shift));
    window.scrollTo({ top: trigger.start + progress * (trigger.end - trigger.start), behavior: "instant" as ScrollBehavior });
  };

  return (
    <section ref={sectionRef} className={s.section} aria-labelledby="showcase-title" data-locale={locale}>
      <div ref={stageRef} className={s.stage}>
        <div className={`u-shell ${s.head}`}>
          {head}
          <div className={`u-enter ${s.controls}`}>
            <div role="group" aria-label={filterLabel} className={s.chips}>
              {chips.map((chip) => {
                const active = chip.id === filter;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={`u-press ${s.chip}`}
                    aria-pressed={active}
                    data-active={active || undefined}
                    onClick={() => setFilter(chip.id)}
                  >
                    <span>{chip.label}</span>
                    <span className={s.chipCount}>{chip.count}</span>
                  </button>
                );
              })}
            </div>
            <div className={s.progressRow} aria-hidden>
              <span className={s.progressTrack}>
                <span ref={barRef} className={s.progressBar} />
              </span>
              <span className={`u-eyebrow ${s.hint}`}>{scrollHint}</span>
            </div>
          </div>
        </div>

        <div ref={viewportRef} className={s.viewport}>
          <ul ref={trackRef} className={s.track} onFocus={onFocusIn}>
            {children}
          </ul>
        </div>
      </div>
    </section>
  );
}
