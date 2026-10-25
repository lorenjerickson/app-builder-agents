import { getLocalAccount, localAuthEnabled } from "@/lib/local-auth";
import { NextResponse } from "next/server";
import { getAuth0, isAuthConfigured } from "@/lib/auth0";

export const dynamic = "force-dynamic";
const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "no-store" },
});

export async function GET() {
  let headers: Record<string, string>;
  if (localAuthEnabled()) {
    const account = await getLocalAccount();
    if (!account) return reply({ error: "Choose a local test account." }, 401);
    headers = { Authorization: `Bearer ${process.env.BORROWBENCH_LOCAL_AUTH_KEY!}`, "X-BorrowBench-Local-Account": account };
  } else {
    if (!isAuthConfigured()) return reply({ error: "Sign-in is not configured." }, 503);
    const auth0 = getAuth0();
    if (!(await auth0.getSession())) return reply({ error: "Sign in to continue." }, 401);
    try {
      const { token } = await auth0.getAccessToken();
      headers = { Authorization: `Bearer ${token}` };
    } catch {
      return reply({ error: "Please sign out and sign in again to connect to the API." }, 401);
    }
  }
  const apiBase = process.env.API_INTERNAL_URL ||
    ((process.env.BORROWBENCH_ENV ?? "dev") === "dev" ? "http://127.0.0.1:3101" : undefined);
  if (!apiBase) return reply({ error: "The pilot service is not configured." }, 503);
  try {
    const endpoint = new URL("/me", apiBase);
    const upstream = await fetch(endpoint, {
      headers, cache: "no-store",
      redirect: "error", signal: AbortSignal.timeout(5000),
    });
    if (upstream.status === 401) return reply({ error: "Your API session is invalid. Sign out and sign in again." }, 401);
    if (upstream.status === 403) return reply({ error: "This account is not authorized for the pilot." }, 403);
    if (!upstream.ok) return reply({ error: "The pilot service is temporarily unavailable." }, 503);
    const result: unknown = await upstream.json();
    if (!result || typeof result !== "object" || !("label" in result) ||
        !("role" in result) || !("platform" in result) ||
        typeof result.label !== "string" || !["member", "custodian"].includes(String(result.role)) ||
        result.platform !== "BorrowBench") {
      return reply({ error: "The pilot service returned an unexpected response." }, 502);
    }
    // Explicit projection: never return the access token, raw upstream data or private subject.
    return reply({ label: result.label, role: result.role, platform: result.platform });
  } catch {
    return reply({ error: "The pilot service is temporarily unavailable." }, 503);
  }
}
