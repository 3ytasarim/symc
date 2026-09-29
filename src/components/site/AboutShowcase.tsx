import Link from "next/link";
import { Anchor, ArrowRight, Award, CheckCircle2, type LucideIcon } from "lucide-react";
import type { SiteImage as SiteImageData } from "@/lib/data/media";
import { Eyebrow } from "./Eyebrow";
import { SiteImage } from "./SiteImage";
import { StatCounter } from "./StatCounter";

export type Feature = { title: string; text: string; href?: string };
export type Stat = { Icon: LucideIcon; value: string; label: string };

function FeatureItem({ feature, side }: { feature: Feature; side: "left" | "right" }) {
  const head = (
    <>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold-50 text-gold-ink transition-colors duration-300 group-hover:bg-gold group-hover:text-ink"
      >
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-bold text-neutral-900">{feature.title}</h3>
    </>
  );
  return (
    <div className={`group ${side === "left" ? "lg:text-right" : ""}`} data-reveal>
      <div className={`flex items-center gap-3 ${side === "left" ? "lg:flex-row-reverse" : ""}`}>
        {feature.href ? (
          <Link href={feature.href} className={`flex items-center gap-3 hover:[&_h3]:text-gold-ink ${side === "left" ? "lg:flex-row-reverse" : ""}`}>
            {head}
          </Link>
        ) : (
          head
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{feature.text}</p>
    </div>
  );
}

/**
 * About section (Greek Harmony pattern): centred heading + divider, framed
 * intro, portrait image flanked by feature points, stat cards and a CTA.
 */
export function AboutShowcase({
  id,
  label,
  title,
  intro,
  image,
  features,
  stats,
  cta,
}: {
  id: string;
  label: string;
  title: string;
  intro: string;
  image: SiteImageData | null;
  features: Feature[];
  stats: Stat[];
  cta?: { href: string; label: string };
}) {
  const half = Math.ceil(features.length / 2);
  const left = features.slice(0, half);
  const right = features.slice(half);

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28" aria-labelledby={id}>
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="shell relative">
        <div className="mx-auto max-w-3xl text-center" data-reveal>
          <Eyebrow className="mb-4">{label}</Eyebrow>
          <h2 id={id} className="display-2 text-balance text-neutral-900">{title}</h2>
          <div aria-hidden="true" className="section-divider mx-auto mt-6 w-24" />
          <p className="mt-8 rounded-xl border border-dashed border-gold/60 bg-gold-50/40 px-6 py-5 text-base leading-relaxed text-neutral-600">
            {intro}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="order-2 space-y-10 lg:order-1">
            {left.map((f) => (
              <FeatureItem key={f.title} feature={f} side="left" />
            ))}
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[17rem] sm:max-w-sm lg:order-2" data-reveal>
            <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[2rem] border border-gold/40" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-xl">
              {image ? <SiteImage image={image} fill sizes="(min-width: 1024px) 384px, 90vw" className="object-cover" /> : null}
            </div>
            <span aria-hidden="true" className="animate-float absolute -right-5 -top-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-white/90 text-gold-ink shadow-lg backdrop-blur">
              <Anchor className="h-7 w-7" />
            </span>
            <span aria-hidden="true" className="animate-float-reverse absolute -bottom-5 -left-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-white/90 text-gold-ink shadow-lg backdrop-blur">
              <Award className="h-7 w-7" />
            </span>
          </div>

          <div className="order-3 space-y-10">
            {right.map((f) => (
              <FeatureItem key={f.title} feature={f} side="right" />
            ))}
          </div>
        </div>

        {stats.length ? (
          <ul className="mt-20 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-14 md:gap-6 lg:grid-cols-4">
            {stats.map(({ Icon, value, label: statLabel }) => (
              <li
                key={statLabel}
                className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-shadow duration-300 hover:shadow-lg"
                data-reveal
              >
                <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-ink">
                  <Icon className="h-6 w-6" />
                </span>
                <strong className="mt-4 text-3xl font-black text-neutral-900">
                  <StatCounter value={value} />
                </strong>
                <span className="mt-2 text-xs uppercase leading-snug tracking-wide text-neutral-600">{statLabel}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {cta ? (
          <div className="mt-12 text-center">
            <Link href={cta.href} className="btn-solid group h-12 px-8">
              {cta.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
