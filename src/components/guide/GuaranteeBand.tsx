import { Lattice, SectionHeading } from "@/components/v2";
import { guarantees } from "@/data/company";
import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import s from "./Guide.module.css";

/**
 * The three legal guarantees (from `company.guarantees`) as the last word of
 * step 8 — durations set as large as the step numerals, so "10 ans" reads
 * from across the room.
 */
export function GuaranteeBand({ locale }: { locale: Locale }) {
  const t = guide[locale].guarantees;
  return (
    <section id="garanties" className={s.guarantees} aria-labelledby="garanties-titre">
      <Lattice />
      <div className="u-shell">
        <div className={s.guaranteesHead}>
          <div id="garanties-titre">
            <SectionHeading eyebrow={t.eyebrow} title={t.title} eyebrowColor="var(--color-ochre-bright)" />
          </div>
          <p className={`u-enter ${s.guaranteesLead}`}>{t.lead}</p>
        </div>
        <ol className={s.guaranteeList}>
          {guarantees.map((g) => (
            <li key={g.years} className={`u-enter ${s.guarantee}`}>
              <p className={s.guaranteeFigure}>
                <span dir="ltr">{g.years}</span>
                <span className={s.guaranteeUnit}>{t.unit(g.years)}</span>
              </p>
              <h3 className={s.guaranteeTitle}>{g.title[locale]}</h3>
              <p className={s.guaranteeBody}>{g.body[locale]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
