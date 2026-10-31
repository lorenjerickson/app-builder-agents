# Local rehearsal ledger

This trusted-operator SQLite adapter records **synthetic bookkeeping**, using Node
24's built-in `node:sqlite` and no packages. New ledgers use schema 2 and default to
published contract **0.7.1** for compatibility with existing fixtures. Published
**0.7.2** uses `definition_binding: {version: "0.7.2", release_ref: "v0.7.2"}`.
Previously supported explicit0.7.2 candidate bindings retain their hashes and
status; they are not silently relabeled. Binding a ledger does not activate definitions. No model calls, role execution,
external actions, production acceptance, isolation or cost metering are implemented.

Run from the repository root with a compatible Node 24 executable:

```sh
node --test runner/*.test.mjs
node runner/rehearse.mjs
```

The second command runs domain-neutral fixtures through separate CLI processes,
reopens the database and verifies persisted handoff/events. All output goes to a
unique `runner/.state/rehearsal-*/` directory, including failed transcripts. It does
not execute any historical pilot exercise. Test results are bookkeeping evidence,
not a ten-agent delivery qualification. No standalone package installation is needed.

## Operator path

Use a fresh database. These commands are executable examples:

```sh
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/init.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/assign.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/dispatch.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/artifact.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/result.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/gate.json
node runner/cli.mjs --db runner/.state/example.sqlite snapshot
```

The examples are complete synthetic fixtures, never accepted product requirements.
`fixtures.mjs` exports envelope constructors and `seal(assignment)`: hash the exact
JSON serialization without `assignment_hash`, after setting all fields. Assignment
refs identify saved envelopes; the ledger persists their bytes and hash. It does
not save or resolve the external label. Artifact hashes similarly cover
`JSON.stringify(payload)`. Identity is `artifact_id@revision`.

Legacy ledgers (including 0.4.0) open read-only. `snapshot` works; **all mutation is
rejected before any transaction or rejection event**. No silent migration, history
rewriting or relabeling occurs. Start a separate schema-2 database. Back up history
with the normal SQLite tools when needed; this adapter does not migrate it.

## Supported command surface

Existing `init`, `assign`, `dispatch`, `artifact`, `result`, `settle`, `action`,
`reconcile`, `gate`, `supersede`, `cancel` retain their bookkeeping meanings.
`action` stores an intent only. Gates must begin with R; real G1–G7 records are
operator-supplied prerequisite references, not ledger acceptance decisions.

| New command | Required fields and behavior |
|---|---|
| `external_baseline` | `ref` with revision, `payload`, `content_hash`, `receipt` with operator/evidence_ref. Registers unknown provenance without inventing a sole role producer. |
| `select_remediation` | `task_id`, `selection`: operator/evidence_ref, authority_ref, finding_ref, scope, recheck_scope, original_task_id, original_attempt, for_attempt. The settled original must share the task's work_key; counters never reset. |
| `receipt` | Unique `id`, `receipt` with operator/evidence_ref, kind, artifact_ref and kind-specific fields below. Stored separately from producer bytes. |

Receipt kinds: `external_acceptance` requires authority_ref and changes provenance
to authority_accepted; `placement` records requested_location, actual_location,
reason and unchanged content_hash; `observation` records observed_at,
configuration_ref, subject_ref, method, result; `decision_propagation` records all
binding roles and reconciled_revision_refs; `dependency_coverage` records
changed_guarantees, dependency_refs, consequence_sweep and bounded recheck_scope.
Assignment input/baseline refs, consumed result refs, gate evidence refs and the
artifact/dependency refs in receipt commands are checked for current, complete
returned revisions (unknown sources are permitted only in the documented discovery
path). Prerequisite condition refs, readiness subjects and preparation/increment
binding strings are operator attestations, not resolved by the ledger. The operator
must verify their identity, freshness and acceptance even when they name local
artifacts; presence of a reference string is not proof.

