# Proposed backlog decision sequence

Date: 2026-10-28. Status: **P57/P58 approved by Loren on the bounded terms below; remaining sequence proposed**. Authority: Loren. Baseline: definition set 0.6.1; documentation commit a5ff4ce.

Loren approved P57/P58 in this chat: "Yes, approve P57 and P58 on that basis. Go ahead and implement the definition changes and run the review and evaluation." The remaining 19 items are proposed. Approval authorizes implementation, review and evaluation, not promotion of a new active definition set. This is framework work; it does not resume any delivery project, implement the rehearsal runtime, or promote a new definition set.

Implementation, independent review and focused evaluation of P57/P58 are complete.
The [candidate review](definition-review-0.7.0.md) records the result: static review
passed; evaluation is inconclusive and does not qualify the candidate for promotion.
EF-070-01/02 investigation was subsequently selected and is [complete](ef-070-investigation.md).
The diagnostic and qualification runs were subsequently selected; see their updated results below. No definition repair is selected.
The sequence below does not authorize remediation.

## Proposed sequence

| Order | Outcome | Items | Decision focus |
|---|---|---|---|
| 1 | Bound implementation and repair work | P57, P58; then P45, P49 | One observable increment per assignment; failures enter a planned backlog; consistent gate severity; non-blocking findings do not trigger automatic repair |
| 2 | Carry decisions and evidence reliably | P42, P47, P44, P54 | Combine overlapping P42/P47 changes; save assignments/results; recover output without rewriting producer evidence; make decision options complete |
| 3 | Keep design changes and reviews aligned | P46, P50, P48, P39, P53, P55 | Peer-change mapping, baseline invalidation, guarantee dependencies, live read-back, field/audience checks and review prerequisites |
| 4 | Strengthen evidence and execution boundaries | P51, P52, P56 | Negative controls and repeatability, verified platform facts, actual enforcement of write scope rather than an instruction alone |
| 5 | Complete platform preparation guidance | P40, P43, P41 | Adopted internal service contracts; profile/scaffold responsibilities; correct image examples. No new platform selection implied |
| Separate | Align rehearsal runtime | P21 | Explicit runtime-work request required. Its old 0.5.0 target must be reconciled with the selected definition version before any implementation |

All 21 items occur once. The sequence is a recommendation, not a new dependency graph or authority to implement every group. Review related items together to avoid contradictory rules while retaining their separate IDs and decisions.

## First decision: P57 and P58

Approved scope (2026-10-28):

1. **P57:** Architecture plans thin vertical increments, each delivering one observable behavior with explicit acceptance checks. Development implements one increment and returns at its checkpoint. Testing verifies that increment's changed behavior, module contract, denial and failure cases before dependent work advances. It does not automatically rerun the cumulative suite. Broad regression/integration remains a separate planned milestone, including integrated-candidate G3. Unexpected coupling goes back to Architecture for a bounded planning decision; it does not silently enlarge verification scope or waive evidence.
2. **P58:** A rejected increment/review produces a durable backlog finding with source, evidence, affected artifact, responsible role and proposed size. The completed attempt remains charged and its failed/incomplete result is preserved. Recording the finding consumes no new execution attempt. No repair assignment or re-check starts until the authority selects remediation into a planned increment; a new assignment does not reset the existing retry/run limits.
3. **Gate behavior:** Backlogging a failure does not turn it into a pass. A mandatory known failure keeps its affected gate failed; missing evidence remains inconclusive when no mandatory failure is known. Only independent work with satisfied dependencies may proceed.
4. **Existing authority boundaries:** These rules concern ordinary rejected delivery work. Existing explicitly authorized incident containment/recovery remains available; agents cannot use an incident label to bypass remediation planning. Author self-checks still apply within the already assigned increment; a completed failed handoff requires the planned remediation route.

Implementation clarification from independent review: distinguish increment assessment from integrated-candidate verification within Testing's existing scope vocabulary; do not require a full integrated candidate merely to check one increment. Reading evidence for a changed guarantee's dependencies (P48) does not authorize rerunning those modules. A design gap is backlogged and blocks its dependent increment; it does not automatically create a design-repair assignment. Align the contract routing table/diagram and Coordinator/Development handoffs with this rule.

P45 (severity) and P49 (non-blocking findings) follow in the same group but are not silently approved with P57/P58. P49's proposed "named acceptance conditions" must not grant permission to bypass a mandatory gate predicate.

## Implementation and evaluation after selection

- Record the chosen IDs and any amendments in BACKLOG.md under Approved work.
- Prepare the narrow definition/contract delta with consistent role references and preserve the current rollback version. Do not activate it in an already-running delivery run.
- Independently review ownership, gate semantics, attempt accounting, scope and domain neutrality.
- Evaluate focused cases: narrow successful increment; rejected increment recorded without retry; dependent work held while unrelated work remains eligible; approved remediation retaining attempt history; unexpected coupling; milestone integration finding; explicitly authorized containment.
- Measure rework and verification breadth where execution supplies comparable evidence. Flat per-increment cost is a hypothesis, not a guarantee. Static checks alone do not establish the claimed savings.
- Return the proposed version and evaluation evidence to the workflow authority for promotion. Mark items complete only when the applicable review/evaluation/promotion requirements are met.

## Subsequent diagnostic completed

Loren selected the four cases on unchanged 0.7.0. [DIAG-070-01](evaluations/DIAG-070-01/scorecard.md)
passed 16/16 checks in four first-response artifact cases. Both previously omitted
behaviors appeared; no definition edit is established as necessary. This updates
the earlier proposed diagnostic status only. The historical evaluation stays
inconclusive. Loren subsequently selected the broader comparison and full-cycle regression.
[QUAL-070-01](evaluations/QUAL-070-01/scorecard.md) passed the held-out comparison
80/80 versus 77/80, but the full-cycle run is inconclusive at G3 because mandatory
native-input evidence is unavailable. Remaining operational gates are unexecuted;
0.7.0 remains unqualified and unpromoted.
