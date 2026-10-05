"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { Figure } from "@/components/media/Figure";
import { media } from "@/data/media.generated";
import st from "./TourCards.module.css";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { VirtualTour as Tour } from "@/data/types";

type Props = {
  locale: Locale;
  tours: Tour[];
  /** Replaces the default introduction (which speaks of a show flat). */
  body?: string;
  /** Shown on posters that are renders, e.g. "Rendu — image non contractuelle". */
  renderNote?: string;
};

type Connection = { saveData?: boolean; effectiveType?: string };

/** How far ahead of the viewport the embed's origins are warmed. */
const APPROACH_MARGIN = "700px";

/**
 * The 360 tours as a set of doors rather than one embedded room.
 *
 * The previous treatment mounted a single tour full-bleed and swapped it with a
 * row of pills. That gave the section one entrance, no sense of how much there
 * was to see, and — because a live 3D canvas sat in the scroll path — a stretch
 * of page where the wheel belonged to the embed instead of the reader.
 *
 * Cards fix all three. Each tour is a place you can see before you commit to
 * it, the set reads as a set, and the scroll path stays clean because nothing
 * interactive is mounted until you open one.
 *
 * The opening is a FLIP: the card's own rectangle is measured at click, the
 * full-screen panel is transformed *back* into that rectangle, and then
 * released. The panel therefore grows out of the card the visitor pressed
 * rather than appearing over it, so the thing they chose and the thing they get
 * are visibly the same object. Only `transform` and `opacity` move, so the
 * whole gesture is composited.
 *
 * Cost discipline is unchanged from the full-bleed version: exactly one live
 * WebGL context at a time, origins preconnected on approach rather than at
 * mount, and a click gate that survives only for metered connections.
 */
