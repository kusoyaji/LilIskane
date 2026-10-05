import type { Locale } from "@/i18n/config";
import { searchCopy } from "@/content/projects";
import { MapPins, type Pin } from "./MapPins";
import { MoroccoSilhouette, projectMorocco } from "./MoroccoSilhouette";
import s from "./search.module.css";

/** Right edge of the label column, in viewBox units — open Atlantic at these latitudes. */
const LABEL_X = 392;
/**
 * Pins drawn slightly off their true position so two dots never sit on top of
 * each other. Had Soualem and Sidi Rahal Chatai are ~8 units apart at this
 * scale with radii of ~12, so Had Soualem moves a little inland — the same
 * nudge the home map loupe makes. Labels and filtering are unaffected.
 */
const NUDGE: Record<string, { dx: number; dy: number }> = {
  "had-soualem": { dx: 16, dy: 10 },
};

/** Minimum vertical distance between two labels. */
const LABEL_GAP = 58;

/**
 * Spreads labels vertically so none overlap, keeping each as close to its pin
 * as it can: a few hundred passes of pushing neighbours apart symmetrically.
 * Cheap, deterministic, and done on the server.
 */
function spread(ys: number[]): number[] {
  const out = [...ys];
  for (let pass = 0; pass < 300; pass += 1) {
    let moved = false;
    for (let i = 1; i < out.length; i += 1) {
      const deficit = LABEL_GAP - (out[i] - out[i - 1]);
      if (deficit > 0.01) {
        out[i - 1] -= deficit / 2;
        out[i] += deficit / 2;
        moved = true;
      }
    }
    const shift = Math.max(0, 28 - out[0]);
    if (shift) for (let i = 0; i < out.length; i += 1) out[i] += shift;
    if (!moved) break;
  }
  return out;
}

export type MapCity = { id: string; name: string; lat: number; lng: number; count: number; total: number };

/**
 * The search map: Morocco whole (server-rendered outline) with a client layer
 * of city pins tied to the city filter.
 */
export function SearchMap({ locale, cities }: { locale: Locale; cities: MapCity[] }) {
  const c = searchCopy[locale];
  const placed = cities
    .map((city) => {
      const at = projectMorocco(city.lat, city.lng);
      const nudge = NUDGE[city.id];
      return { city, x: at.x + (nudge?.dx ?? 0), y: at.y + (nudge?.dy ?? 0) };
    })
    .sort((a, b) => a.y - b.y);
  const labelYs = spread(placed.map((p) => p.y + 11));

  const pins: Pin[] = placed.map((p, i) => ({
    id: p.city.id,
    name: p.city.name,
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    lx: LABEL_X,
    ly: Math.round(labelYs[i] * 10) / 10,
    count: p.city.count,
    total: p.city.total,
  }));

  return (
    <MoroccoSilhouette idBase="search-map" label={c.mapLabel} className={s.map}>
      <MapPins locale={locale} pins={pins} />
    </MoroccoSilhouette>
  );
}
