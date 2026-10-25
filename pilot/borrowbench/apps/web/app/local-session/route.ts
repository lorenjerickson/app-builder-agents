import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { localAccounts, localAuthEnabled, localCookie } from "@/lib/local-auth";

export async function POST(request: NextRequest) {
  if (!localAuthEnabled()) return new NextResponse(null, { status: 404 });
  const base = new URL(process.env.APP_BASE_URL!);
  if (request.headers.get("origin") !== base.origin) return new NextResponse(null, { status: 403 });
  const account = (await request.formData()).get("account");
  if (typeof account !== "string" || (account !== "logout" && !Object.hasOwn(localAccounts, account))) {
    return new NextResponse(null, { status: 400 });
  }
  const response = NextResponse.redirect(new URL("/", base), 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(localCookie(), account === "logout" ? "" : account, {
    httpOnly: true, secure: base.protocol === "https:", sameSite: "strict", path: "/", maxAge: account === "logout" ? 0 : 28800,
  });
  response.cookies.set(`${localCookie()}_csrf`, account === "logout" ? "" : randomBytes(32).toString("hex"), {
    httpOnly: true, secure: base.protocol === "https:", sameSite: "strict", path: "/", maxAge: account === "logout" ? 0 : 28800,
  });
  return response;
}
