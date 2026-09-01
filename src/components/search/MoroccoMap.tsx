"use client";

import { useMemo } from "react";
import { cities } from "@/data/cities";
import { projects } from "@/data/projects";
import { formatNumber, type Locale } from "@/i18n/config";
import type { Project } from "@/data/types";

type Props = {
  locale: Locale;
  results: Project[];
  activeCity: string | null;
  onSelectCity: (cityId: string | null) => void;
};

/* Bounds cover every city Chaabi builds in, with a margin for labels. */
const BOUNDS = { minLng: -10.4, maxLng: -2.6, minLat: 30.6, maxLat: 36.2 };

/* Longitude degrees are shorter than latitude ones; at Morocco's latitude the
   factor is cos(33°). Baking it in keeps the country's real proportions rather
   than stretching it east-west. */
const LNG_SCALE = Math.cos((33 * Math.PI) / 180);

/* Generous user-unit space so stroke widths and font sizes can be expressed as
   round numbers and stay proportional at any rendered size. */
const UNITS_PER_DEGREE = 110;
const WIDTH = (BOUNDS.maxLng - BOUNDS.minLng) * LNG_SCALE * UNITS_PER_DEGREE;
const HEIGHT = (BOUNDS.maxLat - BOUNDS.minLat) * UNITS_PER_DEGREE;

const LABEL_SIZE = 21;
const LABEL_GAP = 26;

function projectPoint(lat: number, lng: number) {
  return {
    x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WIDTH,
    y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT,
  };
}

/**
 * Geography as a filter, not as decoration.
 *
 * An index map rather than a cartographic one: no coastline, no roads, just
 * every city at its true coordinates with dot area scaled to how much is
 * available there. Deliberately chosen over embedding Google or Mapbox, which
 * would mean a third-party script, a cookie banner and roughly 200 KB of
 * JavaScript before anyone could filter anything — to draw streets nobody came
 * here to look at. The arrangement of Moroccan cities is legible unaided:
 * Tanger at the top, Agadir to the south-west, the Casablanca–Rabat belt in the
 * middle.
 *
 * That belt is the hard part. Mohammedia, Témara, Sala Al Jadida, Had Soualem
 * and Sidi Rahal sit within a degree of each other, so labels are placed beside
 * their dots and then pushed apart vertically by a greedy pass, with a leader
 * line drawn whenever a label has moved far enough to look detached.
 *
 * Every dot is a real button, so the map is fully keyboard-operable, and the
 * whole component costs about two kilobytes.
 */
export function MoroccoMap({ locale, results, activeCity, onSelectCity }: Props) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of results) map.set(item.cityId, (map.get(item.cityId) ?? 0) + 1);
    return map;
  }, [results]);

  const placed = useMemo(() => {
    const known = new Set(projects.map((p) => p.cityId));
    const points = cities
      .filter((city) => known.has(city.id))
      .map((city) => ({ city, ...projectPoint(city.lat, city.lng) }))
      .sort((a, b) => a.y - b.y);

    // Greedy vertical separation: walking top to bottom, any label closer than
    // LABEL_GAP to the previous one is pushed down.
    let lastLabelY = -Infinity;
    return points.map((point) => {
      const labelY = Math.max(point.y + LABEL_SIZE / 3, lastLabelY + LABEL_GAP);
      lastLabelY = labelY;
      return { ...point, labelY };
    });
  }, []);

  return (
    <svg
      viewBox={`-20 -20 ${WIDTH + 170} ${HEIGHT + 40}`}
      role="group"
      aria-label={locale === "fr" ? "Villes où Chaabi Lil Iskane construit" : "المدن التي يبني فيها الشعبي للإسكان"}
      className="mx-auto h-auto w-full"
      style={{ maxBlockSize: "28rem" }}
    >
      {placed.map(({ city, x, y, labelY }) => {
        const count = counts.get(city.id) ?? 0;
        const isActive = activeCity === city.id;
        const empty = count === 0;
        const radius = 5 + Math.sqrt(count) * 6;
        const labelX = x + radius + 10;
        const detached = Math.abs(labelY - y) > radius + 8;

        return (
          <g key={city.id}>
            {detached && (
              <line
                x1={x + radius + 2}
                y1={y}
                x2={labelX - 4}
                y2={labelY - LABEL_SIZE / 3}
                stroke="color-mix(in oklab, var(--color-ink) 25%, transparent)"
                strokeWidth={1.2}
              />
            )}

            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={isActive ? "var(--color-ochre)" : empty ? "transparent" : "var(--color-ink)"}
              stroke={empty ? "color-mix(in oklab, var(--color-ink) 32%, transparent)" : "none"}
              strokeWidth={1.5}
              style={{ transition: "fill 200ms var(--ease-ui)" }}
            />

            <text
              x={labelX}
              y={labelY}
              textAnchor="start"
              style={{
                fontSize: `${LABEL_SIZE}px`,
                letterSpacing: "0.02em",
                fill: empty ? "var(--color-ink-mute)" : "var(--color-ink)",
                fontWeight: isActive ? 700 : 500,
                pointerEvents: "none",
              }}
            >
              {city.name[locale]}
              {count > 0 && (
                <tspan
                  dx={7}
                  style={{ fill: "var(--color-ochre-deep)", fontSize: `${LABEL_SIZE * 0.8}px` }}
                >
                  {formatNumber(count, locale)}
                </tspan>
              )}
            </text>

            {/* Hit target sized for a fingertip, independent of the dot. */}
            <circle
              cx={x}
              cy={y}
              r={Math.max(radius + 8, 20)}
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              aria-label={`${city.name[locale]} — ${count}`}
              onClick={() => onSelectCity(isActive ? null : city.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectCity(isActive ? null : city.id);
                }
              }}
              style={{ cursor: "pointer" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
