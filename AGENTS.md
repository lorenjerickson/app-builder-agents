# Project guidance

Read BACKLOG.md at the start of substantive work and update status, evidence,
blockers, and next actions before handoff. Preserve the user's standing personal
workflow and agent-definition guidance.

The primary activity is defining the ten reusable agents, their shared contracts,
and their operating assumptions. Keep proposals distinguishable from decisions and measured results. The target is nine lifecycle roles plus one coordinator. Do not expand into runtime implementation or deployment without a corresponding user request.

Agent definitions live in agents/ and follow templates/agent-definition.md.
contracts/operating-contract.md is the shared source of truth for role IDs,
artifacts, statuses, gates, authority, and handoffs. Keep definitions consistent
with it; docs/blueprint.md supplies conceptual rationale, not competing rules.
Record static definition review separately from executed agent/pilot evidence.

This repository stays domain-neutral. Pilot artifacts, IDs and evaluation outputs
live in the pilot's repository; write findings here as generic mechanisms with
generic examples. Before each commit, run a leak scan of the diff against the
denylist kept in the pilot repository (not here).

The preferred technology stack is defined in docs/tech-stack.md. Any recommendation that depars from this stack must be approved.

In conversations that reference these agents look for gaps or opprtunities for improvemnt in the agents themselves. Write these to the BACKLOG.md file in this folder.