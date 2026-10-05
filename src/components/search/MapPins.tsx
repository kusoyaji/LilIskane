"use client";

import { useEffect, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";
import { searchCopy } from "@/content/projects";
import { scalarOf, withScalar } from "./query";
import { useSearchState } from "./SearchShell";
import s from "./search.module.css";

export type Pin = {
  id: string;
  name: string;
  /** Pin position, viewBox units. */
  x: number;
  y: number;
  /** Label position (right edge of the text), viewBox units. */
  lx: number;
  ly: number;
  /** Programmes in this city under the current filters, city released. */
  count: number;
  /** Programmes in this city in the whole portfolio — sets the pin size. */
  total: number;
};

/**
 * The interactive layer of the search map: a pin per city, its label set out
 * in the Atlantic with a leader line, and the programme count beside it.
 * Choosing a city filters the list; hovering a card lights its city here.
 */
export function MapPins({ locale, pins }: { locale: Locale; pins: Pin[] }) {
  const c = searchCopy[locale];
  const { query, navigate } = useSearchState();
  const active = scalarOf(query, "ville");
  const [hovered, setHovered] = useState<string | null>(null);

  // Cards carry `data-city`; one delegated listener lights the matching pin.
  useEffect(() => {
    const over = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.("[data-city]");
      setHovered(card ? card.getAttribute("data-city") : null);
    };
    document.addEventListener("pointerover", over);
    return () => document.removeEventListener("pointerover", over);
  }, []);

  const toggle = (id: string) => navigate(withScalar(query, "ville", active === id ? null : id));

  const radius = (pin: Pin) => 7 + Math.sqrt(pin.total) * 3.5;

  /**
   * A tap on a dot or its ring answers for the pin whose centre is nearest the
   * tap, not for whichever circle happens to paint on top. In the
   * Rabat–Casablanca and Casablanca-south clusters the rings overlap, and
   * paint order alone sent taps on one city to its neighbour.
   */
  const pickNearest = (event: React.MouseEvent<SVGCircleElement>, fallback: string) => {
    event.stopPropagation();
    const ctm = event.currentTarget.getScreenCTM();
    if (!ctm) return toggle(fallback);
    const at = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    let best = fallback;
    let bestDistance = Infinity;
    for (const pin of pins) {
      const distance = Math.hypot(pin.x - at.x, pin.y - at.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = pin.id;
      }
    }
    toggle(best);
  };

  /**
   * Two layers, in this order:
   *
   * 1. Every pin's invisible hit area (label box, ring around the dot).
   * 2. Every pin's visible dot and label, which are clickable themselves.
   *
   * Painting each pin's hit area together with its own dot let a later pin's
   * transparent shapes cover an earlier pin's dot in the Rabat–Casablanca
   * cluster, so tapping Sala Al Jadida filtered Témara. With the visible marks
   * on top, a dot or a label always answers for its own city; the hit areas
   * only catch taps that land in the space around them. Leaders and halos are
   * decoration and never take a pointer.
   */
  return (
    <g>
      <g aria-hidden>
        {pins.map((pin) => {
          const r = radius(pin);
          // ~19 viewBox units per character at the label size, plus the count.
          const labelWidth = pin.name.length * 19 + 8;
          return (
            <g key={pin.id} className={s.pin} data-city={pin.id} onClick={() => toggle(pin.id)}>
              <rect x={pin.lx - labelWidth} y={pin.ly - 34} width={labelWidth + 40} height={46} fill="transparent" />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={r + 6}
                fill="transparent"
                onClick={(event) => pickNearest(event, pin.id)}
              />
            </g>
          );
        })}
      </g>

      {pins.map((pin) => {
        const on = active === pin.id;
        const lit = on || hovered === pin.id;
        const empty = pin.count === 0;
        const r = radius(pin);
        const elbowX = pin.lx + 12;
        return (
          <g
            key={pin.id}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${pin.name} — ${c.programmesIn(pin.count, String(pin.count))}`}
            className={s.pin}
            data-city={pin.id}
            data-on={on || undefined}
            data-lit={lit || undefined}
            data-empty={empty || undefined}
            onClick={() => toggle(pin.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggle(pin.id);
              }
            }}
          >
            <polyline
              points={`${elbowX},${pin.ly - 11} ${elbowX + 18},${pin.ly - 11} ${pin.x - r - 4},${pin.y}`}
              className={s.leader}
              pointerEvents="none"
            />
            <circle cx={pin.x} cy={pin.y} r={r + 9} className={s.pinHalo} pointerEvents="none" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r={r}
              className={s.pinDot}
              onClick={(event) => pickNearest(event, pin.id)}
            />
            <text x={pin.lx} y={pin.ly} textAnchor="end" className={s.pinLabel}>
              <tspan>{pin.name}</tspan>
              <tspan dx={12} className={s.pinCount}>
                {formatNumber(pin.count, locale)}
              </tspan>
            </text>
          </g>
        );
      })}
    </g>
  );
}
