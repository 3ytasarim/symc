import type { LucideIcon } from "lucide-react";
import type { SiteImage as SiteImageData } from "@/lib/data/media";
import { SiteImage } from "./SiteImage";

/**
 * A single photograph in a rounded frame with an offset gold outline and
 * floating icon badges on its corners (AboutShowcase / Greek Harmony pattern).
 * The image keeps its own aspect ratio, so nothing is cropped.
 */
export function DecoratedImage({
  image,
  icons,
  sizes = "(min-width: 1024px) 760px, 100vw",
  priority = false,
}: {
  image: SiteImageData;
  /** Up to four decorative icons: top-left, top-right, bottom-right, bottom-left. */
  icons: LucideIcon[];
  sizes?: string;
  priority?: boolean;
}) {
  const spots = [
    "-left-4 -top-5 animate-float",
    "-right-4 -top-5 animate-float-reverse",
    "-bottom-5 -right-4 animate-float",
    "-bottom-5 -left-4 animate-float-reverse",
  ];
  return (
    <figure className="relative isolate mx-2 mb-10 mt-6 sm:mx-4">
      <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-gold/50" />
      <div aria-hidden="true" className="absolute -inset-3 translate-x-3 translate-y-3 -z-10 rounded-[2rem] bg-gradient-to-br from-gold/25 to-transparent" />
      <div className="relative overflow-hidden rounded-[1.5rem] bg-neutral-200 shadow-2xl" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
        <SiteImage
          image={image}
          fill
          sizes={sizes}
          quality={80}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] hover:scale-[1.02]"
        />
      </div>
      {icons.slice(0, 4).map((Icon, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-white/95 text-gold-ink shadow-lg backdrop-blur sm:h-14 sm:w-14 ${spots[i]}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      ))}
      {image.caption ? <figcaption className="mt-6 text-center text-xs text-neutral-500">{image.caption}</figcaption> : null}
    </figure>
  );
}
