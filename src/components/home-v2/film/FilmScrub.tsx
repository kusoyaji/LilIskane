"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import s from "./Film.module.css";

type Props = {
  /** Dense-keyframe master (desktop). */
  src: string;
  /** Portrait encode for phones — same keyframe density, so it still scrubs. */
  srcSmall: string;
  /** First frame of `src` (landscape). */
  poster: string;
  /** First frame of `srcSmall` (portrait). */
  posterSmall: string;
  /** Media query that selects the phone encode and poster. */
  phoneQuery: string;
  alt: string;
  /** The beats, chapter rail and cue — server-rendered, choreographed here. */
  children: React.ReactNode;
};

type Connection = { saveData?: boolean; effectiveType?: string };

/** Where in the scroll each beat is fully on screen — used to bring a beat
 *  into view when keyboard focus lands inside it. */
const BEAT_AT = [0, 0.47, 0.84];

/** Where the stage hands over to the heritage panel: from here to the end of
 *  the track the type, rail and caption leave, so that when the sticky stage
 *  releases and scrolls away it carries the image only — never a CTA pair or a
 *  chapter rail riding up over the next section and under the header. */
const HANDOFF = 0.88;

/**
 * The stage of the opening film, and the only part of it that needs script.
 *
 * Techniques carried over from `CinematicSequence` / `ExpandingVideo`:
 *
 * - the poster is an ordinary `<img>` underneath the video, so the first frame
 *   is on screen from the HTML alone, and the video fades in over it only once
 *   it has a decoded frame — there is never a black rectangle;
 * - the playhead is *eased* toward the scroll-derived target on GSAP's ticker,
 *   and a new seek is never issued while one is in flight (seeking every frame
 *   thrashes the decoder, which is the usual cause of stuttering scroll-video);
 * - iOS will not paint a seeked frame until the element has played once, so a
 *   muted play/pause on the first touch unlocks the decoder;
 * - metered connections keep `preload="metadata"` and fetch ranges as they
 *   seek, rather than spending the whole file up front.
 *
 * The stage is held with `position: sticky` inside the tall section rather
 * than by ScrollTrigger's `pin`. This is the first section on the page: a pin
 * spacer here would shift every trigger below it, and those triggers (the
 * site-wide reveals, and the other home sections) are created before this one.
 * Sticky is correct before hydration, needs no spacer, and the timeline maps
 * to exactly the same travel.
 */
