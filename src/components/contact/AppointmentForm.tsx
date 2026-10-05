"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormCopy } from "@/content/contact";
import { ScrollTrigger } from "@/components/motion/gsap";
import type { Locale } from "@/i18n/config";
import {
  BIEN_TYPES,
  MEETING_MODES,
  SLOT_IDS,
  type BienType,
  type CityOption,
  type MeetingMode,
  type ProjectPrefill,
  type SlotId,
} from "./model";
import { ModeIcon } from "./ModeIcon";
import s from "./AppointmentForm.module.css";

type Values = {
  type: BienType | "";
  city: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  mode: MeetingMode | "";
  date: string;
  slot: SlotId | "";
  message: string;
  consent: boolean;
  /** Separate, optional opt-in for information about the programmes (Loi 09-08). Never pre-checked. */
  marketing: boolean;
};

/** Validated fields, in the order the visitor meets them — focus goes to the first wrong one. */
const ORDER = ["lastName", "firstName", "email", "phone", "mode", "date", "slot", "consent"] as const;
type FieldKey = (typeof ORDER)[number];
type Errors = Partial<Record<FieldKey, string>>;

const UPCOMING_DAYS = 12;

/** Local calendar date as YYYY-MM-DD — never `toISOString`, which shifts to UTC. */
function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseIso(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// Moroccan mobile and landline numbers, with or without +212 / 00212, tolerant
// of the spaces, dots and dashes people actually type…
const PHONE_MA = /^(?:(?:\+|00)212|0)\s?[5-7](?:[\s.-]?\d){8}$/;
// …and any international number, because a large share of buyers call from
// abroad (MRE) and must not be told their own number is wrong.
const PHONE_INTL = /^(?:\+|00)[1-9](?:[\s.-]?\d){6,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values, t: FormCopy, today: string): Errors {
  const e: Errors = {};
  if (!v.lastName.trim()) e.lastName = t.errors.lastName;
  if (!v.firstName.trim()) e.firstName = t.errors.firstName;
  const email = v.email.trim();
  if (!email) e.email = t.errors.email;
  else if (!EMAIL.test(email)) e.email = t.errors.emailFormat;
  const phone = v.phone.trim().replace(/\s+/g, " ");
  if (!phone) e.phone = t.errors.phone;
  else if (!PHONE_MA.test(phone) && !PHONE_INTL.test(phone)) e.phone = t.errors.phoneFormat;
  if (!v.mode) e.mode = t.errors.mode;
  const date = parseIso(v.date);
  if (!date) e.date = t.errors.date;
  else if (today && v.date < today) e.date = t.errors.datePast;
  if (!v.slot) e.slot = t.errors.slot;
  if (!v.consent) e.consent = t.errors.consent;
  return e;
}

/**
 * The appointment request — the one thing this site exists to produce.
 *
 * Four short steps on one card, no wizard: everything is visible, nothing is
 * hidden behind "next". The day is a wish, not a booking: it is chosen from the
 * next twelve days (no opening days are assumed — a counsellor calls back to
 * confirm), and "another date" opens a native picker for anything further out,
 * validated the same way (never in the past).
 *
 * Validation runs on submit, then live on any field that has been flagged, so
 * a message disappears the moment it is answered and nobody is corrected while
 * still typing. There is no network call — this is a maquette. The
 * confirmation says what really happens next: a person calls back.
 */
export function AppointmentForm({
  locale,
  t,
  cities,
  prefill,
  privacyHref,
  projectsHref,
  phone,
  phoneHref,
}: {
  locale: Locale;
  t: FormCopy;
  cities: CityOption[];
  prefill: ProjectPrefill | null;
  privacyHref: string;
  projectsHref: string;
  phone: string;
  phoneHref: string;
}) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  const [project, setProject] = useState<ProjectPrefill | null>(prefill);
  const [values, setValues] = useState<Values>({
    type: prefill?.type ?? "",
    city: prefill?.cityId ?? "",
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    mode: "",
    date: "",
    slot: "",
    message: "",
    consent: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [customDate, setCustomDate] = useState(false);

  // Dates depend on the visitor's own clock, so they are computed after mount;
  // the server renders the same grid as empty cells of identical size.
  const [today, setToday] = useState("");
  const [days, setDays] = useState<string[]>([]);
  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const list: string[] = [];
    const d = new Date(now);
    while (list.length < UPCOMING_DAYS) {
      d.setDate(d.getDate() + 1);
      list.push(iso(d));
    }
    setToday(iso(now));
    setDays(list);
  }, []);

  const dtLocale = locale === "ar" ? "ar-MA-u-nu-latn" : "fr-FR";
  const fmt = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(dtLocale, { weekday: "short" }),
      day: new Intl.DateTimeFormat(dtLocale, { day: "numeric" }),
      month: new Intl.DateTimeFormat(dtLocale, { month: "short" }),
      long: new Intl.DateTimeFormat(dtLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    }),
    [dtLocale],
  );

  const successRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K], base: Values = values) => {
    const next = { ...base, [key]: value };
    setValues(next);
    // Once the form has been submitted, or this field flagged, re-check live so
    // the message clears the moment it is answered.
    if (attempted || errors[key as FieldKey]) {
      const all = validate(next, t, today);
      setErrors((prev) => {
        const merged: Errors = {};
        for (const k of ORDER) if ((attempted || prev[k]) && all[k]) merged[k] = all[k];
        return merged;
      });
    }
    return next;
  };

  /** Blur check for typed fields: only once something has been typed. */
  const onBlur = (key: FieldKey) => {
    const raw = values[key as keyof Values];
    if (typeof raw === "string" && raw.trim() === "") return;
    const all = validate(values, t, today);
    setErrors((prev) => {
      const next = { ...prev };
      if (all[key]) next[key] = all[key];
      else delete next[key];
      return next;
    });
  };

  const focusField = (key: FieldKey) => {
    const target =
      key === "mode" || key === "slot" || key === "date"
        ? formRef.current?.querySelector<HTMLInputElement>(`[name="${key}"]:checked, [name="${key}"]`)
        : document.getElementById(id(key));
    target?.focus();
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const next = validate(values, t, today);
    setErrors(next);
    setAttempted(true);
    const first = ORDER.find((k) => next[k]);
    if (first) {
      focusField(first);
      return;
    }
    setStatus("sending");
    // No backend in this maquette: this is where the CRM call goes.
    window.setTimeout(() => setStatus("done"), 650);
  };

  useEffect(() => {
    if (status === "done") successRef.current?.focus();
    // The card changes height; anything scroll-linked below must re-measure.
    ScrollTrigger.refresh();
  }, [status]);

  const errorCount = ORDER.filter((k) => errors[k]).length;
  const describedBy = (key: FieldKey, hint?: boolean) =>
    [hint ? id(`${key}-hint`) : "", errors[key] ? id(`${key}-error`) : ""].filter(Boolean).join(" ") || undefined;

  const errorText = (k: FieldKey) =>
    errors[k] ? (
      <p id={id(`${k}-error`)} className={s.error}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden focusable="false">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4.5v4.2M8 10.9v.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>{errors[k]}</span>
      </p>
    ) : null;

  const optional = <span className={s.optional}>({t.optional})</span>;

  const textField = (
    key: "lastName" | "firstName" | "email" | "phone",
    label: string,
    type: string,
    autoComplete: string,
    hint?: string,
  ) => (
    <div className={s.field}>
      <label htmlFor={id(key)} className={s.label}>
        {label}
      </label>
      <input
        id={id(key)}
        name={key}
        type={type}
        autoComplete={autoComplete}
        inputMode={key === "phone" ? "tel" : key === "email" ? "email" : undefined}
        dir={key === "phone" || key === "email" ? "ltr" : undefined}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        onBlur={() => onBlur(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={describedBy(key, Boolean(hint))}
        aria-required
        className={s.input}
      />
      {hint && (
        <p id={id(`${key}-hint`)} className={s.hint}>
          {hint}
        </p>
      )}
      {errorText(key)}
    </div>
  );

  const cityName = (cid: string) => cities.find((c) => c.id === cid)?.name ?? "";
  const dateObj = parseIso(values.date);
  const isolate = (v: string) => (locale === "ar" ? `⁦${v}⁩` : v);

  /* ------------------------------------------------------------ success -- */
  if (status === "done") {
    const rows: Array<[string, React.ReactNode]> = [];
    if (project) rows.push([t.success.project, `${project.name} · ${project.cityName}`]);
    if (values.type) rows.push([t.success.type, t.types[values.type]]);
    if (values.city && (!project || project.cityId !== values.city)) rows.push([t.success.city, cityName(values.city)]);
    if (values.mode) rows.push([t.success.mode, t.modes[values.mode]]);
    rows.push([
      t.success.when,
      <>
        {dateObj ? fmt.long.format(dateObj) : values.date}
        {values.slot && (
          <>
            {" · "}
            <span dir="ltr">{t.slots[values.slot]}</span>
          </>
        )}
      </>,
    ]);
    rows.push([
      t.success.contact,
      <>
        {values.firstName.trim()} {values.lastName.trim()}
        <br />
        <span dir="ltr">{values.phone.trim()}</span>
        <br />
        <span dir="ltr">{values.email.trim()}</span>
      </>,
    ]);
    if (values.message.trim()) rows.push([t.success.message, values.message.trim()]);

    const [bodyBefore, bodyAfter] = t.success.body.split("{phone}");

    return (
      <div className={s.success} role="status">
        <div className={s.successBadge} aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" focusable="false">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className={`u-eyebrow ${s.successEyebrow}`}>{t.success.eyebrow}</p>
        <h3 ref={successRef} tabIndex={-1} className={`u-display ${s.successTitle}`}>
          {t.success.title.replace("{name}", values.firstName.trim())}
        </h3>
        <p className={s.successBody}>
          {bodyBefore}
          <strong dir="ltr" className={s.nowrap}>
            {values.phone.trim()}
          </strong>
          {bodyAfter}
        </p>

        <div className={s.recap}>
          <p className={`u-eyebrow ${s.recapTitle}`}>{t.success.recap}</p>
          <dl className={s.recapList}>
            {rows.map(([dt, dd]) => (
              <div key={dt} className={s.recapRow}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={s.successActions}>
          <button type="button" className={`${s.btnGhost} u-press`} onClick={() => setStatus("idle")}>
            {t.success.edit}
          </button>
          <Link href={projectsHref} className={`${s.btnSolid} u-press`}>
            <span>{t.success.explore}</span>
            <ArrowIcon />
          </Link>
        </div>
        <p className={s.successCall}>
          {t.success.call}{" "}
          <a href={phoneHref} dir="ltr" className={s.phoneLink}>
            {phone}
          </a>
        </p>
      </div>
    );
  }

  /* --------------------------------------------------------------- form -- */
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={s.form} aria-describedby={id("lead")}>
      <header className={s.head}>
        <p className={`u-eyebrow ${s.eyebrow}`}>{t.eyebrow}</p>
        <h2 className={`u-display-tight ${s.title}`}>{t.title}</h2>
        <p id={id("lead")} className={s.lead}>
          {t.lead}
        </p>
        {project && (
          <div className={s.about}>
            <span className={s.aboutLabel}>{t.about}</span>
            <span className={s.aboutName}>
              {project.name}
              <span className={s.aboutCity}> · {project.cityName}</span>
            </span>
            <button
              type="button"
              className={s.aboutRemove}
              aria-label={`${t.removeProject} — ${project.name}`}
              onClick={() => setProject(null)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input type="hidden" name="projet" value={project.slug} />
          </div>
        )}
      </header>

      {attempted && errorCount > 0 && (
        <div className={s.summary} role="alert">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden focusable="false">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.2M8 10.9v.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{errorCount === 1 ? t.summaryOne : t.summaryMany.replace("{n}", isolate(String(errorCount)))}</span>
        </div>
      )}

      {/* 01 — the project */}
      <div className={s.step}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>
            <span className={s.stepNo}>01</span>
            {t.steps.project}
          </legend>

          <div className={s.field}>
            <p className={s.label} id={id("type-label")}>
              {t.type} {optional}
            </p>
            <div className={s.chips} role="radiogroup" aria-labelledby={id("type-label")}>
              {BIEN_TYPES.map((key) => (
                <label key={key} className={s.chip}>
                  <input
                    type="radio"
                    name="type"
                    value={key}
                    checked={values.type === key}
                    onChange={() => set("type", key)}
                    className={s.srOnly}
                  />
                  <span className={s.chipFace}>{t.types[key]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={s.field}>
            <label htmlFor={id("city")} className={s.label}>
              {t.city} {optional}
            </label>
            <div className={s.selectWrap}>
              <select
                id={id("city")}
                name="city"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                className={`${s.input} ${s.select}`}
              >
                <option value="">{t.cityPlaceholder}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <svg className={s.selectChevron} width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </fieldset>
      </div>

      {/* 02 — the person */}
      <div className={s.step}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>
            <span className={s.stepNo}>02</span>
            {t.steps.you}
          </legend>
          <div className={s.grid2}>
            {textField("lastName", t.lastName, "text", "family-name")}
            {textField("firstName", t.firstName, "text", "given-name")}
            {textField("email", t.email, "email", "email")}
            {textField("phone", t.phone, "tel", "tel", t.phoneHint)}
          </div>
        </fieldset>
      </div>

      {/* 03 — the meeting */}
      <div className={s.step}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>
            <span className={s.stepNo}>03</span>
            {t.steps.meeting}
          </legend>

          <div className={s.field}>
            <p className={s.label} id={id("mode-label")}>
              {t.mode}
            </p>
            <div
              className={s.modes}
              role="radiogroup"
              aria-labelledby={id("mode-label")}
              aria-describedby={describedBy("mode")}
              aria-invalid={errors.mode ? true : undefined}
            >
              {MEETING_MODES.map((key) => (
                <label key={key} className={s.mode}>
                  <input
                    type="radio"
                    name="mode"
                    value={key}
                    checked={values.mode === key}
                    onChange={() => set("mode", key)}
                    className={s.srOnly}
                  />
                  <span className={s.modeFace} data-invalid={errors.mode ? "" : undefined}>
                    <span className={s.modeIcon}>
                      <ModeIcon mode={key} />
                    </span>
                    <span className={s.modeLabel}>{t.modes[key]}</span>
                  </span>
                </label>
              ))}
            </div>
            {values.mode && <p className={s.hint}>{t.modeHints[values.mode]}</p>}
            {errorText("mode")}
          </div>

          <div className={s.field}>
            <div className={s.labelRow}>
              <p className={s.label} id={id("date-label")}>
                {t.date}
              </p>
              <button
                type="button"
                className={s.textBtn}
                onClick={() => {
                  setCustomDate((c) => !c);
                  if (!customDate && days.includes(values.date)) set("date", "");
                  if (customDate && !days.includes(values.date)) set("date", "");
                }}
                aria-expanded={customDate}
              >
                {customDate ? t.backToDays : t.otherDate}
              </button>
            </div>
            <p id={id("date-hint")} className={s.hint}>
              {t.dateHint}
            </p>

            {customDate ? (
              <div className={s.customDate}>
                <label htmlFor={id("date")} className="u-visually-hidden">
                  {t.otherDateLabel}
                </label>
                <input
                  id={id("date")}
                  name="date"
                  type="date"
                  min={today || undefined}
                  value={values.date}
                  onChange={(e) => set("date", e.target.value)}
                  onBlur={() => onBlur("date")}
                  aria-invalid={errors.date ? true : undefined}
                  aria-describedby={describedBy("date", true)}
                  className={s.input}
                />
                {dateObj && !errors.date && <p className={s.hint}>{fmt.long.format(dateObj)}</p>}
              </div>
            ) : (
              <div
                className={s.days}
                role="radiogroup"
                aria-labelledby={id("date-label")}
                aria-describedby={describedBy("date", true)}
                aria-invalid={errors.date ? true : undefined}
              >
                {days.length === 0
                  ? Array.from({ length: UPCOMING_DAYS }, (_, i) => <span key={i} className={s.dayGhost} aria-hidden />)
                  : days.map((day) => {
                      const d = parseIso(day)!;
                      return (
                        <label key={day} className={s.day}>
                          <input
                            type="radio"
                            name="date"
                            value={day}
                            checked={values.date === day}
                            onChange={() => set("date", day)}
                            className={s.srOnly}
                            aria-label={fmt.long.format(d)}
                          />
                          <span className={s.dayFace} data-invalid={errors.date ? "" : undefined} aria-hidden>
                            <span className={s.dayWeek}>{fmt.weekday.format(d).replace(".", "")}</span>
                            <span className={s.dayNum}>{fmt.day.format(d)}</span>
                            <span className={s.dayMonth}>{fmt.month.format(d).replace(".", "")}</span>
                          </span>
                        </label>
                      );
                    })}
              </div>
            )}
            {errorText("date")}
          </div>

          <div className={s.field}>
            <p className={s.label} id={id("slot-label")}>
              {t.slot}
            </p>
            <div
              className={s.slots}
              role="radiogroup"
              aria-labelledby={id("slot-label")}
              aria-describedby={describedBy("slot")}
              aria-invalid={errors.slot ? true : undefined}
            >
              {SLOT_IDS.map((key) => (
                <label key={key} className={s.chip}>
                  <input
                    type="radio"
                    name="slot"
                    value={key}
                    checked={values.slot === key}
                    onChange={() => set("slot", key)}
                    className={s.srOnly}
                  />
                  <span className={`${s.chipFace} ${s.slotFace}`} data-invalid={errors.slot ? "" : undefined}>
                    <span dir="ltr">{t.slots[key]}</span>
                  </span>
                </label>
              ))}
            </div>
            {errorText("slot")}
          </div>
        </fieldset>
      </div>

      {/* 04 — the message */}
      <div className={s.step}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>
            <span className={s.stepNo}>04</span>
            {t.steps.message}
          </legend>
          <div className={s.field}>
            <label htmlFor={id("message")} className={s.label}>
              {t.message} {optional}
            </label>
            <textarea
              id={id("message")}
              name="message"
              rows={4}
              value={values.message}
              placeholder={t.messagePlaceholder}
              onChange={(e) => set("message", e.target.value)}
              className={`${s.input} ${s.textarea}`}
            />
          </div>
        </fieldset>
      </div>

      <div className={s.consentBlock}>
        <label className={s.consent}>
          <input
            id={id("consent")}
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy("consent")}
            className={s.srOnly}
          />
          <span className={s.box} data-invalid={errors.consent ? "" : undefined} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" focusable="false">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={s.consentText}>
            {t.consentBefore}
            <Link href={privacyHref} className={s.inlineLink}>
              {t.consentLink}
            </Link>
            {t.consentAfter}
          </span>
        </label>
        {errorText("consent")}
        <label className={s.consent}>
          <input
            type="checkbox"
            name="marketing"
            checked={values.marketing}
            onChange={(e) => set("marketing", e.target.checked)}
            className={s.srOnly}
          />
          <span className={s.box} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" focusable="false">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={s.consentText}>{t.marketing}</span>
        </label>
      </div>

      <div className={s.submitRow}>
        <button type="submit" className={`${s.submit} u-press`} aria-busy={status === "sending"} disabled={status === "sending"}>
          <span>{status === "sending" ? t.submitting : t.submit}</span>
          {status === "sending" ? <span className={s.spinner} aria-hidden /> : <ArrowIcon />}
        </button>
        <p className={s.reassurance}>{t.reassurance}</p>
      </div>
    </form>
  );
}

function ArrowIcon() {
  return (
    <svg className={s.arrow} width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
