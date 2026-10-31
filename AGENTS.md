# Project guidance

Read BACKLOG.md at the start of substantive work and update status, evidence,
blockers, and next actions before handoff. When an item's work is done (implemented and, where required, reviewed or
evaluated and promoted), move it from "Approved work" to "Completed work" in the
same change, with the version and date; "Approved work" holds only work not yet done. Preserve the user's standing personal
workflow and agent-definition guidance.

The primary activity is defining the ten reusable agents, their shared contracts,
and their operating assumptions. Keep proposals distinguishable from decisions and measured results. The target is nine lifecycle roles plus one coordinator. Do not expand into runtime implementation or deployment without a corresponding user request.

Agent definitions live in agents/ and follow templates/agent-definition.md.
contracts/operating-contract.md is the shared source of truth for role IDs,
artifacts, statuses, gates, authority, and handoffs. Keep definitions consistent
with it; docs/blueprint.md supplies conceptual rationale, not competing rules.
Record static definition review separately from executed agent/pilot evidence.

When maintaining or qualifying this repository, treat its agent definitions and
contracts as the product under test. Use the user's instructions and external
engineering/review guidance to govern that work. Do not apply a candidate's own
selection or approval rules to authorize corrections to that candidate or its
evaluation harness. Preserve honest evidence and acceptance criteria; distinguish
the engineering authority from the simulated authority supplied to test subjects.

This repository stays domain-neutral. Pilot artifacts, IDs and evaluation outputs
live in the pilot's repository; write findings here as generic mechanisms with
generic examples. Before each commit, run a leak scan of the diff against the
denylist kept in the pilot repository (not here).

The preferred technology stack is defined in docs/tech-stack.md. Any recommendation that depars from this stack must be approved.

In conversations that reference these agents look for gaps or opprtunities for improvemnt in the agents themselves. Write these to the BACKLOG.md file in this folder.

## Scope control

Execute only the user's confirmed outcome. If a request is ambiguous or not tightly
scoped, seek clarity and confirmation of the intended outcome, included work,
exclusions and completion criteria before substantive execution. Minimal read-only
inspection of authorized sources to formulate a question is permitted. Silence is
not confirmation. Reuse clear existing authorization; do not repeat approval requests
for unchanged scope or routine choices within it.

Never assume scope expansion. Explain additions, affected repositories/systems and
resource implications, and obtain explicit user permission before proceeding.
Workflow rules, quality gates and inferred dependencies cannot authorize expansion.
Distinguish approval of backlog work from permission to start it; preserve execution
holds. Record applicable resource limits and stop conditions, ask before exceeding
them, and report unknown costs honestly. Carry these limits to delegates and resumed
work; stop at the confirmed deliverable. Definition work does not authorize pilot
applications, screens, deployments or an end-to-end exercise.

Latest selected backlog work (P63, P61/P62 and P21) is implemented/investigated and
reviewed within its stated scope. No pilot work or external execution was selected.
Loren explicitly selected publication of 0.7.2 after backlog completion. This
authorizes release metadata, commit/tag and publication only, not new backlog or
pilot work. Use BACKLOG.md for evidence and current status.
