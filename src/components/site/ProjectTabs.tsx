"use client";

import { useState } from "react";

type Tab = { key: string; label: string; count: number };
type Item = { id: string; cat: string; node: React.ReactNode };

/**
 * Category tabs over the project grid (Norm Yacht pattern). Every card is in
 * the server HTML; filtering only hides cards on the client.
 */
export function ProjectTabs({ tabs, items }: { tabs: Tab[]; items: Item[] }) {
  const [active, setActive] = useState("all");
  const all: Tab = { key: "all", label: "All", count: items.length };
  return (
    <>
      {tabs.length > 1 ? (
        <div className="mb-10 flex justify-center">
          <div role="group" aria-label="Filter projects" className="inline-flex flex-wrap justify-center gap-1 rounded-lg bg-neutral-100 p-1">
            {[all, ...tabs].map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={active === t.key}
                onClick={() => setActive(t.key)}
                className={`min-h-11 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  active === t.key ? "bg-white text-gold-ink shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.id} hidden={active !== "all" && it.cat !== active}>
            {it.node}
          </li>
        ))}
      </ul>
    </>
  );
}
