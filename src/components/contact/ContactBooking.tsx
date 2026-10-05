import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { contact } from "@/content/contact";
import { shared } from "@/content/shared";
import { company } from "@/data/company";
import type { MediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { AppointmentForm } from "./AppointmentForm";
import { MEETING_MODES, type CityOption, type ProjectPrefill } from "./model";
import { ModeIcon } from "./ModeIcon";
import s from "./contact.module.css";

/** Delivered Riad Garden I — a photograph of something finished, not a render. */
const BACKDROP: MediaRef = {
  key: "rg1_DSC00924",
  nature: "photograph",
  alt: {
    fr: "La piscine et les jardins de Riad Garden I, à Marrakech, après livraison.",
    ar: "المسبح والحدائق في رياض غاردن 1 بمراكش بعد التسليم.",
  },
};

/** "+212 5 20 39 34 00", derived from the canonical tel: href rather than typed twice. */
function internationalPhone(href: string): string {
  const digits = href.replace(/^tel:\+?/, "");
  const cc = digits.slice(0, 3);
  const rest = digits.slice(3);
  return `+${cc} ${rest[0]} ${rest.slice(1).replace(/(\d{2})(?=\d)/g, "$1 ")}`;
}

/**
 * The opening of /contact: the page IS the call to action, so the form is in
 * the first screen. Left, the statement and every direct route (the phone
 * number first, as a link); right, the appointment request on a paper card.
 * On desktop the left column holds still while the form scrolls past it.
 */
export function ContactBooking({
  locale,
  cities,
  prefill,
}: {
  locale: Locale;
  cities: CityOption[];
  prefill: ProjectPrefill | null;
}) {
  const t = contact[locale];
  const h = t.hero;
  const [street, city] = company.hq[locale].split(/[,،]\s*/);

  return (
    <section className={s.booking} data-tone="ink" data-nav-media aria-labelledby="contact-title">
      <div className={s.backdrop}>
        <Figure ref_={BACKDROP} locale={locale} sizes="100vw" priority className={s.backdropImg} />
      </div>
      <div aria-hidden className={s.scrim} />

      <div className="u-shell">
        <div className={s.grid}>
          <div className={s.aside}>
            <div className={s.asideInner}>
              <nav aria-label={locale === "ar" ? "مسار التصفح" : "Fil d'Ariane"} className={`u-eyebrow u-enter ${s.crumbs}`}>
                <Link href={`/${locale}`}>{shared[locale].home}</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{h.crumb}</span>
              </nav>
              <h1 id="contact-title" className={`u-display ${s.heroTitle}`} data-reveal="mask">
                <span className="reveal-inner">{h.title}</span>
              </h1>
              <p className={`u-enter ${s.heroLead}`}>{h.lead}</p>

              <ul className={`u-enter ${s.modeList}`} aria-label={h.modesLabel}>
                {MEETING_MODES.map((m) => (
                  <li key={m} className={s.modeItem}>
                    <span className={s.modeIcon} aria-hidden>
                      <ModeIcon mode={m} size={18} />
                    </span>
                    {h.modes[m]}
                  </li>
                ))}
              </ul>

              <div className={`u-enter ${s.direct}`}>
                <div>
                  <p className={`u-eyebrow ${s.directLabel}`}>{h.phoneLabel}</p>
                  <a href={company.phoneHref} className={s.phone}>
                    <span className={s.phoneIcon} aria-hidden>
                      <ModeIcon mode="telephone" size={20} />
                    </span>
                    <span className={`u-numeric ${s.phoneNumber}`} dir="ltr">
                      {company.phone}
                    </span>
                  </a>
                  <p className={s.directSmall}>
                    {h.phoneAbroad} ·{" "}
                    <a href={company.phoneHref} className={`u-numeric ${s.plainLink}`} dir="ltr">
                      {internationalPhone(company.phoneHref)}
                    </a>
                  </p>
                </div>
                <div>
                  <p className={`u-eyebrow ${s.directLabel}`}>{h.hqLabel}</p>
                  <p className={s.hqText}>
                    {street}
                    <br />
                    {city}
                  </p>
                  <p className={s.directSmall}>
                    {company.name[locale]} · {company.group[locale]}
                  </p>
                </div>
              </div>

              <p className={`u-enter ${s.photoCaption}`}>{h.photoCaption}</p>
            </div>
          </div>

          <div id="rendez-vous" className={`u-enter ${s.card}`}>
            <AppointmentForm
              locale={locale}
              t={t.form}
              cities={cities}
              prefill={prefill}
              privacyHref={`/${locale}/donnees-personnelles`}
              projectsHref={`/${locale}/projets`}
              phone={company.phone}
              phoneHref={company.phoneHref}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
