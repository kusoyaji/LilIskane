"use client";

import { useEffect, useRef, useState } from "react";
import s from "./YouTubeFilm.module.css";

/**
 * Click-to-play YouTube.
 *
 * Nothing from YouTube loads until the visitor asks for it: the poster (a
 * server-rendered `Figure`, passed in as children so the media manifest never
 * reaches the browser) sits under a play button, and only a press mounts the
 * privacy-enhanced iframe with autoplay. A page with three films therefore costs
 * three images, not three players — about 1.5 MB of third-party script each.
 */
export function YouTubePlayer({
  youtubeId,
  title,
  playLabel,
  badge,
  children,
}: {
  youtubeId: string;
  title: string;
  playLabel: string;
  /** Shown over the poster only (e.g. the non-contractual note on a render). */
  badge?: string;
  children: React.ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The pressed button unmounts as the player mounts; hand focus to the
  // player so a keyboard user lands on its controls, not back at <body>.
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);

  return (
    <div className={s.frame}>
      {playing ? (
        <iframe
          ref={iframeRef}
          className={s.iframe}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className={`${s.poster} u-press`} onClick={() => setPlaying(true)} aria-label={`${playLabel} — ${title}`}>
          {children}
          <span aria-hidden className={s.scrim} />
          <span aria-hidden className={s.play}>
            <svg width="18" height="18" viewBox="0 0 24 24" focusable="false">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
            <span className={s.playLabel}>{playLabel}</span>
          </span>
        </button>
      )}
      {badge && !playing && <span className={s.badge}>{badge}</span>}
    </div>
  );
}
