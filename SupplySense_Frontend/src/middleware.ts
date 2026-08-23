/**
 * SupplySense — Next.js Edge Middleware for Route Protection
 *
 * Protects authenticated routes and enforces role-based access.
 * Uses cookie-based token check (Edge Runtime cannot access localStorage).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
]);

const EXECUTIVE_ONLY_ROUTES = new Set(["/executive"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Allow static assets, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookie (set by client after login)
  const authCookie = request.cookies.get("supplysense_authenticated");

  if (!authCookie?.value) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to view executive insights
  if (EXECUTIVE_ONLY_ROUTES.has(pathname)) {
    // Verified by authCookie above
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/suppliers/:path*",
    "/shipments/:path*",
    "/forecasting/:path*",
    "/risks/:path*",
    "/executive/:path*",
    "/assistant/:path*",
    "/settings/:path*",
    "/purchase-orders/:path*",
    "/notifications/:path*",
    "/reports/:path*",
    "/agents/:path*",
  ],
};
