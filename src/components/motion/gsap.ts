"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The single place ScrollTrigger is registered.
 *
 * Registration has to happen at **module scope**, not inside a component's
 * effect, and the reason is a React ordering rule that is very easy to get
 * wrong: child effects run *before* parent effects. Registering the plugin in a
 * layout-level component means every section further down the tree creates its
 * tweens first — at which point `scrollTrigger: {...}` is an unrecognised
 * property, so GSAP silently drops it, applies the tween's `from` values
 * through `immediateRender`, and then never animates them.
 *
 * The failure is quiet and deceptive: nothing errors, GSAP visibly "owns" the
 * elements, and every element sits frozen at frame zero of its own animation —
 * which looks like a page with no animation rather than a page with broken
 * ones. A card offset by exactly its `y` from-value is the tell.
 *
 * Importing this module registers the plugin as a side effect of the import
 * itself, which resolves before any component body or effect runs. Every file
 * that uses ScrollTrigger must import `gsap` from here rather than from the
 * package, so the registration cannot be bypassed.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Exposed for diagnosis. Because everything here is module-scoped, there is
  // otherwise no way to ask the running page how many triggers exist — and
  // "the animation does not work" and "the animation works but is too subtle"
  // look identical from the outside while producing very different fixes.
  // `ScrollTrigger.getAll().length` distinguishes them in one line.
  Object.assign(window as unknown as Record<string, unknown>, { gsap, ScrollTrigger });
}

export { gsap, ScrollTrigger };
