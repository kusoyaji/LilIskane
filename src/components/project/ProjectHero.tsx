import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { LinkButton, Lattice } from "@/components/v2";
import { company } from "@/data/company";
import { getCity } from "@/data/cities";
import type { Project } from "@/data/types";
import { getDictionary } from "@/i18n";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { shared } from "@/content/shared";
import { projectCopy, statusText } from "@/content/projects";
import { effectiveTotal, formatMonthly, formatPrice, formatRange } from "@/lib/format";
import { LandPlan } from "./LandPlan";
import { heroMode, statusTone, year } from "./view";
import s from "./ProjectHero.module.css";

/**
 * Arrival. Name, place, price and the way to book — all before any scrolling.
 *
 * Three grounds, chosen from the data rather than per programme:
 * a full-bleed image when the master is large enough to carry it; an ink
 * panel with the image framed at a size it can hold when it is not; and, for
 * land, a drawn plan in place of a photograph nobody should see. The key-facts
 * bar is the same in all three and only lists the fields the programme has.
 */
export function ProjectHero({ locale, project }: { locale: Locale; project: Project }) {
  const t = getDictionary(locale);
  const c = projectCopy[locale];
  const city = getCity(project.cityId);
  const mode = heroMode(project.hero.key, project.segment);
  const land = mode === "land";
  const sqm = t.common.sqm;

  const surfaces = `${formatRange(project.surfaceMin, project.surfaceMax, locale)} ${sqm}`;
  const facts: { label: string; value: string }[] = [
    { label: land ? c.factPlots : c.factSurfaces, value: surfaces },
    ...(project.bedroomsMax > 0
      ? [{ label: c.factBedrooms, value: formatRange(project.bedroomsMin, project.bedroomsMax, locale) }]
      : []),
    ...(project.floors ? [{ label: c.factFloors, value: isolateRun(project.floors, locale) }] : []),
    ...(project.readyNow
      ? [{ label: c.factDelivery, value: c.immediate }]
      : project.deliveryYear
        ? [{ label: c.factDelivery, value: year(project.deliveryYear) }]
        : []),
  ];

  const priceSub = land
    ? c.smallestLot(`${formatNumber(effectiveTotal(project.price), locale)} ${t.common.currency}`)
    : `${c.monthlyApprox} ${formatMonthly(project.price, locale)}`;

  const name = project.name[locale];
  const longName = name.length > (mode === "full" ? 18 : 12);

  const head = (
    <>
      <nav aria-label={c.crumbProjects} className={`u-eyebrow ${s.crumbs}`}>
        <Link href={`/${locale}`}>{shared[locale].home}</Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/projets`}>{c.crumbProjects}</Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/projets?ville=${project.cityId}`}>{city.name[locale]}</Link>
      </nav>

      <p className={s.status}>
        <span className={s.statusDot} style={{ background: statusTone(project.status, true) }} aria-hidden />
        <span className="u-eyebrow">{statusText(project, locale)}</span>
      </p>

      <h1 className={`u-display ${s.name} ${longName ? s.nameLong : ""}`} data-reveal="mask">
        <span className="reveal-inner">{name}</span>
      </h1>
      <p className={`u-enter ${s.place}`}>
        {city.name[locale]} <span aria-hidden className={s.placeSep}>—</span> {project.neighbourhood[locale]}
      </p>
    </>
  );

  const actions = (
    <div className={`u-enter ${s.actions}`}>
      <LinkButton href={`/${locale}/contact?projet=${project.slug}`} variant="light">
        {c.bookVisit}
      </LinkButton>
      <LinkButton href={company.phoneHref} variant="outline" arrow={false}>
        {isolateRun(company.phone, locale)}
      </LinkButton>
    </div>
  );

  const factsBar = (
    <div className={`u-enter ${s.bar}`}>
      <div className={s.price}>
        <p className={`u-eyebrow ${s.factLabel}`}>{land ? c.perSqm : c.fromPrice}</p>
        <p className={`u-numeric ${s.priceValue}`}>{formatPrice(project.price, locale)}</p>
        <p className={`u-numeric ${s.priceSub}`}>{priceSub}</p>
      </div>

      <dl className={s.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={s.fact}>
            <dt className={`u-eyebrow ${s.factLabel}`}>{fact.label}</dt>
            <dd className={`u-numeric ${s.factValue}`}>{fact.value}</dd>
          </div>
        ))}
      </dl>

    </div>
  );

  if (mode === "full") {
    return (
      <section className={`${s.hero} ${s.full}`} data-nav-media>
        <div className={s.backdrop} data-parallax="0.25">
          {/* Portrait screens crop a landscape picture to cover a tall box: ask for
              a file as wide as the cropped picture really is (box height x 16/9),
              or a phone gets a 420 px file stretched four times. */}
          <Figure
            ref_={project.hero}
            locale={locale}
            sizes="(max-aspect-ratio: 1/1) 178vh, 100vw"
            priority
            className={s.backdropImg}
          />
        </div>
        <div aria-hidden className={s.scrim} />
        {project.hero.nature === "render" && (
          <p className={s.renderNote}>{c.renderNote}</p>
        )}
        <div className={`u-shell ${s.fullInner}`}>
          <div className={s.head}>
            {head}
            {actions}
          </div>
          {factsBar}
        </div>
      </section>
    );
  }

  return (
    <section className={`${s.hero} ${s.panel}`} data-nav-media>
      {/* The drawn plan is already a lattice; a second one behind it is noise. */}
      {!land && <Lattice />}
      <div className={`u-shell ${s.panelInner}`}>
        <div className={s.head}>
          {head}
          {actions}
        </div>

        <div className={s.visual}>
          {land ? (
            <div className={s.plan}>
              <LandPlan
                minLabel={`${formatNumber(project.surfaceMin, locale)} ${sqm}`}
                maxLabel={`${formatNumber(project.surfaceMax, locale)} ${sqm}`}
              />
              <p className={`u-eyebrow ${s.planCaption}`}>
                {c.plotRange(`${formatRange(project.surfaceMin, project.surfaceMax, locale)} ${sqm}`)}
              </p>
            </div>
          ) : (
            <figure className={s.frame}>
              <div className={s.frameMedia}>
                <Figure
                  ref_={project.hero}
                  locale={locale}
                  sizes="(min-width: 64rem) 30rem, 92vw"
                  priority
                  className={s.frameImg}
                />
              </div>
              {project.hero.nature === "render" && (
                <figcaption className={s.frameNote}>{c.renderNote}</figcaption>
              )}
            </figure>
          )}
        </div>

        <div className={s.panelBar}>{factsBar}</div>
      </div>
    </section>
  );
}
