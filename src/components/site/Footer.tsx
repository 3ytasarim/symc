import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { formatAddress, getSiteSettings, telHref } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { routes } from "@/lib/seo/site";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "./Icons";

function Column({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <nav aria-labelledby={id} className="text-center sm:text-left">
      <h2 id={id} className="text-lg font-bold text-neutral-900">
        {title}
      </h2>
      <ul className="mt-6 space-y-4 text-sm">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className = "text-neutral-600 transition-colors hover:text-gold-ink";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}

/**
 * Four-column footer in the style of 21st.dev "Footer Column" (MVPBlocks):
 * light-grey panel with rounded top, brand column (logo, text, socials) and
 * four link columns, divider and copyright row. Light grey (#F4F4F4, the
 * section colour of symc.com.tr) so the original transparent logo sits on it
 * without a plate. On pages ending with the CTA band the rounded top overlaps
 * the band (globals.css).
 */
export async function Footer() {
  const [s, services] = await Promise.all([getSiteSettings(), getPublishedServices()]);
  const address = formatAddress(s);
  const socials = [
    s.instagramUrl && { href: s.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    s.linkedinUrl && { href: s.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
    s.whatsappUrl && { href: s.whatsappUrl, label: "WhatsApp", Icon: WhatsappIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <footer className="site-footer relative z-10 w-full rounded-t-[2rem] border-t-2 border-gold bg-bone">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {/* Brand */}
          <div>
            <Link href="/" aria-label={`${s.companyName} — home`} className="mx-auto block w-fit sm:mx-0">
              <Image
                src="/brand/symc-logo.png"
                alt=""
                width={1200}
                height={1075}
                sizes="(min-width: 768px) 170px, 145px"
                quality={80}
                className="h-32 w-auto md:h-[9.5rem]"
                loading="lazy"
              />
            </Link>
            {s.footerText ? (
              <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-neutral-600 sm:mx-0 sm:max-w-xs sm:text-left">{s.footerText}</p>
            ) : null}
            {socials.length ? (
              <ul className="mt-6 flex justify-center gap-3 sm:justify-start">
                {socials.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.companyName} on ${label}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-gold-ink transition-colors hover:bg-gold hover:text-ink"
                    >
                      <Icon className="h-6 w-6" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.5fr)] lg:col-span-2">
            <Column id="footer-about" title="About SYMC">
              <FooterLink href={routes.home}>Home</FooterLink>
              <FooterLink href={routes.about}>About Us</FooterLink>
              <FooterLink href={routes.projects}>Completed Projects</FooterLink>
              <FooterLink href={routes.news}>News</FooterLink>
            </Column>

            <Column id="footer-services" title="Our Services">
              {services.map((svc) => (
                <FooterLink key={svc.slug} href={routes.service(svc.slug)}>
                  {svc.title}
                </FooterLink>
              ))}
            </Column>

            <Column id="footer-help" title="Helpful Links">
              <FooterLink href={routes.services}>All Services</FooterLink>
              <FooterLink href={routes.contact}>Contact</FooterLink>
              {s.googleMapsUrl ? (
                <FooterLink href={s.googleMapsUrl} external>
                  Directions
                </FooterLink>
              ) : null}
            </Column>

            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-neutral-900">Contact Us</h2>
              <address className="mt-6 not-italic">
                <ul className="space-y-4 text-sm text-neutral-600">
                  {s.email ? (
                    <li className="flex items-center justify-center gap-2 sm:justify-start">
                      <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-ink" />
                      <a href={`mailto:${s.email}`} className="break-all transition-colors hover:text-gold-ink">
                        {s.email}
                      </a>
                    </li>
                  ) : null}
                  {s.phone ? (
                    <li className="flex items-center justify-center gap-2 sm:justify-start">
                      <Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-ink" />
                      <a href={telHref(s.phone)} className="transition-colors hover:text-gold-ink">
                        {s.phone}
                      </a>
                    </li>
                  ) : null}
                  {address ? (
                    <li className="flex items-start justify-center gap-2 sm:justify-start">
                      <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink" />
                      <span className="leading-relaxed">{address}</span>
                    </li>
                  ) : null}
                  {s.openingHours ? (
                    <li className="flex items-start justify-center gap-2 sm:justify-start">
                      <Clock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink" />
                      <span className="leading-relaxed">{s.openingHours}</span>
                    </li>
                  ) : null}
                </ul>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-300 pt-6">
          <div className="flex flex-col items-center justify-between gap-2 text-sm text-neutral-600 sm:flex-row">
            <p>© {new Date().getFullYear()} SYMC YACHT — Superyacht Management &amp; Consultancy</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
