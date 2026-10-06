"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AiAnswerCard } from "@/components/search-concierge/AiAnswerCard";
import { registerHeroTarget } from "@/components/search-concierge/hero-target";
import { ChipList } from "@/components/search-concierge/parts/ChipList";
import { FacetButton } from "@/components/search-concierge/parts/FacetButton";
import { MarkedInput } from "@/components/search-concierge/parts/MarkedInput";
import { relaxedSentence, type FacetGroup } from "@/components/search-concierge/parts/model";
import { Arrow } from "@/components/v2/LinkButton";
import { Lattice } from "@/components/v2/Lattice";
import v2 from "@/components/v2/v2.module.css";
import { homeSearchCopy } from "@/content/home-search";
import { searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { useHomeSearch } from "./context";
import { Thumbs } from "./Thumbs";
import { useTween } from "./useTween";
import s from "./Hero.module.css";

type PickerId = "city" | "budget" | "status" | "bedrooms";

/**
 * The home's first screen: the search itself.
 *
 * Two columns, composed like the budget finder further down: on the reading
 * side the question (the concierge field, what it understood, quick pickers
 * for people who would rather not type); on the other side the answer, live —
 * how many programmes, in how many cities, their pictures, and the way to them.
 * The answer is the same list the results, the map and the budget finder read
 * (see context.tsx), so the figure here is the figure everywhere.
 */
export function SearchHero({ locale, founded }: { locale: Locale; founded: number }) {
  const t = homeSearchCopy[locale];
  const c = searchCopy[locale];
  const search = useHomeSearch();
  const { raw, rows, exact, chips, facets, ai, active } = search;
  const uid = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const pickersRef = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState<PickerId | null>(null);
  const [announce, setAnnounce] = useState("");
  const lastAsked = useRef<string | null>(null);

  const count = rows.length;
  const shown = Math.round(useTween(count));

  /* ------------------------------------------- one search, not two ---- */
  // While this field is on screen, the header's search trigger and Ctrl/⌘K
  // come here instead of opening the overlay.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    let visible = false;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
    const io = new IntersectionObserver(([entry]) => (visible = Boolean(entry?.isIntersecting)), {
      rootMargin: `-${navH}px 0px 0px 0px`,
      threshold: 0.6,
    });
    io.observe(field);
    const unregister = registerHeroTarget({
      visible: () => visible,
      focus: () => {
        const input = inputRef.current;
        if (!input) return;
        input.focus({ preventScroll: true });
        input.select();
      },
    });
    return () => {
      io.disconnect();
      unregister();
    };
  }, []);

  /* ------------------------------------------- no shift below it ---- */
  // The concierge's answer lands 5–7 s after Enter, often once the visitor
  // has gone down to the results: the hero then grows above what they are
  // reading. While the hero is mostly above the viewport, a change of its
  // height is taken back by the scroll position in the same commit — before
  // the browser paints, so no frame shows the results moving (a
  // ResizeObserver fires too late: the shift is already counted).
  const heroHeight = useRef<number | null>(null);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const next = section.offsetHeight;
    const before = heroHeight.current;
    heroHeight.current = next;
    if (before === null || next === before) return;
    const delta = next - before;
    // Judged on where the hero ended before this change.
    if (section.getBoundingClientRect().bottom - delta > window.innerHeight * 0.5) return;
    const lenis = (window as Window & { __lenis?: { isScrolling?: unknown; scrollTo: (y: number, o?: { immediate?: boolean }) => void } }).__lenis;
    // A scroll to the results is in flight: it re-aims itself when it lands (context.tsx).
    if (lenis?.isScrolling === "smooth") return;
    const y = window.scrollY + delta;
    window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    lenis?.scrollTo(y, { immediate: true });
  });

  /* ------------------------------------------------------- pickers ---- */
  useEffect(() => {
    if (!picker) return;
    const onDown = (event: PointerEvent) => {
      if (!pickersRef.current?.contains(event.target as Node)) setPicker(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPicker(null);
      pickersRef.current?.querySelector<HTMLElement>(`[aria-expanded="true"]`)?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [picker]);

  const group = (id: FacetGroup["id"]) => facets.find((g) => g.id === id);
  const pickers: Array<{ id: PickerId; label: string; groups: FacetGroup[] }> = [
    { id: "city", label: t.pickerCity, groups: [group("city")].filter(Boolean) as FacetGroup[] },
    { id: "budget", label: t.pickerBudget, groups: [group("budget"), group("monthly")].filter(Boolean) as FacetGroup[] },
    { id: "status", label: t.pickerStatus, groups: [group("status")].filter(Boolean) as FacetGroup[] },
    { id: "bedrooms", label: t.pickerBedrooms, groups: [group("bedrooms")].filter(Boolean) as FacetGroup[] },
  ];
  const openPicker = pickers.find((p) => p.id === picker);

  /* --------------------------------------------------------- field ---- */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    // Enter asks the concierge now (it would after a pause anyway); Enter
    // again on the same words, or on a phone, goes to the results.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (lastAsked.current === raw || coarse) {
      if (coarse) inputRef.current?.blur();
      search.showResults();
    }
    lastAsked.current = raw;
    ai.ask();
  };

  // Announced politely once typing settles.
  const message = active ? (exact ? t.announce(count, formatNumber(count, locale)) : t.relaxedShort) : "";
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounce(message), 450);
    return () => window.clearTimeout(timer);
  }, [message]);

  const refocus = () => inputRef.current?.focus({ preventScroll: true });

  return (
    <section ref={sectionRef} className={s.hero} data-nav-media aria-labelledby={`${uid}-title`}>
      <Lattice cell={32} />
      <div className={`u-shell ${s.grid}`}>
        <div className={s.ask}>
          <p className={`u-eyebrow ${s.eyebrow}`}>{t.eyebrow.replace("{year}", String(founded))}</p>
          <h1 id={`${uid}-title`} className={`u-display ${s.title}`}>
            {t.title}
          </h1>

          <form
            className={s.form}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              ai.ask();
              search.showResults();
            }}
          >
            {/* The field speaks for itself (client, 2026-10-06): its label is for assistive tech only. */}
            <label htmlFor={`${uid}-q`} className="u-visually-hidden">
              {t.fieldLabel}
            </label>
            <div ref={fieldRef} className={s.field}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden focusable="false" className={s.glyph}>
                <circle cx="10.5" cy="10.5" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <MarkedInput
                inputRef={inputRef}
                id={`${uid}-q`}
                className={s.input}
                value={raw}
                onValue={search.setRaw}
                spans={search.userQuery.spans}
                spansFor={raw}
                placeholders={c.placeholders}
                onKeyDown={onKeyDown}
                onBlur={(event) => {
                  // A long query shows its beginning again once the visitor leaves the field.
                  event.currentTarget.scrollLeft = 0;
                }}
              />
              {active && (
                <button
                  type="button"
                  className={`${s.clear} u-press`}
                  onClick={() => {
                    search.clear();
                    refocus();
                  }}
                >
                  <span className="u-visually-hidden">{c.clear}</span>
                  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden focusable="false">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
              )}
              <button type="submit" className={`${s.submit} u-press`}>
                <span className="u-visually-hidden">{t.submit}</span>
                <Arrow />
              </button>
            </div>
          </form>

          <div className={s.chipsRow}>
            {chips.length > 0 ? (
              <>
                <span className="u-visually-hidden">{t.understood}</span>
                <ChipList
                  chips={chips}
                  onRemove={(chip) => {
                    search.removeChip(chip);
                    refocus();
                  }}
                  removeLabel={c.removeChip}
                  aiMark={c.aiMark}
                  aiTitle={c.aiTitle}
                />
              </>
            ) : (
              <>
                <ul className={s.ideas} aria-label={t.ideasLabel}>
                  {t.ideas.map((idea) => (
                    <li key={idea.label}>
                      <button
                        type="button"
                        className={`${s.idea} u-press`}
                        onClick={() => {
                          search.setRaw(idea.query);
                          refocus();
                        }}
                      >
                        {idea.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div ref={pickersRef} className={s.pickers}>
            <div className={s.pickerButtons}>
              {pickers.map((p) => {
                let on = p.groups.reduce((n, g) => n + g.chips.filter((chip) => chip.on).length, 0);
                // A typed ceiling ("moins de 1,2 million") is a budget even when it is not one of the presets.
                if (p.id === "budget" && on === 0 && (search.query.priceMax !== null || search.query.monthlyMax !== null)) on = 1;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`${s.picker} u-press`}
                    aria-expanded={picker === p.id}
                    aria-controls={`${uid}-picker`}
                    data-active={on > 0 || undefined}
                    onClick={() => setPicker((current) => (current === p.id ? null : p.id))}
                  >
                    {p.label}
                    {on > 0 && <span className={`u-numeric ${s.pickerCount}`}>{formatNumber(on, locale)}</span>}
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false" className={s.chevron}>
                      <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div
              id={`${uid}-picker`}
              className={s.pop}
              role="group"
              aria-label={openPicker?.label}
              hidden={!openPicker}
            >
              {openPicker?.groups.map((g) => (
                <div key={g.id} className={s.popGroup}>
                  {openPicker.groups.length > 1 && <p className={s.popTitle}>{g.title}</p>}
                  <div className={s.popChips}>
                    {g.chips.map((chip) => (
                      <FacetButton key={chip.key} chip={chip} locale={locale} onPick={(picked) => search.apply(picked.toggle())} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={s.answer}>
          <p className={`u-eyebrow ${s.answerEyebrow}`}>{t.answerEyebrow}</p>
          <p className={s.count}>
            <span className={`u-numeric ${s.countFigure}`} dir="ltr">
              {formatNumber(shown, locale)}
            </span>
            <span className={s.countWords}>
              <span>{t.countWords(count)}</span>
              <span className={s.countCities}>
                {exact ? t.cities(search.cityCount, formatNumber(search.cityCount, locale)) : t.closest}
              </span>
            </span>
          </p>

          <Thumbs docs={rows.map((row) => row.doc)} locale={locale} plot={t.plot} sqm={c.sqm} />

          {/* Said once: when the concierge has answered, its sentence says what was widened. */}
          {!exact && !(ai.state === "ready" && ai.answer?.summary) && (
            <p className={s.relaxed}>
              <strong>{c.relaxedLead}</strong> {relaxedSentence(search.outcome, c)}
            </p>
          )}

          {(ai.state === "thinking" || ai.answer) && (
            <div className={s.aiSlot}>
              <AiAnswerCard locale={locale} state={ai.state} answer={ai.answer} onQuery={(text) => search.setRaw(text)} compact />
            </div>
          )}

          <div className={s.ctas}>
            <button type="button" className={`${v2.btn} ${v2.btnLight} u-press`} onClick={search.showResults}>
              <span>{t.ctaResults(count, formatNumber(count, locale))}</span>
              <Arrow />
            </button>
            <button type="button" className={`${s.mapLink} u-press`} onClick={search.showMap}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
                <path
                  d="M1.5 3.5l4-1.5 5 1.5 4-1.5v10.5l-4 1.5-5-1.5-4 1.5z M5.5 2v10.5 M10.5 3.5V14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              {t.ctaMap}
            </button>
          </div>
        </div>
      </div>
      <p className="u-visually-hidden" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
    </section>
  );
}
