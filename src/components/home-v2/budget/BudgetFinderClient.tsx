"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useHomeSearch } from "@/components/home-search/context";
import { useTween } from "@/components/home-search/useTween";
import { Arrow } from "@/components/v2/LinkButton";
import v2 from "@/components/v2/v2.module.css";
import type { BudgetCopy } from "@/content/home-conversion";
import type { Price } from "@/data/types";
import { formatNumber, type Locale } from "@/i18n/config";
import { CREDIT_DEFAULTS, DEFAULT_DEPOSIT, maxAffordablePrice } from "@/lib/credit";
import { DEFAULT_MONTHLY, MONTHLY_MAX, MONTHLY_MIN, ceilingOf, effectiveTotal } from "./match";
import s from "./BudgetFinder.module.css";

export type FinderItem = {
  slug: string;
  name: string;
  cityName: string;
  price: Price;
  isPlot: boolean;
  isRender: boolean;
};

const MIN = MONTHLY_MIN;
const MAX = MONTHLY_MAX;
const STEP = 250;
const START = DEFAULT_MONTHLY;
const DURATIONS = [15, 20, 25] as const;
const TICKS = [5_000, 10_000, 15_000];

function DepositField({
  id,
  value,
  onChange,
  locale,
  suffix,
  describedBy,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  locale: Locale;
  suffix: string;
  describedBy: string;
}) {
  const [text, setText] = useState(() => formatNumber(value, locale));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setText(formatNumber(value, locale));
  }, [value, locale, editing]);

  return (
    <div className={s.depositWell}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        value={text}
        aria-describedby={describedBy}
        onFocus={(event) => {
          setEditing(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          const raw = event.target.value;
          setText(raw);
          const parsed = Number(raw.replace(/[^\d]/g, ""));
          onChange(Number.isFinite(parsed) ? Math.min(parsed, 50_000_000) : 0);
        }}
        onBlur={() => {
          setEditing(false);
          setText(formatNumber(value, locale));
        }}
        className={`${s.depositInput} u-numeric`}
      />
      <span className={s.depositSuffix}>{suffix}</span>
    </div>
  );
}

