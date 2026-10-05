import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Lattice, Arrow } from "@/components/v2";
import { cityById } from "@/data/cities";
import { projects } from "@/data/projects";
import type { Project, Segment } from "@/data/types";
import { getDictionary } from "@/i18n";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { formatPrice, statusLabel } from "@/lib/format";
import { shared } from "@/content/shared";
import { fill, segmentLabels, showcaseCopy } from "@/content/home-portfolio";
import { ShowcaseRail, type FilterChip } from "./showcase/ShowcaseRail";
import s from "./showcase/Showcase.module.css";

/**
 * Assets below this width are shown framed, never full-bleed: the brief caps
 * them at 480 CSS px (th_dyar_al_bahia is 1304 px, th_odyssee_studios 1536).
 * Stretching them across a 540 px card on a 2x screen is what makes a portfolio
 * look like a scraped listing.
 */
const SMALL_ASSETS = new Set(["th_dyar_al_bahia", "th_odyssee_studios"]);

/** Order of the filter chips; only segments that actually have programmes appear. */
const SEGMENT_ORDER: Segment[] = ["haut-standing", "moyen-standing", "economique", "terrain", "commercial", "bureaux"];

const isLand = (p: Project) => p.segment === "terrain" || p.price.unit === "per-sqm";

/**
 * Catalogue order, with the land programmes spread evenly through it instead
 * of arriving as a block of four dark cards at the end — the rail reads as a
 * rhythm of photographs punctuated by type, not as two lists.
 */
function railOrder(list: Project[]): Project[] {
  const built = list.filter((p) => !isLand(p));
  const land = list.filter(isLand);
  if (land.length === 0 || built.length === 0) return list;
  const out: Project[] = [];
  let j = 0;
  built.forEach((p, i) => {
    out.push(p);
    while (j < land.length && i + 1 >= Math.round(((j + 1) * built.length) / land.length)) {
      out.push(land[j]!);
      j += 1;
    }
  });
  return [...out, ...land.slice(j)];
}

function yearLine(project: Project, locale: Locale): string | null {
  const t = showcaseCopy[locale];
  if (project.deliveredYear) return `${t.deliveredIn} ${isolateRun(String(project.deliveredYear), locale)}`;
  if (project.deliveryYear) return `${t.deliveryIn} ${isolateRun(String(project.deliveryYear), locale)}`;
  return null;
}

/**
 * The portfolio, as large cards on a horizontal pan.
 *
 * Everything is decided here on the server — which card treatment each
 * programme gets, its price string, its status — and the cards are rendered as
 * server markup. The client rail receives them as children and only owns two
 * things: the segment filter (a data attribute the stylesheet reads, so no card
 * is re-rendered to filter) and the pinned pan.
 *
 * Three treatments, chosen by what the programme can honestly show:
 * - **photo**: a large asset, full-bleed under a floor scrim;
 * - **framed**: a small asset, inset on a limestone panel at its true size;
 * - **land**: no picture at all — land has none worth showing (the client's
 *   only images are clip-art signposts), so the card is typographic: the
 *   moucharabieh lattice on ink and the price per m² set large.
 */
