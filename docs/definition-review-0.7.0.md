# Definition-set review — 0.7.0

Promotion update: 2026-10-29. QUAL-070-01 independently qualified this definition set; Loren authorized promotion. See [promotion record](promotion-0.7.0.md). The following initial review status is historical.

Date: 2026-10-28. Scope: **approved P57/P58 only**. Candidate source is implemented;
independent static review passed. Focused evaluation is **inconclusive / not qualified
for promotion** ([scorecard](evaluations/EVAL-070-01/scorecard.md)). Active release:
**v0.6.1**. No commit, tag, promotion or change to a running delivery baseline is made.

## Definition changes

| Area | Change |
|---|---|
| Shared contract §5 | One observable behavior per increment; explicit acceptance/dependency boundaries; independent increment checkpoint; separate integration milestones |
| Rejected work | Durable backlog finding with source, evidence, affected artifact, responsible role, proposed size, dependencies, disposition and attempt lineage; authority selection before repair/design revision/re-check |
| Gate and budget integrity | Backlogging never passes a gate; dependent work stays blocked; eligible independent work may continue; charged attempts and no-progress history survive new assignment IDs |
| Architecture | Plans vertical increments and integration checkpoints; coupling/design gaps need a selected planning decision, not automatic expansion |
| Development | One implement/repair increment per assignment; returns at checkpoint; pre-handoff self-check corrections stay within existing scope, while rejected handoffs require planned remediation |
| Testing | `increment` assessment scope inside existing verify/reverify modes; exact scoped candidate/setup rather than a future full release prerequisite; no cumulative suite at each increment; integrated-candidate G3 remains unchanged |
| Other roles and shared flow | Rejection routes consistently use selection; explicit incident containment/recovery and uncertain-side-effect reconciliation remain available under existing authority |
| Identity and examples | Ten roles retain twelve sections; source/profile/template identify unpromoted 0.7.0; focused scenario tables are specifications, not execution evidence |

P45/P49 and other proposed changes are not adopted. No new lifecycle role, gate,
artifact type, runtime, technology selection or product behavior is introduced.
The contract's active-version notice requires new delivery runs to use the active
0.6.1 set until promotion; candidate evaluation uses 0.7.0 only as its subject.

## Review and verification

- Development's 20 author checks passed. Coordinator's 16 structural/reference checks
  passed. These overlap and are not counted as separate proof of behavioral quality.
- A separate Architecture compatibility review passed 11 checks with no actionable
  findings; it compared all 14 baseline/candidate files and verified 28 file hashes.
- Raw domain-scan matches were generic process terms; semantic review found no
  introduced pilot-domain requirements or identifiers in the definition delta.
- The exact 14-file candidate reviewed and evaluated was integrated into the working
  tree. Its frozen source remains in the external evaluation record; rollback is the
  immutable active v0.6.1 definition set, not a reconstruction from summaries.
- Fresh paired simulations scored 68/80 baseline and 78/80 candidate, with zero
  regressed checks. Candidate guardrails were 31/32 rather than the required 32/32,
  so static review success does not authorize promotion.

## Remaining decision

EF-070-01 and EF-070-02 in [BACKLOG](../BACKLOG.md) preserve the shared response
omissions. Their cause is not established; both obligations are already explicit.
The selected [investigation](ef-070-investigation.md) is complete; it supports the original
zeros but establishes no necessary definition edit. The subsequently selected diagnostic and qualification outcomes appear below. No definition repair is assigned; the original result and frozen rubric remain historical.
At the initial review, P57/P58 stayed under Approved work pending qualification/promotion.
The requested implementation, review and evaluation are complete; production-use
or full-cycle validation remains outside this result.

## Subsequent diagnostic completed

Loren selected the four cases on unchanged 0.7.0. [DIAG-070-01](evaluations/DIAG-070-01/scorecard.md)
passed 16/16 checks in four first-response artifact cases. Both previously omitted
behaviors appeared; no definition edit is established as necessary. This updates
the earlier proposed diagnostic status only. The historical evaluation stays
inconclusive. Loren subsequently selected the broader comparison and full-cycle regression.
[QUAL-070-01](evaluations/QUAL-070-01/scorecard.md) passed the held-out comparison
80/80 versus 77/80. The first full-cycle assessment was inconclusive at G3 because
native-input evidence was unavailable. The selected continuation subsequently closed
that gap, executed the remaining operational gates, and passed independent FC01–FC07
assessment. Loren promoted 0.7.0 on 2026-10-29; P57/P58 are now Completed.
