import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toMediaItem } from "@/lib/admin/media-items";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireRole("ADMIN");
  const s = await prisma.siteSetting.findUnique({
    where: { id: "site" },
    include: { logo: true, logoLight: true, logoDark: true, homeHeroImage: true, defaultOgImage: true },
  });
  const v = (x: string | null | undefined) => x ?? "";
  return (
    <>
      <PageHeader title="Site settings" />
      <SettingsForm
        initial={{
          companyName: v(s?.companyName) || "SYMC",
          alternateName: v(s?.alternateName),
          tagline: v(s?.tagline),
          description: v(s?.description),
          foundingYear: s?.foundingYear ? String(s.foundingYear) : "",
          phone: v(s?.phone),
          email: v(s?.email),
          streetAddress: v(s?.streetAddress),
          addressLocality: v(s?.addressLocality),
          addressRegion: v(s?.addressRegion),
          postalCode: v(s?.postalCode),
          addressCountry: v(s?.addressCountry),
          openingHours: v(s?.openingHours),
          openingHoursSpec: v(s?.openingHoursSpec),
          googleMapsUrl: v(s?.googleMapsUrl),
          googleMapsEmbedUrl: v(s?.googleMapsEmbedUrl),
          instagramUrl: v(s?.instagramUrl),
          linkedinUrl: v(s?.linkedinUrl),
          youtubeUrl: v(s?.youtubeUrl),
          whatsappUrl: v(s?.whatsappUrl),
          footerText: v(s?.footerText),
          defaultSeoTitle: v(s?.defaultSeoTitle),
          defaultSeoDescription: v(s?.defaultSeoDescription),
          logo: toMediaItem(s?.logo),
          logoLight: toMediaItem(s?.logoLight),
          logoDark: toMediaItem(s?.logoDark),
          homeHeroImage: toMediaItem(s?.homeHeroImage),
          defaultOgImage: toMediaItem(s?.defaultOgImage),
        }}
      />
    </>
  );
}
