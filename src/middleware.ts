import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Edge gate for /admin: requests without a session cookie are sent to the
 * login page. This is only a fast pre-check — the session itself is validated
 * against the database in the admin layout and in every server action.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login/" || pathname === "/admin/login";
  const response = isLogin || request.cookies.has(SESSION_COOKIE)
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/admin/login/", request.url));
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
