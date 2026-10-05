import { Figure } from "@/components/media/Figure";
import { Stat } from "@/components/v2";
import { about } from "@/content/about";
import { company } from "@/data/company";
import type { Locale } from "@/i18n/config";
import s from "./about.module.css";

/**
 * Qui sommes-nous: the statement, the client's own two paragraphs, the four
 * trades as an index, the four figures that are the company's record — and
 * then the whole job in one image: a study model (conceive) pinned like a
 * print over the façade as it was handed over (deliver), full-bleed.
 *
 * The full-bleed band is also the hinge into the dark chronology: the page
 * ground changes colour behind a photograph, never behind a line of text.
 *
 * The model photograph is a 515px source, so its frame is held at or under
 * 30rem and cropped 16:9 to drop the letterbox bars baked into the file.
 */
export function Who({ locale }: { locale: Locale }) {
  const t = about[locale].who;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <section className={s.who}>
        <div className={`u-shell ${s.whoGrid}`}>
          <header className={s.whoHead}>
            <p
              className="u-eyebrow u-enter"
              style={{ color: "var(--color-ochre-deep)" }}
            >
              {t.eyebrow}
            </p>
            <h2 className={`u-display ${s.whoTitle}`} data-reveal="mask">
              <span className="reveal-inner">{t.title}</span>
            </h2>
          </header>

          <div className={s.whoText}>
            <p className={`u-enter ${s.whoLead}`}>{t.p1}</p>
            <p className={`u-enter ${s.whoBody}`}>{t.p2}</p>
          </div>

          <div className={s.trades}>
            <p className={`u-eyebrow u-enter ${s.tradesLabel}`}>
              {t.tradesLabel}
            </p>
            <ol className={s.tradeList}>
              {t.trades.map((trade, i) => (
                <li key={trade.title} className={`u-enter ${s.trade}`}>
                  <span className={`u-numeric ${s.tradeIndex}`} dir="ltr">
                    {pad(i + 1)}
                  </span>
                  <span className={s.tradeTitle}>{trade.title}</span>
                  <span className={s.tradeNote}>{trade.note}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={s.stats}>
            <div className={s.statCell}>
              <Stat
                value={company.founded}
                plain
                label={t.stats.founded}
                locale={locale}
              />
            </div>
            <div className={s.statCell}>
              <Stat
                value={company.experienceYears}
                prefix="+"
                label={t.stats.years}
                locale={locale}
              />
            </div>
            <div className={s.statCell}>
              <Stat
                value={company.citiesCount}
                label={t.stats.cities}
                locale={locale}
              />
            </div>
            <div className={s.statCell}>
              <Stat
                value={company.essaouira.units}
                label={t.stats.units}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={s.band} data-nav-media>
        <div className={s.bandMedia} data-parallax="0.25">
          <Figure
            ref_={{
              key: "rg1_DSC08632",
              nature: "photograph",
              alt: {
                fr: "Façade livrée de Riad Garden I à Marrakech : enduit ocre rose, claustras en béton ajouré, arbres plantés sous un ciel bleu.",
                ar: "الواجهة المُسلَّمة لرياض غاردن 1 بمراكش: طلاء وردي مغرة، مشربيات خرسانية مفرّغة، وأشجار مغروسة تحت سماء زرقاء.",
              },
            }}
            locale={locale}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div aria-hidden className={s.bandScrim} />

        <div className={`u-shell ${s.bandInner}`}>
          <figure className={s.modelCard} data-reveal="media">
            <div className={s.modelFrame}>
              <Figure
                ref_={{
                  key: "maquette_model",
                  nature: "photograph",
                  alt: {
                    fr: "Maquette d'étude d'un programme Chaabi Lil Iskane : îlots de bâtiments ocre rose autour de jardins et d'allées plantées.",
                    ar: "مجسّم دراسة لأحد مشاريع الشعبي للإسكان: مجموعات من المباني الوردية حول حدائق وممرات مشجّرة.",
                  },
                }}
                locale={locale}
                ratio="16 / 9"
                sizes="(min-width: 64em) 26rem, 88vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className={s.modelCaption}>
              <span className={`u-display ${s.modelWord}`}>{t.conception}</span>
              <span className={s.modelNote}>{t.conceptionNote}</span>
            </figcaption>
          </figure>

          <div className={s.bandText}>
            <p className={`u-display ${s.bandWord}`} data-reveal="mask">
              <span className="reveal-inner">{t.delivery}</span>
            </p>
            <p className={`u-eyebrow u-enter ${s.bandNote}`}>
              {t.deliveryNote}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
