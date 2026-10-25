# Local PostgreSQL and API operations

Run commands from `pilot/borrowbench` with the workspace's pinned Node and installed
dependencies. Docker Desktop must be running. Targets are mandatory; arbitrary target
names are rejected. Each target owns a Compose project, default network, persistent
database volume, generated credential and local identity map.

| Target | Compose project | Loopback PostgreSQL | Loopback host API |
|---|---|---|---|
| dev | borrowbench-dev | 55432 | 3101 |
| verify | borrowbench-verify | 55433 | 3201 |
| pilot | borrowbench-pilot | 55434 | 3301 |

```sh
node tools/platform.mjs init --target verify
node tools/platform.mjs up --target verify
node tools/platform.mjs migrate --target verify
node tools/platform.mjs status --target verify
pnpm build
node tools/platform.mjs test-api --target verify
node tools/platform.mjs test --target verify
node tools/platform.mjs run-api --target verify
```

Repeat the four setup commands with `dev` or `pilot` for those databases. Tests accept
only `verify`. `up` checks the host port before creating a service and waits for database
health. Repeating `init` preserves existing files; repeating `up` preserves existing
data. Migration execution holds node-pg-migrate's database lock and applies only pending
migrations. A fresh database has migration bookkeeping and the singleton
`platform_metadata` row, with no business tables. `status` verifies that row through pg.

Private configuration is generated into `.local/<target>.env` (mode 600) with a
cryptographically random database password. The `.local` directory must be mode 700.
Keep these ignored local files private. Do not print, commit, or paste them. Initialization
never rotates an existing credential, and no command resets or removes a volume.

The initial `.local/<target>-accounts.json` is empty, so all identities are denied.
Populate it locally using `database/accounts.example.json` as the shape reference and
actual Auth0 subjects. Examples are placeholders, not authorized identities. Keep each
target's mapping separate. `run-api` loads the target configuration at runtime and passes
the database URL, fixed issuer/audience, identity-map path and loopback binding directly
to the API process without printing credentials. Ctrl-C stops that host API process.

This slice runs PostgreSQL in Compose and the compiled API on the host. All three database
ports are therefore published on loopback, extending the earlier dev-only host-port
proposal. Database images use the pinned PostgreSQL 17.11 manifest and linux/amd64.
App containers, release promotion, backup/restore rehearsal
and failure injection are not implemented by these operations. Existing target data is
never disposable by implication; a future recovery runbook must separately authorize
and verify backups and restores.

Verification of actual Docker startup, migration application, persistence and API tests
must be recorded in the project evidence after execution; these files alone do not
establish platform acceptance.

Host API watch mode: `node tools/platform.mjs dev-api --target dev`.
Add `API_INSPECT=127.0.0.1:9231` to enable Node's local inspector. TypeScript rebuilds
on source changes and Node restarts compiled output. The web uses Next's existing
`pnpm dev` watch mode. These commands do not establish Compose app-development support.

Observed startup, migration, database restart/persistence and integration checks are
recorded in [platform evidence](../../../docs/pilot/evidence/platform-integration.md).

The compiled container test targets are now defined separately in
[CONTAINERS.md](CONTAINERS.md). They use separate Compose projects and data; the host
operations above retain their original behavior. App-image staging/promotion commands
are distinct from host development/watch mode. Do not combine the two Compose files.
