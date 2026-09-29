import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { formatAddress, getSiteSettings, telHref } from "@/lib/data/settings";
import { pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/site";

export const revalidate = 3600;

function describe(s: Awaited<ReturnType<typeof getSiteSettings>>): string {
  const reach = [s.phone && `phone ${s.phone}`, s.email].filter(Boolean).join(", ");
  const where = [s.addressLocality, s.addressRegion].filter(Boolean).join(", ");
  return `Contact ${s.companyName} Superyacht Management & Consultancy${where ? ` in ${where}` : ""}${reach ? ` — ${reach}` : ""}. ${s.openingHours}`.trim();
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "Contact", description: describe(await getSiteSettings()), path: routes.contact });
}

export default async function ContactPage() {
  const s = await getSiteSettings();
  const address = formatAddress(s);
  const DESCRIPTION = describe(s);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Contact", path: routes.contact },
  ];
  const jsonLd = await pageGraph(s, {
    path: routes.contact,
    type: "ContactPage",
    name: "Contact SYMC",
    description: DESCRIPTION,
    crumbs,
    aboutOrganization: true,
    dateModified: s.updatedAt,
  });

  const details = [
    address && { Icon: MapPin, label: "Address", value: address, href: s.googleMapsUrl || undefined },
    s.phone && { Icon: Phone, label: "Phone", value: s.phone, href: telHref(s.phone) },
    s.email && { Icon: Mail, label: "E-mail", value: s.email, href: `mailto:${s.email}` },
    s.openingHours && { Icon: Clock, label: "Opening hours", value: s.openingHours },
    s.whatsappUrl && { Icon: MessageCircle, label: "WhatsApp", value: s.phone || "Message us", href: s.whatsappUrl },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title="Contact"
        eyebrow="Get in touch"
        intro="Whether maintenance, service, refit or a new build — we are available 24/7."
        crumbs={crumbs}
      />

      <section className="bg-white py-16">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="display-3 mb-8 text-neutral-900">Contact information</h2>
            <ul className="mb-10 space-y-6">
              {details.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <Icon className="h-5 w-5 text-gold-ink" />
                  </span>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="font-medium leading-relaxed text-neutral-800 transition-colors hover:text-gold-ink"
                        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium leading-relaxed text-neutral-800">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {s.googleMapsEmbedUrl ? (
              <div className="h-72 overflow-hidden rounded-lg shadow-md">
                <iframe
                  src={s.googleMapsEmbedUrl}
                  title={`Map — ${s.companyName}, ${address}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-full w-full border-0"
                />
              </div>
            ) : null}
          </div>

          <div>
            <h2 className="display-3 mb-8 text-neutral-900">Send us a message</h2>
            <div className="rounded-lg border border-neutral-100 bg-bone p-6 md:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
