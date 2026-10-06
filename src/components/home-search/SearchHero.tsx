"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AiAnswerCard } from "@/components/search-concierge/AiAnswerCard";
import { registerHeroTarget } from "@/components/search-concierge/hero-target";
import { ChipList, useChipListShown } from "@/components/search-concierge/parts/ChipList";
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
import { currentTranslate, glideFrom, reducedMotion, slideIndicator } from "./motion";
import { Odometer } from "./Odometer";
import { SwapText } from "./SwapText";
import { Thumbs } from "./Thumbs";
import s from "./Hero.module.css";

/** A picker closes faster than it opens (120 vs 160 ms). */
const POP_OUT_MS = 120;

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
  const popRef = useRef<HTMLDivElement>(null);
  const hiliteRef = useRef<HTMLSpanElement>(null);
  const [picker, setPicker] = useState<PickerId | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(0);
  const [announce, setAnnounce] = useState("");
  const lastAsked = useRef<string | null>(null);

  const count = rows.length;
  // The understood row stays until its last chip has faded out; then the ideas come back.
  const [chipsShown, releaseChips] = useChipListShown(chips.length);

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
  // The concierge answers seconds after the last keystroke, often once the
  // visitor has gone further down: this hero (and the results) then change
  // height above what they are reading. The provider keeps the block they
  // are reading in place for every section at once (context.tsx, "anchor").
  //
  // When the visitor is reading this hero, though, there is nothing to
  // compensate: the answer card (or the "élargi" note) takes its height and
  // what follows has to make room. It makes room smoothly: every part of the
  // answer column that moved, and the results below, are played from where
  // they stood to their new place (FLIP, transform only, 260 ms). The results
  // glide over the hero's newly grown edge, so the hero seems to open up
  // rather than the page to jump.
  const answerRef = useRef<HTMLDivElement>(null);
  const placedY = useRef(new WeakMap<Element, number>());
  useLayoutEffect(() => {
    const hero = sectionRef.current;
    const answer = answerRef.current;
    if (!hero || !answer) return;
    const ground = hero.parentElement;
    const below = ground?.nextElementSibling as HTMLElement | null;
    const tracked = [...answer.children, ...(below ? [below] : [])] as HTMLElement[];
    const box = ground?.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    const reading = Boolean(box && box.top <= mid && box.bottom > mid);
    const animate = reading && !reducedMotion();
    for (const el of tracked) {
      const r = el.getBoundingClientRect();
      const shown = currentTranslate(el).y;
      const y = r.top + window.scrollY - shown;
      const was = placedY.current.get(el);
      placedY.current.set(el, y);
      if (!animate || was === undefined || Math.abs(was - y) < 0.5) continue;
      // Off screen before and after: nothing to see move.
      const h = r.height;
      const seen = (top: number) => top < window.innerHeight && top + h > 0;
      if (!seen(r.top - shown) && !seen(was - window.scrollY)) continue;
      const anim = glideFrom(el, 0, was - y + shown, 260);
      if (anim && el === below) {
        // Over the hero (z 5) while it travels, so its own ground covers the
        // hero's grown edge until it has moved down past it.
        el.style.position = "relative";
        el.style.zIndex = "6";
        const done = () => {
          el.style.position = "";
          el.style.zIndex = "";
        };
        anim.addEventListener("finish", done);
        anim.addEventListener("cancel", done);
      }
    }
  });
  // A resize re-flows everything: remember the new places, nothing glides.
  useEffect(() => {
    const onResize = () => (placedY.current = new WeakMap());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ------------------------------------------------------- pickers ---- */
  // Closing is a quick fade (120 ms), then the panel goes; opening is
  // immediate and grows from its trigger (see the layout effect below).
  const closePicker = useCallback((refocus = false) => {
    const trigger = pickersRef.current?.querySelector<HTMLElement>(`[aria-expanded="true"]`);
    window.clearTimeout(closeTimer.current);
    if (reducedMotion()) {
      setPicker(null);
      setClosing(false);
    } else {
      setClosing(true);
      closeTimer.current = window.setTimeout(() => {
        setPicker(null);
        setClosing(false);
      }, POP_OUT_MS);
    }
    if (refocus) trigger?.focus();
  }, []);
  const togglePicker = (id: PickerId) => {
    if (picker === id && !closing) return closePicker();
    window.clearTimeout(closeTimer.current);
    setClosing(false);
    setPicker(id);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // The panel opens out of its trigger: its transform-origin is the
  // trigger's centre, measured before the first frame of the scale-in.
  useLayoutEffect(() => {
    const pop = popRef.current;
    const trigger = pickersRef.current?.querySelector<HTMLElement>(`[aria-expanded="true"]`);
    if (!picker || !pop || !trigger) return;
    const t = trigger.getBoundingClientRect();
    const p = pop.getBoundingClientRect();
    pop.style.transformOrigin = `${Math.round(t.left + t.width / 2 - p.left)}px -0.6rem`;
    const hilite = hiliteRef.current;
    if (hilite) {
      delete hilite.dataset.box;
      hilite.dataset.on = "false";
    }
  }, [picker]);

  // One soft highlight slides between the options under the pointer or the
  // keyboard's focus (transform only; offsets are layout values, so the
  // panel's own scale-in does not skew them).
  const hilite = (target: EventTarget | null, animate: boolean) => {
    const el = (target as HTMLElement | null)?.closest?.("button");
    const box = hiliteRef.current;
    if (!el || !box || !popRef.current?.contains(el)) return;
    // It slides along a row; to another row (Budget, then Mensualité) it does
    // not cut diagonally through the gap: it is placed there and fades in.
    const prevY = box.dataset.box ? (JSON.parse(box.dataset.box) as { y: number }).y : null;
    const sameRow = prevY === el.offsetTop;
    const wasOn = box.dataset.on === "true";
    slideIndicator(box, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }, { animate: animate && wasOn && sameRow, duration: 180 });
    if (wasOn && !sameRow && prevY !== null && !reducedMotion()) {
      box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    box.dataset.on = "true";
  };
  const unhilite = () => {
    const box = hiliteRef.current;
    if (!box) return;
    box.dataset.on = "false";
    delete box.dataset.box;
  };

  useEffect(() => {
    if (!picker) return;
    const onDown = (event: PointerEvent) => {
      if (!pickersRef.current?.contains(event.target as Node)) closePicker();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closePicker(true);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [picker, closePicker]);

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
            <div ref={fieldRef} className={s.field} data-filled={raw !== "" || undefined}>
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
            {chipsShown ? (
              <>
                <span className="u-visually-hidden">{t.understood}</span>
                <ChipList
                  chips={chips}
                  onEmpty={releaseChips}
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
                    onClick={() => togglePicker(p.id)}
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
              // Keyed on the picker: switching from one to another plays the opening again, from the new trigger.
              key={picker ?? "none"}
              ref={popRef}
              id={`${uid}-picker`}
              className={s.pop}
              role="group"
              aria-label={openPicker?.label}
              hidden={!openPicker}
              data-closing={closing || undefined}
              onPointerOver={(event) => event.pointerType === "mouse" && hilite(event.target, true)}
              onPointerLeave={unhilite}
              onFocus={(event) => event.target.matches(":focus-visible") && hilite(event.target, true)}
              onBlur={(event) => {
                if (!popRef.current?.contains(event.relatedTarget as Node | null)) unhilite();
              }}
            >
              <span ref={hiliteRef} className={s.hilite} aria-hidden />
              {openPicker?.groups.map((g) => (
                <div key={g.id} className={s.popGroup}>
                  {openPicker.groups.length > 1 && <p className={s.popTitle}>{g.title}</p>}
                  <div className={s.popChips}>
                    {g.chips.map((chip) => (
                      <FacetButton
                        key={chip.key}
                        chip={chip}
                        locale={locale}
                        onPick={(picked) => {
                          search.apply(picked.toggle());
                          // A choice made, the panel steps aside (quick fade) and the answer shows.
                          closePicker(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div ref={answerRef} className={s.answer}>
          <p className={`u-eyebrow ${s.answerEyebrow}`}>{t.answerEyebrow}</p>
          <p className={s.count}>
            <Odometer value={count} className={s.countFigure} />
            <span className={s.countWords}>
              <SwapText text={t.countWords(count)} />
              {/* While the concierge reads the sentence, its quiet line takes the place of "dans N villes"
                  — in the line that is already there, so nothing below moves when it comes and goes. */}
              <span className={s.countSub} data-thinking={ai.state === "thinking" || undefined}>
                <SwapText
                  className={s.countCities}
                  text={exact ? t.cities(search.cityCount, formatNumber(search.cityCount, locale)) : t.closest}
                />
                {ai.state === "thinking" && (
                  <AiAnswerCard locale={locale} state="thinking" answer={null} onQuery={search.setRaw} inline className={s.countThinking} />
                )}
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

          {ai.state === "ready" && ai.answer && (
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
