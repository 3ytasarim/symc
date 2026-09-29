import { getSiteSettings, telHref } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { routes } from "@/lib/seo/site";
import { HeaderBar, type NavItem, type Social } from "./HeaderBar";

export async function Header() {
  const [s, services] = await Promise.all([getSiteSettings(), getPublishedServices()]);
  const navLeft: NavItem[] = [
    { label: "Home", href: routes.home },
    { label: "About", href: routes.about },
    {
      label: "Services",
      href: routes.services,
      children: services.map((svc) => ({ label: svc.title, href: routes.service(svc.slug) })),
    },
  ];
  const navRight: NavItem[] = [
    { label: "Projects", href: routes.projects },
    { label: "News", href: routes.news },
    { label: "Contact", href: routes.contact },
  ];
  const socials = [
    s.instagramUrl && { kind: "instagram", href: s.instagramUrl, label: "Instagram" },
    s.linkedinUrl && { kind: "linkedin", href: s.linkedinUrl, label: "LinkedIn" },
    s.whatsappUrl && { kind: "whatsapp", href: s.whatsappUrl, label: "WhatsApp" },
  ].filter(Boolean) as Social[];

  return (
    <HeaderBar
      navLeft={navLeft}
      navRight={navRight}
      phone={s.phone ? { label: s.phone, href: telHref(s.phone) } : null}
      email={s.email || null}
      socials={socials}
      companyName={s.companyName}
    />
  );
}
