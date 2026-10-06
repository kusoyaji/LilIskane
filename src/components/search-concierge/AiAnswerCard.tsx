"use client";

import type { Locale } from "@/i18n/config";
import { aiCopy } from "@/lib/search/ai/copy";
import { bindFigures, isolateFigures } from "@/lib/search/ai/numbers";
import type { AiAnswer, AiState } from "@/lib/search/ai/types";
import s from "./AiAnswerCard.module.css";

/**
 * The concierge's answer, above the results (header overlay, home hero,
 * /projets hero). Presentational: the state comes from `useAiSearch`.
 *
 * - "thinking": one quiet line, "Le concierge affine votre recherche…" — the
 *   instant results below stay usable.
 * - "ready": a spark + "Concierge", the one-sentence summary (already
 *   validated on the server: no figure the data does not contain), the
 *   clarifying question and the follow-up suggestions as chips that fill the
 *   field (`onQuery`), and the AI disclosure.
 * - "idle" / "unavailable", or nothing worth showing: renders nothing — the
 *   instant results are the answer.
 *
 * The summary carries the answer's own language (an Arabic question on the
 * French page is answered in Arabic), so it sets its own lang/dir.
 */
export type AiAnswerCardProps = {
  locale: Locale;
  state: AiState;
  /** Only an answer for the text currently in the field (see useAiSearch's forQuery). */
  answer: AiAnswer | null;
  /** Put this text in the field (a suggestion, or the clarifying question). */
  onQuery: (text: string) => void;
  tone?: "ink" | "paper";
  /** Tighter spacing, no disclosure line break — for narrow columns. */
  compact?: boolean;
  /** "thinking" only: render as a span inside an existing line (no box of its own). */
  inline?: boolean;
  className?: string;
};

export function AiAnswerCard({ locale, state, answer, onQuery, tone = "ink", compact = false, inline = false, className }: AiAnswerCardProps) {
  const c = aiCopy[locale];

  if (state === "thinking") {
    // `inline`: set inside a line that already exists (the home hero's count), so it takes no height.
    const Line = inline ? "span" : "p";
    return (
      <Line className={`${s.thinking} ${className ?? ""}`} data-tone={tone} data-inline={inline || undefined} role="status">
        <Spark className={s.thinkingSpark} />
        <span className={s.thinkingText}>
          {c.thinking}
          {/* The light that crosses the line: a bright copy of the words, seen through a moving window. */}
          <span className={s.sweep} aria-hidden>
            <span className={s.sweepText}>{c.thinking}</span>
          </span>
        </span>
      </Line>
    );
  }

  if (state !== "ready" || !answer) return null;
  const { summary, clarify, suggestions } = answer;
  if (!summary && !clarify && suggestions.length === 0) return null;
  const lang = answer.language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <section
      className={`${s.card} ${className ?? ""}`}
      data-tone={tone}
      data-compact={compact ? "" : undefined}
      aria-label={c.concierge}
    >
      <p className={s.head}>
        <Spark className={s.spark} />
        <span className={`u-eyebrow ${s.label}`}>{c.concierge}</span>
      </p>

      {summary && (
        // Only the sentence is announced, not the chips and the disclosure.
        <p className={s.summary} lang={lang} dir={dir} aria-live="polite">
          {display(summary)}
        </p>
      )}

      {(clarify || suggestions.length > 0) && (
        <ul className={s.chips} aria-label={c.suggestionsLabel}>
          {clarify && (
            <li>
              <button type="button" className={`${s.chip} ${s.clarify}`} onClick={() => onQuery(clarify)}>
                <span className="u-visually-hidden">{c.clarifyLabel} : </span>
                <bdi lang={lang}>{display(clarify)}</bdi>
              </button>
            </li>
          )}
          {suggestions.map((text) => (
            <li key={text}>
              <button type="button" className={s.chip} onClick={() => onQuery(text)}>
                <bdi lang={lang}>{display(text)}</bdi>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={s.disclosure}>{c.disclosure}</p>
    </section>
  );
}

/** A figure never wraps ("1 045 / 000 DH"), and keeps its digit order in Arabic. */
function display(text: string): string {
  return isolateFigures(bindFigures(text));
}

/** The concierge's mark: a four-point spark. */
function Spark({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M12 2.5c.5 4.6 2.4 8.4 9.5 9.5-7.1 1.1-9 4.9-9.5 9.5-.5-4.6-2.4-8.4-9.5-9.5 7.1-1.1 9-4.9 9.5-9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
