import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { telHref } from "@/lib/data/settings";
import { VELARIS_COLORS } from "./palette";
import { Velaris } from "./Velaris";

type Props = {
  phone?: string;
  title?: string;
  text?: string;
};

/**
 * Closing call to action on an animated gold/charcoal Velaris background.
 * The rounded footer overlaps its bottom edge (globals.css). Copy from the
 * original SYMC homepage.
 */
export function CtaBand({
  phone,
  title = "Do you want to work with us?",
  text = "With more than 25 years of experience and expertise as a marine surveyor and project manager, SYMC can be your solution partner for all kinds of classification rules, owner requirements and the best quality for your existing yacht or new build.",
}: Props) {
  return (
    <section aria-labelledby="cta-title" data-cta-band className="on-dark text-white">
      <Velaris colors={VELARIS_COLORS} className="pb-24 pt-24 md:pb-28 md:pt-28">
        {/* keeps text contrast even where the gold highlight passes behind it */}
        <div aria-hidden="true" className="absolute inset-0 -z-[5] bg-black/30" />
        <div className="shell relative text-center">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur">
            Get in touch
          </span>
          <h2 id="cta-title" className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{text}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact/" className="btn-solid group h-12 px-8">
              Contact SYMC
              <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            {phone ? (
              <a href={telHref(phone)} className="btn-light h-12 px-8 backdrop-blur">
                <Phone aria-hidden="true" className="h-4 w-4" />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </Velaris>
    </section>
  );
}
