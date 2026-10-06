"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AiSlot } from "@/components/search-concierge/AiSlot";
import { BusyDots } from "@/components/search-concierge/parts/BusyDots";
import { registerHeroTarget } from "@/components/search-concierge/hero-target";
import { ChipList, useChipListShown } from "@/components/search-concierge/parts/ChipList";
import { FacetButton } from "@/components/search-concierge/parts/FacetButton";
import { MarkedInput } from "@/components/search-concierge/parts/MarkedInput";
import type { FacetGroup } from "@/components/search-concierge/parts/model";
import { Arrow } from "@/components/v2/LinkButton";
import { Lattice } from "@/components/v2/Lattice";
import v2 from "@/components/v2/v2.module.css";
import { homeSearchCopy } from "@/content/home-search";
import { searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { isAiming, useHomeSearch } from "./context";
import { currentTranslate, glideFrom, keepInPlace, reducedMotion, slideIndicator } from "./motion";
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
 * for people who would rather not type) and, under it, the concierge's
 * answer to it — question, then answer, in reading order; on the other side
 * the result, live and calm: how many programmes, in how many cities, their
 * pictures (only as many as there are), and the way to them.
 *
 * Nothing above the pickers, and nothing in the result column, moves when
 * the concierge is asked or answers: its wait and its answer have their own
 * place under the pickers (AiSlot), kept ready while the visitor types a
 * sentence worth asking about.
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
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
  // Enter, the arrow, a phone keyboard's search key — one behaviour. When the
  // concierge will read this sentence (or is reading it), the first press asks
  // and stays: the wait and the answer play here, in view (on a phone the
  // keyboard is put away and the answer's place scrolled into view). Pressed
  // again on the same words — or when there is nothing to ask — it goes to
  // the results, as "Voir la liste" always does.
  const submit = () => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) inputRef.current?.blur();
    if (ai.willAsk && lastAsked.current !== raw) {
      lastAsked.current = raw;
      askNow();
      revealReply();
      return;
    }
    lastAsked.current = raw;
    askNow();
    search.showResults();
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  /* --------------------------------------------- the answer, in view ---- */
  // Asked: bring the concierge's place on screen if it is not (phones: it is
  // under the result, often below the fold once the keyboard is down). Two
  // frames, so the wait is laid out; again once the keyboard has gone.
  const replyRef = useRef<HTMLDivElement>(null);
  const revealReply = () => {
    const reveal = () => {
      const el = replyRef.current;
      if (!el || isAiming()) return;
      const r = el.getBoundingClientRect();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
      const bottom = window.innerHeight - 16;
      let dy = 0;
      // Its bottom into view — never its top under the header.
      if (r.bottom > bottom) dy = Math.min(r.bottom - bottom, r.top - navH - 16);
      else if (r.top < navH) dy = r.top - navH - 16;
      if (Math.abs(dy) < 2) return;
      const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
      const top = window.scrollY + dy;
      if (lenis && !reducedMotion()) lenis.scrollTo(top, { duration: 0.6 });
      else window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
    };
    requestAnimationFrame(() => requestAnimationFrame(reveal));
    window.setTimeout(reveal, 450);
  };

  // The answer's place changes height outside the page's own commits too (the
  // wait's 150 ms fade-out ends inside AiSlot): when the visitor is reading
  // below it, the page is moved by the same amount before paint, so what they
  // read stays still. Heights from the page's commits are recorded first — the
  // provider already holds the reader in place for those.
  const replyH = useRef(0);
  useLayoutEffect(() => {
    if (replyRef.current) replyH.current = replyRef.current.offsetHeight;
  });
  useEffect(() => {
    const el = replyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      const delta = h - replyH.current;
      replyH.current = h;
      if (Math.abs(delta) < 1 || isAiming()) return;
      const oldBottom = el.getBoundingClientRect().bottom - delta;
      if (oldBottom <= window.innerHeight / 2) return keepInPlace(delta);
      // Reading the hero: what follows it makes room smoothly (or closes up), as for the page's own commits.
      const below = sectionRef.current?.parentElement?.nextElementSibling as HTMLElement | null;
      if (!below || reducedMotion()) return;
      const top = below.getBoundingClientRect().top - currentTranslate(below).y;
      if (top - delta >= window.innerHeight && top >= window.innerHeight) return;
      glideFrom(below, 0, -delta + currentTranslate(below).y, 260);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Announced politely once typing settles.
  const message = active ? (exact ? t.announce(count, formatNumber(count, locale)) : t.relaxedShort) : "";
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounce(message), 450);
    return () => window.clearTimeout(timer);
  }, [message]);

  const refocus = () => inputRef.current?.focus({ preventScroll: true });

  // Asked: the button and the field show it on the very next frame — set on
  // the DOM here, before the search state (a render of the whole page)
  // catches up and keeps it (it renders the same attribute, then removes it
  // when the answer is in). Only when the concierge will really be asked.
  const askNow = () => {
    if (ai.willAsk) {
      submitRef.current?.setAttribute("data-busy", "true");
      fieldRef.current?.setAttribute("data-busy", "true");
    }
    ai.ask();
  };

  const busy = ai.state === "thinking";
  // The busy state set by hand above is React's to remove: it renders the same
  // attribute while busy, but never removes one it did not set.
  useLayoutEffect(() => {
    if (busy) return;
    submitRef.current?.removeAttribute("data-busy");
    fieldRef.current?.removeAttribute("data-busy");
  });

  // The type steps down as the sentence grows, so 60–90 characters stay whole
  // on two or three lines — with some give either way, so the field does not
  // switch size back and forth around one length while typing.
  const length = raw.trim().length;
  const sizeRef = useRef<"m" | "l" | undefined>(undefined);
  const prevSize = sizeRef.current;
  const size: "m" | "l" | undefined =
    length > 62 || (prevSize === "l" && length > 56) ? "l" : length > 40 || (prevSize !== undefined && length > 34) ? "m" : undefined;
  sizeRef.current = size;
  // The narrowest phones take a fourth line rather than hiding the end of the question.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 25rem)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // The answer's place under the pickers (desktop) opens once the sentence is
  // clearly worth asking about (12+ characters) and then holds until the field
  // is emptied or the sentence has stopped being worth asking for a moment —
  // never opening and closing with every word fragment typed.
  const wantReserve = (ai.willAsk && length >= 12) || ai.state !== "idle";
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (wantReserve) {
      setHeld(true);
      return;
    }
    if (length === 0) {
      setHeld(false);
      return;
    }
    const timer = window.setTimeout(() => setHeld(false), 600);
    return () => window.clearTimeout(timer);
  }, [wantReserve, length]);
  const reserve = wantReserve || (held && length > 0);

  // What had to be widened, in one quiet line — there for as long as it is
  // true, through the wait and the answer, so nothing around it moves.
  const widened = active && !exact;
  const widenedFields = (search.outcome.relaxed as string[]).map((f) => c.relaxedFields[f]).filter(Boolean);

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
              submit();
            }}
          >
            {/* The field speaks for itself (client, 2026-10-06): its label is for assistive tech only. */}
            <label htmlFor={`${uid}-q`} className="u-visually-hidden">
              {t.fieldLabel}
            </label>
            <div ref={fieldRef} className={s.field} data-filled={raw !== "" || undefined} data-size={size} data-busy={busy || undefined}>
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
                multiline
                maxLines={narrow ? 4 : 3}
                onKeyDown={onKeyDown}
                onBlur={(event) => {
                  // A very long query shows its beginning again once the visitor leaves the field.
                  event.currentTarget.scrollTop = 0;
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
              {/* Asked: the arrow gives way to three breathing dots until the concierge answers.
                  Still a button — pressing it again goes to the results. */}
              <button ref={submitRef} type="submit" className={`${s.submit} u-press`} data-busy={busy || undefined}>
                <span className="u-visually-hidden">{t.submit}</span>
                <span className={s.submitArrow}>
                  <Arrow />
                </span>
                <BusyDots className={s.submitDots} />
              </button>
              {/* …and a light runs along the field's rule (phones have no arrow). */}
              <span className={s.busyRule} aria-hidden />
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

        {/* The answer to the question just above: what had to be widened, and the concierge. */}
        <div ref={replyRef} className={s.reply} data-reserve={reserve || undefined} data-widened={widened || undefined}>
          {widened && (
            <p className={s.widened}>{c.heroWidened(widenedFields.length ? widenedFields.join(c.listJoin) : null)}</p>
          )}
          <AiSlot
            locale={locale}
            state={ai.state}
            answer={ai.answer}
            onQuery={(text) => search.setRaw(text)}
            total={search.docs.length}
            variant="plain"
            maxChips={3}
            className={s.aiSlot}
          />
        </div>

        <div ref={answerRef} className={s.answer}>
          <p className={`u-eyebrow ${s.answerEyebrow}`}>{t.answerEyebrow}</p>
          <p className={s.count}>
            <Odometer value={count} className={s.countFigure} />
            <span className={s.countWords}>
              <SwapText text={t.countWords(count)} />
              {/* "les plus proches" only when the results had to be widened. */}
              <SwapText
                className={s.countCities}
                text={exact ? t.cities(search.cityCount, formatNumber(search.cityCount, locale)) : t.closest(count)}
              />
            </span>
          </p>

          <Thumbs docs={rows.map((row) => row.doc)} locale={locale} plot={t.plot} sqm={c.sqm} />

          <div className={s.ctas}>
            <button type="button" className={`${v2.btn} ${v2.btnLight} u-press`} onClick={search.showResults}>
              <span>{c.heroCta(count)}</span>
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
