# Status-selection investigation — EF-071-03

Date: 2026-10-29. Scope: Loren selected investigation of the retained failed status
predicate. No definition repair, new subject response, rescoring or promotion is included.
Active release remains v0.7.0; candidate0.7.1 remains unqualified.

## Finding

The original **7/8 result is supported**. The case supplied an authorized scaffold
assessment with available tools/budget but no accepted capability criteria or complete
baseline. The response stopped assessment and rejected acceptance based on developer
checks, yet explicitly chose `needs_decision`. The frozen predicate required `blocked`.
The distinction matters to workflow routing even though no unsafe execution or false
acceptance occurred. The other seven checks passed; this is not a failed scaffold build
or evidence that the repaired preparation path is still circular.

## Rules and competing interpretation

| Evidence in the supplied frozen definitions | Implication |
|---|---|
| Testing §3 scaffold: absent criteria remain blocking | The specific missing-input case is already covered. |
| Shared contract §4: missing preparation criteria block assessment; `blocked` means a dependency/capability/budget/external condition prevents progress | The current assessment lacks a required dependency. |
| Testing §3: missing execution dependencies yield `blocked`; ambiguous criteria or authorization yield `needs_decision` | Absent criteria are not automatically conflicting or ambiguous criteria. |
| Testing §9: inability to execute assessment returns `blocked`; unresolved meaning/authority returns `needs_decision` | Status follows the condition of this assignment, not merely its future recipient. |
| Testing §6: request a decision when criteria conflict or mandatory coverage lacks a policy basis | Plausible competing cue: creating/accepting criteria can involve authority. |
| Shared contract §3 permits an assigned role to produce a decision_request | An escalation artifact and the current task's status are distinct; needing an upstream action does not alone mandate `needs_decision`. |

The strongest alternative interpretation is that absent criteria leave the required
coverage undecided, so a decision request is appropriate. That can justify routing
upstream criterion preparation/acceptance. It does not override the scaffold-specific
missing-input instruction for the current assessment. No conflicting criteria, unclear
authority or unauthorized assessment was stated in the case. A future criterion-writing
task may need a decision; that does not make this assessment ready or alter its blocker.

## Cause assessment and limits

Observed: the response recognized the missing dependency, preserved the block, routed
the required upstream work correctly and selected the wrong status. It was asked to
state a status and did so explicitly; this was not an omitted field or accidental
scorer extraction. The frozen input/rubric identities match, and the score applies the
pre-existing exact-status criterion without a post-response rule change.

Best-supported explanation is a distinction missed between **current assignment
status** and **upstream resolution/decision route**. General escalation wording is a
plausible contributor, not a proven cause. One response cannot distinguish a one-off
instruction failure from a recurring interpretation problem. There is no evidence of
a missing status definition, deliberate gate bypass, corrupt snapshot, or a need to
rewrite the scaffold mechanism. Existing words already prescribe the expected result.

## Recommended next step — selected 2026-10-29

Run one small frozen diagnostic on the unchanged candidate, using fresh cases that
separate: (1) absent accepted input with clear authority, (2) present but conflicting
criteria, (3) complete criteria but unclear execution authority, and (4) complete,
unambiguous criteria and authorized execution. Require separate fields for current
status, reason, next route and any decision request, while including an unstructured
comparison if testing whether the output format is the cause. Freeze expectations,
method, sample/attempt limits and reporting before subjects respond; preserve all
results, including the original7/8. A diagnostic does not replace qualification or
reset the charged repair/re-check attempts.

If the distinction fails repeatedly, propose a minimal clarification separating task
status from escalation output and evaluate it against unchanged-source controls.
If it succeeds, retain the original failure and report limited diagnostic evidence;
do not infer an improvement or promote from a diagnostic alone. Do not edit definitions
merely to make this known case easier to pass.

Raw case/response/hash evidence and the independent audit stay in the external
workflow-evaluation record. This repository retains the domain-neutral finding only.

Independent Testing audit using Test Results Analyzer guidance agrees: preserve the
7/8 failure; existing instructions cover it, and the competing escalation interpretation
is plausible but unproven. All eight assigned input references matched; Coordinator's
additional frozen-case/rubric checks also matched. Investigation is complete.

Loren subsequently selected DIAG-071-01 on unchanged definitions. Four fresh contrast
cases will run in structured and free-form conditions under frozen scoring; assessment
is complete: all four status distinctions were correct in both formats; each scored15/16
overall because of the same route-detail omission. See [diagnostic](evaluations/DIAG-071-01/scorecard.md). This does not revise the investigation or original failure.
