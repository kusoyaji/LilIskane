import { contact } from "@/content/contact";
import { company } from "@/data/company";
import { cityById } from "@/data/cities";
import type { Locale } from "@/i18n/config";
import { Lattice, LinkButton } from "@/components/v2";
import { MoroccoMap } from "./MoroccoMap";
import s from "./contact.module.css";

/** 33.5731 → 33°34′ N — the head office as a surveyor would write it. */
function dms(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′ ${value >= 0 ? pos : neg}`;
}

/**
 * "Venir nous voir": where the head office is, said as plainly as a letterhead.
 * The map is a single silhouette with one pin — orientation, not decoration.
 */
export function VisitUs({ locale }: { locale: Locale }) {
  const t = contact[locale].visit;
  const casa = cityById.get("casablanca")!;
  const [street, city] = company.hq[locale].split(/[,،]\s*/);

  return (
    <section className={s.visit} data-tone="paper" aria-labelledby="visit-title">
      <div className="u-shell">
        <div className={s.visitGrid}>
          <div className={`u-enter ${s.mapPanel}`}>
            <Lattice cell={18} />
            <div className={s.visitMap}>
              <MoroccoMap locale={locale} label={casa.name[locale]} sublabel={t.hq} />
            </div>
            <p className={`u-numeric ${s.coords}`} dir="ltr">
              {dms(casa.lat, locale === "ar" ? "ش" : "N", locale === "ar" ? "ج" : "S")}
              <span aria-hidden> · </span>
              {dms(casa.lng, locale === "ar" ? "ق" : "E", locale === "ar" ? "غ" : "O")}
            </p>
          </div>

          <div className={s.visitText}>
            <p className={`u-eyebrow u-enter ${s.eyebrowPaper}`}>{t.eyebrow}</p>
            <h2 id="visit-title" className={`u-display ${s.visitTitle}`} data-reveal="mask">
              <span className="reveal-inner">{t.title}</span>
            </h2>
            <p className={`u-enter ${s.visitBody}`}>{t.body}</p>

            <dl className={`u-enter ${s.facts}`}>
              <div className={s.fact}>
                <dt>{t.address}</dt>
                <dd>
                  <span className={s.factBig}>{street}</span>
                  <span className={s.factSub}>{city}</span>
                </dd>
              </div>
              <div className={s.fact}>
                <dt>{t.phone}</dt>
                <dd>
                  <a href={company.phoneHref} className={`u-numeric ${s.factBig} ${s.factLink}`} dir="ltr">
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div className={s.fact}>
                <dt>{t.group}</dt>
                <dd>
                  <span className={s.factMid}>{company.name[locale]}</span>
                  <span className={s.factSub}>{company.group[locale]}</span>
                </dd>
              </div>
            </dl>

            <div className={`u-enter ${s.visitActions}`}>
              <LinkButton href="#rendez-vous">{t.book}</LinkButton>
              <LinkButton href={company.phoneHref} variant="outline" arrow={false}>
                {t.call}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
