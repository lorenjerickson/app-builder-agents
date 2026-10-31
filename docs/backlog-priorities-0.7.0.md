# Remaining backlog priorities after 0.7.0

Date: 2026-10-29. Baseline: promoted v0.7.0. Status: selected by Loren on 2026-10-29 (“proceed with the prioritized list”). P59 was subsequently selected for a two-role 0.7.1 candidate update;
The remaining definition sequence and focused evaluation are now selected; runtime
implementation and promotion remain outside scope.
This replaces the remaining-order recommendation in backlog-triage-next.md, preserving
its historical P57/P58 decision. Scope: P59 plus18 selected definition items and two bounded investigations; P21 remains
proposed runtime work. Reprioritized after the P59 definition update.

## Current selected work

All19 selected items (P59 and P39–P56) have definition implementations and independent
static assessment. P59 focused comparison passed32/32 for both versions. Original
broader comparison passed76/80 versus71/80 without regressions, retaining four target
omissions. P43's selected two-file repair passed static re-check, but its fresh narrow
behavioral re-check failed7/8 against8/8 (wrong result status for missing criteria).
EF-071-03 investigation is complete and supports the original failed score; no missing
rule is established. The unchanged-candidate contrast diagnostic is complete: all status distinctions correct,
15/16 overall percondition with a shared route-detail omission;
disposition the four target omissions under EF-071-04 separately. The candidate remains
unqualified/unpromoted; v0.7.0 remains active. P21 runtime work stays outside scope.
Items remain Approved until applicable qualification/promotion is complete.

## Selected execution order

Order reflects recorded consequence, recurrence, reach across roles, dependency and
likely change breadth. These are judgments, not measured return-on-investment scores.
The past estimate of avoidable rework is not a forecast. Size describes relative
work including focused review/evaluation: S is a bounded rule/evidence change; M spans
several role/contract interfaces. Runtime enforcement is sized separately when scoped.

| Order | Items | Intended outcome and reason | Next bounded step / relative size |
|---|---|---|---|
| 1 | P55 | Establish usable verification evidence before starting. Earlier capability gaps and the latest viewport/handoff correction directly affected completion and user effort. | Define check-to-capability evidence, actual viewport/visible handoff when applicable, immutable subject readiness and restoration of temporary settings. Preserve blocked/inconclusive outcomes when evidence is unavailable; human observation must be explicit. S, expanded beyond the original XS label. |
| 2 | P51 | Make developer checks capable of detecting the failures they claim to prevent. A passing self-check suite missed multiple independently found defects. P59 now makes component-boundary and generic-conformance evidence particularly relevant. | Bounded falsification and clean-state repetition for applicable invariance/boundary claims. Select controls by acceptance criterion; avoid mechanically duplicating every test. S–M; no cumulative suite per increment. |
| 3 | P42 + P47 | Make authority decisions and completed evidence reach the task graph and current status. Repeated missed revisions and stale summaries affect many roles. | One coordinated change with both IDs retained: required-revision dispositions and proposed bounded tasks, saved assignments/results, consumed-decision accounting and status reconciliation. Use registered task outputs, not indiscriminate newest-file scans. M; overlapping work must not be estimated twice. |
| 4 | P56 | Prevent out-of-scope writes during review/evidence gathering. A reverted accidental write still demonstrates the hazard. | First specify and verify the operator/host enforcement binding and safe diff procedure. A separate copy alone is not write enforcement. S for contract/binding; host/runner implementation unestimated and separately scoped. |
| 5 | P39 | Stop reporting design-tool edits that did not persist. Direct read-back is a small, observable safeguard against a demonstrated false completion claim. | Delta-scoped live node read-back and explicit zero-match failure; compare intended and persisted changes. S. |
| 6 | P46 + P53 | Keep peer revisions and user-visible fields, audiences and read consistency aligned. Repeated design omissions have concrete evidence. | P46 diff-derived peer changes first, then P53 field/audience/consistency checks. Preserve separate IDs and checkpoints. M combined; operation/string mapping already exists, so add only missing detail. |
| 7 | P52 | Prevent consequential architecture decisions resting on unverified platform assumptions. | Verify decision-bearing facts with dated primary evidence; define treatment of missing evidence without making every incidental fact a new gate. S. |
| 8 | P48 + P50 | Preserve the consequences of a change during scoped review. | Assess the remaining delta first: dependency invalidation and joint G2 rechecks already exist. Add guarantee-dependency evidence and superseded-statement reconciliation only where missing. S–M; reading related evidence does not authorize rerunning unrelated modules. |
| 9 | P45 + P49 | Make finding classification and disposition predictable without reopening automatic repair loops. | Audit against 0.7.0 first. Mandatory-predicate blocking and planned remediation already exist. Potential remaining additions: explicit predicate references and scope accounting for newly introduced content. Establish P45 predicate classification before changing P49 dispositions; do not make a non-blocking finding a new blocking condition by default. S audit; implementation only if a gap survives. |
| 10 | P54 + P44 | Reduce incomplete decision choices and recover stranded outputs without changing their provenance. | Separate small increments: parameter-complete options; then unchanged fallback transfer with verified identity. Useful but less recurrent evidence than earlier groups. S each. |
| 11 | P43 + P41 + P40 | Prepare the next scaffold/platform exercise with explicit responsibilities and sound examples. | P43 bounded profile/scaffold/source binding first; P41 image examples before reuse; P40 service-specific guidance only when that topology is selected. M overall, not one implementation pass. Check actual existing mode coverage first. |
| Separate | P21 | Align the rehearsal runtime when runtime work becomes the intended deliverable. | Keep deferred from definition work. The old 0.5.0 target is stale; scope against an explicitly selected current contract. Requires a runtime request and fresh estimate. |

