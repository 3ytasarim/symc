import Link from "next/link";
import { SailMark } from "./Icons";

export function NotFoundContent() {
  return (
    <section className="on-dark flex min-h-[80svh] items-end bg-deep text-white">
      <div className="shell pb-20 pt-40">
        <p className="eyebrow flex items-center gap-3 text-white/70">
          <SailMark className="h-2.5 w-2.5" /> Error 404
        </p>
        <h1 className="display-1 mt-6 max-w-[14ch]">This page has sailed.</h1>
        <p className="lede mt-8 max-w-xl text-white/75">The page you are looking for does not exist or is no longer available.</p>
        <ul className="mt-12 flex flex-wrap gap-4">
          <li><Link href="/" className="btn-light-solid">Home</Link></li>
          <li><Link href="/services/" className="btn-light">Services</Link></li>
          <li><Link href="/completed-projects/" className="btn-light">Completed projects</Link></li>
          <li><Link href="/contact/" className="btn-light">Contact</Link></li>
        </ul>
      </div>
    </section>
  );
}
