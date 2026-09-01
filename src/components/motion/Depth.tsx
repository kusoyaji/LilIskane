"use client";

import { useRef, type ReactNode } from "react";
import { useScrollProgress } from "./useScrollProgress";

/**
 * A band of media whose contents move at rates set by how far away they are.
 *
 * The reason a photograph drifting past reads as *distance* rather than as an
 * effect is that things at different depths move at different rates. That is
 * the whole mechanism; there is nothing else to it.
 *
 * One scroll subscription for the entire band, never one per image. Children
 * read the same `--p` the band writes and multiply it by their own `--depth`,
 * so adding a seventh photograph to a field costs nothing at all. Six images
 * each running their own listener is precisely how this effect turns into the
 * jank it was supposed to avoid.
 */
export function DepthField({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  /** Ground colour this band hands to the page field. */
  tone?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref);

  return (
    <div ref={ref} data-tone={tone} className={`depth-field ${className ?? ""}`}>
      {children}
    </div>
  );
}

/**
 * `depth` runs 0 (pinned to the page, moves with it) to 1 (nearest the viewer,
 * moves most). Values above ~0.8 start reading as a glitch rather than as
 * parallax, because the image outruns the scroll it is supposed to belong to.
 */
export function Depth({
  depth = 0.5,
  children,
  className,
}: {
  depth?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`depth ${className ?? ""}`}
      style={{ "--depth": depth } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
