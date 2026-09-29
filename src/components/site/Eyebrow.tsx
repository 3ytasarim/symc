/** Section label above a heading (Norm Yacht pattern: bold, uppercase, accent colour). */
export function Eyebrow({ children, tone = "dark", className = "" }: { children: React.ReactNode; tone?: "dark" | "light"; className?: string }) {
  return <p className={`eyebrow ${tone === "light" ? "text-gold" : "text-gold-ink"} ${className}`}>{children}</p>;
}

/** Centred section heading with label, title, optional subtitle and the gradient divider. */
export function SectionHeading({
  label,
  title,
  subtitle,
  id,
  tone = "dark",
  align = "center",
}: {
  label: string;
  title: string;
  subtitle?: string;
  id?: string;
  tone?: "dark" | "light";
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mb-14 text-center" : "mb-10"}>
      <Eyebrow tone={tone} className="mb-3">{label}</Eyebrow>
      <h2 id={id} className={`display-2 ${tone === "light" ? "text-white" : "text-neutral-900"}`}>{title}</h2>
      {subtitle ? <p className={`mt-4 max-w-2xl ${centered ? "mx-auto" : ""} ${tone === "light" ? "text-neutral-400" : "text-neutral-600"}`}>{subtitle}</p> : null}
      <div aria-hidden="true" className={`section-divider mt-6 w-20 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
