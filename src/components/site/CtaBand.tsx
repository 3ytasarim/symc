import Link from "next/link";
import type { SiteImage as SiteImageData } from "@/lib/data/media";
import { telHref } from "@/lib/data/settings";
import { Eyebrow } from "./Eyebrow";
import { SiteImage } from "./SiteImage";

type Props = {
  image?: SiteImageData | null;
  phone?: string;
  email?: string;
  title?: string;
  text?: string;
};

/** Closing call to action (copy from the original SYMC homepage). */
export function CtaBand({
  image,
  phone,
  email,
  title = "Do you want to work with us?",
  text = "With more than 25 years of experience and expertise as a marine surveyor and project manager, SYMC can be your solution partner for all kinds of classification rules, owner requirements and the best quality for your existing yacht or new build.",
}: Props) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-deep text-white" aria-labelledby="cta-title">
      {image ? (
        <>
          <SiteImage image={image} fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-deep/80" />
        </>
      ) : null}
      <div className="shell grid gap-12 py-24 md:grid-cols-12 md:py-32" data-reveal>
        <div className="md:col-span-7">
          <Eyebrow tone="light">Contact</Eyebrow>
          <h2 id="cta-title" className="display-2 mt-6 text-balance">{title}</h2>
          <p className="lede mt-8 max-w-xl text-white/75">{text}</p>
        </div>
        <div className="flex flex-col justify-end gap-4 md:col-span-4 md:col-start-9">
          <Link href="/contact/" className="btn-light-solid w-full">
            Contact SYMC
          </Link>
          {phone ? (
            <a href={telHref(phone)} className="btn-light w-full">
              {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="btn-light w-full normal-case tracking-[0.06em]">
              {email}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
