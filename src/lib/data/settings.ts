import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { toSiteImage, type SiteImage } from "./media";

export type SiteSettings = {
  companyName: string;
  alternateName: string;
  tagline: string;
  description: string;
  foundingYear: number | null;
  logo: SiteImage | null;
  logoLight: SiteImage | null;
  logoDark: SiteImage | null;
  homeHeroImage: SiteImage | null;
  defaultOgImage: SiteImage | null;
  phone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  openingHours: string;
  openingHoursSpec: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  footerText: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  updatedAt: Date;
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const s = await prisma.siteSetting.findUnique({
    where: { id: "site" },
    include: { logo: true, logoLight: true, logoDark: true, homeHeroImage: true, defaultOgImage: true },
  });
  if (!s) {
    // Minimal safe fallback before the first seed — never invents contact data.
    return {
      companyName: "SYMC", alternateName: "", tagline: "", description: "", foundingYear: null,
      logo: null, logoLight: null, logoDark: null, homeHeroImage: null, defaultOgImage: null,
      phone: "", email: "", streetAddress: "", addressLocality: "", addressRegion: "", postalCode: "",
      addressCountry: "", openingHours: "", openingHoursSpec: "", googleMapsUrl: "", googleMapsEmbedUrl: "",
      instagramUrl: "", linkedinUrl: "", youtubeUrl: "", whatsappUrl: "", footerText: "",
      defaultSeoTitle: "", defaultSeoDescription: "", updatedAt: new Date(0),
    };
  }
  return {
    ...s,
    logo: toSiteImage(s.logo, s.companyName),
    logoLight: toSiteImage(s.logoLight, s.companyName),
    logoDark: toSiteImage(s.logoDark, s.companyName),
    homeHeroImage: toSiteImage(s.homeHeroImage),
    defaultOgImage: toSiteImage(s.defaultOgImage),
  };
});

export function formatAddress(s: Pick<SiteSettings, "streetAddress" | "addressLocality" | "addressRegion" | "postalCode">): string {
  const cityLine = [s.postalCode, [s.addressLocality, s.addressRegion].filter(Boolean).join("/")].filter(Boolean).join(" ");
  return [s.streetAddress, cityLine].filter(Boolean).join(", ");
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
