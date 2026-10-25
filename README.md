# Ten-agent software delivery system

Define nine reusable lifecycle agents and one coordinating agent, then validate
their definitions together with a pilot project. The agent system is the primary
deliverable; the pilot is its subsequent proving exercise.

## Definition set

Version 0.5.0 (draft, pending promotion) adds project binding, decision records, shared checklists, actor profiles, discovery mode and tenancy/delegation profile capabilities from the rental-ops pilot; see the [0.5.0 review](docs/definition-review.md). Version 0.4.0 (git tag `v0.4.0`) incorporated the complete-cycle definition audit. Read the shared contract first, then the role
definition. Use both with a scoped assignment; each role inherits the common rules.
These documents specify behavior and capability requirements, not installed agents.
The audit repaired ownership and handoff gaps, including isolated staging before
verification, Figma baseline preservation, asset production, and continuing operations.
Static review and the assisted ledger rehearsal are complete; full agent delivery behavior remains unverified until the pilot.

- [Common definition format](templates/agent-definition.md)
- [Shared operating contract](contracts/operating-contract.md)
- [Shared application architecture profile](contracts/platform-profile.md)

| Role | Definition |
|---|---|
| Coordinator | [Orchestration, state, gates, and routing](agents/coordinator.md) |
| Requirements | [Product intent and acceptance contract](agents/requirements.md) |
| Branding | [Product identity, voice, tone, and brand style](agents/branding.md) |
| Architecture | [Technical structure, domain contracts, and operational design](agents/architecture.md) |
| Experience | [Visual look, feel, and user-facing behavior](agents/experience.md) |
| Development | [Implementation and candidate build](agents/development.md) |
| Testing | [Independent verification and defect evidence](agents/testing.md) |
| Deployment | [Release preparation, execution, and recovery](agents/deployment.md) |
| Monitoring | [Operational observation and incident evidence](agents/monitoring.md) |
| Retrospective | [Product and process improvement proposals](agents/retrospective.md) |

## Supporting documents

- [Definition review](docs/definition-review.md): 0.5.0 changes and static checks; earlier reviews linked from it.
- [0.5.0 backlog triage](docs/backlog-triage-0.5.0.md): dispositions and change sketches.
- [Technology stack](docs/tech-stack.md): preferred stack; departures require approval.
- [Assisted coordinator ledger](runner/README.md): durable bookkeeping, operator examples and handoff rehearsal.
- [Blueprint](docs/blueprint.md): conceptual rationale and later pilot proposal.
- [Requirements template](templates/requirements.md): starting artifact format for Requirements.
- [Project backlog](BACKLOG.md): agent gaps, improvements and next work.

The shared operating contract is authoritative for the draft's vocabulary and
handoffs; the blueprint provides context. The assisted ledger rehearsal passes; real
assignment bindings, tool adapters and execution authority/budgets remain open. The
autonomous agent runtime is not implemented.

## Pilot

The definitions are being validated against the Rental Ops project in the sibling
folder `../rental-ops`, which builds an application from a narrative business-domain
description and performs all lifecycle work through these agents. Pilot artifacts
and evidence live in that project, not here.

The earlier BorrowBench pilot is abandoned; its scaffold remains in
[pilot/borrowbench](pilot/borrowbench/README.md) for historical reference only.
