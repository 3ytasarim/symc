import type { SpecRow } from "@/lib/data/projects";

/** Definition list of project specifications. Empty values never reach this component. */
export function SpecList({ specs }: { specs: SpecRow[] }) {
  if (!specs.length) return null;
  return (
    <dl className="border-t border-line">
      {specs.map((s) => (
        <div key={s.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line py-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{s.label}</dt>
          <dd className="text-[15px]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
