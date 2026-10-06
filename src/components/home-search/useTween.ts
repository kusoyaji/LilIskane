"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Eases a displayed number towards its target so a figure *travels* as the
 * search changes instead of flickering through every intermediate digit.
 * Short (240ms) and cancelled on each new target, so it never lags a fast
 * typist or a dragged slider. Reduced motion gets the exact value at once.
 */
export function useTween(target: number, duration = 240): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = origin + (target - origin) * eased;
      from.current = value;
      setShown(value);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return shown;
}
