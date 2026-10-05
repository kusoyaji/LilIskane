"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LinkButton } from "@/components/v2/LinkButton";
import type { BudgetCopy } from "@/content/home-conversion";
import type { Price } from "@/data/types";
import { formatNumber, type Locale } from "@/i18n/config";
import { CREDIT_DEFAULTS, maxAffordablePrice } from "@/lib/credit";
import {
  DEFAULT_DEPOSIT,
  effectiveTotal,
  matchBudget,
  searchMonthlyFor,
  toQuery,
} from "./match";
import s from "./BudgetFinder.module.css";

export type FinderItem = {
  slug: string;
  name: string;
  cityName: string;
  price: Price;
  isPlot: boolean;
  isRender: boolean;
};

const MIN = 2_000;
const MAX = 20_000;
const STEP = 250;
const START = 6_000;
const DURATIONS = [15, 20, 25] as const;
const TICKS = [5_000, 10_000, 15_000];

/**
 * Eases a displayed number towards its target so the ceiling *travels* as the
 * slider moves instead of flickering through every intermediate digit. Short
 * (240ms) and cancelled on each new target, so it never lags a fast drag.
 * Reduced motion gets the exact value immediately.
 */
function useTween(target: number, duration = 240): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = origin + (target - origin) * eased;
      from.current = value;
      setShown(value);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return shown;
}

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

  const ceiling = useMemo(
    () =>
      maxAffordablePrice(monthly, deposit, CREDIT_DEFAULTS.annualRate, years),
    [monthly, deposit, years],
  );
  const shownCeiling = useTween(ceiling);

  const { found, relaxed } = useMemo(
    () => matchBudget(items, ceiling),
    [items, ceiling],
  );

  // Exact: the most the budget buys first — that is the interesting answer.
  // Relaxed: the nearest out-of-reach programmes first — the honest one.
  const top = useMemo(() => {
    const sorted = [...found].sort((a, b) =>
      relaxed
        ? effectiveTotal(a.price) - effectiveTotal(b.price)
        : effectiveTotal(b.price) - effectiveTotal(a.price),
    );
    return sorted.slice(0, 3);
  }, [found, relaxed]);

  const count = relaxed ? 0 : found.length;
  const linkCount = found.length;

  const query = toQuery(searchMonthlyFor(monthly, deposit, years), deposit);
  const href = `/${locale}/projets?${query}`;

  // The ladder: every programme on one price axis, the ceiling sweeping across it.
  const totals = items.map((i) => effectiveTotal(i.price));
  const scaleMax = Math.ceil((Math.max(...totals) * 1.12) / 100_000) * 100_000;
  const ceilingPos = Math.min(1, Math.max(0, shownCeiling / scaleMax));
  const fill = (monthly - MIN) / (MAX - MIN);

  const ceilingRounded = Math.round(shownCeiling / 1_000) * 1_000;
  const priceText = (p: Price) =>
    p.unit === "per-sqm"
      ? `${formatNumber(p.amount, locale)} ${t.perSqm}`
      : `${formatNumber(p.amount, locale)} ${t.currency}`;

  const ctaLabel =
    linkCount === 1
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
                const inReach = !relaxed && effectiveTotal(i.price) <= ceiling;
                return (
                  <span
                    key={i.slug}
                    className={s.ladderTick}
                    data-in={inReach || undefined}
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
                {t.countOf.replace(
                  "{total}",
                  formatNumber(items.length, locale),
                )}
              </span>
            </span>
          </div>

          {relaxed && <p className={s.relaxed}>{t.relaxed}</p>}

          <div className={s.cta}>
            <LinkButton href={href} variant="light">
              {ctaLabel}
            </LinkButton>
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
