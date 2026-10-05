import { SectionHeading } from "@/components/v2";
import { about } from "@/content/about";
import type { Locale } from "@/i18n/config";
import s from "./about.module.css";

/**
 * Certifications & distinctions. Three marks, each set as large as a headline,
 * because these are the three things a buyer cannot check for themselves and a
 * third party already has: ISO 9001 (AFNOR, since 2005, 9001:2015 in 2017), the
 * Arab League housing prize (Cairo, 2003), and HQE for Résidence Beethoven
 * (Témara, 2025). The years and counts in the copy come from `company.ts`.
 */
export function Seals({ locale }: { locale: Locale }) {
  const t = about[locale].seals;

  return (
    <section className={s.seals}>
      <div className="u-shell">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
        />

        <ol className={s.sealGrid}>
          {t.items.map((item, i) => (
            <li key={item.title} className={`u-enter ${s.seal}`} data-step={i + 1}>
              <p className={`u-eyebrow ${s.sealMeta}`}>{item.meta}</p>
              <p className={`u-display ${s.sealMark}`}>{item.mark}</p>
              <h3 className={s.sealTitle}>{item.title}</h3>
              <p className={s.sealBody}>{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
