import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/content/slug";

/** FormData helpers — every admin mutation is validated server-side with these schemas. */
const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))
    .nullable();
const cuidOrNull = z
  .string()
  .trim()
  .transform((v) => (v.length ? v : null))
  .nullable()
  .refine((v) => v === null || /^[a-z0-9]{20,32}$/.test(v), "Invalid reference");
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .refine((v) => v === "" || SLUG_PATTERN.test(v), "Use lowercase letters, numbers and hyphens only");
const lines = z
  .string()
  .max(20000)
  .default("")
  .transform((v) =>
    v
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  );
const publish = z.enum(["DRAFT", "PUBLISHED"]);
const ids = z.array(z.string().regex(/^[a-z0-9]{20,32}$/)).max(200).default([]);
const year = z
  .string()
  .trim()
  .transform((v) => (v ? Number(v) : null))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 1900 && v <= 2100), "Enter a 4-digit year")
  .nullable();
// Admin date inputs are interpreted in the company's timezone (Europe/Istanbul, UTC+3, no DST).
const date = z
  .string()
  .trim()
  .default("")
  .transform((v) => {
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T00:00:00Z`);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)) return new Date(`${v.length === 16 ? `${v}:00` : v}+03:00`);
    return new Date(Number.NaN);
  })
  .refine((v) => v === null || !Number.isNaN(v.getTime()), "Invalid date")
  .nullable();

export const seoFields = {
  seoTitle: optStr(70),
  seoDescription: optStr(170),
  ogImageId: cuidOrNull,
  robotsIndex: bool,
};

export const projectSchema = z.object({
  title: str(160).min(2, "Title is required"),
  slug,
  categoryId: cuidOrNull,
  status: z.enum(["COMPLETED", "IN_PROGRESS"]),
  publishStatus: publish,
  shortDescription: str(600),
  content: z.string().max(100_000),
  coverImageId: cuidOrNull,
  heroImageId: cuidOrNull,
  gallery: ids,
  projectYear: year,
  completionDate: date,
  yachtName: optStr(120),
  yachtType: optStr(120),
  shipyard: optStr(120),
  location: optStr(120),
  length: optStr(40),
  beam: optStr(40),
  draft: optStr(40),
  grossTonnage: optStr(40),
  scopeItems: lines,
  technicalSpecs: lines.transform((rows) =>
    rows
      .map((r) => {
        const i = r.indexOf(":");
        return i > 0 ? { label: r.slice(0, i).trim(), value: r.slice(i + 1).trim() } : null;
      })
      .filter((x): x is { label: string; value: string } => Boolean(x && x.label && x.value)),
  ),
  serviceIds: ids,
  featured: bool,
  ...seoFields,
});

export const serviceSchema = z.object({
  title: str(160).min(2, "Title is required"),
  slug,
  shortDescription: str(600),
  content: z.string().max(100_000),
  highlights: lines,
  heroImageId: cuidOrNull,
  gallery: ids,
  featured: bool,
  publishStatus: publish,
  ...seoFields,
});

export const postSchema = z.object({
  title: str(200).min(2, "Title is required"),
  slug,
  excerpt: str(600),
  content: z.string().max(200_000),
  coverImageId: cuidOrNull,
  categoryId: cuidOrNull,
  authorName: optStr(120),
  publishStatus: publish,
  publishedAt: date,
  featured: bool,
  relatedProjectIds: ids,
  relatedServiceIds: ids,
  canonicalUrl: optStr(500).refine((v) => v === null || /^https:\/\/[^\s]+$/.test(v), "Canonical must be an absolute https URL"),
  ...seoFields,
});

export const categorySchema = z.object({
  name: str(120).min(2, "Name is required"),
  slug,
  description: str(1000),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const mediaUpdateSchema = z.object({
  alt: str(250),
  caption: str(300),
});

const url = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Must be an https URL");

export const settingsSchema = z.object({
  companyName: str(120).min(1),
  alternateName: str(300),
  tagline: str(200),
  description: str(600),
  foundingYear: year,
  logoId: cuidOrNull,
  logoLightId: cuidOrNull,
  logoDarkId: cuidOrNull,
  homeHeroImageId: cuidOrNull,
  defaultOgImageId: cuidOrNull,
  phone: str(40),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email().max(200)]),
  streetAddress: str(200),
  addressLocality: str(100),
  addressRegion: str(100),
  postalCode: str(20),
  addressCountry: str(2).toUpperCase(),
  openingHours: str(200),
  openingHoursSpec: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || /^(Mo|Tu|We|Th|Fr|Sa|Su)(-(Mo|Tu|We|Th|Fr|Sa|Su))? \d{2}:\d{2}-\d{2}:\d{2}$/.test(v), "Format: Mo-Fr 08:00-18:00"),
  googleMapsUrl: url,
  googleMapsEmbedUrl: url.refine((v) => v === "" || v.startsWith("https://www.google.com/maps/embed"), "Must be a Google Maps embed URL"),
  instagramUrl: url,
  linkedinUrl: url,
  youtubeUrl: url,
  whatsappUrl: url,
  footerText: str(300),
  defaultSeoTitle: str(70),
  defaultSeoDescription: str(170),
});

export const redirectSchema = z.object({
  fromPath: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/[^\s?#]*$/, "Must be a site path starting with /"),
  toPath: z
    .string()
    .trim()
    .max(500)
    .regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/, "Must be a path or https URL"),
  statusCode: z.coerce.number().refine((v) => [301, 302, 308].includes(v)),
});

/** Converts FormData to a plain object; repeated keys ending in [] become arrays. */
export function formToObject(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    if (typeof value !== "string") continue;
    if (key.startsWith("$ACTION")) continue;
    if (key.endsWith("[]")) {
      const k = key.slice(0, -2);
      const list = out[k];
      if (Array.isArray(list)) list.push(value);
      else out[k] = [value];
    } else {
      out[key] = value;
    }
  }
  return out;
}

export type FieldErrors = Record<string, string>;

export function zodErrors(error: z.ZodError): FieldErrors {
  const errs: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errs[key]) errs[key] = issue.message;
  }
  return errs;
}
