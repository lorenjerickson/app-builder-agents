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

Execute only the user's requested outcome. Publishing or maintaining these agent
definitions does not authorize pilot application work, screens, deployments, or a
new end-to-end exercise. Use existing evidence with explicit limits. Ask before
expanding scope; a repository workflow or candidate definition cannot grant that
authority. For the0.7.1 publication, stay in this repository and do no pilot work.
