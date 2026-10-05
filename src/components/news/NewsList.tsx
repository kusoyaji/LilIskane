import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Arrow, Lattice, SectionHeading } from "@/components/v2";
import { getCity } from "@/data/cities";
import type { Project } from "@/data/types";
import { news, type CompanyNews } from "@/content/news";
import { shared } from "@/content/shared";
import { formatPrice } from "@/lib/format";
import { getDictionary } from "@/i18n";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { NewsFilter } from "./NewsFilter";
import s from "./news.module.css";

/**
 * Editorial order for the grid. Launches and company news are interleaved so
 * the grid reads as a page of news rather than a catalogue with a few notes
 * at the end; Océane sits right above its sibling Océane R+1, and the land
 * programmes close the grid as a group of three.
 *
 * Rows on the three-column grid (W = wide card, spans two columns):
 *   Odyssée W · HQE  /  Amaïa · aide · Dyar Al Bahia 2  /  ISO · Izdihar W
 *   Océane W · Odyssée Studios  /  Océane R+1 · Al Youssoufia R+2 · R+3
 * Twelve cards + three wide = 15 slots, so every row is full; with the
 * "Lancements" filter (company cards hidden) it is 9 + 3 = 12, still full.
 * On the two-column grid Izdihar drops back to a single card, so the default
 * view is 2 full-width + 10 singles: again no lone card at the end.
 * Change ORDER and WIDE together, or the grid ends on a lone card again.
 *
 * Anything "en lancement" that is not named here is appended, so a programme
 * added to `projects.ts` still appears without touching this file.
 */
const ORDER: string[] = [
  "odyssee",
  "company:hqe",
  "amaia",
  "company:aide",
  "dyar-al-bahia-2",
  "company:iso",
  "izdihar",
  "oceane",
  "odyssee-studios",
  "oceane-r1",
  "al-youssoufia-r2",
  "al-youssoufia-r3",
];
/**
 * Cards that span two columns — 2560px renders that earn the width. "desk":
 * wide only on the three-column grid (see the row plan above).
 */
const WIDE: Record<string, Wide> = { odyssee: "all", oceane: "all", izdihar: "desk" };
type Wide = "all" | "desk" | undefined;

/**
 * `th_lots` is a clip-art signpost, not a photograph of the land, so land
 * programmes get a typographic panel instead of their listed image.
 */
const hasUsableImage = (p: Project) =>
  p.segment !== "terrain" && p.hero.key !== "th_lots" && p.hero.key !== "th_maamora";

export function NewsList({ locale, launches }: { locale: Locale; launches: Project[] }) {
  const t = news[locale];

  const bySlug = new Map(launches.map((p) => [p.slug, p]));
  const companyById = new Map(t.companyNews.map((c) => [`company:${c.id}`, c]));
  const keys = [
    ...ORDER.filter((k) => bySlug.has(k) || companyById.has(k)),
    ...launches.map((p) => p.slug).filter((k) => !ORDER.includes(k)),
  ];

  const counts = {
    all: launches.length + t.companyNews.length,
    launch: launches.length,
    company: t.companyNews.length,
  };

  return (
    <section className={s.list} aria-labelledby="news-list-title">
      <div className="u-shell">
        <div className={s.listShell}>
          <NewsFilter
            heading={
              <div id="news-list-title">
                <SectionHeading eyebrow={t.listEyebrow} title={t.listTitle} />
              </div>
            }
            label={t.filterLabel}
            options={[
              { id: "all", label: t.filterAll, count: counts.all },
              { id: "launch", label: t.filterLaunches, count: counts.launch },
              { id: "company", label: t.filterCompany, count: counts.company },
            ]}
            announcements={{
              all: t.resultCount(counts.all),
              launch: t.resultCount(counts.launch),
              company: t.resultCount(counts.company),
            }}
          >
            {keys.map((key) => {
              const company = companyById.get(key);
              if (company) return <CompanyCard key={key} locale={locale} item={company} />;
              const project = bySlug.get(key)!;
              return <LaunchCard key={key} locale={locale} project={project} wide={WIDE[key]} />;
            })}
          </NewsFilter>
        </div>
      </div>
    </section>
  );
}

