# Business candidate operations

These are Development-authored operator interfaces. Validation or source presence is
not execution evidence, G3/G4/G5 approval or a recovery verdict. Deployment executes
only the action authorized by the current run, against its exact target. IM-04 only
builds; the current downstream staging boundary allows isolated verify, additive
migration and empty-only baseline loading. It does not authorize promotion, fault,
restore, reset, deletion, observer workload or pilot service starts.

## Build and isolated verify stage

Use the pinned Node24.22.1/pnpm12.15.0 toolchain. `tools/containers.mjs build` freezes
source excluding private/generated/dependency paths and builds both images using the
same snapshot. The default Next build is Turbopack. Optional `BORROWBENCH_RECORDS_DIR`
points to the assigned evidence directory under docs/pilot; the same setting is required
when reading its release. A release binds source hashes, image IDs, Compose and migration
hashes. No runtime services start during build. Source changes require a new build.

Deployment inventories current containers/images/volumes and migration ledger, binds
its source/package/config/authority and sets a unique `BORROWBENCH_ACTION_ID`. Then:

```
node tools/containers.mjs stage /absolute/path/to/release-HASH.json
```

Stage creates a write-once action intent before target mutation. Existing action IDs
fail; inspect their receipt and actual target before a separately authorized continuation.
It refuses running application containers rather than silently interrupting them. It
initializes secret files only when absent, starts only the target DB, runs the dedicated
setup container in three explicit steps (`migrate`, `provision-role`, `load-baseline`),
then starts API/web using exact image IDs. Migration emits before/after ledger hashes,
rejects unexpected migration order and uses node-pg-migrate's lock/atomic ledger.
No error is automatically retried, and no schema/data reset is provided.

Baseline load is deliberately empty-only. A partial/previously populated business
schema fails instead of deleting or appending data. Preserve failure receipts and
route the observed state to Coordinator; continuing against preserved data requires a
separately scoped setup decision. Existing platform metadata is preserved. The runtime
API gets `borrowbench_runtime` plus `/run/secrets/api_db_password`; migration/setup get
the admin `/run/secrets/db_password`. The web gets neither DB secret nor data network.
Each target has independently generated secret files, not copied verify-to-pilot.

Release ID is the exact content-addressed release JSON hash; config ID hashes target,
source, Compose, image IDs and explicit container-test mode. Both are injected into
API/web before startup. No secret enters either hash or log. Runtime role/fixture/config
are recorded in the final stage receipt. Smoke retains `/api/platform` and all three
local accounts, forwarding both account and nonce cookies. Readiness verifies domain
schema and denied audit UPDATE/DELETE privileges.

Inspect a failed setup target before retrying. Role setup can be rerun with the same
externally stored runtime secret after reconciliation. Fixture setup is not blindly
repeatable once committed: absence of an acknowledgment is not proof of failure.
At the current session's end, Deployment stops only the verify services this run
started with `tools/containers.mjs stop verify`; all volumes/secrets remain.

## Manifest-bound S5 interfaces

`node ops/operations.mjs validate <manifest.json>` is read-only. `execute` creates an
exclusive, fsynced journal at `operation-records/<actionId>.jsonl` adjacent to the
manifest, then performs its exact action. Inputs must be regular nonsymlink files under
repository docs/pilot and match SHA256. Authority references identify accepted external
permission; files do not grant permission themselves. An existing journal blocks replay:
manual reconciliation and a new explicitly authorized continuation manifest are required.
No generic command or arbitrary URL is accepted. Never include credentials in manifests.

All manifests have `format:borrowbench-operation-v1`, `action`, unique `actionId`,
`target:verify|pilot`, matching `project:borrowbench-containers-TARGET`, SHA256
`releaseSha256`, `configId`, `sourceSha256`, `authorityRef:{ref,sha256}` and nonempty
`inputs:[{ref,sha256}]`. Field names/case below are exact.

