import { cities, cityById } from "@/data/cities";
import { company } from "@/data/company";
import { MOROCCO_PATH, MOROCCO_VIEWBOX, projectMorocco } from "@/data/morocco-geo";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { formatNumber, type Locale } from "@/i18n/config";
import { formatPrice, statusLabel } from "@/lib/format";
import { shared } from "@/content/shared";
import { fill, mapCopy, programmeCount, segmentLabels } from "@/content/home-portfolio";
import { MapExplorer, type MapCity, type MapDot } from "./map/MapExplorer";
import s from "./map/Map.module.css";

/* -----------------------------------------------------------------------------
 * Geometry, in the outline's own viewBox units (1000 × 1066).
 *
 * Five of the nine programme cities sit within forty kilometres of each other
 * on the Rabat–Casablanca coast — at any size a page can give a whole-country
 * map, their pins would sit on top of one another. Rather than crop the map
 * (the outline is the Kingdom, whole, and is never cut), that stretch is shown
 * a second time through a loupe placed in the open Atlantic: the same single
 * shape, magnified, inside a circle. Nothing is drawn across the land.
 * -------------------------------------------------------------------------- */

/** Centre of the magnified stretch (between Had Soualem and Salé). */
const SOURCE = { x: 600, y: 160 };
/**
 * Where the loupe sits: open ocean, west of the coast at every latitude it
 * spans. As large as that water allows — its right edge stops just short of
 * Essaouira's pin — because five labelled programme cities share it.
 */
const LOUPE = { x: 236, y: 214, r: 205 };
/** Same source circle as ever (≈56 units): only the lens grew. */
const ZOOM = 3.668;
const SOURCE_R = LOUPE.r / ZOOM;

/**
 * Which side of its pin each label sits on. Placed by hand against the actual
 * coordinates so no label crosses a pin, the loupe, or another label. Any city
 * not listed gets "e".
 */
const LABEL_SIDE: Record<string, MapDot["side"]> = {
  tanger: "e",
  marrakech: "e",
  // Essaouira is boxed in: the loupe to the west, Agadir's pin 80 km south,
  // Marrakech's pin due east. Its label sits above, starting a little west of
  // its pin, which clears both the loupe ring and Marrakech.
  essaouira: "ne",
  // Below its pin: east of it is where the city panel sits on desktop.
  agadir: "s",
  "al-hoceima": "s",
  nador: "e",
  "ksar-el-kebir": "w",
  kenitra: "e",
  // Inside the loupe: coastal names over the water, inland names over land,
  // every one inside the ring (measured down to a 514px map, at 1024 wide).
  "sala-al-jadida": "w",
  temara: "w",
  mohammedia: "e",
  // Sidi Rahal Chatai is on the coast: its label sits above, over the ocean.
  "sidi-rahal": "n",
  "had-soualem": "s",
};

/**
 * Phones name only the active city, so its label only has to clear the ring
 * and its neighbours' discs; at 350px the lens is 145px across, so every name
 * in it points towards the middle. Had Soualem, low in the lens, is named
 * above its pin and to the east ("ne"), where the ring is wide enough.
 */
const PHONE_LABEL_SIDE: Record<string, MapDot["side"]> = {
  "sala-al-jadida": "w",
  temara: "s",
  mohammedia: "n",
  "sidi-rahal": "e",
  "had-soualem": "ne",
};

/**
 * Desktop: loupe points nudged apart where true positions collide.
 *
 * Five programme cities and three footprint cities share a lens 410 units
 * across, and at their true magnified places Témara's pin sits on Sala Al
 * Jadida's and Had Soualem's on Sidi Rahal's. These are the same points moved
 * as little as possible (found by search, checked at every desktop width from
 * a 514px map up) until every pin and label is clear of every other and of the
 * ring. Sidi Rahal keeps its true place on the coastline; Témara slides a few
 * kilometres south along the coast; Had Soualem moves inland, the direction it
 * actually lies; Sala Al Jadida stays north-east of Témara. Loupe (viewBox)
 * units.
 */
const DESK_LOUPE: Record<string, { x: number; y: number }> = {
  "sala-al-jadida": { x: 391, y: 134 },
  temara: { x: 331, y: 181 },
  mohammedia: { x: 241, y: 236 },
  "had-soualem": { x: 175, y: 304 },
  casablanca: { x: 200, y: 245 },
  rabat: { x: 362, y: 161 },
  nouaceur: { x: 217, y: 294 },
};

