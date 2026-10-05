"use client";

import { useEffect, useId, useState } from "react";
import { flushSync } from "react-dom";
import s from "./legal.module.css";

type Item = { id: string; num: string; title: string };

/**
 * Table of contents for a legal page.
 *
 * Desktop: a sticky rail that marks the section being read. Below 64rem it
 * collapses behind a toggle, because nine links stacked above the first
 * paragraph would push the content a full screen down on a phone.
 *
 * Clicking a link scrolls to the section and moves focus to it, so keyboard
 * and screen-reader users land where sighted users do. The active section is
 * the last one whose top has crossed a line a third of the way down the
 * viewport — a scroll listener over a handful of elements is cheaper and more
 * predictable here than juggling IntersectionObserver ratios.
 */
export function LegalToc({ label, items }: { label: string; items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      // At the very bottom the last sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = items[items.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    // Collapse the mobile list first, synchronously: scrolling while it is
    // still open would aim at a position that moves up by the list height.
    flushSync(() => setOpen(false));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav aria-label={label}>
      <button
        type="button"
        className={`u-eyebrow ${s.tocToggle}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path
            d="M5 9l7 7 7-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className={`u-eyebrow ${s.tocLabel}`} aria-hidden>
        {label}
      </p>
      <ol id={listId} className={s.tocList} data-open={open}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={s.tocLink}
              aria-current={active === item.id ? "true" : undefined}
              onClick={(e) => go(e, item.id)}
            >
              <span className={s.tocNum}>{item.num}</span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
