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

  return (
    <g>
      {pins.map((pin) => {
        const on = active === pin.id;
        const lit = on || hovered === pin.id;
        const empty = pin.count === 0;
        const r = 7 + Math.sqrt(pin.total) * 3.5;
        const elbowX = pin.lx + 12;
        return (
          <g
            key={pin.id}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${pin.name} — ${c.programmesIn(pin.count, String(pin.count))}`}
            className={s.pin}
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
            />
            {/* Generous invisible hit area over the label. */}
            <rect x={pin.lx - 250} y={pin.ly - 38} width={280} height={54} fill="transparent" />
            <circle cx={pin.x} cy={pin.y} r={r + 14} fill="transparent" />
            <circle cx={pin.x} cy={pin.y} r={r + 9} className={s.pinHalo} />
            <circle cx={pin.x} cy={pin.y} r={r} className={s.pinDot} />
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
