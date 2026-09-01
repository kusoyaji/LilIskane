"use client";

import { useEffect, useState } from "react";

/**
 * True while a full-bleed media block sits under the header strip.
 *
 * The usual implementation is a scroll listener with a hard-coded pixel
 * threshold, which breaks the moment a page puts media anywhere other than the
 * top — and this site does exactly that: the project page has media blocks
 * halfway down, and the header has to go light again over each of them.
 *
 * Instead we make the observer root a strip the height of the header at the top
 * of the viewport, and ask which elements intersect it. Any section that wants
 * a light header marks itself `data-nav-media`. No thresholds, no scroll
 * handler, and it stays correct when sections are reordered.
 */
export function useNavOverMedia(): boolean {
  const [overMedia, setOverMedia] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const navHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;

    const active = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        }
        setOverMedia(active.size > 0);
      },
      {
        // Collapse the root to a strip `navHeight` tall at the very top.
        rootMargin: `0px 0px -${Math.max(0, window.innerHeight - navHeight)}px 0px`,
        threshold: 0,
      },
    );

    const targets = document.querySelectorAll("[data-nav-media]");
    if (targets.length === 0) {
      setOverMedia(false);
      return;
    }
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return overMedia;
}
