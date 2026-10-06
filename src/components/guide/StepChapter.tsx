import { LinkButton } from "@/components/v2";
import type { MediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import { GuideMedia } from "./GuideMedia";
import { StepIndex, type IndexStep } from "./StepIndex";
import s from "./Guide.module.css";

/** Pictures for the three steps that are about places rather than paperwork. */
const STEP_MEDIA: Record<number, { media: MediaRef; caption: "garden" | "pool" | "bedroom" }> = {
  2: {
    caption: "garden",
    media: {
      key: "rg2_Ext_Cam_c1_jardin_1",
      nature: "render",
      alt: {
        fr: "Façade en pierre claire de Riad Garden II vue depuis l'allée piétonne, balcons protégés par des claustras, palmiers et massifs plantés au premier plan.",
        ar: "واجهة رياض غاردن 2 بالحجر الفاتح من الممر الراجل، شرفات تحجبها مشربيات، ونخيل ومساحات مغروسة في المقدمة.",
      },
    },
  },
  6: {
    caption: "pool",
    media: {
      key: "rg1_DSC00924",
      nature: "photograph",
      alt: {
        fr: "Photographie de la piscine livrée de Riad Garden I, eau turquoise, façades ocre rose et palmiers arrivés à maturité.",
        ar: "صورة للمسبح المُسلَّم برياض غاردن 1، ماء فيروزي، واجهات وردية مغرة، ونخيل بلغ اكتماله.",
      },
    },
  },
  8: {
    caption: "bedroom",
    media: {
      key: "rg1_DSC08588",
      nature: "photograph",
      alt: {
        fr: "Photographie de la chambre livrée de Riad Garden I : lit en velours terracotta, parquet chevron et rideaux en lin.",
        ar: "صورة لغرفة النوم المُسلَّمة برياض غاردن 1: سرير من المخمل الطيني، أرضية خشبية بنقشة السنبلة وستائر كتانية.",
      },
    },
  },
};

/**
 * One chapter of the eight-step spine: a sticky reader-tracking index beside
 * a run of substantial step blocks. The page renders two chapters (steps 1–3,
 * then 4–8) around the full-width simulator, which is where financing belongs
 * in the reading order and which would be cramped inside a column.
 *
 * Each step is its own `<section>` so the site-wide choreography batches its
 * entrances per step, as the reader reaches it, rather than per chapter.
 */
export function StepChapter({
  locale,
  from,
  to,
  simulateAbove = false,
}: {
  locale: Locale;
  from: number;
  to: number;
  simulateAbove?: boolean;
}) {
  const t = guide[locale];
  const indexSteps: IndexStep[] = t.steps.map((step, i) => ({ n: i + 1, short: step.short, phase: step.phase }));
  const total = t.steps.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  // Only links that leave the reading path. Step 3 and step 8 used to carry
  // buttons to the simulator and the guarantees — the very next section in
  // each case, and step 3's sat beside the index's own "Simuler mon crédit".
  const links: Record<number, { href: string; label: string }> = {
    2: { href: `/${locale}/projets`, label: t.stepLinks.projects },
  };

  return (
    <div className={`u-shell ${s.chapter}`}>
      <aside className={s.aside}>
        <StepIndex
          steps={indexSteps}
          phases={t.phases}
          label={t.index.label}
          stepWord={t.stepWord}
          simulateLabel={t.index.simulate}
          simulateAbove={simulateAbove}
        />
      </aside>

      <div className={s.steps}>
        {t.steps.slice(from - 1, to).map((step, i) => {
          const n = from + i;
          const pic = STEP_MEDIA[n];
          const link = links[n];
          return (
            <section
              key={n}
              id={`etape-${n}`}
              data-guide-step={n}
              className={s.step}
              aria-labelledby={`etape-${n}-titre`}
            >
              <div className={s.stepHead}>
                <span className={s.stepNum} dir="ltr" aria-hidden>
                  {pad(n)}
                </span>
                <p className={`u-eyebrow ${s.stepMeta}`}>
                  <span>{t.phases[step.phase]}</span>
                  <span aria-hidden className={s.stepDot} />
                  <span>
                    {t.stepWord} {n} {t.index.of} {total}
                  </span>
                </p>
              </div>

              <h2 id={`etape-${n}-titre`} className={`u-display ${s.stepTitle}`} data-reveal="mask">
                <span className="reveal-inner">{step.title}</span>
              </h2>

              <div className={s.stepGrid}>
                <div className={s.stepText}>
                  <p className={`u-enter ${s.stepLead}`}>{step.lead}</p>
                  <p className={`u-enter u-body ${s.stepBody}`}>{step.body}</p>
                  {link && (
                    <div className="u-enter" style={{ marginBlockStart: "2rem" }}>
                      <LinkButton href={link.href} variant="outline">
                        {link.label}
                      </LinkButton>
                    </div>
                  )}
                </div>

                <div className={`u-enter ${s.check}`}>
                  <p className={`u-eyebrow ${s.checkTitle}`}>{step.listTitle}</p>
                  <ul className={s.checkList}>
                    {step.list.map((item) => (
                      <li key={item}>
                        <svg className={s.checkMark} width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {pic && (
                <GuideMedia
                  media={pic.media}
                  locale={locale}
                  caption={t.captions[pic.caption]}
                  sizes="(min-width: 64rem) 62vw, 100vw"
                  className={s.stepMedia}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
