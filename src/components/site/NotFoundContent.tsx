import Link from "next/link";
import { VELARIS_COLORS } from "./palette";
import { Velaris } from "./Velaris";

export function NotFoundContent() {
  return (
    <section className="on-dark text-white">
      <Velaris colors={VELARIS_COLORS}>
        <div aria-hidden="true" className="absolute inset-0 -z-[5] bg-black/35" />
        <div className="shell relative py-24 text-center md:py-32">
          <p className="eyebrow mb-3 text-gold">Error 404</p>
          <h1 className="display-1 mx-auto mb-4 max-w-2xl">This page has sailed.</h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/80">The page you are looking for does not exist or is no longer available.</p>
          <ul className="flex flex-wrap justify-center gap-4">
            <li><Link href="/" className="btn-solid">Home</Link></li>
            <li><Link href="/services/" className="btn-light">Services</Link></li>
            <li><Link href="/completed-projects/" className="btn-light">Completed projects</Link></li>
            <li><Link href="/contact/" className="btn-light">Contact</Link></li>
          </ul>
        </div>
      </Velaris>
    </section>
  );
}
