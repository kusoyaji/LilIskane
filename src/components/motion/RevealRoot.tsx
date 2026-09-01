"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One IntersectionObserver for the whole document.
 *
 * Mounting an observer per animated element is the usual pattern and it is
 * wasteful: this page has upwards of sixty revealed blocks. A single observer
 * plus a MutationObserver for client-navigated content costs about a kilobyte
 * and scales flat.
 *
 * Elements opt in with `class="u-enter"`. The observer only ever writes
 * `data-visible`; all timing lives in CSS, which is what lets the
 * reduced-motion media query switch the whole system off without any JS
 * branching.
 */
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    // Reduced-motion users get the final state immediately. We still set the
    // attribute rather than skipping it, so nothing depends on the animation
    // having run.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      // Fire while the block is still below the fold. Two reasons: a reveal the
      // user watches *start* reads as a delay rather than as motion, and firing
      // early is what lets one section begin arriving while the previous is
      // still leaving — the overlap that makes a long page feel continuous
      // instead of sectioned.
      { rootMargin: "0px 0px -4% 0px", threshold: 0.01 },
    );

    const register = () => {
      const nodes = document.querySelectorAll<HTMLElement>(".u-enter:not([data-visible])");
      nodes.forEach((node) => {
        if (reduced) {
          node.setAttribute("data-visible", "true");
        } else {
          observer.observe(node);
        }
      });
    };

    register();

    const mutations = new MutationObserver(register);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
