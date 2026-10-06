"use client";

import { formatNumber, type Locale } from "@/i18n/config";
import type { FacetChip } from "./model";
import p from "./parts.module.css";

/** One filter choice with the count it would give; dimmed and without a figure (still pressable) when that count is zero. */
export function FacetButton({
  chip,
  locale,
  onPick,
  className,
}: {
  chip: FacetChip;
  locale: Locale;
  onPick: (chip: FacetChip) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${p.fchip} u-press ${className ?? ""}`}
      aria-pressed={chip.on}
      data-empty={!chip.on && chip.count === 0 ? "" : undefined}
      onClick={() => onPick(chip)}
    >
      <span>{chip.label}</span>
      {/* No "0": when nothing matches everything (a widened search), a panel of zeros reads as broken;
          the dimming says it. */}
      {chip.count > 0 && <span className={`u-numeric ${p.fcount}`}>{formatNumber(chip.count, locale)}</span>}
    </button>
  );
}

export const facetChipClass = p.fchip;
export const facetChipsClass = p.fchips;
