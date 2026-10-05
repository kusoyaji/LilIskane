import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { indicativeMonthly, roundMonthly } from "./credit";
import type { Price, Project } from "@/data/types";
import { statusText } from "@/content/projects";

/**
 * Renders a price with its unit made explicit.
 *
 * Land is quoted per square metre. Printing "à partir de 3 450 DH" beside
 * "à partir de 1 830 000 DH" — which is what the current site does — makes a
 * 90 m² plot look like the cheapest thing Chaabi sells by a factor of five
 * hundred. Every price on this site goes through here.
 */
export function formatPrice(price: Price, locale: Locale): string {
  const t = getDictionary(locale);
  const amount = formatNumber(price.amount, locale);
  if (price.unit === "per-sqm") {
    return `${amount} ${t.common.currency}/${t.common.sqm}`;
  }
  return `${amount} ${t.common.currency}`;
}

/**
 * The smallest total a buyer could actually pay, which is what makes land
 * comparable with apartments in a budget filter.
 */
export function effectiveTotal(price: Price): number {
  if (price.unit === "per-sqm") {
    return price.amount * (price.minimumLotSqm ?? 1);
  }
  return price.amount;
}

export function formatMonthly(price: Price, locale: Locale): string {
  const t = getDictionary(locale);
  const monthly = roundMonthly(indicativeMonthly(effectiveTotal(price)));
  return `${formatNumber(monthly, locale)} ${t.common.perMonth}`;
}

/**
 * A numeric range, isolated as a unit.
 *
 * The en-dash is bidi-neutral, so two numbers either side of it get reordered
 * in Arabic — "84–116" becomes "116–84". Each number is already isolated by
 * `formatNumber`; the range as a whole needs isolating too, or the two isolates
 * simply swap places.
 */
export function formatRange(min: number, max: number, locale: Locale): string {
  if (min === max) return formatNumber(min, locale);
  return isolateRun(`${formatNumber(min, locale)}–${formatNumber(max, locale)}`, locale);
}

export function formatSurfaceRange(project: Project, locale: Locale): string {
  const t = getDictionary(locale);
  return `${formatRange(project.surfaceMin, project.surfaceMax, locale)} ${t.common.sqm}`;
}

export function statusLabel(project: Project, locale: Locale): string {
  return statusText(project, locale);
}

/**
 * Status colour, keyed to the background it sits on.
 *
 * Olive means delivered — something that has actually grown — and is
 * deliberately the only place the landscaping green appears in the UI. No
 * single tint of it clears 4.5:1 against both the limestone paper and the ink
 * sections, so the caller says which surface it is drawing on rather than the
 * palette pretending one value works everywhere.
 */
export function statusColor(project: Project, onDark = false): string {
  switch (project.status) {
    case "livre":
      return onDark ? "var(--color-olive-bright)" : "var(--color-olive-deep)";
    case "complet":
      return onDark
        ? "color-mix(in oklab, var(--color-paper) 62%, transparent)"
        : "var(--color-ink-mute)";
    default:
      return onDark ? "var(--color-ochre-bright)" : "var(--color-ochre-deep)";
  }
}