function LaunchCard({ locale, project, wide }: { locale: Locale; project: Project; wide: Wide }) {
  const t = news[locale];
  const d = getDictionary(locale);
  const city = getCity(project.cityId).name[locale];
  const image = hasUsableImage(project);
  const href = `/${locale}/projets/${project.slug}`;
  // "R+2" etc. — the buildable height is part of each land programme's name.
  const height = project.name.fr.match(/R\+\d/)?.[0];

  return (
    <article
      className={[s.card, wide === "all" ? s.wide : wide === "desk" ? s.wideDesk : ""].join(" ")}
      data-cat="launch"
      data-reveal="media"
    >
      {image ? (
        <div className={s.cardMedia}>
          <div className={s.zoom}>
            <Figure
              ref_={project.hero}
              locale={locale}
              sizes={
                wide === "all"
                  ? "(min-width: 72rem) 60vw, (min-width: 48rem) 92vw, 100vw"
                  : wide === "desk"
                    ? "(min-width: 72rem) 60vw, (min-width: 48rem) 46vw, 100vw"
                    : "(min-width: 72rem) 30vw, (min-width: 48rem) 46vw, 100vw"
              }
              className="h-full w-full object-cover"
            />
          </div>
          {project.hero.nature === "render" && <span className={s.note}>{t.renderNote}</span>}
        </div>
      ) : (
        <div className={`${s.cardMedia} ${s.panel} ${s.panelInk}`} aria-hidden>
          <Lattice />
          <p className={`u-eyebrow ${s.panelTop}`}>
            <span>{t.landPanel}</span>
            <span>{city}</span>
          </p>
          {height && <p className={s.panelMark}>{isolateRun(height, locale)}</p>}
          <p className={s.panelCaption}>
            <span>{t.buildable}</span>
            <strong>
              {t.lotRange(
                formatNumber(project.surfaceMin, locale),
                `${formatNumber(project.surfaceMax, locale)} ${d.common.sqm}`,
              )}
            </strong>
          </p>
        </div>
      )}

      <div className={s.cardBody}>
        <p className={`u-eyebrow ${s.cardMeta}`}>
          <span>{t.launch}</span>
          <span aria-hidden>·</span>
          <span>{city}</span>
        </p>
        <h3 className={`u-display-tight ${s.cardTitle}`}>
          <Link href={href}>{project.name[locale]}</Link>
        </h3>
        <p className={s.cardPlace}>
          {project.neighbourhood[locale]}
          {project.deliveryYear ? ` — ${t.deliveryShort(project.deliveryYear)}` : ""}
        </p>
        <p className={s.cardText}>{project.summary[locale]}</p>
        <div className={s.cardFoot}>
          <span className={s.price}>
            <span className={`u-eyebrow ${s.priceLabel}`}>{shared[locale].from}</span>
            <span className={s.priceValue}>{formatPrice(project.price, locale)}</span>
          </span>
          <span aria-hidden className={s.arrowDisc}>
            <Arrow />
          </span>
        </div>
      </div>
    </article>
  );
}

function CompanyCard({ locale, item }: { locale: Locale; item: CompanyNews }) {
  const t = news[locale];
  const long = item.mark.length > 5;
  return (
    <article className={s.card} data-cat="company" data-reveal="media">
      <div className={`${s.cardMedia} ${s.panel} ${s.panelSand}`} aria-hidden>
        <p className={`u-eyebrow ${s.panelTop}`}>
          <span>{t.companyLabel}</span>
          <span>{item.year}</span>
        </p>
        <p className={[s.panelMark, long ? s.panelMarkLong : ""].join(" ")}>{isolateRun(item.mark, locale)}</p>
        <p className={s.panelCaption}>
          <span>{item.markCaption}</span>
        </p>
      </div>

      <div className={s.cardBody}>
        <p className={`u-eyebrow ${s.cardMeta} ${s.cardMetaCompany}`}>
          <span>{t.companyLabel}</span>
          <span aria-hidden>·</span>
          <span>{item.year}</span>
        </p>
        <h3 className={`u-display-tight ${s.cardTitle}`}>
          <Link href={`/${locale}/a-propos`}>{item.title}</Link>
        </h3>
        <p className={s.cardText} style={{ WebkitLineClamp: 5 }}>
          {item.body}
        </p>
        <div className={s.cardFoot}>
          <span className={s.footLink}>{t.companyCta}</span>
          <span aria-hidden className={s.arrowDisc}>
            <Arrow />
          </span>
        </div>
      </div>
    </article>
  );
}