- **observe:** `webContainerId` (full64hex), `webImage` (sha256 image), `intervalMs:2000`,
  `timeoutMs:1000`, `failureThreshold:3`, `durationSeconds`60–900. The independent host
  process executes a bounded API-backed readiness fetch from the preserved web container's
  existing front network; API/database remain unpublished. It records scheduled/dispatch/
  completion monotonic time, UTC, status/transport/request ID, missing-slot gaps and a durable
  three-failure alert. No hidden retry. Failed/missing samples reset healthy continuity;
 60 continuous seconds are reported as measurement, not automatically accepted recovery.
  Host Docker-exec overhead is included in the1s deadline and may itself cause a transport
  failure; record it rather than dropping it. The journal survives API failure. Operator
  relay/alert intake and the30journey workload remain externally bound in the attended plan.
- **recover:** `apiContainerId`, `apiImage`, `approvedAction:start_same_api`. Inspects exact
  Compose labels, source/release/config, image and disabled automatic restart before doing
  anything. If already running it records reconciliation; otherwise starts that same
  existing container. It never recreates/pulls/rebuilds, stops other services or modifies
  DB. Command completion is not restored service: independent observer proves first
  successful readiness within180s and60continuous healthy seconds, plus Testing checks.
- **prepare-migration:** `apiImage`, `schemaBefore`, `schemaAfter` (SHA256 of migration
  names joined by newline in ledger order), and `backupManifestRef:{ref,sha256}`. Backup
  manifest must bind target/project/schemaSha256/backupRef/backupSha256 and a present,
  verified backup. Requires the externally prepared Compose environment (`BB_TARGET`,
  immutable image, release/config/secret-dir and web port) to match. Inspects pre-ledger,
  journals dispatch, runs dedicated setup migration and verifies post-ledger. This fuller
  backed-up migration wrapper is for its later approved operational run; initial authorized
  empty-domain stage uses the stage driver's additive migration/checkpoint path.
- **restore:** only targetverify, `disposable:true`, exact `databaseContainerId` and
  `databaseImage`, new `destinationDatabase:bb_restore_<lowercase-suffix>`, `backupRef`,
  `backupSha256`, `backupFormat:postgres-custom`, `schemaSha256`, `expectedInventory`, and
  `expectedRowDigests`. It refuses any existing destination and never writes borrowbench.
  Creates a separate empty database, restores in one transaction without owners/privileges,
  checks schema, row counts, active-state/time/terminal invariants and exact hashes of IDs/
  rows including receipts/audits. Failed databases remain for evidence; no auto-drop.

`expectedInventory` keys are accounts,equipment,loans,operations,audit_events,active_loans,
invalid_states,invalid_times,unresolved_operations. The last three must be0. Each
`expectedRowDigests` key is one of the five business tables. Capture each digest using
SHA256 of trimmed psql `-At` output for `SELECT coalesce(json_agg(row_to_json(t) ORDER BY
id)::text,'[]') FROM <table> t`; operations orders by `actor_id,key`. Keep the exact
schema/column ordering and tool output convention. Dump with PostgreSQL17 `pg_dump
--format=custom --no-owner --no-privileges` through the authorized DB container, to an
exclusive protected evidence file, recording actual hash/schema/image/row inventory.
No dump or restore was executed by implementation. Independent Testing assesses restored
outcomes; matching hashes are not a release authorization.

Compatible app rollback and data restoration are separate. Retain additive tables and
receipts when reverting an image. The domain down migration intentionally refuses history
removal. Never overwrite acknowledged live writes with a backup. Retention remains30days
after final report, followed only by the approved inventoried operator cleanup.

## Telemetry and verification boundaries

API count/duration/outcome/readiness/pool records carry safe release/config/mode and
request/operation identifiers. Browser `borrowbench:ui-outcome` stays a local event hook;
Testing records it independently with candidate/context/time. No analytics endpoint was
added. Browser deadline8s and Next upstream5s preserve explicit same-key reconciliation.

Pure operator-contract, source-boundary, auth/transport and API developer tests are scoped
checks. They do not execute a migration, start a service, prove a database race or restore,
observe a workload, certify UI fidelity or satisfy real Auth0. All operational definitions
need actual isolated execution and independent evidence at their designated gates.
