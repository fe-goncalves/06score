import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Links antigos / partidas → rota atual /jogos
  const legacyMatch = pathname.match(/^\/partidas\/([^/]+)\/?$/);
  if (legacyMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/jogos/${legacyMatch[1]}`;
    return NextResponse.redirect(url, 308);
  }

  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    // Cloudflare preview hosts — use NEXT_PUBLIC_ORG_SLUG, not worker name as org
    hostname.endsWith(".workers.dev") ||
    hostname.endsWith(".pages.dev")
  ) {
    return NextResponse.next();
  }

  const parts = hostname.split(".");

  if (parts.length < 3) {
    return NextResponse.next();
  }

  const subdomain = parts[0];

  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-org-slug", subdomain);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
