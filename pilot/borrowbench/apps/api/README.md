# BorrowBench API

Nest owns token verification and the pilot role allowlist. Business behavior and deployment prerequisites are documented below.

From the workspace root, run `pnpm --filter @borrowbench/api build`, then
`pnpm --filter @borrowbench/api start`. Build output is `dist/src/main.js`.
`pnpm --filter @borrowbench/api dev` watches TypeScript and restarts Node;
set `API_INSPECT=127.0.0.1:9231` for the Node debugger. Defaults bind HTTP to
127.0.0.1:3101; containers set API_HOST=0.0.0.0 and API_PORT=3001 and publish loopback only.
The API inherits environment from its launcher; it does not read any env files.

Required: DATABASE_URL and PILOT_ACCOUNT_MAP_FILE (absolute filename). The latter
is a private JSON object mapping Auth0 subjects to `{ "label": "Synthetic member",
"role": "member" }` or role `custodian`. Missing or malformed maps prevent startup. An empty object is a valid
deny-all bootstrap map; every authenticated subject receives 403 until mapped. Keep this file outside Git. It is loaded once; restart after editing.
AUTH0_ISSUER defaults to `https://dev-vaonng6ouuwr50kl.us.auth0.com/` and
AUTH0_AUDIENCE to `https://borrowbench.local/api`.

| GET endpoint | Access | Response |
| --- | --- | --- |
| /health/live | Public | `{ "status": "ok" }` |
| /health/ready | Public, schema/privileges + marker read | `{ "status": "ready", "platform": "BorrowBench" }` |
| /me | Valid RS256 access token, mapped subject | `{ "subject": "…", "label": "…", "role": "member", "platform": "BorrowBench" }` |
| /admin/platform | Valid mapped custodian | `{ "platform": "BorrowBench" }` |

Marker query requires public.platform_metadata with singleton=true and
value='BorrowBench'. Apply workspace migrations before readiness checks. Tokens
must have signature, issuer, audience, subject, expiry and issued-at claims.
Authorization failures return 401; valid unmapped subjects and members requesting
admin return 403. Dependency failures return 503. All errors use generic
`{ "error": "code" }` responses, and all responses carry no-store and a generated
request ID. No tokens, account maps or database URLs are logged. JWT keys are
cached for ten minutes, fetch timeout is three seconds, and there are no automatic
request retries. Database acquisition timeout is two seconds; query/statement timeouts are three seconds.

`pnpm --filter @borrowbench/api test` compiles real Nest decorator metadata and runs
Node integration tests against a local ephemeral JWKS server and RSA fixture keys.
Without TEST_DATABASE_URL it verifies denial paths and dependency outage; with a
migrated TEST_DATABASE_URL it additionally exercises readiness and successful
member/custodian database reads. TEST_JWKS_URL overrides key discovery only when
NODE_ENV=test and its HTTP URL hostname is localhost or a loopback literal.
The override is rejected in every other mode. Normal runs discover Auth0 JWKS.

Temporary local authentication is an explicit opt-in: BORROWBENCH_AUTH_MODE=local
requires BORROWBENCH_ENV=dev, API_HOST=127.0.0.1, and a whitespace-free
BORROWBENCH_LOCAL_AUTH_KEY of at least 32 characters. The launcher supplies a
random shared key in memory to web and API. NODE_ENV may be production for a local
compiled build. All other environment/binding combinations fail startup.
Local mode does not read the real account map or contact Auth0. Requests must
send the shared key as a bearer token and X-BorrowBench-Local-Account as member-a,
member-b or custodian. These fixed synthetic identities have subjects local|member-a,
local|member-b and local|custodian; only custodian has the custodian role. Missing or
incorrect keys receive 401; unknown account IDs receive 403. Leave the mode unset
(or set auth0) to restore normal JWT verification and the real allowlist.

## Accepted business API implementation (BB-ARCH-0.2)

The API now implements the nine frozen `/v1` operations from
`docs/pilot/design/api-contract-v0.2.json`. Equipment reads expose only the caller's
active loan ID; My Loans and loan detail always scope by owner. Custodian history
uses synthetic account IDs/labels, never provider subjects. Custodians can borrow
but cannot return another person's loan. Browser CSRF belongs to the Next boundary;
this private API retains the existing environment bearer/account or Auth0 guard.

POST checkout/return require `{}`; PUT maintenance requires `{enabled:boolean}`.
Use an actor-scoped printable ASCII `Idempotency-Key` (1–128, no trimming) and an
optional UUID `X-Correlation-ID`. Inputs reject unknown fields, non-JSON bodies,
malformed IDs/cursors/keys and bodies over 8192 bytes. Business errors use the frozen
`{error:{code,message,requestId},operation?}` shape; scaffold endpoint shapes remain
unchanged. A 503/lost response is unknown: lookup the original key or explicitly
retry the exact same intent/key. There are no automatic mutation retries.

