"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { currentTranslate, glideFrom, reducedMotion } from "@/components/home-search/motion";
import type { ChipModel } from "./model";
import p from "./parts.module.css";

/** Exit is faster than entry (120 vs 160 ms). */
const LEAVE_MS = 120;
/** Stagger between chips arriving together ("3 chambres à Agadir" understood at once). */
const STAGGER_MS = 28;

type Item = { chip: ChipModel; leaving: boolean; wave: number };

/**
 * The understood values, one removable chip each. Ochre-bright on ink (the
 * overlay, the home hero), ink on paper (the home results). A value the AI
 * added rather than the visitor carries a small "IA" mark, and is removed
 * the same way as any other.
 *
 * Motion: a chip arrives with opacity + scale 0.96 → 1 (160 ms; several at
 * once are staggered by ~28 ms); a removed chip is lifted out of the flow at
 * the place it was and fades out faster (120 ms) while the remaining chips
 * glide to their new places (FLIP, transform only). Typing that does not
 * change the set of chips moves nothing.
 */
export function ChipList({
  chips,
  onRemove,
  removeLabel,
  aiMark,
  aiTitle,
  tone = "ink",
  className,
  onEmpty,
}: {
  /** Called once the last chip has finished leaving (the owner may then unmount the list). */
  onEmpty?: () => void;
  chips: ChipModel[];
  onRemove: (chip: ChipModel) => void;
  removeLabel: (label: string) => string;
  /** The visible mark on an AI chip ("IA" / "ذ.ا"). */
  aiMark: string;
  /** Its spelled-out meaning, for the accessible name and the tooltip. */
  aiTitle: string;
  tone?: "ink" | "paper";
  className?: string;
}) {
  const [items, setItems] = useState<Item[]>(() => chips.map((chip) => ({ chip, leaving: false, wave: -1 })));
  const [prev, setPrev] = useState(chips);
  if (prev !== chips) {
    // Derived during render (no extra paint): keep a removed chip, marked
    // leaving, at the place it had, and number the newcomers of this change.
    setPrev(chips);
    setItems((current) => mergeItems(current, chips));
  }

  const listRef = useRef<HTMLUListElement>(null);
  const nodes = useRef(new Map<string, HTMLLIElement>());
  /**
   * Where each chip stood on the page after the last commit (its layout box,
   * any running glide or hover lift taken out). Page coordinates, not
   * offsetLeft: the list is shrink-wrapped, so in RTL its own left edge moves
   * whenever a chip comes or goes, and offsets inside it lie about what moved.
   */
  const last = useRef(new Map<string, { x: number; y: number }>());

  const leavingKeys = items.filter((item) => item.leaving).map((item) => item.chip.key).join("|");
  const orderKey = items.map((item) => item.chip.key).join("|");

  useLayoutEffect(() => {
    const before = last.current;
    const next = new Map<string, { x: number; y: number }>();
    // First take every leaving chip out of the flow, so the others close the
    // gap now; then put it back, over the gap, exactly where it stood.
    const lifted: Array<[HTMLLIElement, { x: number; y: number }]> = [];
    for (const item of items) {
      const el = nodes.current.get(item.chip.key);
      if (!el) continue;
      if (item.leaving) {
        const at = before.get(item.chip.key);
        if (el.dataset.leaving === undefined) {
          for (const a of el.getAnimations()) if (a.id === "glide") a.cancel();
          el.dataset.leaving = "";
          if (at) lifted.push([el, at]);
        }
      } else if (el.dataset.leaving !== undefined) {
        // Put back while it was still fading out.
        delete el.dataset.leaving;
        el.style.left = "";
        el.style.top = "";
      }
    }
    for (const [el, at] of lifted) {
      el.style.left = "0px";
      el.style.top = "0px";
      const r = pageBox(el);
      el.style.left = `${at.x - r.x}px`;
      el.style.top = `${at.y - r.y}px`;
    }
    for (const item of items) {
      const el = nodes.current.get(item.chip.key);
      if (!el || item.leaving) continue;
      const now = pageBox(el);
      next.set(item.chip.key, now);
      const was = before.get(item.chip.key);
      if (was) {
        const showing = currentTranslate(el);
        glideFrom(el, was.x + showing.x - now.x, was.y + showing.y - now.y, 220);
      }
    }
    last.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey, leavingKeys]);

  useEffect(() => {
    if (!leavingKeys) return;
    const timer = window.setTimeout(
      () => setItems((current) => current.filter((item) => !item.leaving)),
      reducedMotion() ? 0 : LEAVE_MS + 20,
    );
    return () => window.clearTimeout(timer);
  }, [leavingKeys]);

  // The last chip has gone: tell the owner once its fade is over (it keeps
  // this list mounted until then, so the last removal fades like any other).
  const empty = items.length === 0;
  const onEmptyRef = useRef(onEmpty);
  onEmptyRef.current = onEmpty;
  useEffect(() => {
    if (empty) onEmptyRef.current?.();
  }, [empty]);

  return (
    <ul ref={listRef} className={`${p.chips} ${className ?? ""}`} data-chip-tone={tone}>
      {items.map(({ chip, leaving, wave }) => (
        <li
          key={chip.key}
          ref={(el) => {
            if (el) nodes.current.set(chip.key, el);
            else nodes.current.delete(chip.key);
          }}
          className={p.chip}
          data-ai={chip.ai || undefined}
          title={chip.ai ? aiTitle : undefined}
          aria-hidden={leaving || undefined}
          style={wave > 0 ? ({ ["--d" as string]: `${wave * STAGGER_MS}ms` } as React.CSSProperties) : undefined}
        >
          <span>{chip.label}</span>
          {chip.ai && (
            <span className={p.aiMark} aria-hidden>
              {aiMark}
            </span>
          )}
          <button
            type="button"
            className={p.chipX}
            tabIndex={leaving ? -1 : undefined}
            aria-label={removeLabel(chip.ai ? `${chip.label} (${aiTitle})` : chip.label)}
            onClick={() => !leaving && onRemove(chip)}
          >
            <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden focusable="false">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * For an owner that shows the list only when there are chips: whether to
 * keep it mounted (true from the first chip until the last one has finished
 * leaving), and the `onEmpty` to pass so it can let go.
 */
export function useChipListShown(count: number): [boolean, () => void] {
  const [held, setHeld] = useState(count > 0);
  if (count > 0 && !held) setHeld(true);
  const release = useCallback(() => setHeld(false), []);
  return [count > 0 || held, release];
}

/** An element's layout box on the page: its rect with any transform it shows (a glide, a lift) taken out. */
function pageBox(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  const t = currentTranslate(el);
  return { x: r.left + window.scrollX - t.x, y: r.top + window.scrollY - t.y };
}

/**
 * The new chips in their order, with each chip that just went away kept (as
 * leaving) right after the chip that preceded it before, so it fades out in
 * place. Newcomers get their rank among this change's arrivals (`wave`), for
 * the stagger.
 */
function mergeItems(current: Item[], chips: ChipModel[]): Item[] {
  const keys = new Set(chips.map((chip) => chip.key));
  const had = new Set(current.filter((item) => !item.leaving).map((item) => item.chip.key));
  let wave = 0;
  const out: Item[] = chips.map((chip) => {
    const old = current.find((item) => item.chip.key === chip.key && !item.leaving);
    return { chip, leaving: false, wave: had.has(chip.key) ? (old?.wave ?? -1) : wave++ };
  });
  current.forEach((item, index) => {
    if (keys.has(item.chip.key)) return;
    // Anchor after the closest earlier chip that is still there.
    let anchor = -1;
    for (let i = index - 1; i >= 0; i--) {
      const at = out.findIndex((o) => o.chip.key === current[i].chip.key);
      if (at !== -1) {
        anchor = at;
        break;
      }
    }
    out.splice(anchor + 1, 0, { ...item, leaving: true });
  });
  return out;
}
