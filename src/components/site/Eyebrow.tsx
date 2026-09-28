import { SailMark } from "./Icons";

export function Eyebrow({ children, tone = "dark", index }: { children: React.ReactNode; tone?: "dark" | "light"; index?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${tone === "light" ? "text-white/75" : "text-mute"}`}>
      <SailMark className="h-2.5 w-2.5 shrink-0" />
      {index ? <span className={tone === "light" ? "text-white" : "text-ink"}>{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}
