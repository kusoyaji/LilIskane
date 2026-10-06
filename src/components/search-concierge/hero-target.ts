/**
 * One search, not two. A page that carries its own concierge field (the
 * home's hero) registers it here; while that field is on screen, the header's
 * search trigger and the Ctrl/⌘K and "/" shortcuts focus it instead of opening
 * the overlay. Off screen — or on any other page — they open the overlay.
 */
type HeroTarget = {
  /** True while the field is visible enough to type into. */
  visible: () => boolean;
  focus: () => void;
};

let current: HeroTarget | null = null;

export function registerHeroTarget(target: HeroTarget): () => void {
  current = target;
  return () => {
    if (current === target) current = null;
  };
}

/** Focus the page's own field if it is on screen; false means "open the overlay". */
export function focusHeroTarget(): boolean {
  if (!current || !current.visible()) return false;
  current.focus();
  return true;
}
