"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { Figure } from "@/components/media/Figure";
import type { Locale } from "@/i18n/config";
import type { MediaRef } from "@/data/types";

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  caption?: string;
  /** Dense-keyframe master, seek-driven on pointer devices. */
  src: string;
  /** Half-resolution loop, for touch. */
  srcSmall: string;
  poster: string;
  altText: string;
  /** Sits behind the film and recedes as it opens. */
  backdrop: MediaRef;
};

/**
 * `still` under reduced motion; `scrub` everywhere else — including touch.
 *
 * There used to be a `loop` mode for touch devices, on the reasoning that
 * seeking during a touch scroll was unreliable on iOS Safari. That was true of
 * iOS 14–15 and is no longer the trade it was; what it produced in practice was
 * a video that autoplayed on its own clock while the reader scrolled past it,
 * which reads as a static clip bolted to the page — the opposite of the effect.
 * Phones now scrub, and the two things that actually make it work are handled
 * explicitly: the mobile encode carries the same dense keyframes as the desktop
 * master (a small file is not a seekable file), and the decoder is primed on
 * first touch, because iOS will not paint a seeked frame until the element has
 * played at least once.
 */
type Mode = "still" | "scrub";

/**
 * The film opens out of the page, and the page moves through it.
 *
 * Three things are driven by one scroll position, which is what makes this read
 * as a single camera move rather than three effects that happen to coincide:
 *
 *   1. the backdrop settles back and darkens, so the page appears to recede;
 *   2. the frame grows from a tile to full-bleed;
 *   3. the film's *playhead* advances.
 *
 * Point 3 is the difference between this and the usual "scroll to expand"
 * treatment. A looping video that merely gets bigger is a poster that happens
 * to move: the footage runs on its own clock and the scroll only reframes it.
 * Here the playhead *is* the scroll position, so the camera travels at exactly
 * the rate the reader scrolls and stops when they stop. They are driving it.
 *
 * One rAF loop does all of it. Progress is written once to a custom property
 * that the backdrop and frame read in CSS, and the same number sets the video's
 * target time — so adding the scrub costs no second subscription and no second
 * layout read.
 *
 * Modes are resolved after mount, never on the server. `scrub` on pointer
 * devices; `loop` on touch, because seeking during a touch scroll is unreliable
 * on iOS Safari and a half-resolution loop is the better failure; `still` under
 * reduced motion, where no video is fetched at all and the poster carries it.
 */
export function ExpandingVideo({
  locale,
  eyebrow,
  title,
  caption,
  src,
  srcSmall,
  poster,
  altText,
  backdrop,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  // Source choice is about bandwidth, not behaviour — both encodes scrub.
  const [small, setSmall] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("still");
      return;
    }
    setSmall(window.matchMedia("(max-width: 47.99rem)").matches);
    setMode("scrub");
  }, []);

  // iOS will not render a seeked frame until the element has played once, so a
  // scrub-only video shows its poster forever. One muted play/pause on the
  // first touch unlocks the decoder; it is removed immediately after.
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
      window.removeEventListener("touchstart", prime);
    };

    window.addEventListener("touchstart", prime, { passive: true, once: true });
    return () => window.removeEventListener("touchstart", prime);
  }, [mode]);

  /**
   * The sequence, as a real timeline rather than four things mapped linearly to
   * one number.
   *
   * That distinction is the whole reason this moved to GSAP. Driving everything
   * off a single `--p` means every layer starts and finishes together, which is
   * legible as *an effect* — the eye sees one slider moving several properties.
   * Staging them is what reads as choreography: the backdrop starts receding
   * immediately, the frame opens slightly behind it, the scrim only arrives once
   * there is something to darken, and the caption lands last, after the film is
   * effectively full-bleed. Same scroll distance, completely different feel.
   *
   * `scrub: 1` gives the timeline a one-second catch-up rather than binding it
   * rigidly to the scroll position, so the sequence has the same weight as the
   * page it lives in — the scroll leads and the animation follows it home.
   *
   * The pin stays in CSS (`position: sticky`) rather than using ScrollTrigger's
   * pin. ScrollTrigger's pin injects a spacer element and rewrites the section's
   * layout on refresh; the sticky version already works, is correct before
   * hydration, and cannot shift the page underneath the reader when the trigger
   * recalculates.
   */
  useEffect(() => {
    if (!mode || mode === "still") return;
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(section);
      const backdrop = q(".film-backdrop")[0];
      const veil = q(".film-backdrop__veil")[0];
      const frame = q(".film-frame")[0];
      const scrim = q(".film-scrim")[0];
      const caption = q(".film-caption")[0];
      const typeBlock = q(".film-type")[0];

      let seekTo = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // The sticky stage is held for the section's height minus one
          // viewport; the timeline is mapped to exactly that travel.
          end: () => `+=${section.offsetHeight - window.innerHeight}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            seekTo = self.progress;
          },
        },
        defaults: { ease: "none" },
      });

      // 0 ────────────────────────────────────────────────── 1
      tl.fromTo(backdrop, { scale: 1 }, { scale: 0.94 }, 0)
        .fromTo(veil, { opacity: 0.15 }, { opacity: 0.7 }, 0)
        .fromTo(frame, { scale: 0.3, yPercent: -6 }, { scale: 1, yPercent: 0 }, 0.05)
        .fromTo(typeBlock, { scale: 0.9 }, { scale: 1 }, 0.05)
        .fromTo(scrim, { opacity: 0 }, { opacity: 1 }, 0.55)
        .fromTo(caption, { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, 0.7);

      // The playhead is eased toward the scroll-derived target on GSAP's own
      // ticker rather than in a second rAF loop, so there is still exactly one
      // loop for the document. Seeks are skipped while one is in flight —
      // issuing a seek every frame thrashes the decoder and is the usual cause
      // of stuttering scroll-video.
      let current = 0;
      const drive = () => {
        const video = videoRef.current;
        const duration = video?.duration;
        if (!video || !Number.isFinite(duration) || !duration) return;
        const target = seekTo * (duration - 0.05);
        current += (target - current) * 0.18;
        if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 30) {
          video.currentTime = current;
        }
      };
      gsap.ticker.add(drive);

      return () => {
        gsap.ticker.remove(drive);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [mode]);

  return (
    <section
      ref={sectionRef}
      className="film-section"
      data-mode={mode ?? "still"}
      aria-labelledby="film-title"
    >
      <div className="film-stage">
        {/* Recedes rather than disappears: the page you arrived on is still
            there behind the film, which is what makes the opening feel like
            depth instead of a slide change. */}
        <div className="film-backdrop">
          <Figure
            ref_={backdrop}
            locale={locale}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div aria-hidden className="film-backdrop__veil" />
        </div>

        <div className="film-frame">
          {mode && mode !== "still" ? (
            <video
              ref={videoRef}
              poster={poster}
              muted
              playsInline
              preload="auto"
              aria-label={altText}
              className="h-full w-full object-cover"
            >
              <source src={small ? srcSmall : src} type="video/mp4" />
            </video>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={poster} alt={altText} className="h-full w-full object-cover" />
          )}
          <div aria-hidden className="film-scrim" />
        </div>

        <div className="film-type">
          <p className="u-eyebrow film-eyebrow">{eyebrow}</p>
          <h2 id="film-title" className="u-display film-title">
            {title}
          </h2>
          {caption && <p className="film-caption u-body">{caption}</p>}
        </div>
      </div>
    </section>
  );
}