export function Showcase({ locale }: { locale: Locale }) {
  const t = showcaseCopy[locale];
  const dict = getDictionary(locale);
  const segLabels = segmentLabels[locale];

  const cityIds = new Set(projects.map((p) => p.cityId));
  const lead = fill(t.lead, {
    n: formatNumber(projects.length, locale),
    cities: formatNumber(cityIds.size, locale),
  });

  const counts = new Map<Segment, number>();
  projects.forEach((p) => counts.set(p.segment, (counts.get(p.segment) ?? 0) + 1));
  const chips: FilterChip[] = [
    { id: "all", label: t.all, count: formatNumber(projects.length, locale) },
    ...SEGMENT_ORDER.filter((seg) => counts.has(seg)).map((seg) => ({
      id: seg,
      label: segLabels[seg],
      count: formatNumber(counts.get(seg) ?? 0, locale),
    })),
  ];

  return (
    <ShowcaseRail
      locale={locale}
      chips={chips}
      filterLabel={t.filterLabel}
      scrollHint={t.scrollHint}
      head={
        <div className={s.headText}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {t.eyebrow}
          </p>
          <h2 id="showcase-title" className={`u-display ${s.title}`} data-reveal="mask">
            <span className="reveal-inner">{t.title}</span>
          </h2>
          <p className={`u-enter ${s.lead}`}>{lead}</p>
        </div>
      }
    >
      {railOrder(projects).map((project, index) => {
        const city = cityById.get(project.cityId);
        const cityName = city ? city.name[locale] : project.cityId;
        const href = `/${locale}/projets/${project.slug}`;
        const status = statusLabel(project, locale);
        const delivered = project.status === "livre";
        const year = yearLine(project, locale);
        const meta = `${cityName} · ${segLabels[project.segment]}`;

        if (isLand(project)) {
          return (
            <li key={project.slug} className={`${s.item} ${s.itemLand}`} data-segment={project.segment}>
              <Link href={href} className={`${s.card} ${s.land}`}>
                <Lattice cell={34} />
                <div className={s.cardTop}>
                  <span className={s.counter} aria-hidden />
                  <span className={s.badge} data-delivered={delivered || undefined}>
                    {status}
                  </span>
                </div>
                <div className={s.landBody}>
                  <p className={`u-eyebrow ${s.landKicker}`}>{t.landKicker}</p>
                  <p className={s.landPrice}>
                    <span className={s.landFrom}>{shared[locale].from}</span>
                    <span className={s.landFigure} dir="ltr">
                      {formatNumber(project.price.amount, locale)}
                    </span>
                    <span className={s.landUnit}>
                      {dict.common.currency}/{dict.common.sqm}
                    </span>
                  </p>
                  {project.price.minimumLotSqm && (
                    <p className={s.landLots}>
                      {fill(t.lotsFrom, { n: formatNumber(project.price.minimumLotSqm, locale) })}
                    </p>
                  )}
                </div>
                <div className={s.cardFoot}>
                  <div className={s.footText}>
                    <p className={`u-eyebrow ${s.meta}`}>{meta}</p>
                    <h3 className={s.name}>{project.name[locale]}</h3>
                    {year && <p className={s.year}>{year}</p>}
                  </div>
                  <span className={s.go} aria-hidden>
                    <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          );
        }

        const framed = SMALL_ASSETS.has(project.hero.key);
        const isRender = project.hero.nature === "render";
        const lead = index === 0;

        if (framed) {
          return (
            <li key={project.slug} className={`${s.item} ${s.itemFramed}`} data-segment={project.segment}>
              <Link href={href} className={`${s.card} ${s.framed}`}>
                <div className={s.cardTop}>
                  <span className={s.counter} aria-hidden />
                  <span className={s.badge} data-delivered={delivered || undefined}>
                    {status}
                  </span>
                </div>
                <div className={s.frameImg}>
                  <Figure
                    ref_={project.hero}
                    locale={locale}
                    sizes="(min-width: 64rem) 480px, 78vw"
                    className={s.img}
                  />
                  {isRender && <span className={s.renderNote}>{t.renderNote}</span>}
                </div>
                <div className={s.cardFoot}>
                  <div className={s.footText}>
                    <p className={`u-eyebrow ${s.meta}`}>{meta}</p>
                    <h3 className={s.name}>{project.name[locale]}</h3>
                    <p className={s.price}>
                      <span className={s.priceFrom}>{shared[locale].from}</span>{" "}
                      <span className="u-numeric">{formatPrice(project.price, locale)}</span>
                    </p>
                  </div>
                  <span className={s.go} aria-hidden>
                    <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          );
        }

        return (
          <li
            key={project.slug}
            className={`${s.item} ${lead ? s.itemLead : ""}`}
            data-segment={project.segment}
          >
            <Link href={href} className={`${s.card} ${s.photo}`}>
              <div className={s.photoMedia}>
                <Figure
                  ref_={project.hero}
                  locale={locale}
                  sizes={lead ? "(min-width: 64rem) 58vw, 84vw" : "(min-width: 64rem) 38vw, 84vw"}
                  className={s.img}
                />
              </div>
              <div aria-hidden className={s.photoScrim} />
              <div className={s.cardTop}>
                <span className={s.counter} aria-hidden />
                <span className={s.badge} data-delivered={delivered || undefined}>
                  {status}
                </span>
                {isRender && <span className={`${s.renderNote} ${s.renderNoteTop}`}>{t.renderNote}</span>}
              </div>
              <div className={s.cardFoot}>
                <div className={s.footText}>
                  <p className={`u-eyebrow ${s.meta}`}>{meta}</p>
                  <h3 className={`${s.name} ${lead ? s.nameLead : ""}`}>{project.name[locale]}</h3>
                  <p className={s.price}>
                    <span className={s.priceFrom}>{shared[locale].from}</span>{" "}
                    <span className="u-numeric">{formatPrice(project.price, locale)}</span>
                    {year && <span className={s.priceYear}> · {year}</span>}
                  </p>
                </div>
                <span className={s.go} aria-hidden>
                  <Arrow />
                </span>
              </div>
            </Link>
          </li>
        );
      })}

      <li className={`${s.item} ${s.itemEnd}`} data-segment="end">
        <Link href={`/${locale}/projets`} className={`${s.card} ${s.end}`}>
          <p className={`u-eyebrow ${s.endKicker}`}>{t.eyebrow}</p>
          <p className={s.endFigure} dir="ltr">
            {formatNumber(projects.length, locale)}
          </p>
          <div className={s.endText}>
            <h3 className={s.endTitle}>{t.allTitle}</h3>
            <p className={s.endBody}>{t.allBody}</p>
          </div>
          <span className={`${s.go} ${s.goEnd}`} aria-hidden>
            <Arrow />
          </span>
        </Link>
      </li>
    </ShowcaseRail>
  );
}
