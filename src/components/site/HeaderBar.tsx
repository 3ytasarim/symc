"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "./Icons";

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };
export type Social = { kind: "instagram" | "linkedin" | "whatsapp"; href: string; label: string };

type Props = {
  navLeft: NavItem[];
  navRight: NavItem[];
  phone: { label: string; href: string } | null;
  email: string | null;
  socials: Social[];
  companyName: string;
};

const socialIcon = { instagram: InstagramIcon, linkedin: LinkedinIcon, whatsapp: WhatsappIcon } as const;

export function HeaderBar({ navLeft, navRight, phone, email, socials, companyName }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    `nav-link inline-flex items-center gap-1 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
      isActive(href) ? "text-gold-ink" : "text-neutral-700 hover:text-gold-ink"
    }`;

  const renderDesktop = (items: NavItem[]) =>
    items.map((item) => (
      <li key={item.href} className="group relative">
        <Link href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>
          {item.label}
          {item.children?.length ? <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" /> : null}
        </Link>
        {item.children?.length ? (
          <div className="invisible absolute left-0 top-full z-50 w-72 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul className="rounded-md border border-neutral-100 bg-white py-2 shadow-xl">
              {item.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gold-50 hover:text-gold-ink ${
                      pathname.startsWith(child.href) ? "text-gold-ink" : "text-neutral-700"
                    }`}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </li>
    ));

  return (
    <>
      {/* Top bar (gold, as on symc.com.tr) */}
      <div className="hidden bg-gold text-sm font-bold text-ink md:block">
        <div className="shell flex items-center justify-between py-2">
          <div className="flex items-center gap-5">
            {phone ? (
              <a href={phone.href} className="flex items-center gap-1.5 transition-opacity hover:opacity-70">
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                <span>{phone.label}</span>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 transition-opacity hover:opacity-70">
                <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                <span>{email}</span>
              </a>
            ) : null}
          </div>
          {socials.length ? (
            <ul className="flex items-center gap-3">
              {socials.map((s) => {
                const Icon = socialIcon[s.kind];
                return (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${companyName} on ${s.label}`}
                      className="flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-70"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Main navigation */}
      <header className={`sticky top-0 z-50 border-b border-neutral-100 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="shell">
          <div className="flex h-20 items-center justify-between gap-6 lg:h-24">
            <nav aria-label="Main" className="hidden flex-1 lg:block">
              <ul className="flex items-center gap-8">{renderDesktop(navLeft)}</ul>
            </nav>

            <Link href="/" className="block shrink-0" aria-label={`${companyName} — home`}>
              <Image
                src="/brand/symc-logo.png"
                alt=""
                width={1200}
                height={1075}
                priority
                sizes="96px"
                className="h-16 w-auto lg:h-20"
              />
            </Link>

            <nav aria-label="Secondary" className="hidden flex-1 lg:block">
              <ul className="flex items-center justify-end gap-8">{renderDesktop(navRight)}</ul>
            </nav>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center text-neutral-700 lg:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation: rendered in the server HTML (real links), revealed by the button. */}
        <div id={panelId} hidden={!open} className="border-t border-neutral-100 bg-white shadow-lg lg:hidden">
          <nav aria-label="Mobile" className="shell max-h-[calc(100svh-5rem)] overflow-y-auto py-4">
            <ul className="space-y-1">
              {[...navLeft, ...navRight].map((item) =>
                item.children?.length ? (
                  <li key={item.href}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-gold-50 hover:text-gold-ink"
                      aria-expanded={mobileServicesOpen}
                      onClick={() => setMobileServicesOpen((v) => !v)}
                    >
                      {item.label}
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    <ul hidden={!mobileServicesOpen} className="ml-4 mt-1 space-y-1">
                      <li>
                        <Link href={item.href} className="block px-3 py-2 text-sm text-neutral-600 hover:text-gold-ink">
                          All services
                        </Link>
                      </li>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className="block px-3 py-2 text-sm text-neutral-600 hover:text-gold-ink">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`block rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                        isActive(item.href) ? "bg-gold-50 text-gold-ink" : "text-neutral-700 hover:bg-gold-50 hover:text-gold-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            {phone || email ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
                {phone ? (
                  <a href={phone.href} className="flex items-center gap-2 hover:text-gold-ink">
                    <Phone aria-hidden="true" className="h-4 w-4" /> {phone.label}
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-gold-ink">
                    <Mail aria-hidden="true" className="h-4 w-4" /> {email}
                  </a>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>
      </header>
    </>
  );
}
