import type { CSSProperties } from "react";

/**
 * The client's Latin wordmark, "CHAABI LIL ISKANE", drawn from their own logo
 * file and painted in `currentColor`.
 *
 * The old standalone PNGs (`wordmark-ink.png` / `wordmark-paper.png`) had been
 * cropped flush against the C, which cut the left of its bowl — the header and
 * footer read "ᑕHAABI" on every page. Rather than ship another hand-crop, the
 * run is masked straight out of `logo-chaabi.png` (500×132, transparent), with
 * 2px of air on every side of its measured bounds (x 123–498, y 54–81). As a
 * mask it takes the exact token colour of its context — ink over paper, paper
 * over media — instead of two baked colour variants.
 *
 * `height` is the box height; the letters fill 28/32 of it, so pass
 * 32/28 × the cap height you want.
 */
const SRC = { w: 500, h: 132 };
const BOX = { x: 121, y: 52, w: 380, h: 32 };

export function Wordmark({ height, className, style }: { height: string; className?: string; style?: CSSProperties }) {
  const u = (n: number) => `calc(${height} * ${n / BOX.h})`;
  const mask = {
    maskImage: "url(/brand/logo-chaabi.png)",
    WebkitMaskImage: "url(/brand/logo-chaabi.png)",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: `${u(SRC.w)} ${u(SRC.h)}`,
    WebkitMaskSize: `${u(SRC.w)} ${u(SRC.h)}`,
    maskPosition: `${u(-BOX.x)} ${u(-BOX.y)}`,
    WebkitMaskPosition: `${u(-BOX.x)} ${u(-BOX.y)}`,
  } as CSSProperties;

  return (
    <span
      aria-hidden
      // Display comes from the class (default `block`), never inline, so a
      // caller's `hidden sm:block` still works.
      className={className ?? "block"}
      style={{
        flexShrink: 0,
        blockSize: height,
        inlineSize: u(BOX.w),
        background: "currentColor",
        ...mask,
        ...style,
      }}
    />
  );
}
