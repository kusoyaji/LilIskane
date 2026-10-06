"use client";

import { useEffect, useState } from "react";
import s from "./SwapText.module.css";

const OUT_MS = 100;

/**
 * A short line whose wording changes ("programme" → "programmes", "dans 3
 * villes" → "dans 1 ville"): the old words fade out quickly, then the new
 * ones fade in — one after the other, never two sentences over each other
 * (in Arabic, two lines of different length overlapping read as garbage).
 *
 * The new wording is taken in the same render as the change (no frame where
 * the count already says "1" and the words still say "programmes"), and it
 * alone sets the line's size: the old one is lifted out of the flow while it
 * fades, so its removal moves nothing. Opacity only. The old words are
 * aria-hidden; assistive tech reads the new.
 */
export function SwapText({ text, className }: { text: string; className?: string }) {
  const [state, setState] = useState({ text, seq: 0, layers: [{ id: 0, text }] });
  if (state.text !== text) {
    const seq = state.seq + 1;
    setState({ text, seq, layers: [...state.layers.slice(-1), { id: seq, text }] });
  }
  const layers = state.layers;

  useEffect(() => {
    if (layers.length < 2) return;
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, layers: current.layers.slice(-1) })),
      OUT_MS + 20,
    );
    return () => window.clearTimeout(timer);
  }, [layers]);

  const last = layers.length - 1;
  return (
    <span className={`${s.swap} ${className ?? ""}`}>
      {layers.map((layer, i) => (
        <span
          key={layer.id}
          className={s.layer}
          data-out={i < last || undefined}
          data-in={(i === last && layer.id > 0) || undefined}
          aria-hidden={i < last || undefined}
        >
          {layer.text}
        </span>
      ))}
    </span>
  );
}
