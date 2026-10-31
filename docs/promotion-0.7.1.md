# Publication and promotion — 0.7.1

Date: 2026-10-30. Authority: Loren's explicit instruction, “Publish meta-agents
0.7.1 now. Stay in the meta-agents repository and do not do any more pilot work.”

Decision: publish and activate the0.7.1 reusable definition set containing
P39–P56 and P59. New runs bind v0.7.1; existing runs retain their pins.
Rollback: v0.7.0. This publication includes no application changes or deployment.

Evidence: independent static reviews and the current corrective textual
[evaluation](evaluations/QUAL-071-01/scorecard.md):80/80,19/19 mandatory checks,
zero baseline regressions and zero critical violations; baseline75/80.
This is incremental post-feedback evidence, not a fresh held-out generalization
result. Earlier outcomes remain preserved. The unfinished application cycle is
not claimed to pass and is not a prerequisite for this explicitly directed
publication. No production reliability or runtime implementation is claimed.

Publication updates activation metadata and current-state documentation; existing
reviewed behavioral definitions are retained. A release manifest records their
published hashes. Project scope guidance records the user's correction.

Validation is limited to repository consistency, local-reference checks, whitespace
and an added-line sensitive-content scan. The user's explicit repository-only
boundary takes precedence over the earlier instruction to read an external pilot
denylist; no external repository is accessed for this publication.
