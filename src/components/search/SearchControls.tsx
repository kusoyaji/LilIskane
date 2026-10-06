"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";
import { KIND_LABELS, searchCopy } from "@/content/projects";
import { KINDS, type Kind } from "@/data/types";
import { maxAffordablePrice } from "@/lib/credit";
import { DEFAULT_DEPOSIT, listOf, scalarOf, toggleInList, withScalar, type ListKey } from "./query";
import { useSearchState } from "./SearchShell";
import s from "./search.module.css";

export type Facet = { value: string; label: string; count: number };

const BUDGET_MIN = 2000;
const BUDGET_MAX = 20000;
const BUDGET_STEP = 250;
/** One step past the maximum means "no limit". */
const BUDGET_NONE = BUDGET_MAX + BUDGET_STEP;
const DEPOSITS = [0, 50_000, 100_000, 150_000, 200_000, 300_000, 500_000, 750_000, 1_000_000];

/**
 * The search controls. Every one of them only edits the URL (see
 * `SearchShell`); counts beside each option are computed on the server with
 * that option's own facet released, so they say what you would get by
 * choosing it.
 */
export function SearchControls({
  locale,
  cities,
  segments,
  bedrooms,
  statuses,
  amenities,
}: {
  locale: Locale;
  cities: Facet[];
  segments: Facet[];
  bedrooms: Facet[];
  statuses: Facet[];
  amenities: Facet[];
}) {
  const c = searchCopy[locale];
  const { query, navigate } = useSearchState();
  const budgetId = useId();
  const depositId = useId();
  const cityId = useId();

  const budgetParam = Number(scalarOf(query, "mensualite")) || null;
  const deposit = Number(scalarOf(query, "apport") ?? DEFAULT_DEPOSIT);
  // `ville` is one city or several (a region typed into the hero search).
  // The select edits one; several are listed as removable chips above it.
  const selectedCities = listOf(query, "ville");
  const city = selectedCities.length === 1 ? selectedCities[0] : null;
  const multiCity = selectedCities.length > 1;
  const rooms = scalarOf(query, "chambres");
  const priceMax = Number(scalarOf(query, "prix")) || null;
  const kinds = listOf(query, "type").filter((k): k is Kind => (KINDS as readonly string[]).includes(k));

  // The slider moves locally and commits when the hand stops, so dragging it
  // is one navigation rather than forty.
  const [budget, setBudget] = useState<number>(budgetParam ?? BUDGET_NONE);
  const commit = useRef<number | undefined>(undefined);
  useEffect(() => setBudget(budgetParam ?? BUDGET_NONE), [budgetParam]);
  useEffect(() => () => window.clearTimeout(commit.current), []);

  const onBudget = (value: number) => {
    setBudget(value);
    window.clearTimeout(commit.current);
    commit.current = window.setTimeout(() => {
      navigate(withScalar(query, "mensualite", value >= BUDGET_NONE ? null : value));
    }, 320);
  };

  const [more, setMore] = useState(() => listOf(query, "equipements").length > 0);
  // An amenity chosen elsewhere (the hero's sentence search, a shared link)
  // must never filter the list from behind a folded panel.
  const hasAmenity = listOf(query, "equipements").length > 0;
  useEffect(() => {
    if (hasAmenity) setMore(true);
  }, [hasAmenity]);
  const [openMobile, setOpenMobile] = useState(false);

  const shownBudget = Math.min(budget, BUDGET_NONE);
  const hasBudget = shownBudget < BUDGET_NONE;
  const ceiling = hasBudget ? maxAffordablePrice(shownBudget, deposit) : null;
  const active =
    (budgetParam ? 1 : 0) +
    (priceMax ? 1 : 0) +
    selectedCities.length +
    kinds.length +
    (rooms ? 1 : 0) +
    listOf(query, "standing").length +
    listOf(query, "statut").length +
    listOf(query, "equipements").length;
  const hasAny = active > 0 || deposit !== DEFAULT_DEPOSIT;

  const chips = (key: ListKey, facets: Facet[]) => {
    const on = listOf(query, key);
    return facets.map((facet) => {
      const selected = on.includes(facet.value);
      return (
        <button
          key={facet.value}
          type="button"
          aria-pressed={selected}
          className={s.chip}
          data-empty={!selected && facet.count === 0 ? "" : undefined}
          onClick={() => navigate(toggleInList(query, key, facet.value))}
        >
          <span>{facet.label}</span>
          <span className={`u-numeric ${s.chipCount}`}>{formatNumber(facet.count, locale)}</span>
        </button>
      );
    });
  };

  const cityName = (id: string) => cities.find((facet) => facet.value === id)?.label ?? id;
  const activeChips: Array<{ key: string; label: string; next: string }> = [
    ...(priceMax
      ? [{ key: "prix", label: c.priceChip(formatNumber(priceMax, locale)), next: withScalar(query, "prix", null) }]
      : []),
    ...kinds.map((kind) => ({ key: `type-${kind}`, label: KIND_LABELS[kind][locale], next: toggleInList(query, "type", kind) })),
    ...(multiCity
      ? selectedCities.map((id) => ({ key: `ville-${id}`, label: cityName(id), next: toggleInList(query, "ville", id) }))
      : []),
  ];

  return (
    <div className={s.controls}>
      {/* Values set by the hero's sentence search or a shared link, which no
          control below shows on its own: visible, and removable one by one. */}
      {activeChips.length > 0 && (
        <div className={s.active}>
          <span className={`u-eyebrow ${s.activeLabel}`}>{c.activeTitle}</span>
          <ul className={s.activeChips}>
            {activeChips.map((chip) => (
              <li key={chip.key} className={s.activeChip}>
                <span className="u-numeric">{chip.label}</span>
                <button
                  type="button"
                  className={s.smartChipX}
                  aria-label={c.removeChip(chip.label)}
                  onClick={() => navigate(chip.next)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------------------------------------------------- budget */}
      <div className={s.budget}>
        <div className={s.budgetTop}>
          <label htmlFor={budgetId} className={`u-eyebrow ${s.label}`}>
            {c.budget}
          </label>
          <output htmlFor={budgetId} className={`u-numeric ${s.budgetValue}`}>
            {hasBudget ? (
              <>
                {formatNumber(shownBudget, locale)} <span className={s.budgetUnit}>{c.perMonth}</span>
              </>
            ) : (
              <span className={s.budgetNone}>{c.budgetAny}</span>
            )}
          </output>
        </div>
        <input
          id={budgetId}
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_NONE}
          step={BUDGET_STEP}
          value={shownBudget}
          onChange={(event) => onBudget(Number(event.target.value))}
          className={s.range}
          style={{ ["--fill" as string]: `${((shownBudget - BUDGET_MIN) / (BUDGET_NONE - BUDGET_MIN)) * 100}%` }}
          aria-valuetext={hasBudget ? `${formatNumber(shownBudget, locale)} ${c.perMonth}` : c.budgetAny}
        />
        <div className={s.budgetBottom}>
          <label htmlFor={depositId} className={s.depositLabel}>
            {c.deposit}
          </label>
          <select
            id={depositId}
            className={`u-numeric ${s.select} ${s.selectSmall}`}
            value={DEPOSITS.includes(deposit) ? deposit : "custom"}
            onChange={(event) => navigate(withScalar(query, "apport", Number(event.target.value)))}
          >
            {!DEPOSITS.includes(deposit) && (
              <option value="custom">{formatNumber(deposit, locale)} {c.currency}</option>
            )}
            {DEPOSITS.map((value) => (
              <option key={value} value={value}>
                {formatNumber(value, locale)} {c.currency}
              </option>
            ))}
          </select>
          {ceiling !== null && (
            <span className={`u-numeric ${s.ceiling}`}>
              {c.ceiling(`${formatNumber(Math.round(ceiling / 10_000) * 10_000, locale)} ${c.currency}`)}
            </span>
          )}
        </div>
      </div>

      {/* --------------------------------------------- city + bedrooms ---- */}
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor={cityId} className={`u-eyebrow ${s.label}`}>
            {c.city}
          </label>
          <select
            id={cityId}
            className={s.select}
            value={multiCity ? "__several" : (city ?? "")}
            onChange={(event) => navigate(withScalar(query, "ville", event.target.value || null))}
          >
            {multiCity && (
              <option value="__several" disabled>
                {c.citiesSelected(selectedCities.length, formatNumber(selectedCities.length, locale))}
              </option>
            )}
            <option value="">{c.allCities}</option>
            {cities.map((facet) => (
              <option key={facet.value} value={facet.value}>
                {facet.label} ({facet.count})
              </option>
            ))}
          </select>
        </div>

        <fieldset className={s.field}>
          <legend className={`u-eyebrow ${s.label}`}>{c.bedrooms}</legend>
          <div className={s.chips}>
            {bedrooms.map((facet) => {
              const selected = rooms === facet.value;
              return (
                <button
                  key={facet.value}
                  type="button"
                  aria-pressed={selected}
                  className={`${s.chip} ${s.chipRound}`}
                  data-empty={!selected && facet.count === 0 ? "" : undefined}
                  onClick={() => navigate(withScalar(query, "chambres", selected ? null : facet.value))}
                >
                  <span className="u-numeric">{facet.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        className={s.mobileToggle}
        aria-expanded={openMobile}
        onClick={() => setOpenMobile((v) => !v)}
      >
        <span>{c.filtersTitle}</span>
        {active > 0 && <span className={`u-numeric ${s.badge}`}>{formatNumber(active, locale)}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className={s.chev}>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className={s.rest} data-open={openMobile || undefined}>
        <fieldset className={s.field}>
          <legend className={`u-eyebrow ${s.label}`}>{c.segment}</legend>
          <div className={s.chips}>{chips("standing", segments)}</div>
        </fieldset>

        <fieldset className={s.field}>
          <legend className={`u-eyebrow ${s.label}`}>{c.status}</legend>
          <div className={s.chips}>{chips("statut", statuses)}</div>
        </fieldset>

        {more && (
          <fieldset className={s.field}>
            <legend className={`u-eyebrow ${s.label}`}>{c.amenities}</legend>
            <div className={s.chips}>{chips("equipements", amenities)}</div>
          </fieldset>
        )}

        <div className={s.utility}>
          <button type="button" className={s.textButton} aria-expanded={more} onClick={() => setMore((v) => !v)}>
            {more ? c.fewerFilters : c.moreFilters}
          </button>
          {hasAny && (
            <button type="button" className={s.textButton} onClick={() => navigate("")}>
              {c.clear}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
