"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { burnPasswordCheck, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { createSession, destroySession, requireAdmin } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/admin/common";

const MAX_FAILED = 8;
const LOCK_MS = 15 * 60 * 1000;
const GENERIC = "Invalid e-mail or password.";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export async function loginAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, message: GENERIC };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  if (!rateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000).ok || !rateLimit(`login:email:${email}`, 10, 15 * 60 * 1000).ok) {
    return { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    await burnPasswordCheck(password);
    return { ok: false, message: GENERIC };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, message: "This account is temporarily locked after repeated failed attempts. Try again later." };
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failed = user.failedLoginCount + 1;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLoginCount: failed, lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MS) : null },
    });
    return { ok: false, message: GENERIC };
  }
  await prisma.adminUser.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createSession(user.id);
  redirect("/admin/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login/");
}

const passwordSchema = z
  .object({
    current: z.string().min(1).max(200),
    next: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function changePasswordAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse({ current: fd.get("current"), next: fd.get("next"), confirm: fd.get("confirm") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return { ok: false, message: "Current password is incorrect." };
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  // sign out every other session
  await prisma.adminSession.deleteMany({ where: { userId: admin.id } });
  await createSession(admin.id);
  return { ok: true, message: "Password updated. Other sessions were signed out." };
}
