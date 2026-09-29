import Link from "next/link";
import { Anchor, ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, HardHat, Sailboat, Ship, Sun, UserRound, Wrench } from "lucide-react";
import { SailMark } from "./Icons";

export type FeatureCard = {
  title: string;
  text: string;
  href?: string;
  art: "partner" | "refit" | "team";
};

/*
 * Feature cards in the style of 21st.dev "Feature Sections" (PrebuiltUI):
 * each card has an illustrated panel (gold gradient with small UI-style
 * mock-ups) above the title and description. The mock-ups are decorative.
 */

function PartnerArt() {
  const node = "flex flex-col items-center gap-2";
  const chip = "rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink shadow";
  return (
    <div className="flex h-full items-center justify-center gap-3 px-6">
      <div className={node}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
          <UserRound className="h-7 w-7 text-gold-ink" />
        </span>
        <span className={chip}>Owner</span>
      </div>
      <span className="mb-7 h-px flex-1 border-t-2 border-dashed border-white/80" />
      <div className={node}>
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-white/40">
          <SailMark className="h-10 w-10" />
        </span>
        <span className={chip}>SYMC</span>
      </div>
      <span className="mb-7 h-px flex-1 border-t-2 border-dashed border-white/80" />
      <div className={node}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
          <Ship className="h-7 w-7 text-gold-ink" />
        </span>
        <span className={chip}>Shipyard</span>
      </div>
    </div>
  );
}

function RefitArt() {
  return (
    <div className="relative flex h-full items-end justify-center px-6 pb-0">
      <Sun className="absolute right-8 top-6 h-10 w-10 text-white/90" />
      <div className="w-full max-w-[15rem] rounded-t-2xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold text-ink">
            <Wrench className="h-4 w-4 text-gold-ink" /> Refit
          </span>
          <CheckCircle2 className="h-5 w-5 text-green-700" />
        </div>
        <div className="mt-3 h-2 rounded-full bg-neutral-200">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-gold to-gold-dark" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold text-ink">
            <CalendarCheck className="h-4 w-4 text-gold-ink" /> Next vacation
          </span>
          <Sailboat className="h-6 w-6 text-gold-ink" />
        </div>
      </div>
    </div>
  );
}

function TeamArt() {
  const bubble = "absolute flex items-center justify-center rounded-full bg-white shadow-lg";
  return (
    <div className="relative h-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 180" preserveAspectRatio="none" aria-hidden="true">
        <g stroke="rgb(255 255 255 / 0.75)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
          <path d="M150 90 L70 50" />
          <path d="M150 90 L230 45" />
          <path d="M150 90 L80 140" />
          <path d="M150 90 L225 138" />
        </g>
      </svg>
      <span className={`${bubble} left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 ring-4 ring-white/40`}>
        <Anchor className="h-8 w-8 text-gold-ink" />
      </span>
      <span className={`${bubble} left-[23%] top-[28%] h-11 w-11 -translate-x-1/2 -translate-y-1/2`}>
        <HardHat className="h-5 w-5 text-gold-ink" />
      </span>
      <span className={`${bubble} left-[77%] top-[25%] h-11 w-11 -translate-x-1/2 -translate-y-1/2`}>
        <ClipboardList className="h-5 w-5 text-gold-ink" />
      </span>
      <span className={`${bubble} left-[27%] top-[78%] h-11 w-11 -translate-x-1/2 -translate-y-1/2`}>
        <UserRound className="h-5 w-5 text-gold-ink" />
      </span>
      <span className={`${bubble} left-[75%] top-[77%] h-11 w-11 -translate-x-1/2 -translate-y-1/2`}>
        <Ship className="h-5 w-5 text-gold-ink" />
      </span>
    </div>
  );
}

const arts = { partner: PartnerArt, refit: RefitArt, team: TeamArt } as const;

export function FeatureCards({ cards }: { cards: FeatureCard[] }) {
  return (
    <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {cards.map((card) => {
        const Art = arts[card.art];
        const body = (
          <>
            <div aria-hidden="true" className="h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-gold via-gold-dark to-[#8a6d2b] shadow-inner transition-transform duration-500 group-hover:-translate-y-1">
              <Art />
            </div>
            <h3 className="mt-6 text-lg font-bold text-neutral-900 transition-colors group-hover:text-gold-ink">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{card.text}</p>
            {card.href ? (
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-gold-ink">
                Read more
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            ) : null}
          </>
        );
        return (
          <li key={card.title} data-reveal>
            {card.href ? (
              <Link href={card.href} className="group block">
                {body}
              </Link>
            ) : (
              <div className="group">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
