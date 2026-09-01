import Image from "next/image";
import { media } from "@/data/media.generated";
import type { MediaRef, ResolvedMediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";

type Props = {
  /**
   * Either a full `MediaRef` or one whose alt is already resolved to a single
   * language. The search list uses the latter so the inactive language never
   * reaches the browser; everything else passes the full ref unchanged.
   */
  ref_: MediaRef | ResolvedMediaRef;
  locale: Locale;
  /** Real value, not a guess — this is what decides which file the phone downloads. */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Force an aspect ratio; otherwise the image's own ratio is used. */
  ratio?: string;
  objectPosition?: string;
};

/**
 * The only image component on the site.
 *
 * Everything flows from the generated manifest: intrinsic dimensions (so there
 * is never a layout shift), a real LQIP (so slow connections see the shape of
 * the photograph rather than a grey box), and the AVIF/WebP negotiation that
 * next/image handles from the 2560px master.
 *
 * Alt text is required and localised at the data layer — there is no path
 * through this component that produces an empty alt on a meaningful image.
 */
export function Figure({
  ref_,
  locale,
  sizes,
  priority = false,
  className,
  ratio,
  objectPosition,
}: Props) {
  const asset = media[ref_.key];

  return (
    <Image
      src={asset.src}
      alt={typeof ref_.alt === "string" ? ref_.alt : ref_.alt[locale]}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL={asset.blur}
      className={className}
      style={{
        aspectRatio: ratio,
        objectFit: ratio ? "cover" : undefined,
        objectPosition,
      }}
    />
  );
}
