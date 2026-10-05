"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * The page's ground, owned by the page instead of by each section.
 *
 * Sections used to paint their own backgrounds, and that is what put a hard
 * edge everywhere two of them met — limestone stopping dead against ink. The
 * fix is not to bridge each join one at a time (which is what the expanding
 * frame was doing) but to move the background up a level: a single fixed layer
 * behind everything, whose colour is decided by whichever section currently
 * owns the middle of the viewport and blended toward the next as it comes.
 *
 * Sections opt in with `data-tone` and stop setting a background at all, so
 * there is no edge left to see anywhere on the page.
 *
 * Mounted in the locale layout rather than inside `template.tsx` on purpose.
 * The route wrapper is animated, and a transform there becomes the containing
 * block for every fixed descendant — the same trap that is already documented
 * against the pinned stages. A `position: fixed` field placed inside it would
 * stop being fixed to the viewport the moment a route transition ran.
 */
const TONES: Record<string, string> = {
  paper: "var(--color-paper)",
  warm: "var(--color-paper-warm)",
  sand: "var(--color-sand)",
  ink: "var(--color-ink)",
};

const toneOf = (value: string | undefined) => TONES[value ?? ""] ?? TONES.paper;

export function Field({ initialTone = "paper" }: { initialTone?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Colour is not movement, so the field keeps running under reduced motion —
    // switching it off would leave every `data-tone` section with no background
    // at all. What reduced motion drops is the *blend*: the ground snaps at the
    // boundary instead of crossfading across it.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let sections: HTMLElement[] = [];
    // The field only earns its keep where there are at least two tones to blend
    // between. A page with one toned section or none (the project page has just
    // the footer; search has none) gets no gradient out of it — only a fixed,
    // full-viewport compositing layer painting a flat colour behind sections
    // that already draw their own backgrounds. On the project page that layer
    // sits under a continuously-seeking video, which is the last place to spend
    // a needless full-screen composite. So when there is nothing to blend the
    // element is removed from the paint tree entirely and the scroll work is
    // skipped; `display: none` also drops it as a stacking/compositing cost, not
    // merely hides it.
    let active = false;
    const collect = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
      active = sections.length >= 2;
      el.style.display = active ? "" : "none";
    };

    const update = () => {
      frame.current = 0;
      if (!active) return;

      // Whatever sits under the middle of the viewport owns the ground. Keying
      // off the midline rather than the top edge means a section takes the
      // page's colour while it holds the screen, not as it first peeks in.
      const line = window.innerHeight / 2;

      let index = -1;
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].getBoundingClientRect().top <= line) index = i;
      }

      const current = sections[Math.max(0, index)];
      const next = sections[index + 1];
      const from = toneOf(current.dataset.tone);
      const to = next ? toneOf(next.dataset.tone) : from;

      let t = 0;
      if (next && !reduced) {
        // Blended across a fifth of a viewport, finishing exactly as the
        // incoming section reaches the midline — the moment ownership switches,
        // so there is no jump when `index` advances.
        //
        // This was two-thirds of a viewport. That started the blend the moment
        // the next section peeked in at the bottom, and left the last half
        // screen of every section — its closing figures, captions, fine print
        // — sitting on a mid-tone olive-grey where neither light nor dark type
        // reads. Six independent reviews of the v2 build flagged it. A short
        // blend still reads as the ground turning, not as a cut, and costs
        // legibility for a fifth of a screen instead of half of one.
        const span = window.innerHeight * 0.2;
        const remaining = next.getBoundingClientRect().top - line;
        t = Math.min(1, Math.max(0, 1 - remaining / span));
      }

      el.style.setProperty("--field-from", from);
      el.style.setProperty("--field-to", to);
      el.style.setProperty("--field-t", String(t));
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(update);
    };

    collect();
    update();

    // Toned sections arrive and leave on client navigation, so the list is
    // rebuilt rather than captured once at mount.
    const mutations = new MutationObserver(() => {
      collect();
      onScroll();
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      mutations.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="field"
      // Server-rendered at the first section's tone so the page is never briefly
      // the wrong colour between paint and hydration.
      style={
        {
          "--field-from": toneOf(initialTone),
          "--field-to": toneOf(initialTone),
        } as React.CSSProperties
      }
    />
  );
}
