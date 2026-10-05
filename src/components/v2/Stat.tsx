"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";
import s from "./v2.module.css";

/**
 * A large figure that counts up once, when it first comes into view.
 *
 * The count runs on a fast-start curve and lands on the exact value, so the
 * number a reader settles on is always the true one. Years (e.g. 1948) pass
 * `plain` so they are not grouped as "1 948". Under reduced motion the final
 * value is rendered immediately — there is nothing to watch, only to read.
 */
export function Stat({
  value,
  label,
  locale,
  prefix = "",
  suffix = "",
  plain = false,
  duration = 1600,
  size = "lg",
}: {
  value: number;
  label: string;
  locale: Locale;
  prefix?: string;
  suffix?: string;
  plain?: boolean;
  duration?: number;
  /** `md` fits four figures across a row even when one is "11 000". */
  size?: "lg" | "md";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Start from zero only once we know we will animate, so the server render
    // (and any no-JS reader) shows the real figure.
    setShown(plain ? Math.max(0, value - 60) : 0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const from = plain ? Math.max(0, value - 60) : 0;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setShown(Math.round(from + (value - from) * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, plain]);

  const text = plain ? String(shown) : formatNumber(shown, locale);

  return (
    <div ref={ref} className={s.stat}>
      <span className={`${s.statFigure} ${size === "md" ? s.statFigureMd : ""}`} dir="ltr">
        {prefix}
        {text}
        {suffix}
      </span>
      <span className={s.statLabel}>{label}</span>
    </div>
  );
}
