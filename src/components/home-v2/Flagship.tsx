import { coreRef, Figure } from "@/components/media/Figure";
import { getCity } from "@/data/cities";
import { getProject } from "@/data/projects";
import type { Amenity, MediaRef } from "@/data/types";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { formatPrice, formatRange, formatSurfaceRange, statusLabel } from "@/lib/format";
import { flagshipCopy } from "@/content/home-opening";
import { shared } from "@/content/shared";
import { LinkButton } from "@/components/v2";
import { Strip } from "./flagship/Strip";
import s from "./flagship/Flagship.module.css";

/** Distance between the two phases, as the project data states it. */
const PHASE_DISTANCE_M = 200;

/** Amenities worth naming on the home page, in the order a buyer asks. */
const SHOWN_AMENITIES: Amenity[] = [
  "piscine",
  "espaces-verts",
  "spa",
  "mosquee",
  "commerces",
  "parking-sous-sol",
  "ascenseur",
  "securite",
];

type Room = { key: keyof (typeof flagshipCopy)["fr"]["rooms"]; media: MediaRef; shape: "wide" | "tall" };

/**
 * Riad Garden II, as a magazine feature.
 *
 * The film walked the visitor in; this lays the programme out on the table:
 * its name at the scale of a masthead, two renders layered at different
 * depths, the figures a buyer asks for first (all from the project record —
 * price through `formatPrice`, surfaces through `formatSurfaceRange`), the
 * rooms drifting past, and the one fact that makes buying off-plan safe: the
 * first phase is already built and lived in, two hundred metres away.
 *
 * Every render carries its non-contractual note; the one photograph is
 * labelled as the delivered building it is.
 */
