import { createHmac, timingSafeEqual } from "node:crypto";

export function sessionToken(secret: string, actor: string, session: string): string {
  return createHmac("sha256", secret).update(JSON.stringify(["csrf-v1", actor, session])).digest("hex");
}
export function actorHandle(secret: string, actor: string): string {
  return createHmac("sha256", secret).update(JSON.stringify(["actor-v1", actor])).digest("hex");
}
export function validCsrf(received: string | null, expected: string): boolean {
  if (!received || !/^[a-f0-9]{64}$/.test(received) || expected.length !== 64) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
export function trustedMutation(headers: Headers, trustedOrigin: string, token: string): boolean {
  return headers.get("origin") === trustedOrigin &&
    headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json" &&
    validCsrf(headers.get("x-csrf-token"), token);
}
// Endpoint recognition is separate from path-parameter validation: known malformed
// requests are400; unrelated paths/verbs stay404 and cannot reach the private API.
export function routeStatus(method: string, segments: string[]): 200 | 400 | 404 {
  const [resource, target, action] = segments;
  if (method === "GET" && (
    (segments.length === 1 && ["equipment", "audit-events"].includes(resource)) ||
    (segments.length === 2 && ((resource === "loans" && target === "mine") || (resource === "operations" && target === "lookup")))
  )) return 200;
  const parameterized =
    (method === "GET" && segments.length === 2 && ["equipment", "loans"].includes(resource)) ||
    (method === "POST" && segments.length === 3 && ((resource === "equipment" && action === "checkout") || (resource === "loans" && action === "return"))) ||
    (method === "PUT" && segments.length === 3 && resource === "equipment" && action === "maintenance");
  if (!parameterized) return 404;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(target) ? 200 : 400;
}
export function allowedRoute(method: string, segments: string[]): boolean {
  return routeStatus(method, segments) === 200;
}
