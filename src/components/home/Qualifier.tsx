"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { AmountInput } from "@/components/ui/AmountInput";
import { cities } from "@/data/cities";
import { projects } from "@/data/projects";
import { DEFAULT_DEPOSIT, search, toSearchParams, type Filters } from "@/lib/filter";
import { maxAffordablePrice } from "@/lib/credit";
import { formatNumber, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { effectiveTotal } from "@/lib/format";

const BUDGET_MIN = 2000;
const BUDGET_MAX = 20000;
const BUDGET_STEP = 250;

/**
 * The way in.
 *
 * Budget is expressed as a monthly payment because that is the number a family
 * on two salaries actually knows about themselves. The sale price is a
 * consequence of it, and is shown as one — the ceiling updates live underneath
 * the slider so nobody has to trust an invisible calculation.
 *
 * There is no submit button that might return nothing. The count updates as you
 * drag, the matching projects are named before you leave the page, and the link
 * out carries the whole state in its query string.
 */
export function Qualifier({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const budgetId = useId();
  const depositId = useId();
  const cityId = useId();

  const [budget, setBudget] = useState(6000);
  const [deposit, setDeposit] = useState(DEFAULT_DEPOSIT);
  const [city, setCity] = useState<string>("");

  const filters: Filters = useMemo(
    () => ({
      budget,
      deposit,
      city: city || null,
      segments: [],
      bedrooms: null,
      surfaceMin: null,
      statuses: [],
      amenities: [],
    }),
    [budget, deposit, city],
  );

  const result = useMemo(() => search(filters), [filters]);
  const ceiling = useMemo(() => maxAffordablePrice(budget, deposit), [budget, deposit]);

  // Cities are listed with the count they would return, so nobody picks a city
  // that has nothing in it.
  const cityOptions = useMemo(() => {
    const ceilingNow = maxAffordablePrice(budget, deposit);
    return cities
      .map((c) => ({
        ...c,
        count: projects.filter(
          (p) => p.cityId === c.id && effectiveTotal(p.price) <= ceilingNow,
        ).length,
      }))
      .filter((c) => projects.some((p) => p.cityId === c.id));
  }, [budget, deposit]);

  const href = `/${locale}/projets?${toSearchParams(filters).toString()}`;
  const exact = result.relaxed.length === 0;

  return (
    <section
      aria-labelledby="qualifier-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4rem, 9vw, 7.5rem)" }}
    >
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,34ch)_1fr]">
        <div className="u-enter">
          <p className="u-eyebrow" style={{ color: "var(--color-ochre-deep)" }}>
            {t.home.qualifierEyebrow}
          </p>
          <h2
            id="qualifier-title"
            className="u-display-tight u-enter mt-4"
            data-reveal="mask"
            style={{ fontSize: "var(--text-title)" }}
          >
            <span className="reveal-inner">{t.home.qualifierTitle}</span>
          </h2>
          <p className="u-body mt-5" style={{ color: "var(--color-ink-soft)" }}>
            {t.home.qualifierBody}
          </p>
        </div>

        <div className="u-enter" data-step="1">
          <div className="flex flex-col gap-8">
            <div>
              <label htmlFor={budgetId} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {t.home.qualifierBudget}
              </label>
              <output
                htmlFor={budgetId}
                className="u-display-tight u-numeric mt-3 block"
                style={{ fontSize: "var(--text-display)" }}
              >
                {formatNumber(budget, locale)}{" "}
                <span style={{ fontSize: "0.4em", letterSpacing: "0.06em" }}>
                  {t.common.perMonth}
                </span>
              </output>
              <input
                id={budgetId}
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="qualifier-range mt-4 w-full"
                aria-describedby={`${budgetId}-ceiling`}
              />
              <p
                id={`${budgetId}-ceiling`}
                className="u-numeric mt-3"
                style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}
              >
                {t.project.monthlyFrom} {formatNumber(Math.round(ceiling / 10000) * 10000, locale)}{" "}
                {t.common.currency} — {t.home.qualifierEstimate}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={depositId} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                  {t.home.qualifierDeposit}
                </label>
                <AmountInput
                  id={depositId}
                  value={deposit}
                  onChange={setDeposit}
                  locale={locale}
                  suffix={t.common.currency}
                />
              </div>

              <div>
                <label htmlFor={cityId} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                  {t.home.qualifierCity}
                </label>
                <select
                  id={cityId}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-3 w-full border-0 bg-transparent py-2"
                  style={{
                    fontSize: "var(--text-title)",
                    borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 30%, transparent)",
                  }}
                >
                  <option value="">{t.home.qualifierAllCities}</option>
                  {cityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name[locale]} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="flex flex-col gap-5 pt-7 sm:flex-row sm:items-end sm:justify-between"
              style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)" }}
            >
              <div>
                {/* Live count. Announced politely so a screen reader hears the
                    result change without being interrupted mid-drag. */}
                <p aria-live="polite" className="u-display-tight u-numeric" style={{ fontSize: "var(--text-title)" }}>
                  {formatNumber(result.projects.length, locale)}{" "}
                  {result.projects.length === 1 ? t.common.project : t.common.projects}
                </p>
                <p
                  className="mt-2"
                  style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}
                >
                  {exact
                    ? result.projects
                        .slice(0, 3)
                        .map((p) => p.name[locale])
                        .join(" · ")
                    : t.home.qualifierRelaxed}
                </p>
              </div>

              <Link
                href={href}
                className="u-eyebrow shrink-0 rounded-full px-8 py-4 u-press"
                style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
              >
                {t.home.qualifierResults} {formatNumber(result.projects.length, locale)}{" "}
                {t.home.qualifierResultsSuffix}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
