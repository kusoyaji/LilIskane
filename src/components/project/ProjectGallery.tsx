import { GalleryFigure, resolveGallery } from "@/components/media/GalleryFigure";
import type { GalleryRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import { GalleryLightbox, type LightboxItem } from "./GalleryLightbox";
import s from "./ProjectGallery.module.css";

const COPY: Record<
  Locale,
  {
    count: (n: number) => string;
    more: (n: number) => string;
    /** Spoken name of the last tile: it opens on its own picture, then n more follow. */
    andMore: (n: number) => string;
    open: string;
    dialog: string;
    close: string;
    previous: string;
    next: string;
  }
> = {
  fr: {
    count: (n) => (n === 1 ? "1 image" : `${n} images`),
    more: (n) => `+${n}`,
    andMore: (n) => (n === 1 ? "et 1 autre image" : `et ${n} autres images`),
    open: "Voir toutes les images",
    dialog: "Galerie d'images",
    close: "Fermer",
    previous: "Image précédente",
    next: "Image suivante",
  },
  ar: {
    // Arabic counted nouns: dual for 2, plural for 3–10, singular from 11.
    count: (n) => (n === 1 ? "صورة واحدة" : n === 2 ? "صورتان" : n <= 10 ? `${n} صور` : `${n} صورة`),
    more: (n) => `+${n}`,
    andMore: (n) => (n === 1 ? "وصورة أخرى" : n === 2 ? "وصورتان أخريان" : n <= 10 ? `و${n} صور أخرى` : `و${n} صورة أخرى`),
    open: "عرض جميع الصور",
    dialog: "معرض الصور",
    close: "إغلاق",
    previous: "الصورة السابقة",
    next: "الصورة التالية",
  },
};

/** Tiles in the spread; the rest are one press away in the viewer. */
const SPREAD = 7;

/**
 * The gallery as an edited spread rather than a carousel: one large image,
 * the rest arranged around it, every frame cropped generously. Every tile
 * opens the full-screen viewer at that picture; when there are more pictures
 * than tiles, the last tile says how many more.
 *
 * Photographs are shown as what they are; renders carry the non-contractual
 * note, in the spread and in the viewer.
 */
export function ProjectGallery({
  locale,
  images: all,
  onPage = [],
  note,
  delivered,
}: {
  locale: Locale;
  images: GalleryRef[];
  /**
   * Keys of pictures the page already shows elsewhere (hero, tour posters,
   * film poster). Those frames move behind the "+N" tile — still in the
   * viewer, never twice in one scroll. A gallery with nothing new is omitted.
   */
  onPage?: string[];
  /** What the photographs show, when that needs saying (see Project.galleryNote). */
  note?: string;
  /** Only a delivered programme may be titled "Livré": show-flat photographs are photographs too. */
  delivered: boolean;
}) {
  const seen = new Set(onPage);
  const repeat = (image: GalleryRef) => seen.has(image.key) || (image.sameAs !== undefined && seen.has(image.sameAs));
  const fresh = all.filter((image) => !repeat(image));
  if (fresh.length === 0) return null;
  const images = [...fresh, ...all.filter(repeat)];
  const c = projectCopy[locale];
  const g = COPY[locale];
  const allPhotos = images.every((image) => image.nature === "photograph");
  // Repeats never take a tile: the spread holds only new pictures, and the
  // last of them carries the "+N" that leads on to the rest.
  const shown = images.slice(0, Math.min(SPREAD, fresh.length));
  const hidden = images.length - shown.length;

  const items: LightboxItem[] = images.map((image) => {
    const asset = resolveGallery(image);
    return {
      src: asset.src,
      width: asset.width,
      height: asset.height,
      blur: asset.blur,
      alt: image.alt[locale],
      render: image.nature === "render",
    };
  });

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="gallery-title">
      <GalleryLightbox
        items={items}
        dir={locale === "ar" ? "rtl" : "ltr"}
        labels={{
          dialog: g.dialog,
          close: g.close,
          previous: g.previous,
          next: g.next,
          render: c.renderShort,
        }}
      >
        {/* Heading at the start, the "see all" control at the end of the same
            row, on the title's baseline — the way "À voir aussi" sets its
            link — rather than a lone button under the title. */}
        <header className={s.head}>
          <div className={s.headText}>
            <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
              {c.galleryEyebrow}
              <span className={s.count}>
                {" · "}
                <bdi>{g.count(images.length)}</bdi>
              </span>
            </p>
            <h2 id="gallery-title" className={`u-display ${s.title}`} data-reveal="mask">
              <span className="reveal-inner">{allPhotos && delivered ? c.galleryTitleDelivered : c.galleryTitleRender}</span>
            </h2>
            {note && <p className={s.lede}>{note}</p>}
          </div>
          {images.length > 1 && (
            <button type="button" className={`${s.openAll} u-press u-enter`} data-gallery-index={0}>
              {g.open}
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
                <path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          )}
        </header>

        <ul className={s.grid} data-count={shown.length}>
          {shown.map((image, index) => {
            const last = index === shown.length - 1 && hidden > 0;
            return (
              <li key={image.key} className={s.item} data-i={index}>
                <figure className={s.figure} data-reveal="media">
                  <button
                    type="button"
                    className={s.tile}
                    data-gallery-index={index}
                    aria-label={last ? `${image.alt[locale]} — ${g.andMore(hidden)}` : image.alt[locale]}
                  >
                    <GalleryFigure
                      ref_={image}
                      locale={locale}
                      sizes={index === 0 ? "(min-width: 64rem) 50vw, 100vw" : "(min-width: 64rem) 25vw, 50vw"}
                      className={s.img}
                    />
                    {last && (
                      <span className={s.more} aria-hidden>
                        <bdi dir="ltr">{g.more(hidden)}</bdi>
                      </span>
                    )}
                  </button>
                  {image.nature === "render" && !last && <figcaption className={s.note}>{c.renderShort}</figcaption>}
                </figure>
              </li>
            );
          })}
        </ul>
      </GalleryLightbox>
    </section>
  );
}
