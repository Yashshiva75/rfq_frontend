import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const userRole = (
    request.cookies.get("user_role")?.value || ""
  ).toLowerCase();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAdminOnlyPage = pathname.startsWith("/admin");

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (isProtectedPage && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated non-admin users trying to access /admin -> redirect to /dashboard
  if (isAdminOnlyPage && authToken) {
    if (userRole !== "admin") {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 3. Already authenticated users visiting /login or /signup -> redirect to /dashboard
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
