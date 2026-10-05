import Link from "next/link";
import { MoroccoSilhouette, projectMorocco } from "@/components/search/MoroccoSilhouette";
import { Arrow } from "@/components/v2";
import { getCity } from "@/data/cities";
import type { Project } from "@/data/types";
import { formatNumber, type Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import s from "./ProjectLocation.module.css";

/**
 * Where it is, in the two ways people ask: "where in Morocco?" (the country,
 * whole, with this programme pinned and the other Chaabi cities faint behind
 * it) and "how far from my life?" (minutes, by car or on foot, set large).
 */
export function ProjectLocation({
  locale,
  project,
  otherCities,
  sameCity = [],
}: {
  locale: Locale;
  project: Project;
  /** Coordinates of the other cities Chaabi builds in, drawn faint for context. */
  otherCities: { id: string; lat: number; lng: number }[];
  /** Other programmes in the same city, linked from the text column. */
  sameCity?: { slug: string; name: string; status: string }[];
}) {
  const c = projectCopy[locale];
  const city = getCity(project.cityId);
  const pin = projectMorocco(project.lat, project.lng);
  const nearby = [...project.nearby].sort((a, b) => a.minutes - b.minutes);

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="location-title">
      <div className={s.grid}>
        <div className={s.text}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {c.locationEyebrow}
          </p>
          <h2 id="location-title" className={`u-display ${s.title}`} data-reveal="mask">
            {/* One string, so the word splitter cannot break the line before the comma. */}
            <span className="reveal-inner">{`${project.neighbourhood[locale]}${locale === "ar" ? "، " : ", "}${city.name[locale]}.`}</span>
          </h2>

          {nearby.length > 0 ? (
            <div className={s.nearby}>
              <p className="u-eyebrow u-enter" style={{ color: "var(--color-ink-mute)" }}>
                {c.nearbyTitle}
              </p>
              <ul className={s.list}>
                {nearby.map((place) => (
                  <li key={place.label.fr} className={`u-enter ${s.item}`}>
                    <span className={`u-numeric ${s.minutes}`}>
                      {c.minutes(place.minutes, formatNumber(place.minutes, locale))}
                    </span>
                    <span className={s.placeName}>{place.label[locale]}</span>
                    <span className={s.mode}>{place.mode === "walk" ? c.onFoot : c.byCar}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={`u-enter ${s.none}`}>{c.noNearby}</p>
          )}

          {sameCity.length > 0 && (
            <div className={`u-enter ${s.same}`}>
              <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                {c.alsoIn(city.name[locale])}
              </p>
              <ul className={s.sameList}>
                {sameCity.map((other) => (
                  <li key={other.slug}>
                    <Link href={`/${locale}/projets/${other.slug}`} className={s.sameLink}>
                      <span className={`u-display-tight ${s.sameName}`}>{other.name}</span>
                      <span className={s.sameStatus}>{other.status}</span>
                      <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <figure className={`u-enter ${s.mapPanel}`}>
          <MoroccoSilhouette idBase={`loc-${project.slug}`} label={c.mapCaption(city.name[locale])} className={s.map}>
            {otherCities.map((other) => {
              const p = projectMorocco(other.lat, other.lng);
              return <circle key={other.id} cx={p.x} cy={p.y} r={4.5} fill="var(--color-paper)" opacity={0.35} />;
            })}
            <circle cx={pin.x} cy={pin.y} r={26} className={s.pulse} />
            <circle cx={pin.x} cy={pin.y} r={9} fill="var(--color-ochre-bright)" stroke="var(--color-ink)" strokeWidth={3} />
            <line
              x1={pin.x - 14}
              y1={pin.y}
              x2={pin.x - 70}
              y2={pin.y}
              stroke="var(--color-ochre-bright)"
              strokeWidth={1.5}
            />
            <text
              x={pin.x - 80}
              y={pin.y + 9}
              textAnchor="end"
              className={s.pinLabel}
            >
              {city.name[locale]}
            </text>
          </MoroccoSilhouette>
          <figcaption className={s.caption}>{c.mapCaption(city.name[locale])}</figcaption>
        </figure>
      </div>
    </section>
  );
}
