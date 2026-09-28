import Image from "next/image";
import type { SiteImage as SiteImageData } from "@/lib/data/media";

type Props = {
  image: SiteImageData;
  sizes: string;
  className?: string;
  /** Only for the LCP image of a page (hero). Never lazy-loaded. */
  priority?: boolean;
  fill?: boolean;
  alt?: string;
  quality?: 70 | 75 | 80;
};

/**
 * Responsive image with real intrinsic dimensions (no CLS), AVIF/WebP srcset
 * via next/image, lazy-loading below the fold and eager+high priority for the
 * hero. The alt text always comes from the CMS media library.
 */
export function SiteImage({ image, sizes, className, priority = false, fill = false, alt, quality = 75 }: Props) {
  const text = alt ?? image.alt;
  const loadingProps = priority ? { priority: true, fetchPriority: "high" as const } : { loading: "lazy" as const };
  return fill ? (
    <Image src={image.url} alt={text} sizes={sizes} className={className} quality={quality} fill {...loadingProps} />
  ) : (
    <Image src={image.url} alt={text} sizes={sizes} className={className} quality={quality} width={image.width} height={image.height} {...loadingProps} />
  );
}
