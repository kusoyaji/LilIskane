import { Figure } from "@/components/media/Figure";
import { GalleryFigure } from "@/components/media/GalleryFigure";
import { galleryMedia } from "@/data/media.gallery.generated";
import type { GalleryRef, MediaRef, ResolvedMediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import { YouTubePlayer } from "./YouTubePlayer";
import s from "./YouTubeFilm.module.css";

const PLAY: Record<Locale, string> = { fr: "Lire le film", ar: "تشغيل الفيلم" };

/**
 * A film from the client's own YouTube channel, with a poster we choose.
 *
 * The poster is deliberately ours, not YouTube's thumbnail: several of the
 * client's programme thumbnails carry prices baked into the image ("à partir de
 * 865 000 DHS") that no longer match the published price, and a page must never
 * show two prices for the same programme. Server component: the poster renders
 * here, the player island only swaps in the iframe.
 */
export function YouTubeFilm({
  locale,
  youtubeId,
  title,
  poster,
  eyebrow,
  caption,
  sizes = "(min-width: 64rem) 70vw, 100vw",
}: {
  locale: Locale;
  youtubeId: string;
  title: string;
  /** Any picture, gallery images included: this renders on the server. */
  poster: MediaRef | ResolvedMediaRef | GalleryRef;
  eyebrow?: string;
  caption?: string;
  sizes?: string;
}) {
  // A render keeps its non-contractual note here too, as it does in the gallery.
  const render = "nature" in poster && poster.nature === "render";
  return (
    <figure className={s.film}>
      <YouTubePlayer
        youtubeId={youtubeId}
        title={title}
        playLabel={PLAY[locale]}
        badge={render ? projectCopy[locale].renderShort : undefined}
      >
        {poster.key in galleryMedia ? (
          <GalleryFigure ref_={poster as GalleryRef} locale={locale} sizes={sizes} className="h-full w-full object-cover" />
        ) : (
          <Figure
            ref_={poster as MediaRef | ResolvedMediaRef}
            locale={locale}
            sizes={sizes}
            ratio="16 / 9"
            className="h-full w-full object-cover"
          />
        )}
      </YouTubePlayer>
      {(eyebrow || caption) && (
        <figcaption className={s.caption}>
          {eyebrow && <span className={`u-eyebrow ${s.eyebrow}`}>{eyebrow}</span>}
          <span className={s.title}>{caption ?? title}</span>
        </figcaption>
      )}
    </figure>
  );
}
