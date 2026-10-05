"use client";

import { useId, useMemo, useState } from "react";
import { AmountInput } from "@/components/ui/AmountInput";
import { CREDIT_DEFAULTS, computeCredit } from "@/lib/credit";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import type { Typology } from "@/data/types";

type Props = {
  locale: Locale;
  basePrice: number;
  typologies: Typology[];
  /**
   * The introduction above the controls. Defaults to the project-page copy;
   * pass your own, or `false` where the surrounding page already introduces
   * the simulator (the buying guide) — the default copy is written for a
   * project page and would be wrong anywhere else.
   */
  intro?: false | { eyebrow?: string; title: string; body?: string };
};

const DURATIONS = [10, 15, 20, 25];

/**
 * The credit simulator, treated as the instrument it is.
 *
 * This is almost certainly the highest-intent interaction on the site: someone
 * running numbers is someone deciding. So it gets a full-width dark section
 * rather than a widget in a box, it is pre-filled with this project's real
 * price, and it shows the parts of the answer that are usually hidden — the
 * insurance premium and the total cost of the credit, not just the flattering
 * monthly figure.
 *
 * It shares `src/lib/credit.ts` with the search filter, so the payment quoted
 * here is the same one that decided whether this project appeared in a budget
 * search at all.
 */
export function CreditSimulator({ locale, basePrice, typologies, intro }: Props) {
  const t = getDictionary(locale);
  const depositId = useId();
  const priceId = useId();

  const [price, setPrice] = useState(basePrice);
  const [deposit, setDeposit] = useState(Math.round(basePrice * CREDIT_DEFAULTS.minDepositRatio));
  const [years, setYears] = useState<number>(CREDIT_DEFAULTS.years);

  const result = useMemo(
    () => computeCredit({ price, deposit, years, annualRate: CREDIT_DEFAULTS.annualRate }),
    [price, deposit, years],
  );

  const depositTooLow = price > 0 && deposit < price * CREDIT_DEFAULTS.minDepositRatio;

  const rows = [
    { label: t.simulator.borrowed, value: result.borrowed },
    { label: t.simulator.insurance, value: result.monthlyInsurance, perMonth: true },
    { label: t.simulator.interest, value: result.totalInterest },
    { label: t.simulator.total, value: result.totalPaid },
  ];

  return (
    <section
      id="financement"
      aria-labelledby={intro === false ? undefined : "simulator-title"}
      aria-label={intro === false ? t.simulator.title : undefined}
      style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
    >
      <div className="u-shell" style={{ paddingBlock: "clamp(4rem, 9vw, 7rem)" }}>
        {intro !== false && (
          <div className="max-w-[48ch]">
            <p className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
              {intro?.eyebrow ?? t.simulator.title}
            </p>
            <h2
              id="simulator-title"
              className="u-display mt-5"
              style={{ fontSize: "var(--text-display)" }}
            >
              {intro?.title ?? t.project.simulatorTitle}
            </h2>
            <p
              className="u-body mt-6"
              style={{ color: "color-mix(in oklab, var(--color-paper) 78%, transparent)" }}
            >
              {intro ? intro.body : t.project.simulatorBody}
            </p>
          </div>
        )}

        <div className={`${intro === false ? "" : "mt-12 "}grid gap-x-16 gap-y-12 lg:grid-cols-2`}>
          <div className="flex flex-col gap-8">
            {typologies.length > 0 && (
              <div>
                <p className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}>
                  {t.project.typologiesEyebrow}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {typologies.map((typology) => {
                    const selected = typology.price.amount === price;
                    return (
                      <button
                        key={typology.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPrice(typology.price.amount);
                          setDeposit(
                            Math.round(typology.price.amount * CREDIT_DEFAULTS.minDepositRatio),
                          );
                        }}
                        className="u-eyebrow inline-flex min-h-11 items-center rounded-full px-4 py-2.5 u-press"
                        style={{
                          background: selected ? "var(--color-paper)" : "transparent",
                          color: selected ? "var(--color-ink)" : "color-mix(in oklab, var(--color-paper) 82%, transparent)",
                          border: `1px solid ${selected ? "var(--color-paper)" : "color-mix(in oklab, var(--color-paper) 26%, transparent)"}`,
                        }}
                      >
                        {typology.label[locale]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor={priceId} className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}>
                  {t.simulator.price}
                </label>
                <AmountInput
                  id={priceId}
                  value={price}
                  onChange={setPrice}
                  locale={locale}
                  suffix={t.common.currency}
                />
              </div>

              <div>
                <label htmlFor={depositId} className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}>
                  {t.simulator.deposit}
                </label>
                <AmountInput
                  id={depositId}
                  value={deposit}
                  onChange={setDeposit}
                  locale={locale}
                  suffix={t.common.currency}
                  describedBy={depositTooLow ? `${depositId}-warn` : undefined}
                />
                {depositTooLow && (
                  <p
                    id={`${depositId}-warn`}
                    className="mt-2"
                    style={{ fontSize: "var(--text-small)", color: "var(--color-ochre-bright)" }}
                  >
                    {t.simulator.depositTooLow}
                  </p>
                )}
              </div>
            </div>

            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}>
                {t.simulator.duration}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {DURATIONS.map((duration) => {
                  const selected = duration === years;
                  return (
                    <button
                      key={duration}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setYears(duration)}
                      className="u-eyebrow u-numeric inline-flex min-h-11 items-center rounded-full px-5 py-3 u-press"
                      style={{
                        background: selected ? "var(--color-ochre-bright)" : "transparent",
                        color: selected ? "var(--color-ink)" : "color-mix(in oklab, var(--color-paper) 82%, transparent)",
                        border: `1px solid ${selected ? "var(--color-ochre-bright)" : "color-mix(in oklab, var(--color-paper) 26%, transparent)"}`,
                      }}
                    >
                      {formatNumber(duration, locale)}{" "}
                      {/* Arabic counts 3–10 take the plural (10 سنوات); 11 and up the singular (15 سنة). */}
                      {locale === "ar" ? (duration <= 10 ? "سنوات" : "سنة") : t.simulator.years}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div>
            <p className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 62%, transparent)" }}>
              {t.simulator.monthly}
            </p>
            <p
              aria-live="polite"
              className="u-display u-numeric mt-4"
              style={{ fontSize: "var(--text-mega)", color: "var(--color-paper)" }}
            >
              {formatNumber(Math.round(result.monthlyTotal), locale)}
              <span className="ms-3" style={{ fontSize: "0.24em", letterSpacing: "0.14em" }}>
                {t.common.perMonth}
              </span>
            </p>

            <dl className="mt-10">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 py-4"
                  style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 16%, transparent)" }}
                >
                  <dt style={{ color: "color-mix(in oklab, var(--color-paper) 76%, transparent)" }}>
                    {row.label}
                  </dt>
                  <dd className="u-numeric">
                    {formatNumber(Math.round(row.value), locale)}{" "}
                    {row.perMonth ? t.common.perMonth : t.common.currency}
                  </dd>
                </div>
              ))}
            </dl>

            <p
              className="mt-6"
              style={{
                fontSize: "var(--text-small)",
                color: "color-mix(in oklab, var(--color-paper) 58%, transparent)",
                maxInlineSize: "48ch",
              }}
            >
              {t.simulator.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
