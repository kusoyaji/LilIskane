import { Figure } from "@/components/media/Figure";
import type { MediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { guide } from "@/content/guide";
import s from "./Guide.module.css";

/**
 * A framed image with its caption. Renders carry the "image non contractuelle"
 * mark in the corner of the frame itself, so it travels with the picture
 * however the layout reflows; photographs say so in their caption.
 */
export function GuideMedia({
  media,
  locale,
  caption,
  ratio = "16 / 10",
  sizes,
  className,
  frameClassName,
}: {
  media: MediaRef;
  locale: Locale;
  caption?: string;
  ratio?: string;
  sizes: string;
  className?: string;
  frameClassName?: string;
}) {
  return (
    <figure className={[s.media, className].filter(Boolean).join(" ")}>
      <div
        className={[s.mediaFrame, frameClassName].filter(Boolean).join(" ")}
        style={{ aspectRatio: ratio }}
        data-reveal="media"
      >
        <Figure ref_={media} locale={locale} sizes={sizes} className={s.mediaImg} />
        {media.nature === "render" && <span className={s.renderNote}>{guide[locale].renderNote}</span>}
      </div>
      {caption && <figcaption className={s.mediaCaption}>{caption}</figcaption>}
    </figure>
  );
}
