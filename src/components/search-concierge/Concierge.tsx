"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { searchCopy } from "@/content/search";
import { focusHeroTarget } from "./hero-target";
import { prefetchIndex } from "./index-cache";
import s from "./Trigger.module.css";

/**
 * The concierge search — everything the header needs, and nothing more.
 *
 * The overlay itself (parser, ranker, results, filters) is a separate chunk,
 * loaded with `next/dynamic` and `ssr: false`: the header only carries the
 * triggers, the shortcuts and this hook. Both the chunk and the index are
 * warmed on the first sign of intent — a pointer over a trigger, focus on it,
 * or the shortcut — so by the time the click lands they are usually there.
 */
const loadOverlay = () => import("./ConciergeOverlay");
const Overlay = dynamic(() => loadOverlay().then((m) => m.ConciergeOverlay), { ssr: false });

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"].includes(target.type);
  }
  return false;
}

export function useConcierge(locale: Locale): {
  show: (from?: Element | null) => void;
  warm: () => void;
  overlay: ReactNode;
} {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /** Bumped by a shortcut while already open: the overlay refocuses its field. */
  const [nonce, setNonce] = useState(0);
  const returnTo = useRef<HTMLElement | null>(null);

  const warm = useCallback(() => {
    prefetchIndex(locale);
    loadOverlay().catch(() => {});
  }, [locale]);

  const show = useCallback(
    (from?: Element | null) => {
      // The home's hero field is the search while it is on screen.
      if (focusHeroTarget()) return;
      warm();
      // A field scrolled out of view (the home's hero field, after Ctrl/⌘K from the results) must
      // not get focus back on close: the browser would scroll the page back up to it.
      const offscreen =
        from instanceof HTMLElement &&
        (from instanceof HTMLInputElement || from instanceof HTMLTextAreaElement) &&
        (from.getBoundingClientRect().bottom < 0 || from.getBoundingClientRect().top > window.innerHeight);
      if (offscreen) {
        (from as HTMLElement).blur();
        returnTo.current = null;
      } else if (from instanceof HTMLElement && from !== document.body) returnTo.current = from;
      setMounted(true);
      setOpen(true);
      setNonce((n) => n + 1);
    },
    [warm],
  );

  // Ctrl/⌘+K anywhere; "/" when focus is not in a field. `code` as well as
  // `key`, so the shortcut still works with an Arabic keyboard layout, where
  // the K key types "ن".
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const k = event.key === "k" || event.key === "K" || event.code === "KeyK";
      if (k && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        show(document.activeElement);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        show(document.activeElement);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [show]);

  const onClosed = useCallback(() => setOpen(false), []);

  return {
    show,
    warm,
    overlay: mounted ? (
      <Overlay locale={locale} open={open} nonce={nonce} onClosed={onClosed} returnTo={returnTo} />
    ) : null,
  };
}

function Magnifier({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" className={s.glyph}>
      <circle cx="10.5" cy="10.5" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** The key hint, platform-aware once mounted (the server cannot know: it renders "Ctrl K"). */
function useModKey(): string {
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platform = nav.userAgentData?.platform || nav.platform || "";
    if (/mac|iphone|ipad/i.test(platform)) setMod("⌘");
  }, []);
  return mod;
}

/**
 * The header triggers. `bar`: from 1280px, a pill in the bar (in French an
 * icon until 1440px — the French nav needs nearly all of the bar at 1280 and
 * must never wrap — and the key hint only from 1536px). `icon`: below 1280, a
 * 44px button beside the call button and the menu.
 */
export function SearchTrigger({
  variant,
  locale,
  light,
  show,
  warm,
}: {
  variant: "bar" | "icon";
  locale: Locale;
  light: boolean;
  show: (from?: Element | null) => void;
  warm: () => void;
}) {
  const c = searchCopy[locale];
  const mod = useModKey();
  const shortcut = mod === "⌘" ? "⌘K" : "Ctrl K";
  const common = {
    type: "button" as const,
    "data-light": light || undefined,
    "aria-label": c.triggerLabel,
    "aria-haspopup": "dialog" as const,
    "aria-keyshortcuts": "Control+K Meta+K /",
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => show(event.currentTarget),
    onPointerEnter: warm,
    onFocus: warm,
    onTouchStart: warm,
  };
  if (variant === "icon") {
    return (
      <button {...common} className={`${s.icon} u-press`}>
        <Magnifier size={20} />
      </button>
    );
  }
  return (
    <button {...common} className={`${s.bar} u-press`} data-locale={locale} title={`${c.triggerLabel} (${shortcut})`}>
      <Magnifier size={15} />
      <span className={s.barLabel} aria-hidden>
        {c.trigger}
      </span>
      <kbd className={s.kbd} aria-hidden dir="ltr">
        {shortcut}
      </kbd>
    </button>
  );
}

/** First row of the mobile menu: looks like a field, opens the overlay. */
export function SearchMenuRow({ locale, onActivate, warm }: { locale: Locale; onActivate: () => void; warm: () => void }) {
  const c = searchCopy[locale];
  return (
    <button
      type="button"
      className={`${s.menuRow} u-press`}
      aria-haspopup="dialog"
      onClick={onActivate}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
    >
      <Magnifier size={20} />
      <span>{c.menuRow}</span>
    </button>
  );
}
