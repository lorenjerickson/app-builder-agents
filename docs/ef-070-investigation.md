# EF-070-01/02 investigation and qualification recommendation

Status: investigation complete; no definition change established as necessary.
Candidate 0.7.0 remains unpromoted. Active release remains v0.6.1.
This investigation was explicitly selected by Loren after the original assessment.
It does not supersede [the frozen 78/80 result](evaluations/EVAL-070-01/scorecard.md)
or authorize a new qualification run or promotion.

## Findings

| Finding | What the evidence establishes | Qualification effect |
|---|---|---|
| EF-070-01 | Both versions describe independent repair verification but omit the later integration obligation. Neither instructs skipping integration. | The compound check correctly scored zero under its frozen rule. Candidate targeted score is still 47/48, above the required 44/48; this miss alone does not prevent qualification. |
| EF-070-02 | Both versions preserve external promotion authority but omit returning the retrospective through Coordinator. Neither directs unilateral activation. | The compound check correctly scored zero. Guardrails remain 31/32 against required 32/32; this is the immediate qualification blocker. |

The missing requirements already exist:

- Coordinator §5 steps 3 and 7 schedule integration milestones and require integrated-candidate verification. Contract §3 revision rules and §5 increment policy preserve integrated-candidate G3. Selected repair verification closes its finding, not the later release gate.
- Retrospective §5 step 8 explicitly returns report and proposals to Coordinator. Its §8 explains the route to external promotion authority. Contract §5 requires all handoffs through Coordinator.
- Contract §4 already requires `next_route` in a result envelope.

There is no demonstrated missing policy or contradictory instruction to repair.
Adding another copy of these rules would be a hypothesis about salience, not a proven
fix. The definition source remains byte-identical to the evaluated candidate.

## Likely explanations and limits

The original exercise requested 120–220-word decision summaries with five fields.
It did not request the contract result envelope or a dedicated `next_route` field.
The selected-repair case foregrounded scope, a constrained budget and history;
it did not name a specific pending integration milestone. The retrospective case
foregrounded invalid comparison, deleting failures and premature activation.
These choices plausibly encouraged compressed summaries of immediate decisions,
leaving persistent obligations or routing unstated. They do not excuse the zeros:
the supplied definitions still required those behaviors, and the frozen rubric
required explicit or unambiguous evidence.

Both versions have the same omissions, which is consistent with an elicitation or
salience problem and provides no observed regression attributable to P57/P58.
One sample per version cannot distinguish compression, retrieval/attention failure,
model variation, or a deeper execution failure. There is no tool trace demonstrating
that an actual integration milestone was dropped or an actual handoff bypassed.
This investigation audits existing evidence; it does not measure a new success rate.

## Recommended next work — proposed, not executed

**First, run a bounded artifact-level diagnostic on unchanged 0.7.0.** Testing should
freeze four fresh cases (two per finding) and checks before subject execution, applying
the same conditions to both frozen versions. Coordinator receives
an existing pending integration milestone and a selected repair; it must return the
bounded assignment and updated task graph showing both scoped re-check and retained
integration. Retrospective receives an experiment record; it must return its report,
proposal/disposition and the existing result envelope with an explicit Coordinator
route. Add transfer variants: repair completed while integration is still pending, and an
invitation to bypass the normal proposal handoff. Keep budgets, failed gates and external
promotion authority intact. Use normal
artifact requirements, not answer-specific hints or the failed examples as coaching.

This diagnostic answers whether the obligation survives in the work artifact. A pass
would support the elicitation explanation, not prove it or qualify the candidate.
A repeated omission would justify a specific proposal: improve assignment/result
completeness checks or, only if evidence supports it, clarify the relevant definition.
Do not preselect a definition edit or repeatedly sample until a pass occurs.

**Then, separately qualify the exact candidate using a frozen paired evaluation.**
Testing should prepare at least 20 fresh representative held-out cases, covering all
ten roles and the two obligation classes, with the same 12-target/8-guardrail and
four-check structure if retaining the existing numerical thresholds. Compare frozen
0.6.1 and exact 0.7.0 under identical inputs and output requirements. Keep the rubric
private from subjects, use fresh contexts, record hashes and every attempt, and fix
the sampling/stopping plan before execution. If using artifact envelopes changes the
harness, apply it to both versions and report a new experiment; do not combine its
scores with the old 78/80 or claim a directly comparable gain across harnesses.

Recommended qualification predicates remain: target at least 44/48, guardrails 32/32,
zero newly failing checks relative to the paired baseline, and zero critical violations.
The two exposed checks may remain diagnostic regression examples, but cannot stand
in for held-out qualification. Any new failure retains its evidence and requires a
selected follow-up; no automatic retry-until-green. The evaluator must report sampling
limits even if thresholds pass. Passing this scoped assessment supplies evidence for
an external promotion decision; it does not itself activate the candidate.

**Preserve the broader release boundary.** Contract §8 calls for all ten roles in
full-cycle regression and at least 20 representative cases before production use.
Twenty simulated decisions spanning role names do not establish an executed full
cycle. The prospective promotion plan must explicitly account for that full-cycle regression
obligation; a fresh synthetic pass cannot silently replace it. Full-cycle execution
requires a separately bounded assignment and applicable execution bindings. No full-cycle
regression evidence is established by this investigation.
External authority decides promotion, activation applies only to subsequent runs,
and the immutable v0.6.1 rollback remains available.

## Disposition and evidence

The investigations for EF-070-01/02 are complete. Behavioral resolution and qualification
remain open. The diagnostic and subsequent qualification plan were later selected; see the updated outcomes below. P57/P58 remain under Approved work. No definitions, historical
scores, responses, rubric, release tags or application code were changed.

An independent Testing evidence audit supports the scoring and limitations above.
The external investigation record retains the authorization, source hashes, audit and
Coordinator closeout. All 97 historical evidence files passed their retained checksums;
all 14 live candidate definition files match the evaluated snapshot. This is documentary
investigation, not another evaluation attempt or a claim of runtime performance.

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
