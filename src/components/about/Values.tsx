import { Figure } from "@/components/media/Figure";
import { SectionHeading } from "@/components/v2";
import { about } from "@/content/about";
import { values } from "@/data/company";
import type { Locale } from "@/i18n/config";
import s from "./about.module.css";

/**
 * Nos valeurs — the client's four, each given a full row of the page and a
 * title at near-display size, beside a photograph of a delivered interior that
 * holds its place while the four pass. A value written small is a value nobody
 * reads; the room beside it is the evidence that it was kept.
 */
export function Values({ locale }: { locale: Locale }) {
  const t = about[locale].values;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className={s.values}>
      <div className="u-shell">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <div className={s.valuesGrid}>
          <figure className={s.valuesFigure}>
            <div className={s.valuesFrame} data-reveal="media">
              <Figure
                ref_={{
                  key: "rg1_DSC08601",
                  nature: "photograph",
                  alt: {
                    fr: "Chambre d'un appartement livré de Riad Garden I, porte ouverte sur la salle d'eau, parquet en chevrons et lumière naturelle.",
                    ar: "غرفة نوم في شقة مُسلَّمة برياض غاردن 1، باب مفتوح على الحمّام، أرضية خشبية وضوء طبيعي.",
                  },
                }}
                locale={locale}
                sizes="(min-width: 64em) 40vw, 92vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className={`u-eyebrow ${s.figNote}`}>{t.caption}</figcaption>
          </figure>

          <ol className={s.valueList}>
            {values.map((value, i) => (
              <li key={value.title.fr} className={s.value}>
                <span className={`u-numeric u-enter ${s.valueIndex}`} dir="ltr">
                  {pad(i + 1)}
                </span>
                <h3 className={`u-display ${s.valueTitle}`} data-reveal="mask">
                  <span className="reveal-inner">{value.title[locale]}</span>
                </h3>
                <p className={`u-enter ${s.valueBody}`}>{value.body[locale]}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
