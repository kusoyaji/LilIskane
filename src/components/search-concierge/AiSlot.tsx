"use client";

import { useEffect, useState } from "react";
import { searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { aiCopy } from "@/lib/search/ai/copy";
import type { AiAnswer, AiState } from "@/lib/search/ai/types";
import { AiAnswerCard, hasAnswerContent, Spark } from "./AiAnswerCard";
import s from "./AiSlot.module.css";

/** The wait leaves faster than anything arrives. */
const PENDING_OUT_MS = 150;
/** Each stage of the status line holds about this long; the last one stays. */
const STAGE_MS = [1400, 1500];
/** The answer's words leave the live region this long after being announced. */
const LIVE_CLEAR_MS = 3000;

/**
 * Where the concierge's answer appears — the same place before, during and
 * after the wait, so the page never jumps for it.
 *
 * - Asked ("thinking"): a skeleton of the answer, at once — the "Concierge"
 *   eyebrow with a breathing spark, three bars of text with a light sweeping
 *   across them in the reading direction, and one status line that follows
 *   the request's real course: the sentence read, the programmes compared,
 *   the answer checked against the fiches (the server's validator). It is
 *   about the answer's height, so its arrival does not shove anything.
 * - Answered: the answer comes into focus over the fading skeleton (both in
 *   one grid cell for the 150 ms they overlap), its chips one after another.
 * - No answer (timeout, refusal, no key): the skeleton just fades out. The
 *   instant results are already there; nothing says "error".
 *
 * Announced once: "Le concierge cherche…" when the wait starts (aria-busy on
 * the region), then the sentence when it lands — never each stage.
 */
export function AiSlot({
  locale,
  state,
  answer,
  onQuery,
  total = null,
  variant = "card",
  compact = false,
  maxChips,
  announceBusy = true,
  className,
}: {
  locale: Locale;
  state: AiState;
  /** Only an answer for the text currently in the field. */
  answer: AiAnswer | null;
  onQuery: (text: string) => void;
  /** Programmes in the catalogue (the "Comparaison des 23 programmes…" stage), when known. */
  total?: number | null;
  variant?: "card" | "plain";
  compact?: boolean;
  maxChips?: number;
  /** False where the surface already announces the wait in its own live region. */
  announceBusy?: boolean;
  className?: string;
}) {
  const c = searchCopy[locale];
  const pending = state === "thinking";
  const shown = state === "ready" && hasAnswerContent(answer) ? answer : null;

  // The skeleton stays mounted for its fade-out once the wait is over, and the
  // status line restarts with each new wait. Both are set during the render
  // that sees the change — never one commit late, which would unmount the
  // skeleton for a frame (the page below would jump up, then back).
  const [leaving, setLeaving] = useState(false);
  const [stage, setStage] = useState(0);
  const [wasAsked, setWasAsked] = useState(pending);
  if (pending !== wasAsked) {
    setWasAsked(pending);
    setLeaving(!pending);
    if (pending) setStage(0);
  }
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(false), PENDING_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!pending) return;
    const first = window.setTimeout(() => setStage(1), STAGE_MS[0]);
    const second = window.setTimeout(() => setStage(2), STAGE_MS[0] + STAGE_MS[1]);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [pending]);

  const stages = c.aiStages(total, total ? formatNumber(total, locale) : "");
  const skeleton = pending || leaving;
  // What the answer says, announced once: its sentence — or, when it has none, the lead line and
  // the suggestions. Then the live region empties itself (after the reader had time to say it), so
  // browsing the page does not meet the sentence twice.
  const ai = aiCopy[locale];
  const said = shown
    ? (shown.summary ?? `${ai.suggestOnly} ${shown.suggestions.slice(0, maxChips ?? 4).join(" · ")}`)
    : "";
  const [quiet, setQuiet] = useState(false);
  const [lastSaid, setLastSaid] = useState(said);
  if (said !== lastSaid) {
    setLastSaid(said);
    setQuiet(false);
  }
  useEffect(() => {
    if (!said) return;
    const timer = window.setTimeout(() => setQuiet(true), LIVE_CLEAR_MS);
    return () => window.clearTimeout(timer);
  }, [said]);
  const live = pending ? (announceBusy ? c.aiBusy : "") : quiet ? "" : said;
  const status = !skeleton && !shown ? "empty" : shown ? "answer" : "pending";

  return (
    <div className={`${s.slot} ${className ?? ""}`} data-variant={variant} data-state={status} aria-busy={pending || undefined}>
      {skeleton && (
        <div className={s.pending} data-leaving={!pending || undefined} aria-hidden>
          <p className={s.head}>
            <Spark className={s.spark} />
            <span className={`u-eyebrow ${s.label}`}>{ai.concierge}</span>
          </p>
          <span className={s.bars}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={s.line}>
                <span className={s.bar} style={{ ["--i" as string]: i }} />
              </span>
            ))}
          </span>
          {/* The suggestions' row to come — shown where the answer's chips wrap tall (the overlay on phones). */}
          <span className={s.pills}>
            <span />
            <span />
          </span>
          <p className={s.stage}>
            <span key={stage} className={s.stageText}>
              {stages[stage]}
            </span>
          </p>
        </div>
      )}
      {shown && (
        <AiAnswerCard
          locale={locale}
          answer={shown}
          onQuery={onQuery}
          variant={variant}
          compact={compact}
          maxChips={maxChips}
          className={s.answer}
        />
      )}
      <p className="u-visually-hidden" aria-live="polite" aria-atomic="true" lang={shown?.summary && !quiet ? shown.language : undefined}>
        {live}
      </p>
    </div>
  );
}