Assignment validation uses the explicit role/mode matrix and named §3 prerequisite
obligations in `policy.mjs`. Each prerequisite requires an immutable_ref with a
revision and acceptance_ref. External refs remain **operator attestations**; the
ledger does not prove their existence or acceptance. Coordinator `coordinate` and
Retrospective `review` are adapter labels because these definitions do not enumerate
modes. The supported subset is intentionally stricter about structural bookkeeping.
The operator must ensure each receipt covers the entire cited entry condition.

Readiness binds every mandatory predicate exactly once to a selected acceptance
check with available capability/executor/evidence, or to a policy-backed exclusion.
The mandatory predicate list and semantic sufficiency remain operator-owned.
Mandatory self-checks must pass or carry policy-backed non-applicability for success.
A complete assessment can succeed while a separate subject-quality check fails.
Issues require severity, predicate_ref, gate_ref and severity-policy reference.

Scopes have exact allowed location tokens and action phases; no path-prefix inference
is performed. Assignments bind the same scope ref and remain within numeric resource
ceilings. Run and task holds prevent dispatch. Changing scope or lifting a hold
requires a new explicitly authorized run/assignment; no mutation command silently
widens authority. `max_cost: 0` is the synthetic ceiling, not measured cost. Actual
usage may be null with a reason. Timers, aggregate costs and actual filesystem/tool
permissions remain the operator's responsibility. Concurrency and attempt counters
are ledger-enforced; the operator keeps semantic work_key identity stable.

A retry after a settled attempt requires a fresh selection tied to its next work
attempt. Initial dependency-block resolution before any attempt does not require
remediation selection. Unknown external outcomes also require reconciliation.
New task names do not reset shared work counters. Repair/reverify requires retained
selection lineage; unrelated prior work cannot supply it.

## Required delta, verification and manual boundaries

| P21 delta | Local verification / supported behavior | Explicit manual boundary |
|---|---|---|
| Version/history | Manifest and legacy tests; published release or candidate hashes, schema 2 | Hashes supplied by operator; no definition loading/activation |
| Manifest/scope | Scope rejection/hold tests; authorities, profile, policy, manual responsibilities, phase/location/limit checks | No authentication, real isolation or metering; semantic inclusion/exclusion interpretation |
| Provenance/decisions | External provenance and decision tests; unknown source barred from accepted inputs/gates; coordinator-owned decision fields/revisions | Authority truth, source authenticity, completeness of propagated revisions |
| Modes/readiness | Mode/predicate rejection tests; named mode prerequisite receipts, saved assignment hash, every predicate bound to capability/check or exclusion | Actual capabilities, accepted meaning and completeness of operator predicate list |
| Increment/review | Increment/pair tests; behavior/checkpoint/dependencies, integration milestone, exact consumed review pair | Product semantics and correct planned scope |
| Scaffold exception | Scaffold test passes without product G1/G2/test plan; preparation criteria and independent scope required | Actual preparation acceptance and isolated environment |
| Rejected work | Retry/uncertainty/attempt tests; selection plus original lineage, unchanged counters | Selection authority and semantic work identity |
| Results/self-check | Mandatory-check tests, issue linkage validation; assessment success distinct from subject outcome | Semantic evidence quality, severity-policy applicability |
| Handoffs/evidence | Decision/placement and observation/dependency receipt tests; separate immutable receipts | Physical fallback placement, external observations, actual revision reconciliation |
| Freshness | Supersede test; changed inputs invalidate dependent tasks/results; gates conservatively become inconclusive | Affected semantic re-check scope decided by operator; invalidation never executes broad tests |
| Durability/limits | Atomic hash rejection, stale replies, cancellation, legacy preservation, subprocess reopen rehearsal | Trusted operator can modify SQLite directly; not a security boundary |

SQLite uses WAL/FULL synchronization and immediate write transactions. State/events
commit together; ordinary rejection records only command identity/error, not the
unvalidated payload. Malformed current results retain their evidence and settle the
attempt; stale responses cannot settle a newer one. Events have update/delete
triggers. Filesystem ownership, safe content and backups remain operator-owned.
No secrets, credentials or unnecessary personal data belong in command envelopes.

P61/P62 conclusions: [bounded investigation](../docs/p61-p62-disposition.md).
