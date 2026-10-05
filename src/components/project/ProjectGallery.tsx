import { Figure } from "@/components/media/Figure";
import type { MediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import s from "./ProjectGallery.module.css";

/**
 * The gallery as an edited spread rather than a carousel: one large image,
 * the rest arranged around it, every frame cropped generously. Photographs of
 * delivered programmes are shown as what they are; renders carry the
 * non-contractual note.
 */
export function ProjectGallery({ locale, images }: { locale: Locale; images: MediaRef[] }) {
  if (images.length === 0) return null;
  const c = projectCopy[locale];
  const allPhotos = images.every((image) => image.nature === "photograph");
  const shown = images.slice(0, 7);

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="gallery-title">
      <header className={s.head}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
          {c.galleryEyebrow}
        </p>
        <h2 id="gallery-title" className={`u-display ${s.title}`} data-reveal="mask">
          <span className="reveal-inner">{allPhotos ? c.galleryTitleDelivered : c.galleryTitleRender}</span>
        </h2>
      </header>

      <ul className={s.grid} data-count={shown.length}>
        {shown.map((image, index) => (
          <li key={image.key} className={s.item} data-i={index}>
            <figure className={s.figure} data-reveal="media">
              <Figure
                ref_={image}
                locale={locale}
                sizes={index === 0 ? "(min-width: 64rem) 50vw, 100vw" : "(min-width: 64rem) 25vw, 50vw"}
                className={s.img}
              />
              {image.nature === "render" && <figcaption className={s.note}>{c.renderShort}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
