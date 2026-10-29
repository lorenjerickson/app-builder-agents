# Promotion — 0.7.0

Date: 2026-10-29. Authority: Loren, explicit request “promote P57/P58”.
Decision: promote the qualified 0.7.0 definition set containing P57/P58.
Active-version reference: **v0.7.0**. Rollback reference: **v0.6.1**.
Activation applies only to subsequent runs; existing runs retain their pinned definitions.
No runtime deployment or change to an existing delivery run is included.

P57 introduces bounded vertical increments and separate integration checkpoints.
P58 requires rejected work to be recorded and selected before remediation, retaining
failed gates and attempt history. Both move to Completed in BACKLOG.md.

Evidence: [independent static review](definition-review-0.7.0.md),
[qualification](evaluations/QUAL-070-01/scorecard.md): 80/80 versus 77/80 with no
regressions or critical failures, and independent FC01–FC07 pass after the selected
human-assisted full-cycle continuation. Original inconclusive evaluation and diagnostic
records remain unchanged. This does not establish production reliability or causal cost savings.

The qualified behavioral definitions are unchanged. Release-only differences update
candidate/unpromoted headers and the contract activation paragraph. Evaluation snapshots
remain immutable. Pilot evidence stays in its own repository.

Release checks: added-line neutrality scan against the external pilot denylist reviewed
23 matched lines; all are generic workflow terminology, with no pilot-specific content.
Whitespace validation passed. Independent promotion review checks qualified-source
identity with only the activation metadata differences described above.
