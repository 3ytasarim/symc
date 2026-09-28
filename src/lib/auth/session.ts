import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_PATH, SESSION_TTL_MS } from "./constants";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 250) ?? null;
  await prisma.adminSession.create({ data: { tokenHash: hashToken(token), userId, expiresAt, userAgent } });
  // opportunistic cleanup of expired sessions
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SESSION_COOKIE_PATH,
    expires: expiresAt,
  });
}

export type CurrentAdmin = { id: string; email: string; name: string; role: "ADMIN" | "EDITOR" };

/** Validates the session cookie against the database (server-side, per request). */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
  const { id, email, name, role } = session.user;
  return { id, email, name, role };
});

/** Use at the top of every admin page, layout and server action. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login/");
  return admin;
}

export async function requireRole(role: "ADMIN"): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== role) redirect("/admin/");
  return admin;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH });
}
