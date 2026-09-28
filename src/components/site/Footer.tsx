import Image from "next/image";
import Link from "next/link";
import { formatAddress, getSiteSettings, telHref } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { getPublishedPosts } from "@/lib/data/posts";
import { routes } from "@/lib/seo/site";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "./Icons";

export async function Footer() {
  const [s, services, posts] = await Promise.all([getSiteSettings(), getPublishedServices(), getPublishedPosts(1)]);
  const address = formatAddress(s);
  const socials = [
    s.instagramUrl && { href: s.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    s.linkedinUrl && { href: s.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
    s.whatsappUrl && { href: s.whatsappUrl, label: "WhatsApp", Icon: WhatsappIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <footer className="on-dark bg-ink text-white">
      <div className="shell grid gap-14 py-20 md:grid-cols-12 md:gap-8 lg:py-24">
        <div className="md:col-span-4">
          <Image src="/brand/symc-logo-light.png" alt={`${s.companyName} — Superyacht Management & Consultancy`} width={1200} height={1075} sizes="180px" className="h-auto w-[150px]" loading="lazy" />
          {s.footerText ? <p className="mt-8 max-w-xs text-[14px] leading-relaxed text-white/60">{s.footerText}</p> : null}
        </div>

        <nav aria-label="Services" className="md:col-span-3">
          <h2 className="eyebrow text-white/60">Services</h2>
          <ul className="mt-6 space-y-3 text-[15px]">
            {services.map((svc) => (
              <li key={svc.slug}>
                <Link href={routes.service(svc.slug)} className="text-white/85 hover:text-white">
                  {svc.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <h2 className="eyebrow text-white/60">Company</h2>
          <ul className="mt-6 space-y-3 text-[15px]">
            <li><Link href={routes.about} className="text-white/85 hover:text-white">About SYMC</Link></li>
            <li><Link href={routes.projects} className="text-white/85 hover:text-white">Completed Projects</Link></li>
            {posts.length ? <li><Link href={routes.news} className="text-white/85 hover:text-white">News</Link></li> : null}
            <li><Link href={routes.contact} className="text-white/85 hover:text-white">Contact</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="eyebrow text-white/60">Contact</h2>
          <address className="mt-6 space-y-3 text-[15px] not-italic leading-relaxed text-white/85">
            {address ? <p>{address}</p> : null}
            {s.phone ? <p><a href={telHref(s.phone)} className="hover:text-white">{s.phone}</a></p> : null}
            {s.email ? <p><a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a></p> : null}
            {s.openingHours ? <p className="text-white/60">{s.openingHours}</p> : null}
          </address>
          {socials.length ? (
            <ul className="mt-8 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.companyName} on ${label}`}
                    className="flex h-11 w-11 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} SYMC YACHT. All rights reserved.</p>
          <p>Superyacht Management &amp; Consultancy{s.addressLocality ? ` · ${[s.addressLocality, s.addressRegion].filter(Boolean).join(", ")}` : ""}</p>
        </div>
      </div>
    </footer>
  );
}
