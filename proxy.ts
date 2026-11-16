import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check for the admin area (the file convention formerly called
 * middleware). It only looks for the session cookie and redirects visitors
 * without one to the login page; it never touches the database. Real
 * authorisation happens in every admin page, server action and route
 * handler (lib/auth/dal.ts), so this file is a convenience, not a guard.
 */
const SESSION_COOKIES = ["__Host-bfl_admin", "bfl_admin"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasCookie = SESSION_COOKIES.some((name) => request.cookies.has(name));

  let response: NextResponse;
  if (!isLogin && !hasCookie) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
