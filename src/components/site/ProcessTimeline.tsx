import { CheckCircle2 } from "lucide-react";

type Step = { title: string; text?: string };

/**
 * Numbered vertical timeline in the style of 21st.dev "Path to Resilience
 * Orbital Timeline": intro on the left, steps on a rail on the right, each
 * with a numbered node and a card.
 */
export function ProcessTimeline({
  id,
  eyebrow,
  title,
  description,
  steps,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  steps: Step[];
}) {
  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby={id}>
      <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow text-gold-ink">{eyebrow}</p>
          <h2 id={id} className="display-2 mt-4 text-balance text-neutral-900">
            {title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-600 md:text-lg">{description}</p>
        </div>

        <ol className="relative space-y-5 pl-12 before:absolute before:bottom-6 before:left-[1.05rem] before:top-6 before:w-0.5 before:bg-gradient-to-b before:from-gold before:via-gold/60 before:to-gold/20">
          {steps.map((step, i) => (
            <li key={step.title} className="relative" data-reveal>
              <span
                aria-hidden="true"
                className="absolute -left-12 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-sm font-black text-ink ring-4 ring-white"
              >
                {i + 1}
              </span>
              <div className="rounded-2xl border border-neutral-200 bg-bone px-6 py-5 transition-shadow duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-ink" />
                  <h3 className="text-lg font-bold text-neutral-900">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                </div>
                {step.text ? <p className="mt-2 pl-8 text-sm leading-relaxed text-neutral-600">{step.text}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
