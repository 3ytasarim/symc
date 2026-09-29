"use client";

import { useActionState } from "react";
import type { MediaItem } from "@/app/admin/_actions/media";
import { saveSettingsAction } from "@/app/admin/_actions/site";
import { MediaPicker } from "./MediaPicker";
import { Field, FormMessage, Input, Panel, SubmitButton, Textarea, useKeepInputSubmit } from "./ui";

export type SettingsFormData = Record<
  | "companyName" | "alternateName" | "tagline" | "description" | "foundingYear" | "phone" | "email" | "streetAddress"
  | "addressLocality" | "addressRegion" | "postalCode" | "addressCountry" | "openingHours" | "openingHoursSpec"
  | "googleMapsUrl" | "googleMapsEmbedUrl" | "instagramUrl" | "linkedinUrl" | "youtubeUrl" | "whatsappUrl"
  | "footerText" | "defaultSeoTitle" | "defaultSeoDescription",
  string
> & {
  logo: MediaItem | null;
  logoLight: MediaItem | null;
  logoDark: MediaItem | null;
  homeHeroImage: MediaItem | null;
  defaultOgImage: MediaItem | null;
};

export function SettingsForm({ initial }: { initial: SettingsFormData }) {
  const [state, action, pending] = useActionState(saveSettingsAction, { ok: false });
  const onSubmit = useKeepInputSubmit(action);
  const e = state.errors ?? {};
  const text = (name: keyof SettingsFormData, label: string, hint?: string, type = "text") => (
    <Field label={label} name={name} hint={hint} error={e[name]}>
      <Input name={name} type={type} defaultValue={initial[name] as string} error={e[name]} />
    </Field>
  );
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <p className="rounded-[2px] border border-sky-200 bg-gold-50 px-4 py-3 text-[13px] text-sky-950">
        These values feed the header, footer, contact page and the Organization structured data. Enter only verified company information. API keys and other secrets never belong here.
      </p>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Company">
          {text("companyName", "Company name *")}
          {text("alternateName", "Alternate names", "Separate with |")}
          {text("tagline", "Tagline", "Homepage headline.")}
          <Field label="Description" name="description" error={e.description}>
            <Textarea name="description" defaultValue={initial.description} rows={3} />
          </Field>
          {text("foundingYear", "Founding year")}
          {text("footerText", "Footer text")}
        </Panel>
        <Panel title="Contact">
          {text("phone", "Phone")}
          {text("email", "E-mail", undefined, "email")}
          {text("streetAddress", "Street address")}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("addressLocality", "District / city")}
            {text("addressRegion", "Province")}
            {text("postalCode", "Postal code")}
            {text("addressCountry", "Country code", "ISO code, e.g. TR")}
          </div>
          {text("openingHours", "Opening hours (display)")}
          {text("openingHoursSpec", "Opening hours (structured)", "Format: Mo-Fr 08:00-18:00")}
        </Panel>
        <Panel title="Maps & social">
          {text("googleMapsUrl", "Google Maps link")}
          {text("googleMapsEmbedUrl", "Google Maps embed URL")}
          {text("instagramUrl", "Instagram")}
          {text("linkedinUrl", "LinkedIn")}
          {text("youtubeUrl", "YouTube")}
          {text("whatsappUrl", "WhatsApp link", "e.g. https://wa.me/90…")}
        </Panel>
        <Panel title="Default SEO">
          {text("defaultSeoTitle", "Homepage title")}
          <Field label="Homepage meta description" name="defaultSeoDescription" error={e.defaultSeoDescription}>
            <Textarea name="defaultSeoDescription" defaultValue={initial.defaultSeoDescription} rows={3} maxLength={170} />
          </Field>
        </Panel>
        <Panel title="Brand images" description="The bundled SYMC logo is used when these are empty.">
          <MediaPicker name="logoId" label="Logo (structured data)" initial={initial.logo} folder="brand" />
          <MediaPicker name="logoLightId" label="Light logo" initial={initial.logoLight} folder="brand" />
          <MediaPicker name="logoDarkId" label="Dark logo" initial={initial.logoDark} folder="brand" />
        </Panel>
        <Panel title="Homepage & sharing">
          <MediaPicker name="homeHeroImageId" label="Homepage hero image" initial={initial.homeHeroImage} folder="site" hint="The LCP image — use a large (2400px+) landscape photograph." />
          <MediaPicker name="defaultOgImageId" label="Default social share image" initial={initial.defaultOgImage} folder="site" />
        </Panel>
      </div>
      <div className="sticky bottom-0 flex items-center gap-4 border-t border-[#dde2e6] bg-[#f3f5f6] py-4">
        <SubmitButton pending={pending}>Save settings</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