/**
 * Phones only: where the loupe's points sit when the map is ~350px wide.
 *
 * At that width the true magnified positions put Sala Al Jadida 12px from
 * Témara and Mohammedia 18px from Sidi Rahal — closer than a fingertip, so a
 * tap lands on the neighbour. These are the same points relaxed apart until
 * every programme pin is at least ~90 units (≈31px at 350px) from every other,
 * each kept on land inside the lens and as close as possible to where it
 * truly is (the largest move is Témara's, south along the coast). The ring
 * cities move with them so the neighbourhood still reads right. Loupe
 * (viewBox) units; anything not listed keeps its place.
 */
const PHONE_LOUPE: Record<string, { x: number; y: number }> = {
  "sala-al-jadida": { x: 399, y: 131 },
  temara: { x: 332, y: 200 },
  mohammedia: { x: 233, y: 208 },
  // Coastal (Sidi Rahal Chatai); Had Soualem pushed inland so the two
  // programme pins are a fingertip apart.
  "sidi-rahal": { x: 117, y: 259 },
  "had-soualem": { x: 189, y: 313 },
  casablanca: { x: 207, y: 244 },
  rabat: { x: 364, y: 130 },
  nouaceur: { x: 207, y: 296 },
};

/**
 * Phones, outside the loupe: Essaouira and Agadir are 80 km apart, which on a
 * 350px map is 26px — closer than a fingertip. Each slides a few kilometres
 * along its own coast (Essaouira north, Agadir south). Map (viewBox) units.
 */
const PHONE_MAP: Record<string, { x: number; y: number }> = {
  essaouira: { x: 462, y: 298 },
  agadir: { x: 468, y: 400 },
};

/** Cities inside the loupe that would only crowd it if labelled. */
const UNLABELLED_IN_LOUPE = new Set(["casablanca", "rabat", "nouaceur"]);

const pct = (v: number, of: number) => Number(((v / of) * 100).toFixed(3));

function place(id: string, lat: number, lng: number) {
  const p = projectMorocco(lat, lng);
  const dx = p.x - SOURCE.x;
  const dy = p.y - SOURCE.y;
  const inLoupe = Math.hypot(dx, dy) <= SOURCE_R * 0.92;
  const at = inLoupe ? (DESK_LOUPE[id] ?? { x: LOUPE.x + dx * ZOOM, y: LOUPE.y + dy * ZOOM }) : p;
  const phone = inLoupe ? PHONE_LOUPE[id] : PHONE_MAP[id];
  return {
    inLoupe,
    left: pct(at.x, MOROCCO_VIEWBOX.width),
    top: pct(at.y, MOROCCO_VIEWBOX.height),
    ...(phone && {
      phone: { left: pct(phone.x, MOROCCO_VIEWBOX.width), top: pct(phone.y, MOROCCO_VIEWBOX.height) },
    }),
  };
}

/** External tangents between the source ring and the loupe, so the lens reads as one optical device. */
function tangents() {
  const dx = LOUPE.x - SOURCE.x;
  const dy = LOUPE.y - SOURCE.y;
  const d = Math.hypot(dx, dy);
  const theta = Math.atan2(dy, dx);
  const phi = Math.acos((SOURCE_R - LOUPE.r) / d);
  return [theta + phi, theta - phi].map((a) => ({
    x1: SOURCE.x + SOURCE_R * Math.cos(a),
    y1: SOURCE.y + SOURCE_R * Math.sin(a),
    x2: LOUPE.x + LOUPE.r * Math.cos(a),
    y2: LOUPE.y + LOUPE.r * Math.sin(a),
  }));
}

function programmeItem(project: Project, locale: Locale) {
  return {
    slug: project.slug,
    href: `/${locale}/projets/${project.slug}`,
    name: project.name[locale],
    meta: segmentLabels[locale][project.segment],
    // The figure keeps its unit: the line may wrap after "à partir de", never before "DH".
    price: `${shared[locale].from} ${formatPrice(project.price, locale).replace(/ (?=\S+$)/, "\u00a0")}`,
    status: statusLabel(project, locale),
    delivered: project.status === "livre",
    // Land has no honest picture (the client's are clip-art signposts), so its
    // row gets the lattice tile instead of a thumbnail.
    thumb:
      project.segment === "terrain" || project.price.unit === "per-sqm"
        ? null
        : { key: project.hero.key, nature: project.hero.nature, alt: project.hero.alt[locale] },
  };
}

/**
 * Presence — Morocco, and where the catalogue's programmes are.
 *
 * Two honest numbers, kept apart: the company's footprint (`citiesCount`, the
 * fifteen cities it lists itself) is the headline; the pins are only the
 * programmes in this catalogue, and the lead says exactly that. Footprint
 * cities without a current programme are drawn as quiet rings, so the map
 * shows both without passing one off as the other.
 */
