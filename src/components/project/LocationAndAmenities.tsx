import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";
import type { Amenity, NearbyPlace } from "@/data/types";

const AMENITY_LABELS: Record<Amenity, { fr: string; ar: string }> = {
  piscine: { fr: "Piscine", ar: "مسبح" },
  mosquee: { fr: "Mosquée", ar: "مسجد" },
  ecoles: { fr: "Écoles", ar: "مدارس" },
  "parking-sous-sol": { fr: "Parking en sous-sol", ar: "مرآب تحت أرضي" },
  "espaces-verts": { fr: "Espaces verts", ar: "مساحات خضراء" },
  commerces: { fr: "Commerces de proximité", ar: "محلات تجارية قريبة" },
  "centre-commercial": { fr: "Centre commercial", ar: "مركز تجاري" },
  "aires-de-jeux": { fr: "Aires de jeux", ar: "فضاءات لعب" },
  "terrains-de-sport": { fr: "Terrains de sport", ar: "ملاعب رياضية" },
  spa: { fr: "Spa", ar: "منتجع صحي" },
  ascenseur: { fr: "Ascenseurs", ar: "مصاعد" },
  securite: { fr: "Gardiennage", ar: "حراسة" },
  "vue-mer": { fr: "Vue sur mer", ar: "إطلالة على البحر" },
  "vue-montagne": { fr: "Vue sur l'Atlas", ar: "إطلالة على الأطلس" },
  plage: { fr: "Accès plage", ar: "ولوج إلى الشاطئ" },
};

type Props = {
  locale: Locale;
  nearby: NearbyPlace[];
  amenities: Amenity[];
  title: string;
  body: string;
};

/**
 * "Is it near my life?" — one of the three questions the whole site exists to
 * answer, and the one an address alone never answers.
 *
 * Distances are given in minutes and by mode, because "Route d'Amezmiz" means
 * nothing to someone who does not already know Marrakech, while "10 minutes
 * from Avenue Mohammed VI, 3 minutes' walk to a mosque" means something to
 * everyone.
 */
export function LocationAndAmenities({ locale, nearby, amenities, title, body }: Props) {
  const t = getDictionary(locale);

  return (
    <section
      aria-labelledby="location-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4rem, 9vw, 7rem)" }}
    >
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
        <div>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {t.project.locationEyebrow}
          </p>
          <h2
            id="location-title"
            className="u-display u-enter mt-5"
            data-reveal="mask"
            data-step="1"
            style={{ fontSize: "var(--text-display)" }}
          >
            <span className="reveal-inner">{title}</span>
          </h2>
          <p className="u-body u-enter mt-6" data-step="2" style={{ color: "var(--color-ink-soft)" }}>
            {body}
          </p>

          {nearby.length > 0 && (
            <ul className="mt-10" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {nearby.map((place) => (
                <li
                  key={place.label[locale]}
                  className="flex items-baseline justify-between gap-6 py-3.5"
                  style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)" }}
                >
                  <span>{place.label[locale]}</span>
                  <span className="u-numeric shrink-0" style={{ color: "var(--color-ink-mute)" }}>
                    {formatNumber(place.minutes, locale)} min{" "}
                    {place.mode === "walk" ? t.project.locationWalk : t.project.locationDrive}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
            {t.project.amenitiesEyebrow}
          </p>
          <h3 className="u-display-tight mt-4" style={{ fontSize: "var(--text-title)" }}>
            {t.project.amenitiesTitle}
          </h3>

          <ul
            className="mt-8 grid gap-x-8 gap-y-3.5 sm:grid-cols-2"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {amenities.map((amenity) => (
              <li key={amenity} className="flex items-baseline gap-3">
                {/* The lattice module as a bullet: a small square, the same
                    proportion as the claustras on the facade. */}
                <span
                  aria-hidden
                  className="block shrink-0"
                  style={{
                    inlineSize: "var(--lattice-unit)",
                    blockSize: "var(--lattice-unit)",
                    background: "var(--color-ochre)",
                    transform: "translateY(-0.1em)",
                  }}
                />
                <span>{AMENITY_LABELS[amenity][locale]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { AMENITY_LABELS };
