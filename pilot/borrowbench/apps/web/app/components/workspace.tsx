/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation intentionally remounts protected actor context; Auth0 routes require document navigation. */
import { businessSession } from "@/lib/business-session";
import { localAccounts, localAuthEnabled } from "@/lib/local-auth";
import { isAuthConfigured } from "@/lib/auth0";
import { Product } from "./product";

export async function Workspace({ screen = [] }: { screen?: string[] }) {
  let session;
  try { session = await businessSession(); }
  catch { return <main className="entry"><div className="wordmark">BorrowBench</div><h1>Equipment information is unavailable right now.</h1><p>Your session could not be checked. Try again when the service is available.</p><a className="button" href="/">Try again</a></main>; }
  if (session) {
    // Explicit projection: credentials stay exclusively on the server.
    const { actor, label, role, csrf, local } = session;
    return <Product identity={{ actor, label, role, csrf, local, mode: process.env.BORROWBENCH_AUTH_MODE ?? "auth0" }} screen={screen} />;
  }
  const local = localAuthEnabled();
  return <main className="entry"><div className="wordmark">BorrowBench</div>
    {local ? <><h1>Choose a test account</h1><p>{process.env.BORROWBENCH_AUTH_MODE === "container-test" ? "Container test mode." : "Local test mode."} Choose Member A, Member B, or Custodian to try the pilot. This does not verify Auth0 sign-in.</p>
      <form action="/local-session" method="post">{Object.entries(localAccounts).map(([id, account]) => <button className="primary" key={id} name="account" value={id}>Use {account.label}</button>)}</form>
    </> : isAuthConfigured() ? <><h1>Sign in to BorrowBench</h1><p>Find shared equipment, borrow available items, and keep track of your loans.</p><a className="button primary" href="/auth/login">Sign in</a></> : <><h1>Sign-in setup is not complete yet.</h1><p>Please ask the pilot operator to finish authentication setup.</p></>}
  </main>;
}
