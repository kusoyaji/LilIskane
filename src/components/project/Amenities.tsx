import type { Amenity } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { AMENITY_LABELS, projectCopy } from "@/content/projects";
import { AmenityIcon } from "./AmenityIcon";
import s from "./Amenities.module.css";

/**
 * Amenities as a ruled grid — each one a cell of the lattice, an icon and a
 * word. Read in a glance, which is how people actually use this list: looking
 * for the one thing they will not live without (a pool, a school, parking).
 */
export function Amenities({ locale, amenities }: { locale: Locale; amenities: Amenity[] }) {
  if (amenities.length === 0) return null;
  const c = projectCopy[locale];
  const cols = columnsFor(amenities.length);

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="amenities-title">
      <div className={s.layout}>
        <header className={s.head}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {c.amenitiesEyebrow}
          </p>
          <h2 id="amenities-title" className={`u-display ${s.title}`} data-reveal="mask">
            <span className="reveal-inner">{c.amenitiesTitle}</span>
          </h2>
        </header>

        <ul className={s.grid} data-cols={cols}>
          {amenities.map((amenity) => (
            <li key={amenity} className={`u-enter ${s.cell}`}>
              <span className={s.icon}>
                <AmenityIcon amenity={amenity} size={40} />
              </span>
              <span className={`u-display-tight ${s.label}`}>{AMENITY_LABELS[amenity][locale]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Desktop column count that leaves no lonely last row. */
function columnsFor(n: number): number {
  if (n <= 2) return n;
  if (n === 4) return 2;
  if (n % 3 === 0) return 3;
  if (n % 4 === 0) return 4;
  if (n % 5 === 0) return 5;
  return n < 6 ? 3 : 4;
}