export function Flagship({ locale }: { locale: Locale }) {
  const project = getProject("riad-garden-ii");
  if (!project) return null;
  const previous = project.previousPhaseSlug ? getProject(project.previousPhaseSlug) : undefined;

  const t = flagshipCopy[locale];
  const city = getCity(project.cityId).name[locale];
  const byKey = (key: string) => coreRef(project.gallery.find((m) => m.key === key));

  const pool = byKey("rg2_TypeB_3");
  const shops = byKey("rg2_Ext_Cam_A1_Commerce_1");

  const roomPlan: Array<{ key: Room["key"]; media: MediaRef | undefined; shape: Room["shape"] }> = [
    { key: "sejour", media: byKey("rg2_Sejour_v2"), shape: "wide" },
    { key: "cuisine", media: byKey("rg2_Cuisine_v2"), shape: "tall" },
    { key: "parentale", media: byKey("rg2_Chambre_Parentale_"), shape: "wide" },
    { key: "sdb", media: byKey("rg2_SDB_V2"), shape: "tall" },
    { key: "enfants", media: byKey("rg2_Chambre_Enfants"), shape: "wide" },
  ];
  const rooms: Room[] = roomPlan.flatMap((r) => (r.media ? [{ ...r, media: r.media }] : []));

  const ready = previous?.readyNow === true;
  const delivered: MediaRef | undefined = previous?.hero;

  const specs = [
    { label: t.specFrom, value: formatPrice(project.price, locale), wide: true },
    { label: t.specSurface, value: formatSurfaceRange(project, locale) },
    { label: t.specBedrooms, value: formatRange(project.bedroomsMin, project.bedroomsMax, locale) },
    project.floors ? { label: t.specHeight, value: isolateRun(project.floors, locale) } : null,
    project.deliveryYear
      ? { label: t.specDelivery, value: isolateRun(String(project.deliveryYear), locale) }
      : null,
  ].filter((x): x is { label: string; value: string; wide?: boolean } => Boolean(x));

  const amenities = SHOWN_AMENITIES.filter((a) => project.amenities.includes(a))
    .map((a) => t.amenities[a])
    .filter((x): x is string => Boolean(x));

  return (
    <section className={s.flagship} aria-labelledby="flagship-title">
      <div className={s.body}>
        {/* ---- masthead ------------------------------------------------------- */}
        <header className={`u-shell ${s.head}`}>
          <div className={`u-enter ${s.kicker}`}>
            <p className={`u-eyebrow ${s.eyebrow}`}>{t.eyebrow}</p>
            <span className={s.status}>
              <span aria-hidden className={s.statusDot} />
              {statusLabel(project, locale)}
            </span>
          </div>
          <h2 id="flagship-title" className={`u-display ${s.name}`} data-reveal="mask">
            <span className="reveal-inner">{project.name[locale]}</span>
          </h2>
          <div className={s.headRow}>
            <p className={`u-enter ${s.place}`}>
              <span className={s.placeCity}>{city}</span>
              <span className={s.placeHood}>{project.neighbourhood[locale]}</span>
            </p>
            <p className={`u-enter ${s.deck}`}>{t.deck}</p>
          </div>
        </header>

        {/* ---- two renders, two depths ---------------------------------------- */}
        <div className={`u-shell ${s.layers}`}>
          {pool && (
            <figure className={`u-enter ${s.main}`} data-reveal="media">
              <Figure
                ref_={pool}
                locale={locale}
                sizes="(max-width: 768px) 100vw, 72vw"
                className={s.img}
              />
              <figcaption className={s.note}>{t.renderNote}</figcaption>
            </figure>
          )}
          {shops && (
            <div className={s.insetDepth} data-parallax="1.1">
              <figure className={`u-enter ${s.inset}`} data-reveal="media">
                <Figure
                  ref_={shops}
                  locale={locale}
                  sizes="(max-width: 768px) 70vw, 36vw"
                  className={s.img}
                />
                <figcaption className={s.note}>
                  {t.rooms.commerces} · {t.renderNote}
                </figcaption>
              </figure>
            </div>
          )}
        </div>

        {/* ---- the figures ------------------------------------------------------ */}
        <div className={`u-shell ${s.specsWrap}`}>
          <dl className={s.specs}>
            {specs.map((spec) => (
              <div key={spec.label} className={`u-enter ${s.spec} ${spec.wide ? s.specWide : ""}`}>
                <dt className={s.specLabel}>{spec.label}</dt>
                <dd className={`u-numeric ${s.specValue}`}>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <div className={`u-enter ${s.amenities}`}>
            <p className={`u-eyebrow ${s.eyebrow}`}>{t.amenitiesLabel}</p>
            <ul className={s.amenityList}>
              {amenities.map((a) => (
                <li key={a} className={s.amenity}>
                  <span aria-hidden className={s.amenityMark} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- the rooms, drifting past ---------------------------------------- */}
        <div className={s.rooms}>
          <div className={`u-shell ${s.roomsHead}`}>
            <h3 className={`u-display ${s.roomsTitle}`} data-reveal="mask">
              <span className="reveal-inner">{t.stripTitle}</span>
            </h3>
            <p className={`u-enter ${s.roomsLead}`}>{t.stripLead}</p>
          </div>
          <Strip label={t.stripTitle}>
            {rooms.map((room) => (
              <li key={room.key} className={`${s.card} ${room.shape === "tall" ? s.cardTall : s.cardWide}`}>
                <figure className={s.cardFigure}>
                  <div className={s.cardFrame}>
                    <Figure
                      ref_={room.media}
                      locale={locale}
                      sizes={room.shape === "tall" ? "(max-width: 768px) 50vw, 24vw" : "(max-width: 768px) 80vw, 40vw"}
                      className={s.img}
                    />
                  </div>
                  <figcaption className={s.cardCaption}>
                    <span className={s.cardName}>{t.rooms[room.key]}</span>
                    <span className={s.cardNote}>{t.renderNote}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </Strip>
        </div>

        {/* ---- the phase already built ------------------------------------------ */}
        <div className={`u-shell ${s.phase}`}>
          {delivered && (
            <figure className={`u-enter ${s.phaseFigure}`} data-reveal="media">
              <Figure ref_={delivered} locale={locale} sizes="(max-width: 768px) 100vw, 50vw" className={s.img} />
              {ready && (
                <figcaption className={`${s.note} ${s.notePhoto}`}>
                  {t.photoNote}
                </figcaption>
              )}
            </figure>
          )}
          <div className={s.phaseText}>
            {ready && (
              <p className={`u-eyebrow u-enter ${s.delivered}`}>
                <span aria-hidden className={s.deliveredDot} />
                {t.phase1Eyebrow}
              </p>
            )}
            <h3 className={`u-display ${s.phaseTitle}`} data-reveal="mask">
              <span className="reveal-inner">{t.phase1Title(formatNumber(PHASE_DISTANCE_M, locale))}</span>
            </h3>
            <p className={`u-enter ${s.phaseBody}`}>{t.phase1Body}</p>
            <div className={`u-enter ${s.actions}`}>
              <LinkButton href={`/${locale}/projets/riad-garden-ii`} variant="primary">
                {t.ctaProject}
              </LinkButton>
              <LinkButton href={`/${locale}/contact`} variant="outline">
                {shared[locale].bookVisit}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
