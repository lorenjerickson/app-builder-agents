# P21 and P61/P62 independent local review

Reviewed 2026-10-30. Outcome: **supported local rehearsal subset passes after two
corrections**. This is code inspection and executed synthetic bookkeeping evidence,
not executed agent evidence, production acceptance, qualification or publication.

The review used the external Test Results Analyzer definition for evidence discipline,
with design-to-code-audit, consumer-perspective, focus-and-scope-control and
product-backlog-continuity guidance. The consumer is the trusted local operator who
needs reproducible records, explicit rejection and honest limitations. Candidate
agent rules were inspected as the product under test, not used to authorize work.

## Scope and evidence

Inspected the approved P21 delta, P61/P62 disposition, current backlog and local
QUAL-070-01 scorecard, operating contract, relevant role entry conditions, runner
policy/ledger/fixtures/tests/rehearsal and operator documentation. No raw pilot
records, external services or models were accessed. No publication was performed.

The existing suite initially passed 20 tests. Two independently added negative
regressions then failed against the implementation, demonstrating gaps despite that
pass. The author corrected implementation without editing the independent tests.
Final verification on Node v24.18.0:

- `node --test runner/ledger.test.mjs runner/independent.test.mjs`: 22 passed, zero
  failed (20 author tests plus two independent regressions).
- `node runner/rehearse.mjs`: two persistence assertions passed across CLI processes.
  Local output: `runner/.state/rehearsal-d6f812f0-e916-4ac6-9541-701922beabb0/`.
  This exercise covers durable handoff and five stored events; it is not a full
  lifecycle or role-execution exercise.

## Findings and re-check

1. **Corrected: gate-only consumer freshness.** Superseding an artifact changed all
   rehearsal gates to inconclusive but did not invalidate an already completed task
   whose recorded dependency was only `required_gate_refs`, or its derived output.
   The independent regression creates such a consumer, supersedes gate evidence,
   and requires both task and output to become invalid. The correction propagates
   invalidation through those explicitly recorded gate dependencies. It passed.
2. **Corrected: severity vocabulary.** A successful result previously accepted issue
   severity `anything` despite the contract's blocking/major/minor vocabulary.
   The independent regression requires rejection of that result. The correction
   validates the vocabulary; predicate consequences remain operator-assessed. It passed.

## Requirement coverage and boundaries

| Required area | Reviewed evidence and disposition |
|---|---|
| Version and legacy history | Explicit schema/version binding; legacy mutation rejection and unchanged stored state/events tested. No migration or relabeling. |
| Manifest and P63 scope | Required scope reference, location/phase and resource bounds, execution holds, authority/enforcement receipts checked. Real execution/isolation/cost enforcement remains manual. |
| Provenance and decisions | Unknown external inputs rejected outside permitted discovery contexts and from gates; explicit authority acceptance, decision ownership/revision records and separate propagation/placement receipts tested. |
| Modes and readiness | Role/mode matrix, named prerequisite receipts, assignment hash and predicate coverage/capability requirements checked. External prerequisite truth and semantic completeness remain manual. |
| Scaffold and increments | Scaffold path operates without product gates; candidate relabeling rejected; increment subject/scope identity checked. Exact consumed review-pair structure inspected. |
| Retry and accounting | Selection, retained original settled lineage, shared work counters, uncertainty reconciliation, stale replies, cancellation and no-progress limits tested. Semantic work identity remains operator-owned. |
| Result semantics | Mandatory self-check failure/not-run rejected; assessment execution can succeed while subject quality fails; issue policy/predicate/gate linkage and severity vocabulary checked. |
| Evidence/freshness | Immutable producer bytes plus separate evidence receipts; artifact/dependency and gate-derived invalidation checked. Broad gate invalidation remains conservative bookkeeping and starts no tests. |
| Durability/operator use | Atomic rejection, event preservation and subprocess reopen checks passed; examples/documentation explain local synthetic scope and manual responsibilities. |

References used as input/baseline artifacts, review pairs and receipt revision/dependency
lists receive ledger identity/freshness checks where explicitly resolved by the API.
Other prerequisite, readiness, preparation and external references are structural
operator attestations; merely resembling a local reference does not establish
resolution or acceptance. The operator must supply truthful completeness, authority,
source identity, semantics, revision reconciliation and actual capability evidence.
These boundaries are deliberate; this review does not claim authentication,
semantic quality validation, exhaustive path coverage or automatic production gates.

## P61/P62 disposition

The local backlog and scorecard support the existence of the coverage-reading and
mode-validation follow-ups. They do not establish the exact original invalid label,
prompt, cause or recurrence. The combined disposition correctly preserves those limits
and avoids inventing a causal diagnosis. Existing role/contract provisions address
accepted-predicate coverage, policy-backed exclusions, scaffold exceptions, mode
entry conditions and selected re-checks. No demonstrated definition defect follows
from the available evidence. The supported disposition is therefore a bounded static
finding with concrete structural P21 checks, not proof that all semantic failure
modes have been eliminated. No new definition repair or pilot activity is selected.

Backlog status consolidation belongs to the coordinating author. Publication and
activation of the unpromoted 0.7.2 candidate remain outside this review.
