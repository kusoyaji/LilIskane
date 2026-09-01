/**
 * Route transition.
 *
 * `template.tsx` differs from `layout.tsx` in that it remounts on every
 * navigation, which is what gives us a hook for an enter animation. The header
 * and footer stay in the layout deliberately: they must not flicker or reset
 * when the page beneath them changes — the chrome is continuous, the content
 * is what moves.
 *
 * The animation is opacity only. A transform here would create a containing
 * block for every fixed and sticky descendant, which would break the pinned
 * proof stage and the sticky filter rail in ways that only show up on the
 * second page you visit. Movement is left to the per-section reveals, which
 * re-arm on navigation via the RevealRoot mutation observer — so a new page
 * does not merely fade in, its hero wipes up as it arrives.
 */
export default function RouteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
