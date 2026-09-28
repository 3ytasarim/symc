import type { SiteImage as SiteImageData } from "@/lib/data/media";
import type { Crumb } from "@/lib/seo/json-ld";
import { Breadcrumbs } from "./Breadcrumbs";
import { Eyebrow } from "./Eyebrow";
import { SiteImage } from "./SiteImage";

type Props = {
  title: string;
  eyebrow?: string;
  intro?: string;
  image?: SiteImageData | null;
  crumbs?: Crumb[];
  meta?: string[];
  size?: "home" | "large" | "band";
  children?: React.ReactNode;
};

/**
 * Page hero. Always dark (image + scrim, or deep navy band) so the fixed
 * header can sit on top of it. The image is the page's LCP element: it is
 * server-rendered, eagerly loaded with high fetch priority and is the same
 * image used for og:image and the #primaryimage ImageObject.
 */
export function PageHero({ title, eyebrow, intro, image, crumbs, meta, size = "large", children }: Props) {
  const heights = {
    home: "min-h-[92svh]",
    large: "min-h-[78svh] md:min-h-[82svh]",
    band: "",
  } as const;
  const hasImage = Boolean(image) && size !== "band";

  return (
    <section className={`on-dark relative isolate flex flex-col justify-end overflow-hidden bg-deep text-white ${hasImage ? heights[size] : ""}`}>
      {hasImage && image ? (
        <>
          <SiteImage image={image} fill priority sizes="100vw" quality={80} className="-z-20 object-cover" />
          <div aria-hidden="true" className="scrim-bottom absolute inset-0 -z-10" />
          <div aria-hidden="true" className="scrim-left absolute inset-0 -z-10 hidden md:block" />
        </>
      ) : null}
      <div className={`shell w-full ${hasImage ? "pb-14 pt-36 md:pb-20" : "pb-16 pt-40 md:pb-24 md:pt-48"}`}>
        {crumbs && crumbs.length > 1 ? (
          <div className="mb-10 md:mb-14">
            <Breadcrumbs crumbs={crumbs} />
          </div>
        ) : null}
        {eyebrow ? <Eyebrow tone="light">{eyebrow}</Eyebrow> : null}
        <h1 className={`${size === "home" ? "display-1" : "display-2"} mt-6 max-w-[16ch] text-balance`}>{title}</h1>
        {intro ? <p className="lede mt-8 max-w-2xl text-white/80">{intro}</p> : null}
        {meta && meta.length ? (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-6 font-mono text-[12px] uppercase tracking-[0.16em] text-white/80">
            {meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
        {children ? <div className="mt-10 flex flex-wrap gap-4">{children}</div> : null}
      </div>
    </section>
  );
}