export function TourCards({ locale, tours, body, renderNote }: Props) {
  const t = getDictionary(locale);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const trackRef = useRef<HTMLUListElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [frameReady, setFrameReady] = useState(false);
  const [approached, setApproached] = useState(false);
  const [metered, setMetered] = useState(false);

  const active = tours.find((tour) => tour.id === openId) ?? null;

  /**
   * Vertical scroll drives the track sideways while the section is pinned.
   *
   * The distance is measured, never guessed: the track travels exactly its own
   * overflow, so the last card lands flush against the edge no matter how many
   * tours a programme has or how wide the viewport is. A hard-coded percentage
   * is what makes this pattern break the moment the card count changes — and
   * `invalidateOnRefresh` means the measurement is retaken on resize rather
   * than baked in at mount.
   *
   * Cards also scale and lift as they cross the middle of the screen. Panning a
   * rigid strip is just a carousel on a scrollbar; having each card respond as
   * it passes is what gives the section a focal point and makes the movement
   * feel like it is about the content rather than about the mechanism.
   */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // A single tour has nothing to pan to: it is laid out as one large card.
      if (tours.length < 2) return;
      const stage = section.querySelector<HTMLElement>(".tours__stage");
      if (!stage) return;

      /**
       * On touch screens the track is also a native horizontal scroller
       * (`overflow-x: auto`, see globals.css). An element's overflow clip moves
       * with its own transform, so translating that same element slid its clip
       * box off-screen with the cards and left an empty panel mid-pan. While the
       * scroll-driven pan owns the track its overflow is released, and the
       * stage — which already clips to the viewport — does the clipping.
       */
      const previousOverflow = track.style.overflow;
      track.style.overflow = "visible";
      track.scrollLeft = 0;

      const rtl = document.documentElement.dir === "rtl";
      // Measured from the cards themselves plus the track's own padding, so the
      // last card stops a gutter clear of the edge. `scrollWidth` leaves the
      // end padding out once the track no longer scrolls natively. Both rects
      // carry the same transform, so the span is the same mid-pan as at rest.
      const shift = () => {
        const slots = track.children;
        if (slots.length === 0) return 0;
        const first = slots[0].getBoundingClientRect();
        const last = slots[slots.length - 1].getBoundingClientRect();
        const span = rtl ? first.right - last.left : last.right - first.left;
        const style = getComputedStyle(track);
        const padding = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
        return Math.max(0, Math.ceil(span + padding - track.clientWidth));
      };

      /**
       * ScrollTrigger owns the pin here, not CSS `sticky`.
       *
       * The previous version pinned with `position: sticky` and then tried to
       * hang per-card triggers off the pan with `containerAnimation`. That
       * combination cannot work: `containerAnimation` maps a card's horizontal
       * position back to a scroll position, and to do that it needs the
       * container to be pinned *by ScrollTrigger* so it knows the mapping. With
       * a CSS pin it has no such reference, the per-card triggers never resolve
       * a range, and each card is left holding the `from` half of its tween
       * forever — which is why the third card sat permanently lower than the
       * other two while nothing panned.
       *
       * The per-card tweens are gone rather than fixed. They were decoration on
       * top of the real gesture, and every one of them was another trigger that
       * could fail the same silent way. One pan, measured on refresh, is the
       * whole effect and it either works or it visibly does not.
       */
      const pan = gsap.to(track, {
        x: () => (rtl ? shift() : -shift()),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // Travel is the pan distance, so the last card lands exactly as the
          // pin releases — no dead scroll at either end.
          end: () => `+=${shift()}`,
          pin: stage,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // The pin is measured once; anything above it that changes height later
      // (a late web font, an image without reserved space) would leave it
      // pinning at the wrong scroll position and covering the sections above.
      // Re-measure whenever the document height changes.
      let timer = 0;
      let lastHeight = document.documentElement.scrollHeight;
      const observer = new ResizeObserver(() => {
        const height = document.documentElement.scrollHeight;
        if (Math.abs(height - lastHeight) < 2) return;
        lastHeight = height;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      observer.observe(document.body);
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => {
        observer.disconnect();
        window.clearTimeout(timer);
        pan.scrollTrigger?.kill();
        pan.kill();
        track.style.overflow = previousOverflow;
      };
    });

    return () => mm.revert();
  }, [tours.length]);

  // Warm the embed's origins on approach. The iframe itself still waits for a
  // deliberate click — a 3D scene nobody asked for is 10–15 MB spent on a
  // section they may only be scrolling past.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    setMetered(
      connection?.saveData === true || /^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? ""),
    );

    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setApproached(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${APPROACH_MARGIN} 0px ${APPROACH_MARGIN} 0px` },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const open = useCallback((tour: Tour) => {
    const card = cardRefs.current.get(tour.id);
    openerRef.current = card ?? null;
    setFrameReady(false);
    setOpenId(tour.id);

    const panel = panelRef.current;
    if (!card || !panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // FLIP. The panel is already laid out full-screen, so the first frame maps
    // it back onto the card's box and the second frame releases it. Both are
    // one composited transform; nothing is measured after the animation starts.
    const box = card.getBoundingClientRect();
    panel.style.transition = "none";
    panel.style.transformOrigin = "top left";
    panel.style.transform = `translate(${box.left}px, ${box.top}px) scale(${
      box.width / window.innerWidth
    }, ${box.height / window.innerHeight})`;
    panel.style.opacity = "0.6";

    // Commit the first state with a forced reflow rather than waiting on a
    // pair of animation frames. Both get the browser to accept the starting
    // transform before the transition is armed, but a reflow does it
    // synchronously — so if frames are not being produced (a background tab, a
    // throttled renderer) the panel still ends up at its resting size instead
    // of being stranded at card scale with no callback coming to release it.
    void panel.getBoundingClientRect();

    // `--ease-ui` is already the iOS panel curve (0.32, 0.72, 0, 1). Opacity
    // settles in half the time, so the panel reads as solid well before it has
    // finished growing rather than arriving translucent.
    panel.style.transition = "transform 520ms var(--ease-ui), opacity 260ms var(--ease-ui)";
    panel.style.transform = "";
    panel.style.opacity = "";
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
    setFrameReady(false);
    // Focus goes back to the card that opened it, or the section is left
    // without a sensible focus position after the overlay unmounts. Deferred a
    // frame: the page stays inert until the effect cleanup below has run, and
    // an inert element cannot take focus.
    window.requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
  }, []);

  // Escape, focus trap, and scroll lock while a tour is open.
  useEffect(() => {
    if (!openId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // The overlay is portalled to <body>, so everything else in <body> — the
    // fixed header included — is a sibling of it. Making those siblings inert
    // means no tap can fall through to the header's phone link, and assistive
    // tech sees only the dialog. Anything already inert is left alone.
    const overlay = overlayRef.current;
    const madeInert: Element[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child === overlay || child.hasAttribute("inert")) continue;
      child.setAttribute("inert", "");
      madeInert.push(child);
    }

    // Lock the page under the dialog. The overlay carries `data-lenis-prevent`,
    // so the smooth-scroll driver ignores wheel input over it, and the root's
    // overflow stops native (touch, keyboard) scrolling.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      for (const element of madeInert) element.removeAttribute("inert");
      root.style.overflow = previousOverflow;
    };
  }, [openId, close]);

  if (tours.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="tours-title"
      className={tours.length === 1 ? `tours ${st.single}` : "tours"}
    >
      {approached && (
        <>
          <link rel="preconnect" href="https://my.matterport.com" />
          <link rel="preconnect" href="https://static.matterport.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://cdn-2.matterport.com" />
        </>
      )}

      {/* Pinned: the section is taller than the viewport, and the stage holds
          the screen while the track travels sideways. The type stays put and
          the tours move past it, so the section reads as one continuous move
          rather than a row of cards with a screen of dead space beneath. */}
      <div className="tours__stage">
        <div className="tours__head u-shell">
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {t.project.tourEyebrow}
          </p>
          <h2
            id="tours-title"
            className="u-display u-enter mt-4"
            data-reveal="mask"
            data-step="1"
            style={{ fontSize: "var(--text-display)", maxInlineSize: "14ch" }}
          >
            <span className="reveal-inner">{t.project.tourTitle}</span>
          </h2>
          <p
            className="u-body u-enter mt-5"
            data-step="2"
            style={{ color: "var(--color-ink-soft)", maxInlineSize: "38ch" }}
          >
            {metered ? t.project.tourDataWarning : (body ?? t.project.tourBody)}
          </p>
        </div>

        <ul ref={trackRef} className="tours__track" style={{ listStyle: "none", margin: 0 }}>
          {tours.map((tour, index) => (
            <li
              key={tour.id}
              // Posters from small sources are never shown wider than 480 px.
              className={media[tour.poster.key].width < 2000 ? `tours__slot ${st.slotSmall}` : "tours__slot"}
            >
              <button
                type="button"
                ref={(node) => {
                  if (node) cardRefs.current.set(tour.id, node);
                  else cardRefs.current.delete(tour.id);
                }}
                onClick={() => open(tour)}
                className="tours__card"
                aria-haspopup="dialog"
                style={{ ["--i" as string]: index }}
              >
                <span className="tours__media">
                  <Figure
                    ref_={tour.poster}
                    locale={locale}
                    sizes="(min-width: 64rem) 42vw, 80vw"
                    ratio="4 / 3"
                    className="h-full w-full object-cover"
                  />
                  <span aria-hidden className="tours__veil" />
                  {/* The affordance is the whole card, so the marker only has
                      to say what kind of thing opens — not "click here". */}
                  <span aria-hidden className="tours__enter u-eyebrow">
                    360°
                  </span>
                  {renderNote && tour.poster.nature === "render" && (
                    <span
                      className="absolute bottom-3 end-3 rounded-full px-2.5 py-1"
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-paper)",
                        background: "rgb(28 30 20 / 0.55)",
                      }}
                    >
                      {renderNote}
                    </span>
                  )}
                </span>

                <span className="tours__label">
                  <span className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
                    {tour.label[locale]}
                  </span>
                  {tour.ofDelivered && (
                    <span className="u-eyebrow tours__delivered">{t.common.delivered}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Rendered only while open, so no iframe and no WebGL context exists
          until a tour is actually chosen. */}
      {/* Portalled to <body>: inside the page it inherited the stacking context
          of an ancestor (position: relative; z-index: 1), so the fixed header
          painted over it and swallowed taps on the close button. */}
      {active &&
        createPortal(
        <div
          ref={overlayRef}
          className={`tours__overlay ${st.overlay}`}
          role="presentation"
          data-lenis-prevent=""
        >
          <div
            ref={panelRef}
            className="tours__panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${t.project.tourTitle} — ${active.label[locale]}`}
          >
            <div className="tours__poster" data-hidden={frameReady || undefined}>
              <Figure
                ref_={active.poster}
                locale={locale}
                sizes="100vw"
                className="h-full w-full object-cover"
              />
            </div>

            <iframe
              key={active.matterportId}
              title={`${t.project.tourTitle} — ${active.label[locale]}`}
              src={`https://my.matterport.com/show/?m=${active.matterportId}&play=1&qs=1&title=0&brand=0`}
              allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope"
              allowFullScreen
              onLoad={() => setFrameReady(true)}
              className="tours__frame"
            />

            {!frameReady && (
              <p className="u-eyebrow tours__loading on-media">{t.project.tourLoading}…</p>
            )}

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="u-eyebrow tours__close u-press"
              // Matterport's own logo sits top-left and does not mirror, so in
              // Arabic the pill stays on the physical right instead of
              // following inline-end over it.
              style={locale === "ar" ? { insetInlineEnd: "auto", right: "var(--gutter)" } : undefined}
            >
              {t.nav.close}
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden focusable="false">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>,
          document.body,
        )}
    </section>
  );
}
