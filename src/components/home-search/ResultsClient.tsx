"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CriteriaTicks } from "@/components/search-concierge/CriteriaTicks";
import { BusyDots } from "@/components/search-concierge/parts/BusyDots";
import { ChipList, useChipListShown } from "@/components/search-concierge/parts/ChipList";
import { relaxedSentence } from "@/components/search-concierge/parts/model";
import { Arrow } from "@/components/v2/LinkButton";
import { homeSearchCopy } from "@/content/home-search";
import { searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { toProjetsHref } from "@/lib/search";
import { RESULTS_ID, useHomeSearch } from "./context";
import { currentTranslate, glideFrom, keepInPlace, reducedMotion, slideIndicator } from "./motion";
import { Odometer } from "./Odometer";
import s from "./Results.module.css";

/** The first answers shown; three on phones, so the map and the budget are not 3 000 px away. */
const FIRST = 6;
const FIRST_PHONE = 3;
/** A card that leaves the answer fades out this fast (faster than one arrives). */
const LEAVE_MS = 120;
type Sort = "relevance" | "price";
/** A card's place in the grid (layout offsets, so a running glide does not skew it). */
type Place = { x: number; y: number; w: number; h: number };
const place = (el: HTMLElement): Place => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

export function ResultsClient({ locale, cards }: { locale: Locale; cards: Record<string, ReactNode> }) {
  const t = homeSearchCopy[locale];
  const c = searchCopy[locale];
  const search = useHomeSearch();
  const { rows, chips, active, outcome } = search;
  const refining = active && search.ai.state === "thinking";
  const uid = useId();
  const [sort, setSort] = useState<Sort>("relevance");
  const [expanded, setExpanded] = useState(false);
  const [first, setFirst] = useState(FIRST);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99rem)");
    const update = () => setFirst(mq.matches ? FIRST_PHONE : FIRST);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const ordered = useMemo(
    () => (sort === "price" ? [...rows].sort((a, b) => a.doc.price - b.doc.price || a.doc.slug.localeCompare(b.doc.slug)) : rows),
    [rows, sort],
  );
  const shownSlugs = ordered.map((row) => row.doc.slug);
  const count = ordered.length;

  // A new answer starts collapsed again: the first six are the answer.
  const answerKey = shownSlugs.join("|");
  useEffect(() => setExpanded(false), [answerKey]);

  const visible = new Set(expanded ? shownSlugs : shownSlugs.slice(0, first));
  const visibleKey = [...visible].join("|");

  /* ------------------------------------------------ leaving the answer ---- */
  // A card that was showing and no longer is stays on screen for 120 ms —
  // lifted out of the grid where it stood, fading — while the others glide
  // to their new places. Then it is hidden like any other.
  const [shownBefore, setShownBefore] = useState(visible);
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set());
  if (visibleKey !== [...shownBefore].join("|")) {
    const gone = [...shownBefore].filter((slug) => !visible.has(slug));
    setShownBefore(visible);
    setLeaving((current) => {
      const next = new Set([...current, ...gone].filter((slug) => !visible.has(slug)));
      return next;
    });
  }
  useEffect(() => {
    if (leaving.size === 0) return;
    const timer = window.setTimeout(() => setLeaving(new Set()), reducedMotion() ? 0 : LEAVE_MS + 20);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  // Shown ones in display order first, then everything else (hidden) in a stable order.
  const order = [...shownSlugs, ...Object.keys(cards).filter((slug) => !shownSlugs.includes(slug))];
  const aiBySlug = new Map(ordered.map((row) => [row.doc.slug, row.ai]));

  /* ------------------------------------------------------------- FLIP ---- */
  // After React has moved the (server-rendered) cards and toggled `hidden`,
  // each card that was already showing is played from where it stood to
  // where it now is — transform only, so the grid is laid out once and the
  // page below never moves on account of the animation.
  const gridRef = useRef<HTMLUListElement>(null);
  const last = useRef(new Map<string, Place>());
  const leavingKey = [...leaving].join("|");
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const before = last.current;
    const items = [...grid.children] as HTMLElement[];
    // 1. Lift the leaving ones out of the flow, at the place they had.
    const lifted: Array<[HTMLElement, Place]> = [];
    for (const el of items) {
      const slug = el.dataset.slug ?? "";
      const at = before.get(slug);
      if (leaving.has(slug) && at) {
        if (el.dataset.leaving === undefined && el.dataset.gone === undefined) {
          el.dataset.leaving = "";
          el.style.left = `${at.x}px`;
          el.style.top = `${at.y}px`;
          el.style.inlineSize = `${at.w}px`;
          lifted.push([el, at]);
        }
      } else if (el.dataset.leaving !== undefined || el.dataset.gone !== undefined) {
        delete el.dataset.leaving;
        delete el.dataset.gone;
        el.style.left = "";
        el.style.top = "";
        el.style.inlineSize = "";
      }
    }
    // A card only fades out where it can be seen and where it does not
    // overlap what follows: one that stood off screen, or below the end of
    // the (now shorter) grid, goes at once — it would otherwise be painted
    // over the map or the budget for the length of its fade.
    if (lifted.length) {
      const box = grid.getBoundingClientRect();
      const height = grid.offsetHeight;
      for (const [el, at] of lifted) {
        const top = box.top + at.y;
        if (at.y + at.h > height + 1 || top >= window.innerHeight || top + at.h <= 0) {
          delete el.dataset.leaving;
          el.dataset.gone = "";
          el.style.left = "";
          el.style.top = "";
          el.style.inlineSize = "";
        }
      }
    }
    // 2. Glide the ones that stay; remember everyone's place for next time.
    const next = new Map<string, Place>();
    for (const el of items) {
      const slug = el.dataset.slug ?? "";
      if (el.hidden || el.dataset.leaving !== undefined || el.dataset.gone !== undefined) continue;
      const now = place(el);
      next.set(slug, now);
      const was = before.get(slug);
      // A card joining the answer has no "before": it fades in (CSS, restarted by hidden → shown).
      if (was) {
        const showing = currentTranslate(el);
        glideFrom(el, was.x + showing.x - now.x, was.y + showing.y - now.y, 260);
      }
    }
    last.current = next;
    grid.dataset.settled = "";
  }, [answerKey, visibleKey, leavingKey, sort]);

  // The grid re-wrapping on its own (a resize, the phone turned) is not a
  // change of the answer: just remember the new places, nothing glides.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => {
      const next = new Map<string, Place>();
      for (const el of [...grid.children] as HTMLElement[]) {
        if (el.hidden || el.dataset.leaving !== undefined || el.dataset.gone !== undefined) continue;
        next.set(el.dataset.slug ?? "", place(el));
      }
      last.current = next;
    });
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  const moreHold = useRef<{ el: HTMLElement; top: number } | null>(null);
  useLayoutEffect(() => {
    const hold = moreHold.current;
    moreHold.current = null;
    if (!hold || expanded || !hold.el.isConnected) return;
    keepInPlace(hold.el.getBoundingClientRect().top - hold.top);
  }, [expanded]);

  /* -------------------------------------------------------- sort thumb ---- */
  const sortRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const group = sortRef.current;
    const thumb = thumbRef.current;
    if (!group || !thumb) return;
    const place = (animate: boolean) => {
      const on = group.querySelector<HTMLElement>(`[aria-pressed="true"]`);
      if (!on) return;
      slideIndicator(thumb, { x: on.offsetLeft, y: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight }, { animate, duration: 240 });
      group.dataset.thumb = "";
    };
    place(true);
    // Fonts settling or a locale's longer words: re-seat it without a slide.
    const ro = new ResizeObserver(() => place(false));
    ro.observe(group);
    return () => ro.disconnect();
  }, [sort]);

  const relaxedText = relaxedSentence(outcome, c);
  // The chips' row stays until its last chip has faded out.
  const [chipsShown, releaseChips] = useChipListShown(chips.length);
  const rest = count - first;

  // "12 programmes" with the figure rolling: the sentence is cut at the figure.
  const MARK = "\u0000";
  const titleParts = t.resultsTitle(count, MARK).split(MARK);

  return (
    <section id={RESULTS_ID} className={s.section} aria-labelledby={`${uid}-h`}>
      <div className={s.bar}>
        <div className={`u-shell ${s.barInner}`}>
          <div className={s.headline}>
            {/* While the concierge still reads the sentence, the eyebrow says the list may change —
                in its own line's place (the two cross in one grid cell), so nothing reflows. */}
            <p className={`u-eyebrow ${s.eyebrow}`} data-refining={refining || undefined}>
              <span className={s.eyebrowText}>{t.resultsEyebrow}</span>
              <span className={s.refining} aria-hidden>
                <BusyDots />
                {c.aiRefining}
              </span>
            </p>
            <h2 id={`${uid}-h`} className={`u-display ${s.title}`} tabIndex={-1} data-results-heading="">
              {active ? (
                titleParts.length === 2 ? (
                  <span className={s.titleText}>
                    {titleParts[0]}
                    <Odometer value={count} className={s.titleFigure} data-results-count="" />
                    {/* Its own box, so it can glide when the figure gains or loses a digit (Odometer). */}
                    {/^s/.test(titleParts[1]) && " "}
                    <span className={s.titleTail}>{titleParts[1].trimStart()}</span>
                  </span>
                ) : (
                  <span className={s.titleText} data-results-count="">
                    {titleParts[0]}
                  </span>
                )
              ) : (
                t.resultsAll
              )}
              {!active && <Odometer value={count} className={`u-numeric ${s.titleCount}`} data-results-count="" />}
            </h2>
          </div>

          <div className={s.tools}>
            {chipsShown && (
              <div className={s.chips}>
                <ChipList
                  chips={chips}
                  onEmpty={releaseChips}
                  onRemove={search.removeChip}
                  removeLabel={c.removeChip}
                  aiMark={c.aiMark}
                  aiTitle={c.aiTitle}
                  tone="paper"
                />
                <button type="button" className={`${s.clearAll} u-press`} onClick={search.clear}>
                  {t.clearAll}
                </button>
              </div>
            )}
            <div ref={sortRef} className={s.sort} role="group" aria-label={t.sortLabel}>
              {/* One thumb slides between the options (transform); before it is placed, the pressed option paints its own ground. */}
              <span ref={thumbRef} className={s.sortThumb} aria-hidden />
              {(["relevance", "price"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sort === value}
                  className={`${s.sortOption} u-press`}
                  onClick={() => setSort(value)}
                >
                  {value === "relevance" ? t.sortRelevance : t.sortPrice}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`u-shell ${s.body}`}>
        {relaxedText && (
          <div className={s.relaxed} role="note">
            <p className={s.relaxedLead}>{c.relaxedLead}</p>
            <p>{relaxedText}</p>
          </div>
        )}

        <ul ref={gridRef} className={s.grid}>
          {order.map((slug, index) => {
            const shown = visible.has(slug);
            const going = !shown && leaving.has(slug);
            const fit = aiBySlug.get(slug) ?? null;
            const row = fit ? ordered.find((r) => r.doc.slug === slug) : undefined;
            return (
              <li
                key={slug}
                data-slug={slug}
                className={s.item}
                hidden={!shown && !going}
                aria-hidden={going || undefined}
                inert={going || undefined}
                style={{ ["--i" as string]: Math.min(index, 5) }}
                data-ai={fit ? fit.fit : undefined}
              >
                {cards[slug]}
                {fit && row && (
                  <div className={s.ticks}>
                    <CriteriaTicks locale={locale} doc={row.doc} ai={fit} query={search.query} tone="paper" className={s.ticksList} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className={s.foot}>
          {rest > 0 && (
            <button type="button" className={`${s.more} u-press`} aria-expanded={expanded} onClick={(event) => {
                // Collapsing removes everything above the button: keep it under the visitor's
                // hand instead of leaving them 3 000 px down, in the map.
                if (expanded) moreHold.current = { el: event.currentTarget, top: event.currentTarget.getBoundingClientRect().top };
                setExpanded((e) => !e);
              }}>
              {expanded ? t.showLess : t.showMore(rest, formatNumber(rest, locale))}
            </button>
          )}
          <Link href={toProjetsHref(search.query, locale)} className={`${s.projets} u-press`}>
            <span>{t.openProjets}</span>
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
