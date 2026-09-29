import { MapPin, Phone } from "lucide-react";
import { getSiteSettings, telHref } from "@/lib/data/settings";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "./Icons";

/** Fixed quick-contact rail on the right edge (Norm Yacht pattern). Only real, configured channels are shown. */
export async function FloatingCta() {
  const s = await getSiteSettings();
  const items = [
    s.phone && { href: telHref(s.phone), label: `Call ${s.companyName}`, Icon: Phone, hover: "hover:bg-gold", external: false },
    s.whatsappUrl && { href: s.whatsappUrl, label: "WhatsApp", Icon: WhatsappIcon, hover: "hover:bg-[#25D366]", external: true },
    s.linkedinUrl && { href: s.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon, hover: "hover:bg-[#0077B5]", external: true },
    s.instagramUrl && { href: s.instagramUrl, label: "Instagram", Icon: InstagramIcon, hover: "hover:bg-[#E4405F]", external: true },
    s.googleMapsUrl && { href: s.googleMapsUrl, label: "Location on Google Maps", Icon: MapPin, hover: "hover:bg-gold", external: true },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; hover: string; external: boolean }[];

  if (!items.length) return null;
  return (
    <nav aria-label="Quick contact" className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 overflow-hidden rounded-l-xl shadow-2xl md:block">
      <ul>
        {items.map(({ href, label, Icon, hover, external }) => (
          <li key={href}>
            <a
              href={href}
              aria-label={label}
              title={label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`on-dark flex h-12 w-12 items-center justify-center bg-deep text-white transition-colors ${hover}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
