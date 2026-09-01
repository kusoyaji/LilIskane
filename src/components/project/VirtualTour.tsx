"use client";

import { useEffect, useRef, useState } from "react";
import { Figure } from "@/components/media/Figure";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { VirtualTour as Tour } from "@/data/types";

type Props = {
  locale: Locale;
  tours: Tour[];
};

type Connection = { saveData?: boolean; effectiveType?: string };

/** How far ahead of the viewport the tour starts loading. */
const PRELOAD_MARGIN = "700px";

/**
 * The 360 as a place you walk into, not a modal you open.
 *
 * The tour loads **on approach**, not on click. An IntersectionObserver starts
 * the Matterport roughly 700px before the section reaches the viewport, so by
 * the time the user scrolls to it the scene is already live and interactive —
 * they arrive inside the apartment rather than at a button that offers to take
 * them there. The still stays on top until the iframe reports ready, then
 * dissolves, so there is never a black rectangle or a spinner.
 *
 * Only the *active* tour is loaded. Riad Garden II has three, and each is a
 * live WebGL context plus roughly 10–15 MB — mounting all three would make the
 * page unusable on the mid-range Android this site is budgeted for. Switching
 * tours tears the previous one down rather than stacking a second.
 *
 * The click gate survives in exactly one case: when the browser reports
 * `saveData` or a 2G/3G connection, we do not spend someone's data without
 * asking. They get the poster, the reason, and a button.
 */
export function VirtualTour({ locale, tours }: Props) {
  const t = getDictionary(locale);
  const [activeId, setActiveId] = useState(tours[0]?.id ?? "");
  const [entered, setEntered] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [constrained, setConstrained] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const active = tours.find((tour) => tour.id === activeId) ?? tours[0];

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const metered =
      connection?.saveData === true || /^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? "");

    if (metered) {
      setConstrained(true);
      return;
    }

    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${PRELOAD_MARGIN} 0px ${PRELOAD_MARGIN} 0px` },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [activeId]);

  const selectTour = (id: string) => {
    setActiveId(id);
    setFrameReady(false);
    // On a metered connection a switch returns to the poster and waits for a
    // second deliberate tap; otherwise the new tour loads straight away.
    setEntered(!constrained);
  };

  if (!active) return null;

  const showOverlay = !frameReady;

  return (
    <section
      ref={sectionRef}
      data-nav-media
      aria-labelledby="tour-title"
      className="relative isolate"
      style={{ background: "var(--color-ink)" }}
    >
      {/* Warms the connection before the iframe is mounted. React 19 hoists
          these into <head> automatically. */}
      <link rel="preconnect" href="https://my.matterport.com" />
      <link rel="preconnect" href="https://static.matterport.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://cdn-2.matterport.com" />

      {/* The section's accessible name and its entry in the document outline.
          It lives outside the overlay because the overlay unmounts once the
          tour is live — leaving `aria-labelledby` pointing at nothing, and the
          section with no heading at all. The visible display text below is
          decorative and marked aria-hidden. */}
      <h2 id="tour-title" className="u-visually-hidden">
        {t.project.tourTitle} — {active.label[locale]}
      </h2>

      <div className="relative h-[100svh] min-h-[34rem] overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: frameReady ? 0 : 1,
            transitionTimingFunction: "var(--ease-camera)",
            pointerEvents: frameReady ? "none" : undefined,
          }}
        >
          <Figure
            ref_={active.poster}
            locale={locale}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--color-ink) 80%, transparent) 0%, color-mix(in oklab, var(--color-ink) 30%, transparent) 40%, color-mix(in oklab, var(--color-ink) 18%, transparent) 100%)",
            }}
          />
        </div>

        {entered && (
          <iframe
            key={active.matterportId}
            title={`${t.project.tourTitle} — ${active.label[locale]}`}
            src={`https://my.matterport.com/show/?m=${active.matterportId}&play=1&qs=1&title=0&brand=0`}
            allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope"
            allowFullScreen
            onLoad={() => setFrameReady(true)}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
          />
        )}

        {/* The copy sits over the poster while the scene loads and dissolves
            with it. On a metered connection the same block is a button. */}
        {showOverlay &&
          (() => {
            const Tag = constrained && !entered ? "button" : "div";
            return (
              <Tag
                {...(constrained && !entered
                  ? { type: "button" as const, onClick: () => setEntered(true) }
                  : { "aria-hidden": true })}
                className="on-media absolute inset-0 flex w-full flex-col justify-end text-start"
                style={{
                  padding: "var(--gutter)",
                  paddingBlockEnd: "clamp(2rem, 5vw, 3.5rem)",
                  pointerEvents: constrained && !entered ? undefined : "none",
                }}
              >
                <span className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
                  {t.project.tourEyebrow}
                </span>
                <span
                  className="u-display mt-4 block"
                  style={{ fontSize: "var(--text-display)", color: "var(--color-paper)" }}
                >
                  {t.project.tourTitle}
                </span>
                <span
                  className="u-body mt-5 block"
                  style={{ color: "color-mix(in oklab, var(--color-paper) 86%, transparent)" }}
                >
                  {t.project.tourBody}
                </span>

                {constrained && !entered && (
                  <>
                    <span
                      className="u-eyebrow mt-8 inline-flex w-fit items-center gap-3 rounded-full px-7 py-4"
                      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
                    >
                      {t.project.tourStart}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
                        <path
                          d="M4 12h15m0 0-6-6m6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className="mt-5 block"
                      style={{
                        fontSize: "var(--text-small)",
                        color: "color-mix(in oklab, var(--color-paper) 74%, transparent)",
                        maxInlineSize: "42ch",
                      }}
                    >
                      {t.project.tourDataWarning}
                    </span>
                  </>
                )}

                {entered && !frameReady && (
                  <span
                    className="u-eyebrow mt-8 block"
                    style={{ color: "color-mix(in oklab, var(--color-paper) 70%, transparent)" }}
                  >
                    {t.project.tourLoading}…
                  </span>
                )}
              </Tag>
            );
          })()}
      </div>

      {/* Tour switcher. The delivered unit is listed alongside the show flats
          and marked, because it is the most persuasive of the three. */}
      {tours.length > 1 && (
        <div className="u-shell flex flex-wrap gap-3" style={{ paddingBlock: "1.5rem" }}>
          {tours.map((tour) => {
            const isActive = tour.id === active.id;
            return (
              <button
                key={tour.id}
                type="button"
                onClick={() => selectTour(tour.id)}
                aria-pressed={isActive}
                className="u-eyebrow rounded-full px-5 py-3 u-press"
                style={{
                  background: isActive ? "var(--color-paper)" : "transparent",
                  color: isActive
                    ? "var(--color-ink)"
                    : "color-mix(in oklab, var(--color-paper) 80%, transparent)",
                  border: `1px solid ${isActive ? "var(--color-paper)" : "color-mix(in oklab, var(--color-paper) 28%, transparent)"}`,
                }}
              >
                {tour.label[locale]}
                {tour.ofDelivered && (
                  <span
                    className="ms-2"
                    style={{ color: isActive ? "var(--color-olive-deep)" : "var(--color-olive-bright)" }}
                  >
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
