import p from "./parts.module.css";

/**
 * Three dots that breathe one after another — a submit button's "the
 * concierge is on it" (home hero, /projets hero). Decorative: the surface
 * announces the wait itself.
 */
export function BusyDots({ className }: { className?: string }) {
  return (
    <span className={`${p.dots} ${className ?? ""}`} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}
