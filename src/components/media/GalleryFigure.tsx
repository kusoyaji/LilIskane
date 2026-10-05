import "server-only";
import Image from "next/image";
import { galleryMedia } from "@/data/media.gallery.generated";
import { media } from "@/data/media.generated";
import type { GalleryRef } from "@/data/types";
import type { Locale } from "@/i18n/config";

/**
 * Resolve a gallery reference against either manifest.
 *
 * Programme galleries hold ~150 images that no client component ever needs,
 * so they live in their own manifest, and only server code may read it: the
 * `server-only` import above turns an accidental client import into a build
 * error instead of 45 KB of LQIPs in the browser.
 */
export function resolveGallery(ref_: GalleryRef) {
  return ref_.key in galleryMedia
    ? galleryMedia[ref_.key as keyof typeof galleryMedia]
    : media[ref_.key as keyof typeof media];
}

/** `Figure`, for gallery images: same contract, both manifests. */
export function GalleryFigure({
  ref_,
  locale,
  sizes,
  className,
}: {
  ref_: GalleryRef;
  locale: Locale;
  sizes: string;
  className?: string;
}) {
  const asset = resolveGallery(ref_);
  return (
    <Image
      src={asset.src}
      alt={ref_.alt[locale]}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      loading="lazy"
      placeholder="blur"
      blurDataURL={asset.blur}
      className={className}
    />
  );
}
