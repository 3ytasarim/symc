import { getSiteSettings, telHref } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { getPublishedPosts } from "@/lib/data/posts";
import { routes } from "@/lib/seo/site";
import { HeaderBar, type NavItem } from "./HeaderBar";

export async function Header() {
  const [settings, services, posts] = await Promise.all([getSiteSettings(), getPublishedServices(), getPublishedPosts(1)]);
  const nav: NavItem[] = [
    { label: "About", href: routes.about },
    {
      label: "Services",
      href: routes.services,
      children: services.map((s) => ({ label: s.title, href: routes.service(s.slug) })),
    },
    { label: "Projects", href: routes.projects },
    // The news section is only linked once it has published articles.
    ...(posts.length ? [{ label: "News", href: routes.news }] : []),
    { label: "Contact", href: routes.contact },
  ];
  return (
    <HeaderBar
      nav={nav}
      phone={settings.phone ? { label: settings.phone, href: telHref(settings.phone) } : null}
      email={settings.email || null}
      companyName={settings.companyName}
    />
  );
}
