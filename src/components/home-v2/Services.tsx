import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Arrow, SectionHeading } from "@/components/v2";
import { Lattice } from "@/components/v2/Lattice";
import { servicesCopy, type ServiceEntry } from "@/content/home-conversion";
import { guarantees } from "@/data/company";
import type { MediaRef } from "@/data/types";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import s from "./services/Services.module.css";

/** Delivered Riad Garden I photography — what was built, not a render. */
const MEDIA = {
  guide: {
    key: "rg1_DSC08601",
    nature: "photograph",
    alt: {
      fr: "Chambre d'un appartement livré de Riad Garden I, vue depuis le seuil de la salle d'eau.",
      ar: "غرفة نوم في شقة مُسلَّمة برياض غاردن 1، من عتبة الحمّام.",
    },
  },
  tours: {
    key: "rg1_DSC08548",
    nature: "photograph",
    alt: {
      fr: "Séjour d'un appartement livré de Riad Garden I : canapé, table à manger et baie vitrée.",
      ar: "صالون شقة مُسلَّمة برياض غاردن 1: أريكة ومائدة طعام ونافذة زجاجية.",
    },
  },
  visit: {
    key: "rg1_DSC08579",
    nature: "photograph",
    alt: {
      fr: "Chambre à deux lits d'un appartement livré de Riad Garden I, têtes de lit ocre.",
      ar: "غرفة بسريرين في شقة مُسلَّمة برياض غاردن 1، بألواح رأس بلون مغرة.",
    },
  },
} satisfies Record<string, MediaRef>;

type Entry = {
  id: string;
  href: string;
  copy: ServiceEntry;
  media?: MediaRef;
};

/**
 * Services — how Chaabi accompanies a buyer, as four destinations that exist,
 * then the three legal guarantees that follow delivery.
 *
 * Three entries are delivered Riad Garden I photographs; the simulator is a
 * typographic ink panel, because a stock "calculator" picture would be the
 * one image on the page that says nothing.
 */
export function Services({ locale }: { locale: Locale }) {
  const t = servicesCopy[locale];

  const entries: Entry[] = [
    { id: "guide", href: `/${locale}/guide-achat`, copy: t.guide, media: MEDIA.guide },
    { id: "simulator", href: `/${locale}/guide-achat#simulateur`, copy: t.simulator },
    { id: "tours", href: `/${locale}/projets/riad-garden-ii`, copy: t.tours, media: MEDIA.tours },
    { id: "visit", href: `/${locale}/contact`, copy: t.visit, media: MEDIA.visit },
  ];

  return (
    <section className={s.section} aria-labelledby="services-title">
      <div className="u-shell">
        <div className={s.head}>
          <div id="services-title">
            <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          </div>
          <p className={`u-enter ${s.lead}`}>{t.lead}</p>
        </div>

        <ol className={s.grid}>
          {entries.map((entry, index) => (
            <li key={entry.id} className={s.item}>
              <Link href={entry.href} className={s.card}>
                {entry.media ? (
                  <span className={s.frame} data-reveal="media">
                    <Figure
                      ref_={entry.media}
                      locale={locale}
                      sizes={index === 0 || index === 3 ? "(min-width: 48rem) 56vw, 100vw" : "(min-width: 48rem) 40vw, 100vw"}
                      className={s.img}
                    />
                    {entry.copy.caption && <span className={s.caption}>{entry.copy.caption}</span>}
                  </span>
                ) : (
                  <span className={`${s.frame} ${s.tile}`} data-reveal="media">
                    <Lattice cell={30} />
                    <span className={s.tileWords} aria-hidden>
                      {t.simulator.words.map((w, i) => (
                        <span key={w} className={s.tileWord} data-accent={i === 0 || undefined}>
                          {w}
                        </span>
                      ))}
                    </span>
                    <span className={s.tileRail} aria-hidden>
                      <span className={s.tileRailFill} />
                      <span className={s.tileRailThumb} />
                    </span>
                  </span>
                )}

                <span className={`${s.text} u-enter`}>
                  <span className={`${s.index} u-numeric`}>{isolateRun(String(index + 1).padStart(2, "0"), locale)}</span>
                  <span className={s.body}>
                    <span className={s.title}>{entry.copy.title}</span>
                    <span className={s.desc}>{entry.copy.body}</span>
                    <span className={s.action}>
                      <span>{entry.copy.action}</span>
                      <Arrow />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className={s.guarantees}>
          <div className={`${s.gHead} u-enter`}>
            <p className="u-eyebrow" style={{ color: "var(--color-ochre-deep)" }}>
              {t.guaranteesEyebrow}
            </p>
            <h3 className={`u-display ${s.gTitle}`}>{t.guaranteesTitle}</h3>
            <p className={s.gLead}>{t.guaranteesLead}</p>
          </div>
          <ul className={s.gList}>
            {guarantees.map((g) => (
              <li key={g.years} className={`${s.gItem} u-enter`}>
                <p className={s.gFigure}>
                  <span className={`${s.gNumber} u-numeric`} dir="ltr">
                    {formatNumber(g.years, locale)}
                  </span>
                  <span className={s.gUnit}>{t.unit(g.years)}</span>
                </p>
                <div>
                  <p className={s.gName}>{g.title[locale]}</p>
                  <p className={s.gBody}>{g.body[locale]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
