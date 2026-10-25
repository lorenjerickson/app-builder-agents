import "server-only";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

// Secrets are consumed only by the server/SDK; never serialized or logged.
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.APP_BASE_URL && process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET &&
    process.env.AUTH0_SECRET
  );
}

let client: Auth0Client | undefined;
export function getAuth0(): Auth0Client {
  if (!isAuthConfigured()) throw new Error("Authentication configuration is incomplete.");
  if (client) return client;
  const target = process.env.BORROWBENCH_ENV ?? "dev";
  if (!["dev", "verify", "pilot"].includes(target)) {
    throw new Error("Unknown BorrowBench environment.");
  }
  const appBaseUrl = process.env.APP_BASE_URL!;
  client = new Auth0Client({
    appBaseUrl,
    enableAccessTokenEndpoint: false,
    authorizationParameters: {
      scope: "openid profile email",
      audience: process.env.AUTH0_AUDIENCE || "https://borrowbench.local/api",
    },
    session: {
      rolling: true,
      inactivityDuration: 1800,
      absoluteDuration: 28800,
      cookie: { name: `borrowbench_${target}_session`, sameSite: "lax" },
    },
    transactionCookie: { prefix: `borrowbench_${target}_txn_` },
    async onCallback(error) {
      // Fixed destinations avoid exposing provider errors or accepting arbitrary redirects.
      return NextResponse.redirect(new URL(error ? "/sign-in-error" : "/", appBaseUrl));
    },
  });
  return client;
}
