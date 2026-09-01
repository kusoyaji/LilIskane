"use client";

import { useId, useState } from "react";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

type Errors = Partial<Record<"name" | "phone" | "email", string>>;

/**
 * The conversion, kept short and kept dignified.
 *
 * Five fields, two of them optional, no account, no popup, no exit-intent, no
 * countdown. The phone number sits beside the form the whole time because for a
 * large share of this audience calling is the preferred route and making them
 * fill a form first is a way of losing them.
 *
 * Validation runs on submit rather than on every keystroke — being corrected
 * while still typing your own phone number is hostile — and the messages say
 * what to do rather than what went wrong.
 */
export function BookingForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const ids = {
    name: useId(),
    phone: useId(),
    email: useId(),
    date: useId(),
    message: useId(),
  };

  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = t.form.errorName;
    if (!phone) next.phone = t.form.errorPhone;
    // Moroccan mobile and landline numbers, with or without +212, and tolerant
    // of the spaces and dashes people actually type.
    else if (!/^(\+?212|0)\s?[5-7](?:[\s.-]?\d){8}$/.test(phone.replace(/\s+/g, " ")))
      next.phone = t.form.errorPhoneFormat;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = t.form.errorEmail;

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0] as keyof Errors;
      document.getElementById(ids[first])?.focus();
      return;
    }
    // No backend in this build: the submission is where the CRM call goes.
    setSent(true);
  };

  const field = (
    key: "name" | "phone" | "email",
    label: string,
    type: string,
    required: boolean,
    autoComplete: string,
  ) => (
    <div>
      <label htmlFor={ids[key]} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
        {label}{" "}
        <span style={{ color: "color-mix(in oklab, var(--color-ink) 40%, transparent)" }}>
          ({required ? t.form.required : t.form.optional})
        </span>
      </label>
      <input
        id={ids[key]}
        name={key}
        type={type}
        autoComplete={autoComplete}
        inputMode={key === "phone" ? "tel" : undefined}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${ids[key]}-error` : undefined}
        className="mt-3 w-full border-0 bg-transparent py-2.5"
        style={{
          fontSize: "var(--text-lead)",
          borderBlockEnd: `1px solid ${errors[key] ? "var(--color-ochre)" : "color-mix(in oklab, var(--color-ink) 30%, transparent)"}`,
        }}
      />
      {errors[key] && (
        <p
          id={`${ids[key]}-error`}
          className="mt-2"
          style={{ fontSize: "var(--text-small)", color: "var(--color-ochre-deep)" }}
        >
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <section
      id="visite"
      aria-labelledby="booking-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4rem, 9vw, 7rem)" }}
    >
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,38ch)_1fr]">
        <div>
          <p className="u-eyebrow" style={{ color: "var(--color-ochre-deep)" }}>
            {t.project.contactEyebrow}
          </p>
          <h2 id="booking-title" className="u-display mt-5" style={{ fontSize: "var(--text-display)" }}>
            {t.project.contactTitle}
          </h2>
          <p className="u-body mt-6" style={{ color: "var(--color-ink-soft)" }}>
            {t.project.contactBody}
          </p>

          <a
            href={t.nav.phoneHref}
            className="u-display-tight u-numeric mt-8 inline-block"
            style={{ fontSize: "var(--text-title)", color: "var(--color-ochre-deep)" }}
          >
            {t.nav.phone}
          </a>
          <p className="mt-2" style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}>
            {t.footer.hours}
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            className="flex flex-col justify-center p-10"
            style={{ background: "var(--color-paper-warm)" }}
          >
            <h3 className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
              {t.form.successTitle}
            </h3>
            <p className="u-body mt-4" style={{ color: "var(--color-ink-soft)" }}>
              {t.form.successBody}
            </p>
            <a
              href={t.nav.phoneHref}
              className="u-eyebrow u-numeric mt-7 w-fit rounded-full px-7 py-4"
              style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
            >
              {t.nav.phone}
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
            <div className="grid gap-7 sm:grid-cols-2">
              {field("name", t.form.name, "text", true, "name")}
              {field("phone", t.form.phone, "tel", true, "tel")}
              {field("email", t.form.email, "email", false, "email")}

              <div>
                <label htmlFor={ids.date} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                  {t.form.preferredDate}{" "}
                  <span style={{ color: "color-mix(in oklab, var(--color-ink) 40%, transparent)" }}>
                    ({t.form.optional})
                  </span>
                </label>
                <input
                  id={ids.date}
                  name="date"
                  type="date"
                  className="mt-3 w-full border-0 bg-transparent py-2.5"
                  style={{
                    fontSize: "var(--text-lead)",
                    borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 30%, transparent)",
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor={ids.message} className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {t.form.message}{" "}
                <span style={{ color: "color-mix(in oklab, var(--color-ink) 40%, transparent)" }}>
                  ({t.form.optional})
                </span>
              </label>
              <textarea
                id={ids.message}
                name="message"
                rows={3}
                placeholder={t.form.messagePlaceholder}
                className="mt-3 w-full resize-y border-0 bg-transparent py-2.5"
                style={{
                  fontSize: "var(--text-lead)",
                  borderBlockEnd: "1px solid color-mix(in oklab, var(--color-ink) 30%, transparent)",
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                type="submit"
                className="u-eyebrow rounded-full px-8 py-4 u-press"
                style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
              >
                {t.form.submitVisit}
              </button>
              <p
                style={{
                  fontSize: "var(--text-small)",
                  color: "var(--color-ink-mute)",
                  maxInlineSize: "44ch",
                }}
              >
                {t.form.privacy}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
