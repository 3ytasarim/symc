import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { Eyebrow } from "@/components/site/Eyebrow";
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
    address && { label: "Address", value: address, href: s.googleMapsUrl || undefined },
    s.phone && { label: "Phone", value: s.phone, href: telHref(s.phone) },
    s.email && { label: "E-mail", value: s.email, href: `mailto:${s.email}` },
    s.openingHours && { label: "Opening hours", value: s.openingHours },
    s.whatsappUrl && { label: "WhatsApp", value: s.phone || "Message us", href: s.whatsappUrl },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero size="band" title="Contact" eyebrow="SYMC — Tuzla, İstanbul" intro="Whether maintenance, service, refit or a new build — we are available 24/7." crumbs={crumbs} />

      <section className="shell py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow index="01">Contact details</Eyebrow>
            <dl className="mt-8 border-t border-line">
              {details.map((d) => (
                <div key={d.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[9rem_1fr]">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute sm:pt-1">{d.label}</dt>
                  <dd className="text-[1.0625rem]">
                    {d.href ? (
                      <a href={d.href} className="hover:text-sea" {...(d.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Eyebrow index="02">Send a message</Eyebrow>
            <h2 className="display-3 mb-10 mt-6">How can we help?</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {s.googleMapsEmbedUrl ? (
        <section aria-label="Location map" className="border-t border-line">
          <iframe
            src={s.googleMapsEmbedUrl}
            title={`Map — ${s.companyName}, ${address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[420px] w-full grayscale-[60%] md:h-[520px]"
          />
        </section>
      ) : null}
    </>
  );
}
