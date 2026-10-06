"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type InputHTMLAttributes, type RefObject } from "react";
import type { QuerySpan } from "@/lib/search";
import { markParts } from "./model";
import p from "./parts.module.css";

/**
 * The concierge's field: a plain text input, with two layers sharing its box.
 *
 * - Behind it, a mirror of the text in which the words the parser understood
 *   are underlined in ochre (`ParsedQuery.spans`) — the visitor sees what was
 *   read, as they type.
 * - Over an empty field, the example queries cycle (static under reduced
 *   motion: the first one stays as a normal placeholder).
 *
 * The surface gives the type (`className` sets font and size on all three
 * layers); the layering itself lives here, so both search surfaces share it.
 *
 * `multiline` (the home hero): a one-row textarea that grows to show the
 * whole sentence — up to `maxLines`, then it scrolls — so a long question is
 * read in full, not cut at the field's end. It is still one logical line:
 * line breaks typed or pasted become spaces, and Enter is the surface's
 * (submit). The underline layer wraps exactly like the text above it.
 */
export function MarkedInput({
  inputRef,
  value,
  onValue,
  spans,
  spansFor,
  placeholders,
  cycle = true,
  multiline = false,
  maxLines = 3,
  className,
  ...rest
}: {
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  onValue: (value: string) => void;
  spans: QuerySpan[];
  /** The text the spans were computed for; the underline hides while it lags behind. */
  spansFor: string;
  placeholders: string[];
  /** Cycle the examples while the field is empty (e.g. only while it is open / on screen). */
  cycle?: boolean;
  /** A textarea that grows with the text (see above). */
  multiline?: boolean;
  maxLines?: number;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder" | "className" | "onKeyDown" | "onBlur"> & {
  // Method syntax: a surface with a plain input may pass a handler typed for HTMLInputElement only.
  onKeyDown?(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  onBlur?(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void;
}) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setAnimated(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (!cycle || value || !animated || placeholders.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % placeholders.length), 3200);
    return () => window.clearInterval(id);
  }, [cycle, value, animated, placeholders.length]);

  const parts = useMemo(() => markParts(spansFor, spans), [spansFor, spans]);
  // Kept mounted while the spans lag a keystroke behind (hidden, not removed), so a word already
  // understood is not unmounted and redrawn on every keystroke.
  const hasMarks = parts.some((part) => part.mark);
  const stale = spansFor !== value;

  // The input's own scroll (a long query) is mirrored by the underline layer.
  const sync = () => {
    if (mirrorRef.current && inputRef.current) {
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
      mirrorRef.current.scrollTop = inputRef.current.scrollTop;
    }
  };
  useEffect(sync);

  // Multiline: as tall as its text, up to maxLines (then it scrolls). Measured
  // before paint on every change of the text — and of the type, which the
  // surface may step down for a long sentence — and again when the width changes.
  const fit = () => {
    const el = inputRef.current;
    if (!multiline || !el) return;
    const line = parseFloat(getComputedStyle(el).lineHeight) || 0;
    el.style.blockSize = "auto";
    const full = el.scrollHeight;
    const max = line ? Math.ceil(line * maxLines) : full;
    el.style.blockSize = `${Math.min(full, max)}px`;
    el.style.overflowY = full > max + 1 ? "auto" : "hidden";
    sync();
  };
  useLayoutEffect(fit);
  useEffect(() => {
    if (!multiline || !inputRef.current) return;
    let width = inputRef.current.clientWidth;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0;
      if (Math.abs(w - width) < 0.5) return;
      width = w;
      fit();
    });
    ro.observe(inputRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiline]);

  const cycling = animated && cycle && !value && placeholders.length > 1;

  return (
    <div className={p.inputWrap} data-multi={multiline || undefined}>
      {hasMarks && (
        <div
          ref={mirrorRef}
          className={`${p.layer} ${p.mirror} ${className ?? ""}`}
          aria-hidden
          dir="auto"
          data-stale={stale || undefined}
        >
          {keyed(parts).map(({ part, key }) =>
            part.mark ? (
              <mark key={key} className={p.mark}>
                {part.text}
              </mark>
            ) : (
              <span key={key}>{part.text}</span>
            ),
          )}
        </div>
      )}
      {multiline ? (
        <textarea
          ref={inputRef as RefObject<HTMLTextAreaElement | null>}
          className={`${p.input} ${className ?? ""}`}
          data-ph={cycling ? "" : undefined}
          rows={1}
          dir="auto"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          placeholder={placeholders[0]}
          value={value}
          // One logical line: a pasted line break is a space.
          onChange={(event) => onValue(event.target.value.replace(/[\r\n]+/g, " "))}
          onScroll={sync}
          onSelect={sync}
        />
      ) : (
        <input
          ref={inputRef as RefObject<HTMLInputElement | null>}
          className={`${p.input} ${className ?? ""}`}
          data-ph={cycling ? "" : undefined}
          type="text"
          dir="auto"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          {...rest}
          placeholder={placeholders[0]}
          value={value}
          onChange={(event) => onValue(event.target.value)}
          onScroll={sync}
          onSelect={sync}
        />
      )}
      {cycling && (
        <span key={index} className={`${p.layer} ${p.ph} ${className ?? ""}`} aria-hidden>
          {placeholders[index]}
        </span>
      )}
    </div>
  );
}

/**
 * Stable keys for the mirror's runs: an understood span is keyed by where it
 * starts in the text, not by its words, so a span that grows as the visitor
 * types it out ("3 chamb" → "3 chambres") keeps its node — its underline,
 * already drawn, just gets longer — and typing after it does not remount it
 * either. The stroke is drawn once, when the span is first understood, not
 * on every keystroke.
 */
function keyed(parts: Array<{ text: string; mark: boolean }>) {
  let at = 0;
  return parts.map((part, i) => {
    const start = at;
    at += part.text.length;
    return { part, key: part.mark ? `m@${start}` : `t${i}` };
  });
}
