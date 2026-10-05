import { SectionHeading } from "@/components/v2";
import { getProject } from "@/data/projects";
import type { MediaRef } from "@/data/types";
import { isolateRun, type Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import { GuideMedia } from "./GuideMedia";
import s from "./Guide.module.css";

const FACADE: MediaRef = {
  key: "rg1_DSC08632",
  nature: "photograph",
  alt: {
    fr: "Photographie de la façade livrée de Riad Garden I : enduit ocre rose, claustras en béton ajouré, arbres plantés déjà développés.",
    ar: "صورة للواجهة المُسلَّمة برياض غاردن 1: طلاء وردي مغرة، مشربيات خرسانية مفرّغة، وأشجار مغروسة اكتمل نموها.",
  },
};

/**
 * The client's own framing — transparency, legal security, accompaniment —
 * set against a delivered building, with each pillar pointing to the steps
 * that carry it out. The promise and its proof, side by side.
 */
export function Pillars({ locale }: { locale: Locale }) {
  const t = guide[locale];
  const pad = (n: number) => String(n).padStart(2, "0");
  // Captioned as delivered only because the portfolio data says so.
  const delivered = getProject("riad-garden-i")?.readyNow === true;

  return (
    <section className={`u-shell ${s.pillars}`} aria-labelledby="piliers-titre">
      <GuideMedia
        media={FACADE}
        locale={locale}
        ratio="4 / 5"
        sizes="(min-width: 64rem) 42vw, 100vw"
        caption={delivered ? t.pillars.caption : undefined}
        className={s.pillarsMedia}
      />
      <div className={s.pillarsText}>
        <div id="piliers-titre">
          <SectionHeading eyebrow={t.pillars.eyebrow} title={t.pillars.title} />
        </div>
        <ol className={s.pillarList}>
          {t.pillars.items.map((item, i) => (
            <li key={item.title} className={`u-enter ${s.pillar}`}>
              <span className={s.pillarNum} aria-hidden>
                {(locale === "ar" ? ["01", "02", "03"] : ["I", "II", "III"])[i]}
              </span>
              <div>
                <h3 className={s.pillarTitle}>{item.title}</h3>
                <p className={s.pillarBody}>{item.body}</p>
                <p className={s.pillarSteps}>
                  <span className="u-eyebrow">{t.pillars.stepsLabel}</span>
                  {item.steps.map((n) => (
                    <a key={n} href={`#etape-${n}`} className={s.pillarChip} dir="ltr">
                      {pad(n)}
                    </a>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
