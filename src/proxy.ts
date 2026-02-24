import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Simple cookie check - don't call Supabase APIs in middleware
  // This prevents redirect loops during OAuth callback flow
  // The actual session validation happens in the page/API routes
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  );

  // Protect dashboard and checkout routes
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login page
  if (pathname === "/auth/login" && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/checkout/:path*", "/auth/login"],
};
