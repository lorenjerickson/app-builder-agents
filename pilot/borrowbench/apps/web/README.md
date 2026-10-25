# BorrowBench web authentication scaffold

Official Auth0 sample adapted for the BorrowBench pilot, not a standalone demo.
Source: https://github.com/auth0-samples/auth0-nextjs-samples/tree/quickstart/login
Sample commit: efe32a9fbd185a82472bc5106687e75e0312ac59.

Run workspace commands from `pilot/borrowbench`; use Node 24.22.1 and pnpm 12.15.0.

1. `pnpm install --frozen-lockfile`
2. `pnpm ensure-env` (creates this app's private `.env.local` only if absent;
   never reads or overwrites an existing secret file).
3. Enter `AUTH0_CLIENT_SECRET` locally in `apps/web/.env.local`. A session secret is
   generated without printing it. Never paste either secret into chat or commit it.
4. In the supplied Auth0 Regular Web Application, save:
   - Allowed Callback URLs: `http://localhost:3100/auth/callback`
   - Allowed Logout URLs: `http://localhost:3100`
5. `pnpm dev`; visit http://localhost:3100 and sign in with a preprovisioned test account.
6. Confirm the signed-in state, sign out, then confirm the anonymous page returns.

Domain: `dev-vaonng6ouuwr50kl.us.auth0.com`.
Client ID: `dB2ErHzIJlJJTcqpcOh3vW26aTNKfme7`.
Application type: Regular Web Application. Token endpoint auth: client_secret_post.
Public signup is excluded from BorrowBench: disable tenant connection signup and
create pilot test users through Auth0 administration. The UI deliberately has no signup link.

This slice implements official SDK authentication, server-side session handling,
Next 16 proxy, isolated cookie names and generic callback error handling. It disables
browser access-token retrieval. No hand-written OAuth/OIDC flow or client token store.
The unbranded shell is not the Experience agent's final design.

NestJS now validates API tokens and enforces an explicit local subject/role map.
The signed-in shell calls `/api/platform`, which forwards the token only on the server
and checks the database through NestJS. `AUTH0_AUDIENCE` defaults to
`https://borrowbench.local/api`; the user confirmed that API exists. Sign out/in to
obtain a fresh API token after this change. Unmapped accounts receive a denial.
`API_INTERNAL_URL` defaults to dev port 3101 only in the dev environment; verify/pilot
must provide their own explicit URL. Business workflows and app Docker targets remain
open. See the workspace README for database/API startup. Keep deployment local.

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm build`.
Missing configuration produces an operator-facing setup state; `/auth/*` returns 503.
Runtime consumes environment secrets; the assistant must not read/print `.env.local`.

Verified: locked install, typecheck, lint, production build, synthetic HTTP auth smoke
and live sign-in/sign-out. Run `pnpm test:auth` from the workspace after `pnpm build`;
this uses port 3199 and synthetic configuration, never displaying real credentials.
See [evidence](../../../../docs/pilot/evidence/auth0-integration.md).

## BorrowBench product journeys

The accepted Experience0.7/Brand0.2 UI uses the runtime system font stack and actual
API item labels. `/equipment` (also `/`) lists all equipment and the server-side
Available only filter; `/equipment/:id` offers eligible Borrow, exact own-loan
navigation and custodian maintenance. `/loans` separates all Active loans from
cursor-paged Returned loans; `/loans/:id` reads the exact owned loan. `/history`
provides custodian-only cursor-paged team events. Empty, read-error, denied,
pending, conflict, confirmed and uncertain results are distinct.

`/api/v1/*` is a fixed route allowlist to the private API. It creates upstream
credentials from the server session, never caller headers. Mutations require the
configured exact Origin, JSON and an HMAC token bound to the actor and current
login session. Local account selection rotates a random HttpOnly nonce; old local
sessions without this nonce need account reselection. Auth0 uses the SDK's session
ID and creation time; normal provider configuration and local identities are retained.
The UI sends an opaque actor assertion to prevent an old tab from reading another
account after account switching. This assertion is only a stale-context guard, never
an authorization credential. `/api/platform` retains its scaffold diagnostic shape.

Before any mutation the browser saves the original actor/type/target/body/key in
sessionStorage. A saved action prevents a replacement action until reconciled.
Check result uses the original key and interprets the receipt's original HTTP
status; a lookup404 remains unknown. Retry same action is explicit and preserves
the original intent. Navigation/sign-out do not cancel or automatically replay an
action. Storage is not an offline write queue; if unavailable, writes are blocked
and reads remain available. History receipts do not claim current equipment state.

Developer checks: `pnpm --filter @borrowbench/web test`, `typecheck`, `lint`, `build`.
The product tests exercise pure outcome/actor contracts and the real Next route
handler with mocked session/upstream transport; they are not full-stack/browser
verification. Independent Testing still owns runtime journeys, concurrency,
rendered design/keyboard/zoom comparison, pagination fixtures and provider proof.
No service, migration or deployment is performed by these checks.
