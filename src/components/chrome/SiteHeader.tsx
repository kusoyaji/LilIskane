"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { useNavOverMedia } from "./useNavOverMedia";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  const overMedia = useNavOverMedia();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: `/${locale}/projets`, label: t.nav.projects },
    { href: `/${locale}/a-propos`, label: t.nav.about },
    { href: `/${locale}/guide-achat`, label: t.nav.guide },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  // The language toggle keeps you where you are. Sending someone back to the
  // homepage because they switched to Arabic is the single most common way
  // bilingual sites lose people mid-task.
  const otherLocale: Locale = locale === "fr" ? "ar" : "fr";
  const swappedPath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${otherLocale}`);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap. Without it, tabbing out of an open full-screen menu lands
      // on links behind the overlay that a sighted user cannot see.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const light = overMedia && !menuOpen;

  return (
    <header
      data-light={light || undefined}
      className="group/hdr fixed inset-inline-0 top-0 z-50 h-[var(--nav-h)]"
      style={{ insetInlineStart: 0, insetInlineEnd: 0 }}
    >
      {/* Scrim rather than a solid bar: over media the header should feel like
          it is lit from the image, not bolted on top of it. Over paper the
          scrim fades out and a hairline takes over. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-inline-0 top-0 h-[9rem] transition-opacity duration-500"
        style={{
          insetInlineStart: 0,
          insetInlineEnd: 0,
          opacity: light ? 1 : 0,
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-ink) 62%, transparent), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-inline-0 top-0 h-[var(--nav-h)] transition-opacity duration-500"
        style={{
          insetInlineStart: 0,
          insetInlineEnd: 0,
          opacity: light ? 0 : 1,
          background: "var(--color-paper)",
          borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)",
        }}
      />

      <nav
        aria-label={t.nav.menu}
        className={`relative flex h-full items-center justify-between gap-6 ${light ? "on-media" : ""}`}
        style={{ paddingInline: "var(--gutter)" }}
      >
        {/* A bilingual lockup: the company's name in both of its scripts, the way
            it signs its own buildings. On phones only the reader's language
            fits beside the call button, so the other script steps out. */}
        <Link
          href={`/${locale}`}
          className={`flex h-11 shrink-0 items-center gap-3 ${locale === "ar" ? "flex-row-reverse" : ""}`}
          aria-label={t.footer.company}
          style={{ lineHeight: 0, color: light ? "var(--color-paper)" : "var(--color-ink)" }}
        >
          <Image
            src={light ? "/brand/wordmark-paper.png" : "/brand/wordmark-ink.png"}
            alt=""
            width={371}
            height={28}
            priority
            className={`h-[0.62rem] w-auto sm:h-[0.88rem] ${locale === "ar" ? "hidden sm:block" : ""}`}
          />
          <span aria-hidden className="hidden h-4 w-px sm:block" style={{ background: "currentColor", opacity: 0.35 }} />
          <span
            lang="ar"
            dir="rtl"
            className={locale === "ar" ? "" : "hidden sm:inline"}
            style={{ fontFamily: "var(--font-plex-arabic), sans-serif", fontWeight: 600, fontSize: "1.02rem", lineHeight: 1, letterSpacing: 0 }}
          >
            الشعبي للإسكان
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="u-eyebrow relative py-2 u-press"
                  style={{ color: light ? "var(--color-paper)" : "var(--color-ink)" }}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-inline-0 -bottom-1 block h-px"
                      style={{
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        background: light ? "var(--color-paper)" : "var(--color-ochre)",
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-4">
          {/* Hidden below `lg`, where it moves into the menu panel.
              At 390px the bar was overflowing by 41px and pushing the menu
              button entirely off-screen — measured 402–431px in a 390px
              viewport, i.e. untappable. The phone number stays visible because
              it is the conversion; the language toggle is the low-frequency
              control of the three, so it is the one that moves. */}
          <Link
            href={swappedPath}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="u-eyebrow hidden items-center px-2 py-3 u-press lg:inline-flex"
            style={{ color: light ? "var(--color-paper)" : "var(--color-ink)" }}
          >
            <span className="u-visually-hidden">{t.nav.language}: </span>
            {t.nav.switchTo}
          </Link>

          {/* The phone number is the conversion, so it is a real number the
              whole time — never an icon that hides it, and never a popup. */}
          <a
            href={t.nav.phoneHref}
            className="u-eyebrow u-numeric flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 u-press"
            style={{
              background: light ? "color-mix(in oklab, var(--color-paper) 92%, transparent)" : "var(--color-ink)",
              color: light ? "var(--color-ink)" : "var(--color-paper)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
              <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.58 3.6 1 1 0 01-.25 1z" />
            </svg>
            <span className="hidden sm:inline">{t.nav.phone}</span>
            <span className="sm:hidden">{t.nav.callUs}</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            /* 44px is the minimum comfortable touch target; this was 40×29. */
            className="-me-1 flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
            style={{ color: light ? "var(--color-paper)" : "var(--color-ink)" }}
          >
            <span className="u-visually-hidden">{menuOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden focusable="false">
              <line
                x1="2" y1={menuOpen ? "11" : "7"} x2="20" y2={menuOpen ? "11" : "7"}
                stroke="currentColor" strokeWidth="1.5"
                style={{
                  transformOrigin: "center",
                  transform: menuOpen ? "rotate(45deg)" : "none",
                  transition: "transform var(--dur-ui) var(--ease-ui), y var(--dur-ui) var(--ease-ui)",
                }}
              />
              <line
                x1="2" y1={menuOpen ? "11" : "15"} x2="20" y2={menuOpen ? "11" : "15"}
                stroke="currentColor" strokeWidth="1.5"
                style={{
                  transformOrigin: "center",
                  transform: menuOpen ? "rotate(-45deg)" : "none",
                  transition: "transform var(--dur-ui) var(--ease-ui), y var(--dur-ui) var(--ease-ui)",
                }}
              />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id={menuId}
          ref={panelRef}
          className="fixed inset-0 top-[var(--nav-h)] lg:hidden"
          style={{ background: "var(--color-paper)" }}
        >
          <ul
            className="flex flex-col"
            style={{ listStyle: "none", margin: 0, padding: "var(--gutter)" }}
          >
            {links.map((link) => (
              <li key={link.href} className="u-rule first:border-0">
                <Link
                  href={link.href}
                  className="u-display-tight block py-5"
                  style={{ fontSize: "var(--text-title)", color: "var(--color-ink)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Moved out of the bar so the menu button fits — see the note
                there. It reads as a peer of the other destinations here. */}
            <li className="u-rule">
              <Link
                href={swappedPath}
                hrefLang={otherLocale}
                lang={otherLocale}
                className="u-display-tight block py-5"
                style={{ fontSize: "var(--text-title)", color: "var(--color-ink)" }}
              >
                <span className="u-visually-hidden">{t.nav.language}: </span>
                {t.nav.switchTo}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
