import { NextResponse, type NextRequest } from "next/server";
import { getAuth0, isAuthConfigured } from "./lib/auth0";

import { localAuthEnabled } from "./lib/local-auth";

export async function proxy(request: NextRequest) {
  if (localAuthEnabled()) {
    if (request.nextUrl.pathname.startsWith("/auth/")) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  if (!isAuthConfigured()) {
    if (request.nextUrl.pathname.startsWith("/auth/")) {
      return new NextResponse("Sign-in is not configured yet.", {
        status: 503, headers: { "Cache-Control": "no-store" },
      });
    }
    return NextResponse.next();
  }
  // Preserve the SDK response and its cookies/headers for rolling sessions.
  return getAuth0().middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
