"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { CriteriaTicks } from "@/components/search-concierge/CriteriaTicks";
import { ChipList } from "@/components/search-concierge/parts/ChipList";
import { relaxedSentence } from "@/components/search-concierge/parts/model";
import { Arrow } from "@/components/v2/LinkButton";
import { homeSearchCopy } from "@/content/home-search";
import { searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { toProjetsHref } from "@/lib/search";
import { RESULTS_ID, useHomeSearch } from "./context";
import s from "./Results.module.css";

/** The first answers shown; three on phones, so the map and the budget are not 3 000 px away. */
const FIRST = 6;
const FIRST_PHONE = 3;
type Sort = "relevance" | "price";

export function ResultsClient({ locale, cards }: { locale: Locale; cards: Record<string, ReactNode> }) {
  const t = homeSearchCopy[locale];
  const c = searchCopy[locale];
  const search = useHomeSearch();
  const { rows, chips, active, outcome } = search;
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
  // Shown ones in display order first, then everything else (hidden) in a stable order.
  const order = [...shownSlugs, ...Object.keys(cards).filter((slug) => !shownSlugs.includes(slug))];
  const aiBySlug = new Map(ordered.map((row) => [row.doc.slug, row.ai]));

  const relaxedText = relaxedSentence(outcome, c);

  const rest = count - first;

  return (
    <section id={RESULTS_ID} className={s.section} aria-labelledby={`${uid}-h`}>
      <div className={s.bar}>
        <div className={`u-shell ${s.barInner}`}>
          <div className={s.headline}>
            <p className={`u-eyebrow ${s.eyebrow}`}>{t.resultsEyebrow}</p>
            <h2 id={`${uid}-h`} className={`u-display ${s.title}`} tabIndex={-1} data-results-heading="">
              {active ? t.resultsTitle(count, formatNumber(count, locale)) : t.resultsAll}
              {!active && (
                <span className={`u-numeric ${s.titleCount}`} dir="ltr">
                  {formatNumber(count, locale)}
                </span>
              )}
            </h2>
          </div>

          <div className={s.tools}>
            {chips.length > 0 && (
              <div className={s.chips}>
                <ChipList
                  chips={chips}
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
            <div className={s.sort} role="group" aria-label={t.sortLabel}>
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

        <ul className={s.grid}>
          {order.map((slug, index) => {
            const shown = visible.has(slug);
            const fit = aiBySlug.get(slug) ?? null;
            const row = fit ? ordered.find((r) => r.doc.slug === slug) : undefined;
            return (
              <li
                key={slug}
                className={s.item}
                hidden={!shown}
                style={{ ["--i" as string]: Math.min(index, 8) }}
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
            <button type="button" className={`${s.more} u-press`} aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
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
