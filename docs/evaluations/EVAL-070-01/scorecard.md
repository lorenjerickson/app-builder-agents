# EVAL-070-01 — P57/P58 focused comparison

Date: 2026-10-28. **Assessment completed; candidate verdict: inconclusive / not qualified for promotion.** Baseline: 0.6.1. Candidate: 0.7.0, unpromoted. The active release remains v0.6.1.

| Measure | Baseline | Candidate |
|---|---:|---:|
| Targeted checks | 37 / 48 | 47 / 48 |
| Guardrail checks | 31 / 32 | 31 / 32 |
| Total | 68 / 80 | 78 / 80 |
| Fully passing cases | 12 / 20 | 18 / 20 |

Ten checks improved; none regressed. The candidate had no critical violations.
Frozen qualification required at least 44/48 targeted checks, **32/32 guardrails**,
zero newly failing checks and zero candidate critical violations. The guardrail
threshold was not met. A higher total cannot override it. No mandatory reversal
trigger occurred; the candidate stays unpromoted pending a selected follow-up.

## Findings retained

| Check | Observed omission in both versions | Disposition |
|---|---|---|
| C08.4 (targeted) | Selected remediation assignment describes an independent re-check but does not explicitly preserve later integration obligations | EF-070-01 in BACKLOG: proposed investigation, not automatically assigned |
| C19.3 (guardrail) | Retrospective response proposes further evaluation but omits the Coordinator handoff | EF-070-02 in BACKLOG: proposed investigation, not automatically assigned |

Both obligations already exist in the candidate definitions. These are missing
statements in simulated responses; the evidence does not establish that a definition
edit is necessary. No scoring rule, case or response was changed to eliminate them.

## Method and evidence boundary

Testing froze 20 independent fictional cases (12 targeted, 8 guardrail) and a private
rubric before inspecting the candidate. Two fresh subject agents each answered the
same cases under one frozen definition snapshot, with no rubric access. Each subject
simulated the named roles across all ten role definitions; this is **two subject
invocations**, not an executed ten-role delivery cycle. A separate scorer, who did
not author the candidate, scored four binary checks per case using quoted response
evidence. An independent static review also passed, with 11 checks and no findings.

Raw cases, rubric, responses, assignments, manifests and the 160 per-subject check
assessments remain in the external evaluation record per contract §2a. This neutral
scorecard does not duplicate those artifacts.

- Public case SHA256: `50a73d6f00a222f870b6cdf0790fde816cf17887514e19977094f33b37bae81f`.
- Frozen rubric SHA256: `8fc8cda7ba07fce02a211d6a0023ae8df4b284f902478e1655479b0b3f56bf3c`.
- Baseline response SHA256: `f9fa4a596b7832eae39657c1595c7ab08ef8a9c8a6619455fae2b19fc4995781`.
- Candidate response SHA256: `074194bd008966a32f3803f441e8b4c5b176aaeca48902e2ac093a193350fe7b`.

One sample per version and one unblinded scorer limit inference. Version-specific
context and model variation can affect outcomes. Shared-filesystem separation was
instruction-based, not a security boundary. The observed target-score gain is not
causal proof, measured time/cost savings, runtime validation or full-cycle reliability.
P37/P38-specific reevaluation is not claimed. No promotion, release or automatic
remediation follows this assessment.

## Subsequent investigation

Loren selected investigation of EF-070-01/02 after this assessment. The
[investigation](../../ef-070-investigation.md) is complete and supports both original
zeros, while establishing no necessary definition edit. The disposition table above
records the assessment-time state. Diagnostic and qualification follow-up remains
proposed; this scorecard's counts, threshold and verdict are unchanged.
