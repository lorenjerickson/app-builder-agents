# Ten-agent software delivery system

Define nine reusable lifecycle agents and one coordinating agent, then validate
their definitions together with a pilot project. The agent system is the primary
deliverable; the pilot is its subsequent proving exercise.

## Definition set

Version 0.6.1 (current; static increment, not yet evaluated) makes unrun mandatory self-checks block success, wires peer compatibility drafts and puts summaries before front matter. Version 0.6.0 (promoted; EVAL-060-01 8/9) added output length discipline, layered brands and theming, subdomain classification, design-tool named versions, actor state awareness, separate-agent authoring, review-finding rules, configurable rules for variable obligations and a domain-neutrality guard; see the [0.6.0 review](docs/definition-review-0.6.0.md). Version 0.5.1 (rollback point; 0.5.0 evaluated by EVAL-050-01, plus three checklist fixes) added project binding, decision records, shared checklists, actor profiles, discovery mode and tenancy/delegation profile capabilities from pilot P-1; see the [0.5.0 review](docs/definition-review.md). Version 0.4.0 (git tag `v0.4.0`) incorporated the complete-cycle definition audit. Read the shared contract first, then the role
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

- [0.6.0 definition review](docs/definition-review-0.6.0.md): 0.6.0 and 0.6.1 changes and static checks.
- [Definition review](docs/definition-review.md): 0.5.x changes and static checks; earlier reviews linked from it.
- [0.6.0 backlog triage](docs/backlog-triage-0.6.0.md) and [0.5.0 backlog triage](docs/backlog-triage-0.5.0.md): dispositions and change sketches.
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

The definitions are validated by pilot projects that live outside this repository
and perform their lifecycle work through these agents. Pilot artifacts and
evaluation outputs stay in the pilot's own repository; this repository keeps only
domain-neutral findings.

The earlier BorrowBench pilot is abandoned; its scaffold remains in
[pilot/borrowbench](pilot/borrowbench/README.md) for historical reference only.
