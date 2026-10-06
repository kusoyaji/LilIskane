"use client";

import type { ChipModel } from "./model";
import p from "./parts.module.css";

/**
 * The understood values, one removable chip each. Ochre-bright on ink (the
 * overlay, the home hero), ink on paper (the home results). A value the AI
 * added rather than the visitor carries a small "IA" mark, and is removed
 * the same way as any other.
 */
export function ChipList({
  chips,
  onRemove,
  removeLabel,
  aiMark,
  aiTitle,
  tone = "ink",
  className,
}: {
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
  return (
    <ul className={`${p.chips} ${className ?? ""}`} data-chip-tone={tone}>
      {chips.map((chip) => (
        <li key={chip.key} className={p.chip} data-ai={chip.ai || undefined} title={chip.ai ? aiTitle : undefined}>
          <span>{chip.label}</span>
          {chip.ai && (
            <span className={p.aiMark} aria-hidden>
              {aiMark}
            </span>
          )}
          <button
            type="button"
            className={p.chipX}
            aria-label={removeLabel(chip.ai ? `${chip.label} (${aiTitle})` : chip.label)}
            onClick={() => onRemove(chip)}
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
