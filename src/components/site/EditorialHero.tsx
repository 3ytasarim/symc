import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Crumb } from "@/lib/seo/json-ld";
import { Breadcrumbs } from "./Breadcrumbs";

type Badge = { label: string; tone?: "accent" | "success" | "neutral" };

type Props = {
  eyebrow: string;
  title: string;
  titleLine2?: string;
  description?: string;
  crumbs?: Crumb[];
  badges?: Badge[];
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  /** Show the logo collage on the right (default). Ignored when `aside` is given. */
  collage?: boolean;
  /** Custom right-hand column (e.g. an image collage). */
  aside?: React.ReactNode;
};

const badgeTone = {
  accent: "bg-gold text-ink",
  success: "bg-green-700 text-white",
  neutral: "border border-neutral-300 bg-white/70 text-neutral-700",
} as const;

function LogoCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-md" aria-hidden="true">
      <div className="animate-float-reverse absolute inset-x-6 inset-y-4 rotate-[-7deg] rounded-[2rem] bg-gradient-to-br from-gold to-gold-dark shadow-xl" />
      <div className="absolute inset-x-6 inset-y-4 rotate-[4deg] rounded-[2rem] border border-neutral-200 bg-white/60 shadow-lg backdrop-blur" />
      <div className="absolute inset-x-6 inset-y-4 flex items-center justify-center rounded-[2rem] border border-neutral-200 bg-white p-10 shadow-2xl">
        <Image src="/brand/symc-logo.png" alt="" width={1200} height={1075} priority sizes="(min-width: 640px) 360px, 280px" className="h-auto w-full" />
      </div>
    </div>
  );
}

/**
 * Two-column editorial hero in the style of 21st.dev "Editorial Collage Hero"
 * (hero-04): headline, description and CTAs over a soft background wash, with
 * a layered collage on the right — by default the original SYMC logo
 * (transparent PNG, unaltered) stacked over a tilted gold card, or any `aside`.
 */
export function EditorialHero({ eyebrow, title, titleLine2, description, crumbs, badges, primaryCta, secondaryCta, collage = true, aside }: Props) {
  const right = aside ?? (collage ? <LogoCollage /> : null);
  return (
    <section className="relative isolate overflow-hidden bg-bone">
      {/* soft wash */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-gold/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className={`shell grid items-center gap-14 py-16 md:py-24 ${right ? "lg:grid-cols-2 lg:gap-12" : ""}`}>
        <div className={`animate-slide-up ${right ? "" : "max-w-3xl"}`}>
          {crumbs && crumbs.length > 1 ? (
            <div className="mb-8">
              <Breadcrumbs crumbs={crumbs} tone="dark" />
            </div>
          ) : null}
          <p className="eyebrow text-gold-ink">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight text-neutral-900 text-balance sm:text-5xl lg:text-[3.4rem]">
            {title}
            {titleLine2 ? (
              <>
                <br className="hidden sm:block" /> <span className="text-gold-ink">{titleLine2}</span>
              </>
            ) : null}
          </h1>
          {badges?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {badges.map((b) => (
                <li key={b.label} className={`rounded-full px-3 py-1 text-xs font-bold ${badgeTone[b.tone ?? "neutral"]}`}>
                  {b.label}
                </li>
              ))}
            </ul>
          ) : null}
          {description ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">{description}</p> : null}
          {primaryCta || secondaryCta ? (
            <div className="mt-9 flex flex-wrap items-center gap-6">
              {primaryCta ? (
                <Link href={primaryCta.href} className="btn-solid group h-12 rounded-full px-7">
                  {primaryCta.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link href={secondaryCta.href} className="text-sm font-bold text-neutral-900 underline-offset-4 hover:text-gold-ink hover:underline">
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {right}
      </div>
    </section>
  );
}
