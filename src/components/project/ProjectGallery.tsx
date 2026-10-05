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
    open: string;
    dialog: string;
    close: string;
    previous: string;
    next: string;
  }
> = {
  fr: {
    count: (n) => `${n} images`,
    more: (n) => `+${n}`,
    open: "Voir toutes les images",
    dialog: "Galerie d'images",
    close: "Fermer",
    previous: "Image précédente",
    next: "Image suivante",
  },
  ar: {
    count: (n) => `${n} صورة`,
    more: (n) => `+${n}`,
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
  images,
  delivered,
}: {
  locale: Locale;
  images: GalleryRef[];
  /** Only a delivered programme may be titled "Livré": show-flat photographs are photographs too. */
  delivered: boolean;
}) {
  if (images.length === 0) return null;
  const c = projectCopy[locale];
  const g = COPY[locale];
  const allPhotos = images.every((image) => image.nature === "photograph");
  const shown = images.slice(0, SPREAD);
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
        <header className={s.head}>
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
                    aria-label={last ? `${g.open} (${g.count(images.length)})` : image.alt[locale]}
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
