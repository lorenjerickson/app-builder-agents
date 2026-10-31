# Ten-agent software delivery system

Define nine reusable lifecycle agents and one coordinating agent, then validate
their definitions together with a pilot project. The agent system is the primary
deliverable; the pilot is its subsequent proving exercise.

## Definition set

**Active definition set: v0.7.1**, published at Loren's explicit direction on
2026-10-30. Includes P39–P56 and P59: modular design guidance, clearer handoffs,
preparation verification, evidence handling and bounded role responsibilities.
New runs bind v0.7.1; existing pins remain unchanged. Rollback: **v0.7.0**.
See the [promotion record](docs/promotion-0.7.1.md).

Independent static reviews and the corrective textual evaluation passed
(**80/80**, all **19 mandatory checks**, no baseline regressions or critical
violations). This is a definition release; no completed end-to-end application
qualification or deployed runtime is claimed. Further pilot work is outside scope.

Version 0.6.1 (rollback; static increment, not yet evaluated; the preferred stack in docs/tech-stack.md gained a business-rules engine on 2026-10-26, P36) makes unrun mandatory self-checks block success, wires peer compatibility drafts and puts summaries before front matter. Version 0.6.0 (promoted; EVAL-060-01 8/9) added output length discipline, layered brands and theming, subdomain classification, design-tool named versions, actor state awareness, separate-agent authoring, review-finding rules, configurable rules for variable obligations and a domain-neutrality guard; see the [0.6.0 review](docs/definition-review-0.6.0.md). Version 0.5.1 (rollback point; 0.5.0 evaluated by EVAL-050-01, plus three checklist fixes) added project binding, decision records, shared checklists, actor profiles, discovery mode and tenancy/delegation profile capabilities from pilot P-1; see the [0.5.0 review](docs/definition-review.md). Version 0.4.0 (git tag `v0.4.0`) incorporated the complete-cycle definition audit. Read the shared contract first, then the role
definition. Use both with a scoped assignment; each role inherits the common rules.
These documents specify behavior and capability requirements, not installed agents.
The audit repaired ownership and handoff gaps, including isolated staging before
verification, Figma baseline preservation, asset production, and continuing operations.
Static definition reviews and the assisted ledger rehearsal are complete. Scoped pilot execution and selected behavioural evaluations have occurred; full-cycle delivery effectiveness remains unverified.

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

- [0.7.0 candidate review](docs/definition-review-0.7.0.md): P57/P58 changes, independent review and the inconclusive evaluation.
- [0.6.0 definition review](docs/definition-review-0.6.0.md): 0.6.0 and 0.6.1 changes and static checks.
- [Definition review](docs/definition-review.md): 0.5.x changes and static checks; earlier reviews linked from it.
- [0.6.0 backlog triage](docs/backlog-triage-0.6.0.md) and [0.5.0 backlog triage](docs/backlog-triage-0.5.0.md): dispositions and change sketches.
- [Technology stack](docs/tech-stack.md): preferred stack; departures require approval.
- [Assisted coordinator ledger](runner/README.md): durable bookkeeping, operator examples and handoff rehearsal.
- [Blueprint](docs/blueprint.md): conceptual rationale and later pilot proposal.
- [Requirements template](templates/requirements.md): starting artifact format for Requirements.
- [Project backlog](BACKLOG.md): agent gaps, improvements and next work.

The shared operating contract is authoritative for the draft's vocabulary and
handoffs; the blueprint provides context. The assisted ledger rehearsal passed for its
0.4.0 scope. Manual runs bind assignments, authorities and limits per run; those
bindings are not a general autonomous runtime. The rehearsal runner still needs
contract alignment (P21), and autonomous dispatch, tool adapters and automatic
enforcement remain unimplemented. See the [backlog](BACKLOG.md) for proposals and
the [runner limits](runner/README.md) for the existing rehearsal boundary.

## Pilot

The definitions are being evaluated through pilot projects that live outside this
repository and perform their lifecycle work through these agents. Pilot artifacts and
evaluation outputs stay in the pilot's own repository; this repository keeps only
domain-neutral findings.

Current evidence: 0.5.0 has a scoped clean-room comparison; 0.6.0 scored 8/9 in
[EVAL-060-01](docs/evaluations/EVAL-060-01/scorecard.md), a second-domain pre-G1
exercise. The 0.6.1 increment is implemented, reviewed and tagged; its P37/P38-specific
reevaluation is still absent. It served as the baseline for the P57/P58 comparison. None of these results proves full-cycle delivery.
P57/P58 are implemented, qualified and promoted in v0.7.0; they are under Completed
work. The two findings have been [investigated](docs/ef-070-investigation.md); no definition
edit is established as necessary. The selected [diagnostic](docs/evaluations/DIAG-070-01/scorecard.md)
passed 16/16 on unchanged 0.7.0. The subsequently selected
[qualification run](docs/evaluations/QUAL-070-01/scorecard.md) passed its held-out
comparison (80/80 versus 77/80) and completed all seven full-cycle checks after
selected human-assisted native-input verification and actual recovery, release and
finite observation. Independent final assessment qualified unchanged 0.7.0; services
are stopped with evidence retained. This local cycle does not establish production
reliability or causal efficiency. Other proposals remain unselected.

The earlier BorrowBench pilot is abandoned; its scaffold remains in
[pilot/borrowbench](pilot/borrowbench/README.md) for historical reference only.