One pg client owns each READ COMMITTED transaction, key reservation, equipment lock,
exact owned-loan lock, state/event writes and terminal receipt. Replay returns the
original status/receipt with the current request ID. Conflicts and safe not-found
are durable receipts; authorization/validation and key reuse do not bind new intent.
All active loans refresh with each My Loans page; only returned history is paged.

### Deployment prerequisites and operator commands

Development has authored these definitions; Deployment must execute them against
an explicitly bound isolated target and retain actual receipts. Do not execute
against host dev as part of the verify/pilot run. No application startup migrates,
seeds, resets, creates roles or repairs the database.

1. Apply workspace migrations using the existing **admin** connection, including
   `database/migrations/1792800000001_borrowbench-domain.cjs`. It is additive and
   creates empty business tables. Existing platform metadata remains intact.
2. Generate a separate strong runtime password in the approved environment secret
   store. Pass admin connection as `BORROWBENCH_ADMIN_DATABASE_URL`, runtime secret
   as `BORROWBENCH_API_DATABASE_PASSWORD`, and `BORROWBENCH_ENV=verify` (or pilot),
   `BORROWBENCH_TEST_ONLY=1`. Never print these values or put them on a command line.
   Execute from the workspace root:
   `node apps/api/tools/prepare-business.mjs provision-role verify`
3. With the same explicit admin target binding, load exactly one dataset into an
   **empty business schema**:
   `node apps/api/tools/prepare-business.mjs load-fixture verify baseline`
   Use `pilot baseline` for the pilot. Independent race/paging tests use their own
   disposable targets and choose `race` or `paging`; never append datasets or reset
   existing evidence. Loader verifies the exact frozen fixture hash, locks the five
   tables and commits the whole snapshot in one transaction. Nonempty targets fail.
4. Configure the API `DATABASE_URL` to the `borrowbench_runtime` login using its
   separate secret, never the migration owner. The script grants SELECT on the six
   tables, INSERT on loans/operations/audit, and only UPDATE(maintenance),
   UPDATE(returned_at), UPDATE(http_status,outcome,completed_at). It grants no audit
   UPDATE/DELETE, no business DELETE, no account/item-definition writes. The web
   receives no DB credential. Existing memberships/elevated/owner roles are rejected.
5. Bind `BORROWBENCH_RELEASE_ID` and `BORROWBENCH_CONFIG_ID` to safe immutable IDs
   (1–128 letters/digits/dot/underscore/colon/hyphen). Missing IDs log `unbound`; this
   is not acceptable deployed monitoring identity. Readiness retains its old JSON
   shape but now checks business tables and rejects audit UPDATE/DELETE privileges.

The setup script accepts internal host `db:5432`, or the explicit target's loopback
port (verify 55433, pilot 55434), database `borrowbench`; the enclosing Deployment
manifest must bind the exact Compose project/container because an internal hostname
alone cannot distinguish two isolated environments. No `.env` file is read by it.
Setup is operator-only, absent from HTTP routes. It reports only target/action/time,
not connection strings, credentials, SQL errors or fixture contents. If acknowledgment
is lost, inspect the target before retrying. Fixture loading never auto-resets.

Rollback uses a compatible previous image while retaining additive schema/history.
The migration's down function deliberately refuses destructive removal. Backup
restore needs a separately authorized disposable target and independent reconciliation;
it is not an application rollback. Retain receipts/events and evidence for 30 days
following the final report, then follow the accepted operator cleanup policy.

### Developer verification and telemetry

Pinned Node24.22.1 and TypeScript5.9.3 build/typecheck the API. `pnpm test` runs real
Nest HTTP auth/validation checks with ephemeral loopback servers and scripted-client
transaction tests. No-DB tests verify code paths and frozen fixture intent bytes;
they **do not prove PostgreSQL races, trigger execution, privileges, durability,
restart replay, load latency, recovery or real Auth0**. Testing must execute those
against a fresh candidate and Deployment's exact schema/fixture/role evidence.

Structured stdout events include `api_request_total`, `api_duration_ms`,
`operation_outcome_total`, `pool_wait_ms` and `db_ready`, UTC time and release/config/
auth mode. HTTP logs use allowlisted operation IDs, status, safe code and request ID;
mutation outcomes distinguish replay and committed changed/no-op/conflict from
nonterminal rejection/uncertainty. No bodies, query strings, raw keys, tokens or
provider subjects are logged. Pool max is5, acquisition2s, statement/query3s and
transaction lock2s. Existing Next/browser deadlines remain separate. Export/observer/
alert scheduling and independent adequacy verdicts belong to later operational work.