export function MapSection({ locale }: { locale: Locale }) {
  const t = mapCopy[locale];
  const fmt = (n: number) => formatNumber(n, locale);

  const byCity = new Map<string, Project[]>();
  projects.forEach((p) => byCity.set(p.cityId, [...(byCity.get(p.cityId) ?? []), p]));

  // North to south: the order a Moroccan reads their own map in.
  const programmeCities: MapCity[] = [...byCity.entries()]
    .map(([id, list]) => ({ id, list, city: cityById.get(id) }))
    .filter((c): c is { id: string; list: Project[]; city: NonNullable<typeof c.city> } => Boolean(c.city))
    .sort((a, b) => b.city.lat - a.city.lat)
    .map(({ id, list, city }) => {
      const at = place(id, city.lat, city.lng);
      return {
        id,
        name: city.name[locale],
        ...at,
        side: LABEL_SIDE[id] ?? "e",
        phoneSide: PHONE_LABEL_SIDE[id] ?? LABEL_SIDE[id] ?? "e",
        labelled: true,
        count: list.length,
        countLabel: programmeCount(list.length, locale, fmt),
        countFigure: fmt(list.length),
        programmes: list.map((p) => programmeItem(p, locale)),
      };
    });

  const footprint: MapDot[] = cities
    .filter((c) => !byCity.has(c.id))
    .map((c) => {
      const at = place(c.id, c.lat, c.lng);
      return {
        id: c.id,
        name: c.name[locale],
        ...at,
        side: LABEL_SIDE[c.id] ?? "e",
        labelled: !(at.inLoupe && UNLABELLED_IN_LOUPE.has(c.id)),
      };
    });

  const title = fill(t.title, { n: fmt(company.citiesCount) });
  const lead = fill(t.lead, {
    first: String(company.founded),
    n: fmt(projects.length),
    cities: fmt(programmeCities.length),
  });

  const lines = tangents();
  const defaultId = projects[0] && byCity.has(projects[0].cityId) ? projects[0].cityId : programmeCities[0]?.id;

  const silhouette = (
    <svg
      className={s.svg}
      viewBox={`0 0 ${MOROCCO_VIEWBOX.width} ${MOROCCO_VIEWBOX.height}`}
      aria-hidden
      focusable="false"
    >
      <defs>
        <path id="mx-morocco" d={MOROCCO_PATH} />
        <clipPath id="mx-loupe-clip">
          <circle cx={LOUPE.x} cy={LOUPE.y} r={LOUPE.r} />
        </clipPath>
      </defs>

      <g className={s.land}>
        <use href="#mx-morocco" className={s.landShape} />
      </g>

      <g className={s.lens}>
        <circle cx={SOURCE.x} cy={SOURCE.y} r={SOURCE_R} className={s.sourceRing} />
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className={s.tangent} />
        ))}
        <circle cx={LOUPE.x} cy={LOUPE.y} r={LOUPE.r} className={s.loupeWater} />
        <g clipPath="url(#mx-loupe-clip)">
          <g transform={`translate(${LOUPE.x} ${LOUPE.y}) scale(${ZOOM}) translate(${-SOURCE.x} ${-SOURCE.y})`}>
            <use href="#mx-morocco" className={s.loupeLand} />
          </g>
        </g>
        <circle cx={LOUPE.x} cy={LOUPE.y} r={LOUPE.r} className={s.loupeRing} />
      </g>
    </svg>
  );

  return (
    <section className={s.section} aria-labelledby="map-title">
      <div className={`u-shell ${s.grid}`}>
        <MapExplorer
          locale={locale}
          cities={programmeCities}
          footprint={footprint}
          defaultId={defaultId ?? ""}
          loupe={{
            left: pct(LOUPE.x, MOROCCO_VIEWBOX.width),
            top: pct(LOUPE.y + LOUPE.r, MOROCCO_VIEWBOX.height),
            label: t.loupe,
          }}
          copy={{
            listLabel: t.listLabel,
            legendProgramme: t.legendProgramme,
            legendCity: t.legendCity,
            seeAll: t.seeAll,
          }}
          allHref={`/${locale}/projets`}
          intro={
            <div key="intro" className={s.intro}>
              <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
                {t.eyebrow}
              </p>
              <h2 id="map-title" className={`u-display ${s.title}`} data-reveal="mask">
                <span className="reveal-inner">{title}</span>
              </h2>
              <p className={`u-enter ${s.lead}`}>{lead}</p>
            </div>
          }
        >
          {silhouette}
        </MapExplorer>
      </div>
    </section>
  );
}
