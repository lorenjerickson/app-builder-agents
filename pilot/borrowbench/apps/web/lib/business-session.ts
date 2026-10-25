import "server-only";
import { cookies } from "next/headers";
import { getAuth0, isAuthConfigured } from "./auth0";
import { getLocalAccount, localAccounts, localAuthEnabled, localCookie } from "./local-auth";
import { actorHandle, sessionToken } from "./transport-security";

export type BusinessSession = {
  actor: string; label: string; role: "member" | "custodian"; csrf: string;
  headers: Record<string, string>; local: boolean;
};
export function apiBase(): string | undefined {
  return process.env.API_INTERNAL_URL || ((process.env.BORROWBENCH_ENV ?? "dev") === "dev" ? "http://127.0.0.1:3101" : undefined);
}
export async function businessSession(): Promise<BusinessSession | null> {
  if (localAuthEnabled()) {
    const account = await getLocalAccount();
    const nonce = (await cookies()).get(`${localCookie()}_csrf`)?.value;
    if (!account || !nonce) return null;
    const secret = process.env.BORROWBENCH_LOCAL_AUTH_KEY!;
    return { actor: actorHandle(secret, account), ...localAccounts[account], csrf: sessionToken(secret, account, nonce),
      headers: { Authorization: `Bearer ${secret}`, "X-BorrowBench-Local-Account": account }, local: true };
  }
  if (!isAuthConfigured()) return null;
  const auth = getAuth0();
  const session = await auth.getSession();
  if (!session) return null;
  const { token } = await auth.getAccessToken();
  const base = apiBase();
  if (!base) throw new Error("Service unavailable");
  const response = await fetch(new URL("/me", base), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(response.status === 403 ? "Forbidden" : "Service unavailable");
  const me = await response.json();
  if (!["member", "custodian"].includes(me.role) || typeof me.label !== "string") throw new Error("Service unavailable");
  return { actor: actorHandle(process.env.AUTH0_SECRET!, session.user.sub), label: me.label, role: me.role,
    csrf: sessionToken(process.env.AUTH0_SECRET!, session.user.sub, `${session.internal.sid}:${session.internal.createdAt}`),
    headers: { Authorization: `Bearer ${token}` }, local: false };
}
