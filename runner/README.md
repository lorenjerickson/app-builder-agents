# Assisted coordinator ledger

This adapter implements durable **rehearsal bookkeeping** for contract 0.4.0.
It uses Node 24.22.1's built-in SQLite module, without new packages. It does not call
models, execute tools, deploy applications, alter Auth0, or grant real G1–G7 acceptance.
The operator remains responsible for supplying truthful checks and authority references.
BorrowBench's local/container test accounts remain as configured.

## Run the rehearsal

From the project root using Node 24.22.1:

```sh
node runner/rehearse.mjs
node --test runner/ledger.test.mjs
```

The command creates a new local SQLite database under `runner/.state/` and a uniquely
named evidence directory under `docs/pilot/evidence/ledger/`. It prints their paths.
It uses separate CLI processes, kills one after committing an action intent, reopens
the ledger, settles the interrupted attempt and requires reconciliation before retry.
No real external action is performed. Assertions also cover successful and rejected
handoffs, stale artifacts/results, gate invalidation, limits and cancellation.

Evidence contains commands/results, a complete event/state snapshot, verdicts and
explicitly unknown model usage. Failed runs retain their transcript; they are not
silently discarded. Local database/WAL files are ignored by Git. Snapshots contain
only synthetic fixture content. Never put passwords, cookies, tokens, secrets or
unnecessary personal data into command envelopes or evidence.

## Try an operator handoff

Use a fresh database path; init refuses to overwrite an initialized run:

```sh
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/init.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/assign.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/dispatch.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/artifact.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/result.json
node runner/cli.mjs --db runner/.state/example.sqlite apply runner/examples/gate.json
node runner/cli.mjs --db runner/.state/example.sqlite snapshot
```

These fixtures do not replace accepted BorrowBench requirements. Their complete flag
means complete *synthetic fixture*, not a semantically complete real requirements spec.
A dispatch returns the assignment to hand to an agent; it does not launch that agent.
Submission registers immutable payload bytes, then returns a result referencing them.
Task success and gate verdict are separate: a completed test report can succeed while
its mandatory quality check fails and prevents downstream dispatch.

## Commands and enforced boundaries

Each JSON command has `type` plus the fields below. Assignment/result/artifact envelopes
follow the required fields in contracts/operating-contract.md §3–4. The examples are
executable field-shape references. Only rehearsal workflow_evaluation runs are admitted.

| Command | Fields / behavior |
|---|---|
| init | manifest: run_id, objective, mode, contract_version, rehearsal:true, authorization_ref, max_attempts, gates map from R-prefixed ID to required check IDs |
| assign | assignment, work_key; stable work identity prevents task renaming from resetting counters |
| dispatch | task_id; dependencies, current gates/inputs and task/work/run ceilings must permit execution |
| artifact | attempt, artifact, payload; explicit current attempt, producer ownership, input references, SHA-256, revision uniqueness and completeness checked |
| result | result; current identity and consumed/output refs checked; stale results archived; malformed current results settled without fabricating specialist output |
| settle | task_id, attempt, reason, uncertain:boolean, progress:false; timeout/crash/no-result settlement belongs to runner |
| action | task_id, attempt, action_id, idempotency_key, target, baseline_ref, checkpoint_ref; persists intent only, never performs it |
| reconcile | action_id, outcome applied/not_applied/unknown, evidence_ref; unknown continues to block retry |
| gate | gate_id, checks, artifact_refs, authority_ref; required fail wins; missing/not_run makes inconclusive; not_applicable requires policy_ref |
| supersede | artifact_ref, new_ref; preserves history and invalidates dependent state; this adapter conservatively invalidates all rehearsal gates |
| cancel | reason; stops dispatch, settles running attempts as runner cancellation and archives later results |

Artifacts use `artifact_id@revision`; content_hash is SHA-256 of UTF-8
`JSON.stringify(payload)`. Payloads are stored in the database; content_ref is a label,
never an instruction to read a file or fetch a URL. Gate evidence references are also
labels: the trusted operator verifies their content. All ten role IDs and sole-producer
artifact ownership are recognized; decision_request is available to any assigned role.

Attempts are bounded by three per work_key, two consecutive no-progress attempts and
the run's max_attempts. Novel complete outputs provide recorded progress; the operator
must keep work keys stable across semantic rewording. There is no language model that
can infer all renamed equivalent work. Elapsed/cost fields are validated and stored;
there is no process timer or model-cost metering here. The operator must enforce those
limits and settle timed-out attempts before resuming.

## Durability and limits

SQLite uses WAL, FULL synchronization and BEGIN IMMEDIATE to serialize mutations.
State and successful event commit together. Database triggers prevent normal event
update/delete. Rejected transitions retain a rejection event without committing partial
state; malformed current results retain their rejected content and runner settlement.
This is not a tamper-proof security boundary against an operator with database access.
Only one local trusted operator authority is assumed; no authentication/RBAC server,
remote multi-host database or untrusted-agent command endpoint is provided.

Only R-prefixed rehearsal gates are supported. Production gate semantics, role-specific
payload completeness, acceptance authority authenticity, evidence URL/file resolution,
all mode-specific entry conditions and automatic execution/tool permissions remain
manual or future adapters. A passing rehearsal is not a successful ten-agent delivery
cycle or authority to start business implementation. General pilot budgets/authorities
remain MA-018; full runner/gate dispatch remains a separately scoped extension.