P42/P47 and P50 must preserve promoted P58: recording required work and invalidating
acceptance can be immediate, but a decision record is not blanket authority to dispatch
design repairs or re-checks. Record proposed tasks and obtain selection unless the
authority decision already explicitly selects that bounded work. P55 authority treatment
cannot waive mandatory evidence. Browser-specific practices should remain in the
verification harness unless evaluation establishes a generic definition gap.

These are priority groups, not mandatory dependencies. P39 can proceed independently;
P56 moves ahead of any new shared-write review if isolation is absent. P41 must be
resolved before its image examples are used, and P43 before another scaffold attempt
that needs the missing bindings. P40 becomes a prerequisite only for the applicable
service topology. The recorded Node support claim has not been freshly verified in
this prioritization; verify current official lifecycle and packaging guidance when
selecting P41. No platform replacement is proposed here.

## Two investigation-only follow-ups

- **Coverage interpretation:** rank with P55. Compare accepted design behavior with
  the test-plan mapping before execution. Coordinator/Testing/Experience own the
  investigation; existing mandatory coverage rules may be sufficient. Do not create
  a duplicate implementation item unless evidence identifies a missing mechanism.
- **Allowed-mode validation:** rank with P42/P47. Check assignment modes against the
  pinned role before dispatch. Coordinator owns the investigation. A single recorded
  mismatch supports this check, not an automatic new mode or runtime validator.

Both are selected bounded investigations, not established definition defects. EF-070-01/02 keep
their historical scores but have completed investigation/diagnostic/qualification;
they do not re-enter this queue as unresolved promotion blockers. P57/P58 are completed.

## Next checkpoint

The EF-071-03 investigation is complete. Its unchanged-candidate contrast diagnostic
is complete; no status-rule repair is established. EF-071-04 residual finding disposition remains unselected. Preserve the failed narrow result, original comparison and attempt
lineage. No automatic repair, retry or promotion. The ordered implementation list above
is retained as the executed sequence, not a request to repeat it.

Independent read-only overlap review used Project Shepherd guidance. It favored
P42/P47 before P55 and peer-change alignment before P51. This recommendation puts
P55 first because of the fresh completion-blocking evidence, and P51 ahead of design
refinements because falsely reassuring checks can admit defective implementation.
Both choices are prioritization judgments for authority selection, not measured rankings.

Post-P59 priority change: P51 moves from third to second among unselected proposals,
after P55 and before P42/P47. The new component/interface guidance makes trustworthy
conformance checks a useful next complement. P59 does not itself implement P51 negative
controls, P46 peer-delta mapping, or P48/P50 change-impact review. Those retain separate
IDs and selection requirements. This is a dependency/value judgment, not measured benefit.
