import { contact } from "@/content/contact";
import { company } from "@/data/company";
import type { Locale } from "@/i18n/config";
import { LinkButton } from "@/components/v2";
import s from "./contact.module.css";

/**
 * The Loi 09-08 notice from the client's own contact page, rewritten to be
 * read rather than skipped — same obligations, same postal address, same
 * phone number, in two languages.
 */
export function DataNotice({ locale }: { locale: Locale }) {
  const t = contact[locale].data;

  return (
    <section className={s.data} data-tone="paper" aria-labelledby="data-title">
      <div className="u-shell">
        <div className={`${s.dataGrid} ${s.dataPanel}`}>
          <div className={s.dataHead}>
            <p className={`u-eyebrow u-enter ${s.eyebrowPaper}`}>{t.eyebrow}</p>
            <h2 id="data-title" className={`u-display ${s.dataTitle}`} data-reveal="mask">
              <span className="reveal-inner">{t.title}</span>
            </h2>
            <p className={`u-enter ${s.dataLead}`}>{t.lead}</p>
          </div>

          <div className={s.dataBody}>
            <p className="u-body u-enter">{t.collected}</p>
            <p className="u-body u-enter">{t.rights}</p>

            <div className={`u-enter ${s.exercise}`}>
              <p className={`u-eyebrow ${s.exerciseLabel}`}>{t.exercise}</p>
              <div className={s.exerciseGrid}>
                <div className={s.exerciseCard}>
                  <p className={s.exerciseKind}>{t.byMail}</p>
                  <p className={s.exerciseValue}>
                    {company.name[locale]}
                    <br />
                    {company.dataContact[locale]}
                  </p>
                </div>
                <div className={s.exerciseCard}>
                  <p className={s.exerciseKind}>{t.byPhone}</p>
                  <a href={company.phoneHref} className={`u-numeric ${s.exercisePhone}`} dir="ltr">
                    {company.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="u-enter">
              <LinkButton href={`/${locale}/donnees-personnelles`} variant="outline">
                {t.link}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
