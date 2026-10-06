"use client";

import type { Locale } from "@/i18n/config";
import { aiCopy } from "@/lib/search/ai/copy";
import { bindFigures, isolateFigures } from "@/lib/search/ai/numbers";
import type { AiAnswer } from "@/lib/search/ai/types";
import s from "./AiAnswerCard.module.css";

/**
 * The concierge's answer (header overlay, home hero, /projets hero), once it
 * has come — presentational; the wait before it and the landing are AiSlot's.
 *
 * A spark + "Concierge", the one-sentence summary (already validated on the
 * server: no figure the data does not contain), the clarifying question and
 * the follow-up suggestions as chips that fill the field (`onQuery`), and the
 * AI disclosure. Renders nothing when the answer holds nothing worth showing:
 * the instant results are then the answer.
 *
 * - "card": a softly boxed panel (overlay, /projets).
 * - "plain": no box — the home hero, where the answer sits under the
 *   question it answers and must stay light.
 *
 * The summary carries the answer's own language (an Arabic question on the
 * French page is answered in Arabic), so it sets its own lang/dir. It is
 * announced by AiSlot's live region, not here.
 */
export type AiAnswerCardProps = {
  locale: Locale;
  answer: AiAnswer;
  /** Put this text in the field (a suggestion, or the clarifying question). */
  onQuery: (text: string) => void;
  tone?: "ink" | "paper";
  variant?: "card" | "plain";
  /** Tighter spacing — for narrow columns. */
  compact?: boolean;
  /** At most this many chips (the clarifying question first). */
  maxChips?: number;
  className?: string;
};

export function hasAnswerContent(answer: AiAnswer | null): answer is AiAnswer {
  return Boolean(answer && (answer.summary || answer.clarify || answer.suggestions.length > 0));
}

export function AiAnswerCard({
  locale,
  answer,
  onQuery,
  tone = "ink",
  variant = "card",
  compact = false,
  maxChips = 4,
  className,
}: AiAnswerCardProps) {
  const c = aiCopy[locale];
  if (!hasAnswerContent(answer)) return null;
  const { summary, clarify } = answer;
  const lang = answer.language;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const suggestions = answer.suggestions.slice(0, Math.max(0, maxChips - (clarify ? 1 : 0)));

  return (
    <section
      className={`${s.card} ${className ?? ""}`}
      data-ai-tone={tone}
      data-variant={variant}
      data-compact={compact ? "" : undefined}
      aria-label={c.concierge}
    >
      <p className={s.head}>
        <Spark className={s.spark} />
        <span className={`u-eyebrow ${s.label}`}>{c.concierge}</span>
      </p>

      {summary ? (
        <p className={s.summary} lang={lang} dir={dir}>
          {display(summary)}
        </p>
      ) : (
        // No sentence (the server withheld one it could not verify): the chips are still a reply
        // to the question above — a quiet lead line says so, so they never read as stray buttons.
        !clarify && suggestions.length > 0 && <p className={s.lead}>{c.suggestOnly}</p>
      )}

      {(clarify || suggestions.length > 0) && (
        <ul className={s.chips} aria-label={c.suggestionsLabel}>
          {clarify && (
            <li style={{ ["--i" as string]: 0 }}>
              <button type="button" className={`${s.chip} ${s.clarify}`} onClick={() => onQuery(clarify)}>
                <span className="u-visually-hidden">{c.clarifyLabel} : </span>
                <bdi lang={lang}>{display(clarify)}</bdi>
              </button>
            </li>
          )}
          {suggestions.map((text, i) => (
            <li key={text} style={{ ["--i" as string]: i + (clarify ? 1 : 0) }}>
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
export function Spark({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M12 2.5c.5 4.6 2.4 8.4 9.5 9.5-7.1 1.1-9 4.9-9.5 9.5-.5-4.6-2.4-8.4-9.5-9.5 7.1-1.1 9-4.9 9.5-9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
