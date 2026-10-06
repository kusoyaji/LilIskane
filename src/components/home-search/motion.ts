/**
 * Small motion helpers shared by the search surfaces (home hero, results,
 * overlay, map). Everything here animates `transform` / `opacity` only, through
 * the Web Animations API, so nothing re-renders to move and nothing is laid out
 * twice. Under `prefers-reduced-motion: reduce` every helper is a no-op: the
 * state change it decorates has already happened.
 */

/** The site's strong ease-out (--ease-reveal), for things arriving or settling. */
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The translation an element is currently showing (a running FLIP, say), from its computed matrix. */
export function currentTranslate(el: Element): { x: number; y: number } {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return { x: 0, y: 0 };
  const m = new DOMMatrixReadOnly(t);
  return { x: m.m41, y: m.m42 };
}

/**
 * FLIP: the element has just been laid out somewhere new; play it from where
 * it was (dx, dy away) to where it is. Interruptible: a new call cancels the
 * previous glide (the caller adds what was still showing into dx/dy).
 */
export function glideFrom(el: HTMLElement, dx: number, dy: number, duration = 260): Animation | null {
  for (const a of el.getAnimations()) if (a.id === "glide") a.cancel();
  if (reducedMotion() || (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)) return null;
  const anim = el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
    duration,
    easing: EASE_OUT,
  });
  anim.id = "glide";
  return anim;
}

/**
 * Move a single indicator (a sort thumb, a hover highlight, the overlay's
 * active-row field) onto a target box, inside a positioned container.
 *
 * Its size is set at once and its travel is a transform; the size jump is
 * hidden by playing it from the old box with a compensating scale (FLIP), so
 * what the eye sees is one pill stretching across — transform only.
 */
export function slideIndicator(
  indicator: HTMLElement,
  box: { x: number; y: number; w: number; h: number },
  { duration = 200, animate = true }: { duration?: number; animate?: boolean } = {},
): void {
  const prev = indicator.dataset.box ? (JSON.parse(indicator.dataset.box) as typeof box) : null;
  // Already there (a re-measure that found nothing new): leave a running slide alone.
  if (prev && prev.x === box.x && prev.y === box.y && prev.w === box.w && prev.h === box.h) return;
  indicator.dataset.box = JSON.stringify(box);
  indicator.style.inlineSize = `${box.w}px`;
  indicator.style.blockSize = `${box.h}px`;
  indicator.style.transform = `translate(${box.x}px, ${box.y}px)`;
  for (const a of indicator.getAnimations()) if (a.id === "slide") a.cancel();
  if (!animate || !prev || reducedMotion()) return;
  const sx = prev.w / Math.max(1, box.w);
  const sy = prev.h / Math.max(1, box.h);
  const anim = indicator.animate(
    [
      { transform: `translate(${prev.x}px, ${prev.y}px) scale(${sx}, ${sy})` },
      { transform: `translate(${box.x}px, ${box.y}px) scale(1, 1)` },
    ],
    { duration, easing: EASE_OUT },
  );
  anim.id = "slide";
}

type LenisLike = {
  isScrolling?: unknown;
  targetScroll: number;
  animatedScroll: number;
  resize?: () => void;
  scrollTo: (y: number, o?: { immediate?: boolean }) => void;
};

/**
 * Something above what the visitor is reading changed height by `delta`
 * (an answer landing seconds after the last keystroke): move the scroll by
 * the same amount in the same frame, so nothing they are looking at moves.
 * A smoothed glide in progress (Lenis, wheel) is carried along, not stopped.
 */
export function keepInPlace(delta: number, readAt?: number): void {
  if (!delta) return;
  const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
  // Lenis' limit is still the old page height (its own observer runs later).
  lenis?.resize?.();
  // `readAt`: the scroll at which the moved block was measured. When nothing
  // smooth is moving the page, a different scroll now can only be the
  // browser clamping it to a shorter page: start from where the reader was.
  const base = !lenis?.isScrolling && readAt !== undefined ? readAt : window.scrollY;
  const y = base + delta;
  if (lenis?.isScrolling) {
    // Its scroll limit is still the old page height (its own observer runs
    // later): measure now, or a glide near the bottom is clamped back.
    lenis.resize?.();
    lenis.targetScroll += delta;
    lenis.animatedScroll += delta;
    window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    return;
  }
  window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  lenis?.scrollTo(y, { immediate: true });
}

/** A single pulse that draws the eye (a count that changed, a heading landed on). */
export function pulse(el: Element | null | undefined, scale = 1.2, duration = 300): void {
  if (!el || reducedMotion()) return;
  for (const a of el.getAnimations()) if (a.id === "pulse") a.cancel();
  const anim = el.animate(
    [{ transform: "scale(1)" }, { transform: `scale(${scale})`, offset: 0.4 }, { transform: "scale(1)" }],
    // Added onto whatever the element already shows (an active pin is
    // scaled up; a pulse must not snap it back to 1 first).
    { duration, easing: "ease-out", composite: "add" },
  );
  anim.id = "pulse";
}
