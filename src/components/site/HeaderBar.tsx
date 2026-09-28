"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { SailMark } from "./Icons";

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

type Props = {
  nav: NavItem[];
  phone: { label: string; href: string } | null;
  email: string | null;
  companyName: string;
};

export function HeaderBar({ nav, phone, email, companyName }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled && !open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500 ${
        solid ? "border-b border-line bg-paper text-ink" : "border-b border-transparent bg-transparent text-white"
      }`}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6 lg:h-[88px]">
        <Link href="/" className="relative z-10 block h-8 w-[128px] shrink-0 lg:h-9 lg:w-[144px]" aria-label={`${companyName} — home`}>
          <Image
            src="/brand/symc-logo-light-horizontal.png"
            alt=""
            width={959}
            height={240}
            priority
            sizes="144px"
            className={`absolute inset-0 h-full w-auto transition-opacity duration-500 ${solid ? "opacity-0" : "opacity-100"}`}
          />
          <Image
            src="/brand/symc-logo-horizontal.png"
            alt=""
            width={959}
            height={240}
            loading="eager"
            sizes="144px"
            className={`absolute inset-0 h-full w-auto transition-opacity duration-500 ${solid ? "opacity-100" : "opacity-0"}`}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`relative py-3 text-[13px] font-medium tracking-[0.06em] transition-opacity hover:opacity-100 ${
                    isActive(item.href) ? "opacity-100" : "opacity-80"
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ${
                      isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
                {item.children?.length ? (
                  <div className="invisible absolute left-1/2 top-full z-10 w-[340px] -translate-x-1/2 pt-5 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="border border-line bg-paper p-2 text-ink shadow-[0_24px_60px_-30px_rgba(12,18,23,0.45)]">
                      {item.children.map((child, i) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex items-baseline gap-4 px-4 py-3 text-[14px] transition-colors hover:bg-bone"
                          >
                            <span className="font-mono text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          {phone ? (
            <a href={phone.href} className="font-mono text-[12px] tracking-[0.08em] opacity-80 hover:opacity-100">
              {phone.label}
            </a>
          ) : null}
          <Link href="/contact/" className={solid ? "btn-solid h-11" : "btn-light h-11"}>
            Enquire
          </Link>
        </div>

        <button
          type="button"
          className="relative z-10 flex h-11 items-center gap-3 lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="eyebrow">{open ? "Close" : "Menu"}</span>
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {/* Mobile navigation: rendered in the server HTML (real links), revealed by the button. */}
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-0 z-0 overflow-y-auto bg-deep text-white lg:hidden"
      >
        <nav aria-label="Mobile" className="shell flex min-h-full flex-col pb-10 pt-28">
          <ul className="border-t border-white/10">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-white/10">
                <Link href={item.href} className="flex items-baseline justify-between py-5">
                  <span className="font-display text-[2.4rem] leading-none">{item.label}</span>
                  <span className="font-mono text-[11px] text-white/60">{String(i + 1).padStart(2, "0")}</span>
                </Link>
                {item.children?.length ? (
                  <ul className="-mt-1 pb-5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} className="flex items-center gap-3 py-2 text-[15px] text-white/75">
                          <SailMark className="h-2 w-2" />
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-2 pt-10 font-mono text-[13px] text-white/75">
            {phone ? (
              <a href={phone.href} className="block">
                {phone.label}
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="block">
                {email}
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
