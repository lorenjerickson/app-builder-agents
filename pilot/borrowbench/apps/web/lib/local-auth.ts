import "server-only";
import { cookies } from "next/headers";

export const localAccounts = {
  "member-a": { label: "Member A", role: "member" },
  "member-b": { label: "Member B", role: "member" },
  custodian: { label: "Custodian", role: "custodian" },
} as const;
export type LocalAccount = keyof typeof localAccounts;
export { localCookie, localAuthEnabled } from "./local-auth-config";
import { localCookie, localAuthEnabled } from "./local-auth-config";
export async function getLocalAccount(): Promise<LocalAccount | undefined> {
  if (!localAuthEnabled()) return undefined;
  const value = (await cookies()).get(localCookie())?.value;
  return value && Object.hasOwn(localAccounts, value) ? value as LocalAccount : undefined;
}
