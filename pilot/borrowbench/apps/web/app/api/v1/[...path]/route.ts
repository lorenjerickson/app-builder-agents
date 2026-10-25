import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiBase, businessSession } from "@/lib/business-session";
import { routeStatus, trustedMutation } from "@/lib/transport-security";

export const dynamic = "force-dynamic";
const failure = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message, requestId: randomUUID() } }, { status, headers: { "Cache-Control": "no-store" } });
async function transport(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const matchedRoute = routeStatus(request.method, path);
  if (matchedRoute === 404) return failure(404, "NOT_FOUND", "Not found.");
  let session;
  try { session = await businessSession(); } catch { return failure(503, "SERVICE_UNAVAILABLE", "The service is unavailable right now."); }
  if (!session) return failure(401, "SESSION_REQUIRED", "Your session ended. Sign in again to continue.");
  const claimedActor = request.headers.get("x-borrowbench-actor");
  if (claimedActor !== null && claimedActor !== session.actor) return failure(401, "SESSION_REQUIRED", "Your account changed. Choose your account again.");
  const mutation = request.method !== "GET";
  if (mutation && (!process.env.APP_BASE_URL || !trustedMutation(request.headers, new URL(process.env.APP_BASE_URL).origin, session.csrf))) {
    return failure(403, "FORBIDDEN", "You don't have access to this action.");
  }
  if (matchedRoute === 400) return failure(400, "INVALID_REQUEST", "The request could not be accepted.");
  const base = apiBase();
  if (!base) return failure(503, "SERVICE_UNAVAILABLE", "The service is unavailable right now.");
  // Build headers from scratch: neither caller credentials nor routing/forwarding headers cross this boundary.
  const headers: Record<string, string> = { ...session.headers };
  for (const name of ["Idempotency-Key", "X-Correlation-ID"]) {
    const value = request.headers.get(name);
    if (value !== null) headers[name] = value;
  }
  let body: string | undefined;
  if (mutation) {
    headers["Content-Type"] = "application/json";
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    if (reader) while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 8192) { await reader.cancel(); return failure(413, "PAYLOAD_TOO_LARGE", "The request could not be accepted."); }
      chunks.push(chunk.value);
    }
    body = Buffer.concat(chunks).toString("utf8");
  }
  const endpoint = new URL(`/v1/${path.map(encodeURIComponent).join("/")}`, base);
  endpoint.search = request.nextUrl.search;
  try {
    const upstream = await fetch(endpoint, { method: request.method, headers, body, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000) });
    if (!upstream.headers.get("content-type")?.includes("application/json")) throw new Error("Invalid response");
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure(503, mutation ? "OPERATION_UNRESOLVED" : "SERVICE_UNAVAILABLE", mutation ? "We couldn't confirm whether your change completed." : "The service is unavailable right now.");
  }
}
export const GET = transport;
export const POST = transport;
export const PUT = transport;
