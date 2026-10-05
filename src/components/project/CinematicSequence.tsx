"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Cinematic } from "@/data/types";

type Props = {
  locale: Locale;
  cinematic: Cinematic;
  eyebrow: string;
  title: string;
  captions: string[];
  altText: string;
  /** Small print under the title, e.g. the non-contractual render note. */
  note?: string;
};

/** Chosen after mount, so the server always renders the safe static shell. */
type Mode = "static" | "scrub" | "loop";

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * When the scrub master starts buffering, expressed as an observer root margin.
 *
 * This section sits directly under the hero, so it is already at the fold. A
 * positive margin — like the 700 px the 360 tour uses, which is several
 * sections lower — would count the section as "approaching" while the visitor
 * is still parked on the hero, and buffer 5.6 MB against the LCP the moment the
 * page hydrated (measured: the whole file fetched at 88 ms, scrollY 0). The
 * negative bottom margin instead holds off until the section is genuinely
 * scrolled into view, so a visitor who never leaves the hero never pays for it,
 * and the pin still gives a full viewport of travel to buffer across before the
 * scrub actually begins.
 */
const PRELOAD_MARGIN = "0px 0px -12% 0px";

/**
 * The camera path, as the film it always wanted to be.
 *
 * This replaces the three cross-faded stills that stood in for a camera move.
 * The video is scrubbed by scroll position rather than played: you are not
 * watching footage, you are driving it, and the building comes toward you at
 * exactly the rate you scroll. That is the difference between a video on a page
 * and a page that moves through space.
 *
 * Three modes, decided after mount so the server output is never wrong:
 *
 * - `scrub`  — pointer devices. Pinned, seek-driven, 5.6 MB with a keyframe
 *              every 5 frames so any seek lands immediately.
 * - `loop`   — touch and small screens. Seeking during a touch scroll is
 *              unreliable on iOS Safari and janky everywhere else, so the phone
 *              gets a muted autoplaying loop of a 0.95 MB encode instead.
 * - `static` — reduced motion, and the server render. Poster frame with every
 *              caption listed at once. No video is fetched at all.
 */