export function FilmScrub({ src, srcSmall, poster, posterSmall, phoneQuery, alt, children }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"pending" | "scrub" | "still">("pending");
  const [small, setSmall] = useState(false);
  const [buffer, setBuffer] = useState(false);
  const [ready, setReady] = useState(false);

  // Resolve the mode after mount, so the server output is always the safe one.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("still");
      return;
    }
    setSmall(window.matchMedia(phoneQuery).matches);
    setMode("scrub");
  }, [phoneQuery]);

  // This film *is* the first screen, so it buffers as soon as the page has
  // loaded (the poster — the LCP — is already in) rather than on approach.
  useEffect(() => {
    if (mode !== "scrub") return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const metered =
      connection?.saveData === true || /^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? "");
    if (metered) return;
    if (document.readyState === "complete") {
      setBuffer(true);
      return;
    }
    const onLoad = () => setBuffer(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [mode]);

  // iOS decoder unlock on first touch.
  useEffect(() => {
    if (mode !== "scrub") return;
    const video = videoRef.current;
    if (!video) return;
    let done = false;
    const prime = () => {
      if (done) return;
      done = true;
      void video
        .play()
        .then(() => video.pause())
        .catch(() => {});
    };
    window.addEventListener("touchstart", prime, { passive: true, once: true });
    return () => window.removeEventListener("touchstart", prime);
  }, [mode]);

  // The choreography: one scroll position → playhead, beats, rail, cue.
  useEffect(() => {
    if (mode !== "scrub") return;
    const stage = stageRef.current;
    const section = stage?.parentElement;
    if (!stage || !section) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(stage);
      const beats = q("[data-beat]") as HTMLElement[];
      const fills = q("[data-chapter]");
      const cue = q("[data-cue]");
      const media = q("[data-media]");
      const floor = q("[data-floor]");
      const overlay = q("[data-overlay]");
      if (beats.length < 3) return;

      const parts = (el: HTMLElement) => Array.from(el.children);
      let target = 0;

      const setActive = (p: number) => {
        beats[0].toggleAttribute("data-active", p < 0.2);
        beats[1].toggleAttribute("data-active", p >= 0.3 && p < 0.6);
        beats[2].toggleAttribute("data-active", p >= 0.7 && p < 0.97);
      };
      setActive(0);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            target = self.progress;
            setActive(self.progress);
          },
        },
      });

      // Normalise the timeline to a length of 1, so every position below
      // reads directly as a fraction of the scroll.
      tl.to({}, { duration: 1 }, 0);

      tl.to(cue, { opacity: 0, y: 24, duration: 0.05 }, 0.005);

      // The frame settles as the camera starts walking: a slow push from
      // slightly over-scale, so the first scroll already feels like depth.
      tl.fromTo(media, { scale: 1.07 }, { scale: 1, duration: 0.6, ease: "power1.out" }, 0);

      // Beat 1 leaves as the camera reaches the façade.
      tl.to(parts(beats[0]), { opacity: 0, y: -56, stagger: 0.012, duration: 0.08, ease: "power1.in" }, 0.17);

      // Beat 2 holds through the courtyard.
      tl.fromTo(
        parts(beats[1]),
        { opacity: 0, y: 64 },
        { opacity: 1, y: 0, stagger: 0.014, duration: 0.09, ease: "power2.out" },
        0.3,
      );
      tl.to(parts(beats[1]), { opacity: 0, y: -56, stagger: 0.012, duration: 0.08, ease: "power1.in" }, 0.56);

      // Beat 3 lands at the threshold of the salon and stays.
      tl.fromTo(
        parts(beats[2]),
        { opacity: 0, y: 64 },
        { opacity: 1, y: 0, stagger: 0.014, duration: 0.09, ease: "power2.out" },
        0.7,
      );
      tl.to(floor, { opacity: 1, duration: 0.1 }, 0.64);

      // Chapter rail.
      tl.fromTo(fills[0], { scaleX: 0 }, { scaleX: 1, duration: 0.29 }, 0)
        .fromTo(fills[1], { scaleX: 0 }, { scaleX: 1, duration: 0.36 }, 0.29)
        .fromTo(fills[2], { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 0.65);

      // Hand-over: everything typographic lifts away together over the last
      // stretch of the track, so the stage reaches the heritage seam as image
      // alone.
      tl.to(overlay, { opacity: 0, yPercent: -2, duration: 1 - HANDOFF, ease: "power1.in" }, HANDOFF);

      // Playhead, eased toward the scroll target on GSAP's own ticker.
      let current = 0;
      const drive = () => {
        const video = videoRef.current;
        const duration = video?.duration;
        if (!video || !duration || !Number.isFinite(duration)) return;
        const goal = target * (duration - 0.05);
        current += (goal - current) * 0.16;
        if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 30) {
          video.currentTime = current;
        }
      };
      gsap.ticker.add(drive);

      // Keyboard: focus landing in a beat that is not on screen brings the
      // scroll to where that beat is.
      const onFocus = (event: FocusEvent) => {
        const beat = (event.target as Element | null)?.closest<HTMLElement>("[data-beat]");
        const st = tl.scrollTrigger;
        if (!beat || !st || beat.hasAttribute("data-active")) return;
        const at = BEAT_AT[Number(beat.dataset.beat)] ?? 0;
        window.scrollTo({ top: st.start + (st.end - st.start) * at, behavior: "auto" });
      };
      stage.addEventListener("focusin", onFocus);

      return () => {
        stage.removeEventListener("focusin", onFocus);
        gsap.ticker.remove(drive);
        tl.scrollTrigger?.kill();
        tl.kill();
        beats.forEach((b) => b.removeAttribute("data-active"));
      };
    });

    return () => mm.revert();
  }, [mode]);

  return (
    <div ref={stageRef} className={s.stage} data-mode={mode}>
      <div className={s.media} data-media>
        {/* The film's own first frame, served as-is from /public/video — it
            is the LCP and must not wait on the image optimiser. Phones get
            the portrait cut, matching the portrait encode. */}
        <picture>
          <source media={phoneQuery} srcSet={posterSmall} width={720} height={1280} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={alt}
            width={1920}
            height={1080}
            className={s.poster}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        {mode === "scrub" && (
          <video
            ref={videoRef}
            className={s.video}
            data-ready={ready}
            poster={small ? posterSmall : poster}
            muted
            playsInline
            preload={buffer ? "auto" : "metadata"}
            aria-hidden
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
          >
            <source src={small ? srcSmall : src} type="video/mp4" />
          </video>
        )}
        <div aria-hidden className={s.scrimTop} />
        <div aria-hidden className={s.scrimSide} />
        <div aria-hidden className={s.scrimFloor} data-floor />
      </div>
      {children}
    </div>
  );
}
