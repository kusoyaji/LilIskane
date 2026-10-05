"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { LinkButton, Lattice } from "@/components/v2";
import type { ResolvedMediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import s from "./Map.module.css";

export type MapDot = {
  id: string;
  name: string;
  /** Position as a percentage of the map box (geographic, so physical, never mirrored). */
  left: number;
  top: number;
  /** Phone-width position, for the loupe points that would otherwise sit under one fingertip. */
  phone?: { left: number; top: number };
  inLoupe: boolean;
  side: "n" | "s" | "e" | "w";
  labelled: boolean;
};

export type MapProgramme = {
  slug: string;
  href: string;
  name: string;
  meta: string;
  price: string;
  status: string;
  delivered: boolean;
  thumb: ResolvedMediaRef | null;
};

export type MapCity = MapDot & {
  count: number;
  countLabel: string;
  countFigure: string;
  programmes: MapProgramme[];
};

/** Map position as custom properties; the stylesheet picks the phone pair below 48rem. */
function at(dot: MapDot, i: number): React.CSSProperties {
  const phone = dot.phone ?? dot;
  return {
    ["--x" as string]: `${dot.left}%`,
    ["--y" as string]: `${dot.top}%`,
    ["--px" as string]: `${phone.left}%`,
    ["--py" as string]: `${phone.top}%`,
    ["--i" as string]: i,
  };
}

/**
 * The interactive half of the map: pins, the city index and the panel.
 *
 * The silhouette arrives as server-rendered children, so the outline's path
 * data is never part of this component's bundle. Pins are real buttons laid
 * over it by percentage — focusable, labelled, and sized by how many
 * programmes the city holds. The index beside the map is the same set of
 * choices as a list, which is also the map's accessible alternative: every
 * city and every programme is reachable from it without touching the map.
 *
 * Geography does not mirror. The map box is `dir="ltr"` and positions with
 * physical `left`/`top`; the page around it, the index and the panel follow
 * the page direction.
 */
export function MapExplorer({
  locale,
  cities,
  footprint,
  defaultId,
  loupe,
  copy,
  allHref,
  intro,
  children,
}: {
  locale: Locale;
  cities: MapCity[];
  footprint: MapDot[];
  defaultId: string;
  loupe: { left: number; top: number; label: string };
  copy: { listLabel: string; legendProgramme: string; legendCity: string; seeAll: string };
  allHref: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const panelId = useId();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(defaultId);
  const active = cities.find((c) => c.id === activeId) ?? cities[0];

  // A tap is given to the pin whose centre is nearest, not to whichever hit
  // area happens to be painted on top: on a phone the 44px targets of
  // neighbouring pins overlap, and the overlap must split down the middle.
  // Keyboard activation (detail 0) carries no position and keeps its own pin.
  const choose = (id: string, event: React.MouseEvent) => {
    const map = mapRef.current;
    if (!map || event.detail === 0) return setActiveId(id);
    let best = id;
    let bestD = Infinity;
    map.querySelectorAll<HTMLElement>("[data-pin]").forEach((pin) => {
      const r = pin.getBoundingClientRect();
      const d = Math.hypot(event.clientX - (r.left + r.width / 2), event.clientY - (r.top + r.height / 2));
      if (d < bestD) {
        bestD = d;
        best = pin.dataset.pin ?? id;
      }
    });
    setActiveId(best);
  };

  // Pins arrive when the map does. Armed only once JS is running, so without
  // it (or before hydration) every pin is simply there.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.dataset.in = "true";
      return;
    }
    map.dataset.armed = "true";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        map.dataset.in = "true";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(map);
    return () => io.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div className={s.layout}>
      <div className={s.textCol}>
        {intro}

        <ul className={`u-enter ${s.index}`} aria-label={copy.listLabel}>
          {cities.map((city) => {
            const on = city.id === active.id;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  className={`u-press ${s.row}`}
                  aria-pressed={on}
                  aria-controls={panelId}
                  data-active={on || undefined}
                  onClick={() => setActiveId(city.id)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActiveId(city.id)}
                  onFocus={() => setActiveId(city.id)}
                >
                  <span className={s.rowName}>{city.name}</span>
                  <span className={s.rowCount}>{city.countLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={`u-enter ${s.legend}`}>
          <span className={s.legendItem}>
            <span aria-hidden className={s.legendPin} />
            {copy.legendProgramme}
          </span>
          <span className={s.legendItem}>
            <span aria-hidden className={s.legendRing} />
            {copy.legendCity}
          </span>
        </div>

        <div className={`u-enter ${s.cta}`}>
          <LinkButton href={allHref}>{copy.seeAll}</LinkButton>
        </div>
      </div>

      <div className={s.mapCol}>
        <div ref={mapRef} className={s.map} dir="ltr">
          {children}

          <span
            aria-hidden
            className={s.loupeLabel}
            style={{ left: `${loupe.left}%`, top: `${loupe.top}%` }}
            dir={dir}
          >
            {loupe.label}
          </span>

          {footprint.map((dot, i) => (
            <span
              key={dot.id}
              aria-hidden
              className={s.dot}
              data-side={dot.side}
              style={at(dot, i + cities.length)}
            >
              {dot.labelled && (
                <span className={s.dotLabel} dir={dir}>
                  {dot.name}
                </span>
              )}
            </span>
          ))}

          {cities.map((city, i) => {
            const on = city.id === active.id;
            return (
              <button
                key={city.id}
                type="button"
                className={s.pin}
                data-pin={city.id}
                data-count={Math.min(city.count, 3)}
                data-side={city.side}
                data-active={on || undefined}
                aria-pressed={on}
                aria-controls={panelId}
                aria-label={`${city.name}, ${city.countLabel}`}
                style={at(city, i)}
                onClick={(e) => choose(city.id, e)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActiveId(city.id)}
                onFocus={() => setActiveId(city.id)}
              >
                <span className={s.pinDisc}>
                  <span className={s.pinFigure}>{city.countFigure}</span>
                </span>
                <span className={s.pinLabel} dir={dir}>
                  {city.name}
                </span>
              </button>
            );
          })}
        </div>

        <div id={panelId} className={s.panel} dir={dir} aria-live="polite">
          <div key={active.id} className={s.panelInner}>
            <div className={s.panelHead}>
              <p className={`u-eyebrow ${s.panelCount}`}>{active.countLabel}</p>
              <h3 className={s.panelTitle}>{active.name}</h3>
            </div>
            <ul className={s.progs}>
              {active.programmes.map((p) => (
                <li key={p.slug}>
                  <Link href={p.href} className={s.prog}>
                    <span className={s.thumb}>
                      {p.thumb ? (
                        <Figure ref_={p.thumb} locale={locale} sizes="96px" className={s.thumbImg} />
                      ) : (
                        <span className={s.thumbLand}>
                          <Lattice cell={12} />
                        </span>
                      )}
                    </span>
                    <span className={s.progText}>
                      <span className={s.progName}>{p.name}</span>
                      <span className={s.progMeta}>
                        {p.meta} · <span data-delivered={p.delivered || undefined}>{p.status}</span>
                      </span>
                      <span className={s.progPrice}>{p.price}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
