"use client";

import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes, type RefObject } from "react";
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
 */
export function MarkedInput({
  inputRef,
  value,
  onValue,
  spans,
  spansFor,
  placeholders,
  cycle = true,
  className,
  ...rest
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onValue: (value: string) => void;
  spans: QuerySpan[];
  /** The text the spans were computed for; the underline hides while it lags behind. */
  spansFor: string;
  placeholders: string[];
  /** Cycle the examples while the field is empty (e.g. only while it is open / on screen). */
  cycle?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder" | "className">) {
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
  const showMarks = spansFor === value && parts.some((part) => part.mark);

  // The input's own horizontal scroll (long queries) is mirrored by the underline layer.
  const sync = () => {
    if (mirrorRef.current && inputRef.current) mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
  };
  useEffect(sync);

  const cycling = animated && cycle && !value && placeholders.length > 1;

  return (
    <div className={p.inputWrap}>
      {showMarks && (
        <div ref={mirrorRef} className={`${p.layer} ${p.mirror} ${className ?? ""}`} aria-hidden dir="auto">
          {parts.map((part, i) =>
            part.mark ? (
              <mark key={i} className={p.mark}>
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </div>
      )}
      <input
        ref={inputRef}
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
      {cycling && (
        <span key={index} className={`${p.layer} ${p.ph} ${className ?? ""}`} aria-hidden>
          {placeholders[index]}
        </span>
      )}
    </div>
  );
}