export function CinematicSequence({ locale, cinematic, eyebrow, title, captions, altText, note }: Props) {
  // The heading block sits at inline-start, so the side shade follows it: on
  // the left in French, on the right in Arabic, where beats 1–2 are open sky.
  const textSide = locale === "ar" ? "left" : "right";
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("static");
  const [ready, setReady] = useState(false);
  /** Bandwidth only — both encodes seek. */
  const [small, setSmall] = useState(false);
  // The scrub master is 5.6 MB and this section sits directly under the hero,
  // whose image is the page's LCP. `preload="auto"` at mount would have the
  // browser buffer the whole film the instant the component hydrates, racing
  // the LCP for bandwidth. So the video starts at `metadata` — enough to read
  // its duration and show the first frame — and only upgrades to full buffering
  // once the section is on approach, by which point the LCP image (preloaded in
  // the document head) has long since been requested.
  const [buffer, setBuffer] = useState(false);
  const meteredRef = useRef(false);

  // Touch scrubs too, as of the mobile encode gaining dense keyframes. The old
  // `loop` fallback dated from iOS 14–15, where seeking mid-scroll was
  // genuinely unreliable; what it produced on a modern phone was a clip playing
  // on its own clock while the reader scrolled past it, which reads as a static
  // video welded to the page. `loop` is kept in the type only as the state
  // before the mode resolves.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSmall(window.matchMedia("(max-width: 47.99rem)").matches);
    setMode("scrub");
  }, []);

  // iOS paints no seeked frame until the element has played once, so a
  // scroll-only video would sit on its poster forever. One muted play/pause on
  // the first touch unlocks the decoder.
  useEffect(() => {
    if (mode !== "scrub") return;
    const video = videoRef.current;
    if (!video) return;
    let done = false;
    const prime = () => {
      if (done) return;
      done = true;
      void video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener("touchstart", prime, { passive: true, once: true });
    return () => window.removeEventListener("touchstart", prime);
  }, [mode]);

  // Upgrade to full buffering on approach, mirroring the 360 tour: an observer
  // 700 px ahead of the viewport, and the same metered-connection gate — on
  // saveData or 2G/3G the file stays at `metadata` and buffers ranges lazily as
  // the scrub seeks, rather than spending 5.6 MB of someone's data up front.
  useEffect(() => {
    if (mode !== "scrub") return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    meteredRef.current =
      connection?.saveData === true || /^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? "");
    if (meteredRef.current) return;

    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setBuffer(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setBuffer(true);
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mode]);

  // Scroll-driven seeking. The target comes from scroll; the playhead eases
  // toward it rather than snapping, which is what makes a scrub feel like a
  // camera rather than a slider. Seeks are skipped while one is already in
  // flight — issuing a new seek every frame thrashes the decoder and is the
  // usual reason scroll-video stutters.
  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let frame = 0;
    let current = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      frame = requestAnimationFrame(tick);

      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      section.style.setProperty("--p", String(progress));

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const target = progress * (duration - 0.05);
      current += (target - current) * 0.18;

      if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 30) {
        video.currentTime = current;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [mode, ready]);

  const beats = captions.length;

  return (
    <section
      ref={sectionRef}
      data-nav-media
      aria-labelledby="cine-title"
      className="cine-section"
      data-mode={mode}
      style={{ ["--beats" as string]: beats, background: "var(--color-ink)" }}
    >
      <div className="cine-stage">
        <div className="cine-media">
          {mode === "static" ? (
            <img
              src={cinematic.poster}
              alt={altText}
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              // The poster carries the frame until the first decode lands, so
              // there is never a black rectangle.
              poster={cinematic.poster}
              muted
              playsInline
              preload={mode === "scrub" && buffer ? "auto" : "metadata"}
              onLoadedData={() => setReady(true)}
              aria-label={altText}
              className="h-full w-full object-cover"
            >
              <source src={small ? cinematic.mp4Small : cinematic.mp4} type="video/mp4" />
            </video>
          )}

          <div
            aria-hidden
            className="cine-scrim"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--color-ink) 80%, transparent) 0%, color-mix(in oklab, var(--color-ink) 20%, transparent) 34%, transparent 60%), " +
                "linear-gradient(to bottom, color-mix(in oklab, var(--color-ink) 72%, transparent) 0%, color-mix(in oklab, var(--color-ink) 40%, transparent) 30%, transparent 52%), " +
                `linear-gradient(to ${textSide}, color-mix(in oklab, var(--color-ink) 55%, transparent) 0%, transparent 55%)`,
            }}
          />
        </div>

        <div
          className="on-media cine-head"
          style={{ padding: "calc(var(--nav-h) + 1.75rem) var(--gutter) 0" }}
        >
          <p className="u-eyebrow" style={{ color: "var(--color-ochre-bright)", textShadow: "0 1px 2px rgb(0 0 0 / 0.45)" }}>
            {eyebrow}
          </p>
          <h2
            id="cine-title"
            className="u-display mt-4"
            style={{
              fontSize: "var(--text-display)",
              color: "var(--color-paper)",
              maxInlineSize: "14ch",
              textShadow: "0 1px 18px rgb(0 0 0 / 0.28)",
            }}
          >
            {title}
          </h2>
          {note && (
            <p
              className="mt-4"
              style={{
                fontSize: "var(--text-label)",
                fontWeight: 500,
                color: "color-mix(in oklab, var(--color-paper) 84%, transparent)",
                textShadow: "0 1px 2px rgb(0 0 0 / 0.45)",
              }}
            >
              {note}
            </p>
          )}
        </div>

        {/* Captions crossfade on the same progress value that drives the
            playhead, so the words are always describing the frame on screen. */}
        <div
          className="on-media cine-foot"
          style={{ padding: "0 var(--gutter) clamp(2rem, 5vw, 3.5rem)" }}
        >
          <div className="cine-captions">
            {captions.map((caption, index) => (
              <p
                key={caption}
                className="cine-caption u-body"
                style={{
                  ["--i" as string]: index,
                  color: "color-mix(in oklab, var(--color-paper) 92%, transparent)",
                }}
              >
                {caption}
              </p>
            ))}
          </div>

          {/* Where you are in the journey. Quiet, but it tells you the section
              has an end — without it a pinned block reads as a stuck page. */}
          <div className="cine-progress" aria-hidden>
            <span className="cine-progress__fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
