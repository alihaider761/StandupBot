/**
 * Next.js 16 proxy (replaces middleware.ts).
 * Protects /dashboard routes by checking for the NextAuth session cookie.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // NextAuth v4 sets a session cookie named "next-auth.session-token"
    // (or "__Secure-next-auth.session-token" in production over HTTPS).
    const sessionCookie =
      request.cookies.get("next-auth.session-token") ??
      request.cookies.get("__Secure-next-auth.session-token");

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
