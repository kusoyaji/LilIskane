import { cityById } from "@/data/cities";
import { MOROCCO_PATH, MOROCCO_VIEWBOX, projectMorocco } from "@/data/morocco-geo";
import type { Locale } from "@/i18n/config";
import s from "./contact.module.css";

/**
 * Morocco as one silhouette — the unified outline from `morocco-geo.ts`, never
 * an internal line — with a single pin on the Casablanca head office.
 *
 * The frame is `dir="ltr"` on purpose: it is a map, not a layout. West stays
 * west in Arabic, so the pin and its label are placed physically.
 */
export function MoroccoMap({ locale, label, sublabel }: { locale: Locale; label?: string; sublabel: string }) {
  const casa = cityById.get("casablanca")!;
  const { x, y } = projectMorocco(casa.lat, casa.lng);
  const left = (x / MOROCCO_VIEWBOX.width) * 100;
  const top = (y / MOROCCO_VIEWBOX.height) * 100;

  return (
    <div className={s.map} dir="ltr">
      <svg
        viewBox={`0 0 ${MOROCCO_VIEWBOX.width} ${MOROCCO_VIEWBOX.height}`}
        className={s.mapSvg}
        role="img"
        aria-label={`${label ?? casa.name[locale]} — ${sublabel}`}
      >
        <path d={MOROCCO_PATH} className={s.mapShape} />
      </svg>
      <span className={s.pin} style={{ left: `${left}%`, top: `${top}%` }} aria-hidden>
        <span className={s.pinPulse} />
        <span className={s.pinDot} />
      </span>
      <span className={s.pinLabel} style={{ right: `${100 - left}%`, top: `${top}%` }} dir={locale === "ar" ? "rtl" : "ltr"} aria-hidden>
        <span className={s.pinCity}>{label ?? casa.name[locale]}</span>
        <span className={s.pinSub}>{sublabel}</span>
      </span>
    </div>
  );
}
