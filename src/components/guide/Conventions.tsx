import { LinkButton, SectionHeading } from "@/components/v2";
import type { MediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import { GuideMedia } from "./GuideMedia";
import s from "./Guide.module.css";

/** Ground-floor shops of Riad Garden II — partnerships also cover professional programmes. */
const COMMERCE: MediaRef = {
  key: "rg2_Ext_Cam_A1_Commerce_1",
  nature: "render",
  alt: {
    fr: "Les commerces en rez-de-chaussée de Riad Garden II le long de l'allée plantée, vitrines abritées sous les balcons des étages.",
    ar: "المحلات التجارية بالطابق الأرضي لرياض غاردن 2 على طول الممر المغروس، واجهات زجاجية تحميها شرفات الطوابق العليا.",
  },
};

/**
 * Conventions et partenariats — the client's page in three answers (for whom,
 * what, on what). No partner is named because the client's page names none.
 */
export function Conventions({ locale }: { locale: Locale }) {
  const t = guide[locale].conventions;
  return (
    <section className={s.conventions} aria-labelledby="conventions-titre">
      <GuideMedia
        media={COMMERCE}
        locale={locale}
        ratio="auto"
        sizes="(min-width: 64rem) 50vw, 100vw"
        className={s.conventionsMedia}
        frameClassName={s.conventionsFrame}
      />
      <div className={s.conventionsText}>
        <div id="conventions-titre">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
        </div>
        <p className={`u-enter ${s.conventionsBody}`}>{t.body}</p>
        <dl className={s.points}>
          {t.points.map((point) => (
            <div key={point.label} className={`u-enter ${s.point}`}>
              <dt className="u-eyebrow">{point.label}</dt>
              <dd>{point.text}</dd>
            </div>
          ))}
        </dl>
        <div className="u-enter" style={{ marginBlockStart: "2.5rem" }}>
          <LinkButton href={`/${locale}/contact`}>{t.cta}</LinkButton>
        </div>
      </div>
    </section>
  );
}
