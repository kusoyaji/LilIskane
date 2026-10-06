import { AMENITY_LABELS, KIND_LABELS, SEGMENT_LABELS } from "@/content/projects";
import { searchCopy } from "@/content/search";
import { cityById } from "@/data/cities";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import type { ParsedQuery, SearchDoc } from "@/lib/search";
import { aiCopy } from "@/lib/search/ai/copy";
import { evaluate, type Check } from "@/lib/search/ai/criteria";
import type { AiResult } from "@/lib/search/ai/types";
import { statusFacetLabel } from "@/components/search/labels";
import s from "./CriteriaTicks.module.css";

/**
 * The ✓/✕ line under a result row: "✓ Agadir · ✓ 3 chambres · ✕ budget +5 %".
 *
 * Rendered FROM THE DATA, never from the model's words: each tick is the
 * programme's own fact checked against the visitor's criteria (the merged
 * query — typed, picked and AI-inferred values) by the same rule the server
 * used to accept the AI's "exact" fit (lib/search/ai/criteria.ts). The AI
 * result only orders the ticks (criteria the concierge weighed first); missed
 * criteria are always shown, the met ones fill up to `max`.
 *
 * Presentational and server-safe (no hooks); ink ground by default.
 */
export type CriteriaTicksProps = {
  locale: Locale;
  doc: SearchDoc;
  /** The concierge's verdict for this programme, if it gave one. */
  ai?: AiResult | null;
  /** The query the results answer: merge(parse(raw), extra), plus the AI's inferred filters. */
  query: ParsedQuery;
  /** Ticks shown at most (missed criteria always shown). Default 4. */
  max?: number;
  tone?: "ink" | "paper";
  className?: string;
};

export function CriteriaTicks({ locale, doc, ai = null, query, max = 4, tone = "ink", className }: CriteriaTicksProps) {
  const checks = evaluate(doc, query);
  if (checks.length === 0) return null;
  const c = aiCopy[locale];

  const weighed = new Set(ai?.criteria.map((x) => x.key) ?? []);
  const ordered = checks
    .map((check, index) => ({ check, index }))
    .sort((a, b) => Number(weighed.has(b.check.key)) - Number(weighed.has(a.check.key)) || a.index - b.index);
  const missed = ordered.filter((x) => !x.check.ok);
  const met = ordered.filter((x) => x.check.ok).slice(0, Math.max(0, max - missed.length));
  const shown = [...met, ...missed].sort((a, b) => a.index - b.index).map((x) => x.check);

  return (
    <ul className={`${s.ticks} ${className ?? ""}`} data-tone={tone} aria-label={c.ticksLabel}>
      {shown.map((check, i) => (
        <li
          // By criterion only: a criterion added elsewhere does not replay every tick in every card.
          key={check.key === "amenity" ? `amenity:${check.amenity}` : check.key}
          className={s.tick}
          data-ok={check.ok ? "" : undefined}
          style={{ ["--i" as string]: i } as React.CSSProperties}
        >
          <span className={s.glyph} aria-hidden>
            {check.ok ? "✓" : "✕"}
          </span>
          <span className="u-visually-hidden">{check.ok ? c.met : c.unmet} : </span>
          <span className={s.label}>{label(check, query, doc, locale)}</span>
        </li>
      ))}
    </ul>
  );
}

function label(check: Check, query: ParsedQuery, doc: SearchDoc, locale: Locale): string {
  const c = aiCopy[locale];
  const over = (pct: number) => isolateRun(c.over(pct), locale);
  switch (check.key) {
    case "city":
    case "region": {
      if (check.ok) return doc.city[locale];
      if (query.region) return searchCopy[locale].regions[query.region];
      if (query.cities.length === 1) return cityById.get(query.cities[0])?.name[locale] ?? c.place;
      return c.place;
    }
    case "bedrooms":
      return check.ok
        ? c.bedrooms(check.min, formatNumber(check.min, locale))
        : c.bedroomsMax(check.max, formatNumber(check.max, locale));
    case "budget":
      return check.ok ? c.budget : `${c.budget} ${over(check.overPct)}`;
    case "monthly":
      return check.ok ? c.monthly : `${c.monthly} ${over(check.overPct)}`;
    case "segment":
      return SEGMENT_LABELS[check.ok ? check.segment : query.segments[0]][locale];
    case "kind": {
      const kind = check.ok ? (check.kinds.find((k) => query.kinds.includes(k)) ?? query.kinds[0]) : query.kinds[0];
      return KIND_LABELS[kind][locale];
    }
    case "status": {
      const facet = check.ok ? (check.statuses.find((st) => query.statuses.includes(st)) ?? query.statuses[0]) : query.statuses[0];
      return statusFacetLabel(facet, locale);
    }
    case "amenity":
      return AMENITY_LABELS[check.amenity][locale];
  }
}
