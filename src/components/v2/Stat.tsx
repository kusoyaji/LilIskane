"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";
import s from "./v2.module.css";

/**
 * A large figure that counts up once, when it first comes into view.
 *
 * The count runs on a fast-start curve and lands on the exact value, so the
 * number a reader settles on is always the true one. Years (e.g. 1948) pass
 * `plain`: they are not grouped as "1 948" and they never count — only
 * quantities do. Under reduced motion the final value is rendered immediately.
 */
export function Stat({
  value,
  label,
  locale,
  prefix = "",
  suffix = "",
  plain = false,
  duration = 1100,
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
    // Years never count. A year tweened from value−60 spent a second and a half
    // on screen as false dates — "1941 Création de l'AFCA", "1997 certifiée
    // ISO" — beside facts the client's leadership knows by heart. A date is a
    // fact to read, not a quantity to watch grow; the surrounding reveal
    // (u-enter / mask) gives it its entrance.
    if (plain) {
      setShown(value);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Quantities start from 60% rather than zero: the count reads as arrival,
    // and every intermediate figure stays in the right order of magnitude.
    // Set only once we know we will animate, so the server render (and any
    // no-JS reader) shows the real figure.
    const from = Math.round(value * 0.6);
    setShown(from);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
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
