import type { Crumb } from "@/lib/seo/json-ld";
import { Breadcrumbs } from "./Breadcrumbs";
import { Eyebrow } from "./Eyebrow";
import { VELARIS_COLORS } from "./palette";
import { Velaris } from "./Velaris";

type Props = {
  title: string;
  eyebrow?: string;
  intro?: string;
  crumbs?: Crumb[];
  /** Small pills next to the title (status, category, year…). */
  badges?: { label: string; tone?: "accent" | "success" | "neutral" }[];
  children?: React.ReactNode;
};

const badgeTone = {
  accent: "bg-gold text-ink",
  success: "bg-green-700 text-white",
  neutral: "bg-white/15 text-white backdrop-blur",
} as const;

/**
 * Inner-page header band on the animated gold/charcoal Velaris background
 * (same as the CTA band): accent label, bold title, subtitle, breadcrumbs.
 */
export function PageHero({ title, eyebrow, intro, crumbs, badges, children }: Props) {
  return (
    <section className="on-dark text-white">
      <Velaris colors={VELARIS_COLORS}>
        {/* keeps text contrast even where the gold highlight passes behind it */}
        <div aria-hidden="true" className="absolute inset-0 -z-[5] bg-black/35" />
        <div className="shell relative py-16 md:py-24">
          {crumbs && crumbs.length > 1 ? (
            <div className="mb-6">
              <Breadcrumbs crumbs={crumbs} />
            </div>
          ) : null}
          {eyebrow ? (
            <Eyebrow tone="light" className="mb-3">
              {eyebrow}
            </Eyebrow>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-5xl">{title}</h1>
            {badges?.map((b) => (
              <span key={b.label} className={`rounded-full px-3 py-1 text-xs font-bold ${badgeTone[b.tone ?? "neutral"]}`}>
                {b.label}
              </span>
            ))}
          </div>
          {intro ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p> : null}
          {children ? <div className="mt-8 flex flex-wrap gap-4">{children}</div> : null}
        </div>
      </Velaris>
    </section>
  );
}