export function BudgetFinderClient({
  locale,
  copy: t,
  items,
  thumbs,
}: {
  locale: Locale;
  copy: BudgetCopy;
  items: FinderItem[];
  thumbs: Record<string, ReactNode>;
}) {
  const monthlyId = useId();
  const depositId = useId();
  const depositHintId = useId();
  const durationName = useId();

  const [monthly, setMonthly] = useState(START);
  const [deposit, setDeposit] = useState(DEFAULT_DEPOSIT);
  const [years, setYears] = useState<number>(CREDIT_DEFAULTS.years);

  // The ceiling as shown and as applied to the search: whole thousands, down.
  const ceiling = useMemo(
    () => ceilingOf(maxAffordablePrice(monthly, deposit, CREDIT_DEFAULTS.annualRate, years)),
    [monthly, deposit, years],
  );
  const shownCeiling = useTween(ceiling);

  // Live: the finder answers within the current search (a city typed in the
  // hero, a status picked…). What it counts is what the results will show
  // once its button sets this ceiling — the same pipeline, run ahead.
  const search = useHomeSearch();
  const target = search.preview({ price: ceiling });
  const relaxed = !target.exact;
  const total = search.active ? search.preview({ price: null }).rows.length : items.length;
  const inReach = new Set(relaxed ? [] : target.rows.map((row) => row.doc.slug));
  const bySlug = useMemo(() => new Map(items.map((item) => [item.slug, item])), [items]);
  const found = target.rows.map((row) => bySlug.get(row.doc.slug)).filter((item): item is FinderItem => Boolean(item));

  // Exact: the most the budget buys first — that is the interesting answer.
  // Relaxed: the most accessible first — the honest one.
  const top = [...found]
    .sort((a, b) =>
      relaxed ? effectiveTotal(a.price) - effectiveTotal(b.price) : effectiveTotal(b.price) - effectiveTotal(a.price),
    )
    .slice(0, 3);

  const count = relaxed ? 0 : found.length;
  const linkCount = found.length;

  const apply = () => {
    const label = t.chip.replace("{price}", formatNumber(ceiling, locale)).replace("{monthly}", formatNumber(monthly, locale));
    search.setPriceCeiling(ceiling, label);
    search.showResults();
  };

  // The ladder: every programme on one price axis, the ceiling sweeping across it.
  const totals = items.map((i) => effectiveTotal(i.price));
  const scaleMax = Math.ceil((Math.max(...totals) * 1.12) / 100_000) * 100_000;
  const ceilingPos = Math.min(1, Math.max(0, shownCeiling / scaleMax));
  const fill = (monthly - MIN) / (MAX - MIN);

  const ceilingRounded = ceilingOf(shownCeiling + 999);
  const priceText = (p: Price) =>
    p.unit === "per-sqm"
      ? `${formatNumber(p.amount, locale)} ${t.perSqm}`
      : `${formatNumber(p.amount, locale)} ${t.currency}`;

  // Relaxed (nothing within the ceiling): no count the results would not keep.
  const ctaLabel = relaxed
    ? t.ctaClosest
    : linkCount === 1
      ? t.ctaOne
      : t.cta.replace("{n}", formatNumber(linkCount, locale));
  const listKey = top.map((p) => p.slug).join("|");

  return (
    <>
      <div className={s.grid}>
        {/* ---------------------------------------------------------- inputs */}
        <div className={`${s.instrument} u-enter`}>
          <label htmlFor={monthlyId} className={`u-eyebrow ${s.label}`}>
            {t.monthlyLabel}
          </label>
          <output htmlFor={monthlyId} className={s.monthly} aria-live="off">
            <span className={`${s.monthlyFigure} u-numeric`} dir="ltr">
              {formatNumber(monthly, locale)}
            </span>
            <span className={s.monthlyUnit}>{t.perMonth}</span>
          </output>

          <div
            className={s.rangeWrap}
            style={{ "--fill": fill } as React.CSSProperties}
          >
            <input
              id={monthlyId}
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              aria-valuetext={`${formatNumber(monthly, locale)} ${t.perMonth}`}
              className={s.range}
            />
            <div className={s.rangeTicks} aria-hidden>
              <span className={s.tickEdge} style={{ insetInlineStart: 0 }}>
                {formatNumber(MIN, locale)}
              </span>
              {TICKS.map((v) => (
                <span
                  key={v}
                  className={s.tick}
                  style={{
                    insetInlineStart: `${((v - MIN) / (MAX - MIN)) * 100}%`,
                  }}
                >
                  {formatNumber(v, locale)}
                </span>
              ))}
              <span className={s.tickEdge} style={{ insetInlineEnd: 0 }}>
                {formatNumber(MAX, locale)}
              </span>
            </div>
          </div>
        </div>

        <div className={`${s.controls} u-enter`}>
          <div className={s.control}>
            <label htmlFor={depositId} className={`u-eyebrow ${s.label}`}>
              {t.depositLabel}
            </label>
            <DepositField
              id={depositId}
              value={deposit}
              onChange={setDeposit}
              locale={locale}
              suffix={t.currency}
              describedBy={depositHintId}
            />
            <p id={depositHintId} className={s.hint}>
              {t.depositHint}
            </p>
          </div>

          <fieldset className={s.control}>
            <legend className={`u-eyebrow ${s.label}`}>
              {t.durationLabel}
            </legend>
            <div className={s.segmented}>
              {DURATIONS.map((d) => (
                <label
                  key={d}
                  className={`${s.segment} u-press`}
                  data-on={years === d || undefined}
                >
                  <input
                    type="radio"
                    name={durationName}
                    value={d}
                    checked={years === d}
                    onChange={() => setYears(d)}
                    className={s.segmentInput}
                  />
                  <span className="u-numeric">{formatNumber(d, locale)}</span>
                  <span className={s.segmentUnit}>{t.years}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* --------------------------------------------------------- outputs */}
        <div className={`${s.results} u-enter`}>
          <p className={`u-eyebrow ${s.label}`}>{t.ceilingLabel}</p>
          <p className={s.ceiling}>
            <span className={`${s.ceilingFigure} u-numeric`} dir="ltr">
              {formatNumber(ceilingRounded, locale)}
            </span>
            <span className={s.ceilingUnit}>{t.currency}</span>
          </p>
          <p className={s.hint}>{t.ceilingNote}</p>

          <div className={s.ladder} role="img" aria-label={t.scaleLabel}>
            <div className={s.ladderTrack}>
              <span
                className={s.ladderFill}
                style={{ transform: `scaleX(${ceilingPos})` }}
              />
              {items.map((i) => {
                const pos = Math.min(1, effectiveTotal(i.price) / scaleMax);
                return (
                  <span
                    key={i.slug}
                    className={s.ladderTick}
                    data-in={inReach.has(i.slug) || undefined}
                    style={{ insetInlineStart: `${pos * 100}%` }}
                  />
                );
              })}
              <span
                className={s.ladderMarkerTrack}
                style={{ "--p": ceilingPos * 100 } as React.CSSProperties}
              >
                <span className={s.ladderMarker}>
                  <span
                    className={s.ladderMarkerLabel}
                    data-edge={ceilingPos > 0.86 ? "end" : ceilingPos < 0.14 ? "start" : undefined}
                  >{t.scaleYou}</span>
                </span>
              </span>
            </div>
          </div>

          <div className={s.count} aria-live="polite" aria-atomic="true">
            <span className={`${s.countFigure} u-numeric`} dir="ltr">
              {formatNumber(count, locale)}
            </span>
            <span className={s.countText}>
              <span>{count <= 1 ? t.countOne : count === 2 ? t.countTwo : count <= 10 ? t.countFew : t.countMany}</span>
              <span className={s.countOf}>
                {(search.active ? t.countOfSearch : t.countOf).replace("{total}", formatNumber(total, locale))}
              </span>
            </span>
          </div>

          {relaxed && <p className={s.relaxed}>{t.relaxed}</p>}

          <div className={s.cta}>
            <button type="button" className={`${v2.btn} ${v2.btnLight} u-press`} onClick={apply}>
              <span>{ctaLabel}</span>
              <Arrow />
            </button>
          </div>
        </div>
      </div>

      <div className={`${s.matchesBlock} u-enter`}>
        <p className={`u-eyebrow ${s.listLabel}`}>
          {relaxed ? t.closestMatches : t.bestMatches}
        </p>
        <ul className={s.matches} key={listKey}>
          {top.map((p, i) => (
            <li
              key={p.slug}
              className={s.matchItem}
              style={{ "--i": i } as React.CSSProperties}
            >
              <Link href={`/${locale}/projets/${p.slug}`} className={s.match}>
                <span className={s.thumb}>
                  {thumbs[p.slug]}
                  {p.isRender && !p.isPlot && (
                    <span className={s.renderTag}>{t.render}</span>
                  )}
                </span>
                <span className={s.matchBody}>
                  <span className={s.matchCity}>{p.cityName}</span>
                  <span className={s.matchName}>{p.name}</span>
                  <span className={s.matchPrice}>
                    {t.from}{" "}
                    <span className="u-numeric">{priceText(p.price)}</span>
                  </span>
                </span>
                <svg
                  className={s.matchArrow}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M4 12h15M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
