import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteImage as SiteImageData } from "@/lib/data/media";
import { SailMark } from "./Icons";
import { SiteImage } from "./SiteImage";

export type BentoTile = {
  href: string;
  label: string;
  title: string;
  text: string;
  image: SiteImageData | null;
  /** Renders the tile as a call to action (button instead of "View details"). */
  cta?: string;
};

/*
 * Bento layout (21st.dev "Bento" by Farm UI, re-implemented without framer-motion):
 * 6-column grid, two wide tiles on top, three below, extra-rounded outer
 * corners, full-bleed photo with a frosted text panel over its lower part.
 */
const layout = [
  { span: "lg:col-span-3", corners: "max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]", sizes: "(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw" },
  { span: "lg:col-span-3", corners: "lg:rounded-tr-[2rem]", sizes: "(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw" },
  { span: "lg:col-span-2", corners: "lg:rounded-bl-[2rem]", sizes: "(min-width: 1280px) 410px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" },
  { span: "lg:col-span-2", corners: "", sizes: "(min-width: 1280px) 410px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" },
  { span: "lg:col-span-2 sm:max-lg:col-span-2", corners: "max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]", sizes: "(min-width: 1280px) 410px, (min-width: 1024px) 33vw, 100vw" },
] as const;

export function ServicesBento({ tiles }: { tiles: BentoTile[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {tiles.slice(0, layout.length).map((tile, i) => {
        const l = layout[i]!;
        return (
          <li key={tile.href + i} className={l.span} data-reveal>
            <Link
              href={tile.href}
              className={`on-dark group relative isolate flex h-[24rem] flex-col justify-end overflow-hidden rounded-lg bg-deep text-white shadow-sm transition-shadow duration-300 hover:shadow-xl sm:h-[26rem] lg:h-[28rem] ${l.corners}`}
            >
              {tile.image ? (
                <SiteImage
                  image={tile.image}
                  fill
                  sizes={l.sizes}
                  quality={80}
                  className="-z-20 object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                />
              ) : (
                <div aria-hidden="true" className="absolute inset-0 -z-20 flex items-center justify-center bg-gradient-to-br from-deep to-deep-2">
                  <SailMark className="h-16 w-16" />
                </div>
              )}
              {/* Only the lower third is darkened, so the photograph stays visible. */}
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Compact caption */}
              <div className="px-5 pb-5 md:px-6 md:pb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{tile.label}</p>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <h3 className="text-lg font-bold leading-snug md:text-xl">{tile.title}</h3>
                  {tile.cta ? null : (
                    <span className="mb-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-bold text-gold">
                      View details
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
                {tile.text ? <p className="mt-1 line-clamp-1 max-w-xl text-xs leading-relaxed text-white/80">{tile.text}</p> : null}
                {tile.cta ? (
                  <span className="btn-solid mt-3 h-9 px-4 text-xs">
                    {tile.cta}
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
