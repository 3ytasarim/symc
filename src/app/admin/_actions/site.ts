"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, requireRole } from "@/lib/auth/session";
import { revalidateSite, type ActionResult } from "@/lib/admin/common";
import { canonicalPath } from "@/lib/seo/site";
import { formToObject, redirectSchema, settingsSchema, zodErrors } from "@/lib/validation/admin";

export async function saveSettingsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = settingsSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: zodErrors(parsed.error) };
  await prisma.siteSetting.upsert({ where: { id: "site" }, create: { id: "site", ...parsed.data }, update: parsed.data });
  revalidateSite();
  return { ok: true, message: "Settings saved." };
}

export async function saveRedirectAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = redirectSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: zodErrors(parsed.error) };
  const fromPath = canonicalPath(parsed.data.fromPath);
  const toPath = parsed.data.toPath.startsWith("/") ? canonicalPath(parsed.data.toPath) : parsed.data.toPath;
  if (fromPath === toPath) return { ok: false, errors: { toPath: "Source and target are the same" } };
  if (await prisma.redirect.count({ where: { fromPath: toPath } })) return { ok: false, errors: { toPath: "Target is itself redirected — point to the final URL" } };
  await prisma.redirect.upsert({
    where: { fromPath },
    create: { fromPath, toPath, statusCode: parsed.data.statusCode, source: "MANUAL" },
    update: { toPath, statusCode: parsed.data.statusCode, source: "MANUAL" },
  });
  revalidateSite();
  return { ok: true, message: "Redirect saved." };
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.redirect.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}

export async function setMessageReadAction(id: string, isRead: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  return { ok: true };
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } }).catch(() => null);
  return { ok: true };
}
