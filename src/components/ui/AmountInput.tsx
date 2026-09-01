"use client";

import { useEffect, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";

type Props = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  locale: Locale;
  suffix: string;
  describedBy?: string;
};

/**
 * A money field that reads like money.
 *
 * `<input type="number">` cannot show grouped digits, so a deposit renders as
 * "150000" — which on a page whose whole argument is that money is stated
 * plainly is the wrong detail to get wrong. This keeps a formatted string for
 * display and a number for the caller, and only reformats on blur so the
 * separators never jump around under the cursor while typing.
 *
 * `inputMode="numeric"` still brings up the number pad on a phone.
 */
export function AmountInput({ id, value, onChange, locale, suffix, describedBy }: Props) {
  const [text, setText] = useState(() => formatNumber(value, locale));
  const [editing, setEditing] = useState(false);

  // Keep in step when the value is changed elsewhere (the simulator resets it
  // when you switch typology), but never while the field has focus.
  useEffect(() => {
    if (!editing) setText(formatNumber(value, locale));
  }, [value, locale, editing]);

  return (
    <div
      className="mt-3 flex items-baseline gap-2"
      style={{ borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 30%, transparent)" }}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={text}
        aria-describedby={describedBy}
        onFocus={() => setEditing(true)}
        onChange={(event) => {
          const raw = event.target.value;
          setText(raw);
          const parsed = Number(raw.replace(/[^\d]/g, ""));
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        onBlur={() => {
          setEditing(false);
          setText(formatNumber(value, locale));
        }}
        className="u-numeric w-full min-w-0 border-0 bg-transparent py-2"
        style={{ fontSize: "var(--text-title)" }}
      />
      <span className="u-eyebrow shrink-0" style={{ color: "var(--color-ink-mute)" }}>
        {suffix}
      </span>
    </div>
  );
}
