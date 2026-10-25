# BorrowBench pilot workspace

Runnable platform slice: Next.js/Auth0 web session → NestJS authorization → PostgreSQL.
Equipment, loans and branded screens await the pilot design gates.

Use Node 24.22.1 and pnpm 12.15.0. From this directory:

```sh
pnpm install --frozen-lockfile
pnpm ensure-env
pnpm db:init
pnpm db:up
pnpm db:migrate
pnpm build
```

Complete [web setup](apps/web/README.md) and the local subject mapping in
[operations](ops/README.md). Empty account maps deny every identity.
In separate terminals, run `pnpm dev` (web at localhost:3100) and `pnpm dev:api`
(API at 127.0.0.1:3101). For compiled API execution use `pnpm api:start`.
PostgreSQL runs in Docker; web/API run on the host. Keep secrets, tokens and cookies
out of source control and chat. Never reset volumes just to switch modes.

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:auth`.
Prepare the verify database using the operations guide, then run
`node tools/platform.mjs test-api --target verify` and `pnpm test:platform`.
The latter uses synthetic encrypted sessions and signed JWTs against the real verify
database; it does not assert a real Auth0 login/API result.

See [integration evidence](../../docs/pilot/evidence/platform-integration.md) and
[remaining prerequisites](../../docs/pilot/platform-prerequisites.md).
App container builds, release promotion and the controlled recovery experiment remain open.

## Temporary local sign-in

Auth0 user provisioning is currently deferred at the user's request. After database
setup and `pnpm build`, run `pnpm start:local` instead of the separate web/API commands.
It starts both on loopback at 3100/3101 and generates a shared key in process memory.
Open http://localhost:3100 and choose Member A, Member B or Custodian. No passwords or
Auth0 accounts are required. Anyone using this local mode can select any test role.
The UI labels the bypass explicitly; this is not production identity verification.

Local mode requires the dev target and a loopback API binding, and cannot be launched
for verify/pilot. NestJS still enforces role checks and queries the dev database.
Test accounts use `local|...` subjects and do not alter the Auth0 account map. To return
to Auth0, stop this launcher and run the normal web/API commands with local-mode
variables unset; then complete the deferred real-account setup. Secret files are unchanged.

With local mode running, `node tests/smoke/local-auth.mjs` checks all three roles through
the full stack, logout, anonymous denial, cross-origin denial and invalid selection.

## Source identity for agent handoffs

`node tools/scaffold-manifest.mjs write` publishes a content-addressed source record
under docs/pilot/evidence/scaffold without overwriting an existing record. To verify it,
run `node tools/scaffold-manifest.mjs check <absolute-manifest-path>`. Edits, added files
and removed files within the declared source roots invalidate the match. Run
`node --test tests/tools/scaffold-manifest.test.mjs` to test those boundaries.

The manifest covers apps/database/ops/tests/tools and explicit root package/config/docs
files. It skips private environment files, .local, dependencies and generated outputs
before reading them. Future new top-level source roots must be added explicitly.
This identifies source only: pin built images/config/schema separately for releases.
See [baseline evidence](../../docs/pilot/evidence/scaffold-baseline.md).

## Isolated container staging and promotion

See [container delivery](ops/CONTAINERS.md) for `node tools/containers.mjs build`,
`stage <release.json>` and `promote <same-release.json>`. Verify/pilot container targets
use distinct explicitly enabled test authentication, private networks/data and web-only
loopback ports 3200/3300. Existing host dev mode on 3100 is independent. Container-test
accounts defer Auth0; they do not satisfy real-provider acceptance.
