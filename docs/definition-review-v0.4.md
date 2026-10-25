# Ten-agent delivery-cycle audit — version 0.4.0

Date: 2026-10-24. Result: definition-level gaps identified in this audit are repaired.
The contract now describes a complete delivery and feedback cycle under its explicit
platform/tool/authority prerequisites. It is ready for pilot planning, not an assertion
of operational reliability or readiness to deploy an application.

## Scope and method

Reviewed all ten agents, the common format, operating contract, platform profile,
README, blueprint and project status. Three independent bounded reviews covered
design ownership, delivery/operations and orchestration. Findings were reconciled,
fixed in definitions, and re-reviewed. Structural checks covered exact role IDs,
version metadata, twelve-section format, links and scenario inventory.

This was static inspection and a written execution walkthrough. No agents were run
against an application, no Figma document or infrastructure was created, and no test,
deployment, service observation or evaluation result was fabricated. Existing Figma
authoring instructions in Experience were preserved and made mode-specific.

Historical reviews: [v0.3](definition-review-v0.3.md),
[v0.2](definition-review-v0.2.md), [v0.1](definition-review-v0.1.md).

## Findings and repairs

All rows below are closed as definition changes. Empirical confirmation remains
part of the future pilot; “closed” does not claim the behavior has executed.

| ID | Finding and consequence | Repair / authoritative location |
|---|---|---|
| A01 | Architecture and Experience globally required G1 even for pre-G1 compatibility; intake could deadlock | Mode-specific prerequisites in [Architecture](../agents/architecture.md) and [Experience](../agents/experience.md) |
| A02 | Requirements revision required an already accepted specification; a rejected draft had no clear continuation | [Requirements](../agents/requirements.md) accepts named draft or accepted baselines, preserving lineage and budgets |
| A03 | Figma creation/wireframe/branding steps ran unconditionally, conflicting with read-only review and in-place revision | [Experience](../agents/experience.md) scopes authoring by mode, reuses assigned document/node identities and reconciles uncertain creation |
| A04 | A live visual-design URL could change while accepted package identity stayed unchanged | [Contract §3](../contracts/operating-contract.md#3-artifact-identity-and-ownership) and Experience bind immutable visual snapshots, text mapping and invalidation |
| A05 | Required brand/UI assets could remain preparation notes without a producer | [Contract §10](../contracts/operating-contract.md#10-end-to-end-ownership-and-service-continuation) assigns Branding/external identity production, Experience UI exports and Development integration, with readiness dependencies |
| A06 | Slice integration and final candidate assembly were implied, not assigned | [Development](../agents/development.md) owns integrate mode, manifest and integrated checks; Coordinator schedules it |
| A07 | Testing needed a running candidate but could not deploy; Deployment release/rehearsal needed gates that testing had not yet established | [Deployment](../agents/deployment.md) prepares environments and stages exact candidates in isolated targets before G3; Testing independently verifies |
| A08 | Coordinator's “executes only after G4” prohibited authorized setup, rehearsal and recovery | [Coordinator](../agents/coordinator.md) distinguishes ordinary release from explicit execution exceptions |
| A09 | Test-plan acceptance, stage-specific check prerequisites, relevant risk coverage and documentation handoff were underspecified | Testing's plan is baselined against G2 with target gates, so later recovery checks do not deadlock G3; Architecture maps risks, Development supplies docs, Deployment assembles runbooks |
| A10 | Monitoring ended with a delivery run; telemetry installation, triggers and service ownership were insufficiently bound | operations_plan assigns installation to Deployment, read-only adequacy to Monitoring and continuing triggers to an external scheduler/operator; G4/G5 require applicable handoff |
| A11 | Legitimate pre-G1/incident artifacts could not omit unknown requirement IDs; incomplete outputs had no valid representation | [Contract §§3–4](../contracts/operating-contract.md#3-artifact-identity-and-ownership) adds traceability reasons, completeness/missing fields and missing-output accounting |
| A12 | No-result attempts and late successes lacked settlement rules; successful failing reports could be confused with satisfied release dependencies | Runner owns timeout/crash settlement, current-attempt fencing and cancellation; required_gate_refs supplement task dependencies |
| A13 | Retrospective input/report closure and follow-up outcome tracking were incomplete | Interim run report feeds retrospective; final report follows G7; Coordinator records follow-up authority/state and later benefit verification |
| A14 | Run policy could be read as allowing mandatory contract gates to be waived | Contract precedence explicitly limits run policy to permitted parameters; reduced scopes report milestones rather than full delivery |
| A15 | New recurring observation dispatch had no legal run-mode value; environment records still assumed faults | Explicit observation run mode and completion rules; environment_record supports purpose-or-fault and readiness evidence |

## Ownership boundaries across all ten agents

| Agent | Owns | Must not absorb |
|---|---|---|
| Requirements | Product truth, scope, business rules and acceptance intent | Brand identity, UI composition or technical implementation |
| Branding | Identity, voice/tone, editorial/visual principles, identity assets and brand conformance | UI layouts/interaction semantics or invented product claims |
| Architecture | Technical/domain/API/state contracts, risk/telemetry/recovery design, slices | Visual identity or user-facing interaction choices outside accepted intent |
| Experience | Applied visual system, Figma wireframes/branded designs, UI states/copy/assets, accessibility | New business rules, backend state semantics or competing brand identity |
| Development | Source/config/scripts, docs, asset integration, combined immutable candidate | Independent acceptance, release execution or rewriting upstream criteria |
| Testing | Baselined independent tests/fixtures, verification and defect evidence | Application deployment, product repairs or weakening mandatory checks |
| Deployment | Environment/candidate installation, release/recovery execution, operations plan and handoff | Application/infra logic design or independent acceptance of its release |
| Monitoring | Read-only coverage/health/incident assessment | Environment mutations, synthetic production writes or unbounded background execution |
| Retrospective | Evidence-backed cause analysis and improvement proposals/outcome assessment | Active policy edits, self-promotion or assuming shipped code proves benefit |
| Coordinator | Bounded assignments, gate assessment, routing, dependency/follow-up ledger | Specialist execution, fabricated evidence or external authority |

Shared areas now have producer/consumer boundaries: Branding defines tone while
Experience authors state-specific copy; Architecture defines domain transitions while
Experience exposes them; Development authors operational code/configuration while
Deployment executes it; Testing verifies while Monitoring observes real operation.
These interactions are intentional, not duplicate ownership.

## Complete-cycle walkthrough

| Step | Inputs and action | Evidence / next handoff |
|---|---|---|
| 1. Initialize | Owner supplies objective, policy/authority and available baselines; Coordinator records prerequisites and bounded work | Manifest and graph, including required gate references |
| 2. Resolve intent | Requirements drafts; Architecture/Experience compatibility and Branding discovery can answer bounded questions before G1 | Named draft revisions and decisions; G1 accepted without a pre-G1 gate cycle |
| 3. Establish identity | Branding defines/adopts identity independently and supplies required assets or explicit delivery dependencies | G2B and brand_package; Experience may already have provisional wireframes |
| 4. Produce design | Architecture records technical contracts; Experience creates/reuses Figma, preserves wireframes, applies branding and captures snapshots | G2A/G2E, asset readiness and complete visual/behavioral contracts |
| 5. Reconcile | Architecture/Experience review exact pair; Branding reviews exact brand/experience pair | Joint G2 with exact three-artifact baseline; mismatches return to owners within budgets |
| 6. Prepare verification | Testing maps requirements, quality and relevant risks; Coordinator records plan coverage | Baselined test_plan and environment needs |
| 7. Implement/integrate | Development creates slices and combines them with assets, migrations, scripts and documentation | One immutable integrated implementation_package/candidate |
| 8. Install test subject | Deployment prepares isolated environment and stages exact candidate before G3 | environment_record identifies actual digest/config/migrations; no production authority implied |
| 9. Verify | Testing checks digest and independently runs scoped functional, visual, negative and quality checks | G3 or defects; failing assessment can complete while release stays blocked |
| 10. Establish release readiness | Deployment prepares release/operations plans and rehearses; Testing assesses readiness; Monitoring reviews observation coverage | G4 with applicable recovery/alert/runbook checks and named service ownership |
| 11. Release | Deployment promotes exact verified artifact, executes authorized migrations and smoke checks, confirms operational configuration/handoff | G5, actual deployment record, runbooks and service/pilot operating policy |
| 12. Observe | Monitoring evaluates specified window/workload, raises incidents immediately | G6 health evidence or explicit fail/inconclusive; Deployment contains incidents under policy |
| 13. Review | Retrospective consumes interim run snapshot, incidents, interventions and outcomes | G7 and owned proposals; Coordinator publishes final report and follow-up states |
| 14. Continue operations | External scheduler/alert intake wakes Coordinator under operations_plan | Bounded observation/incident runs continue after delivery closes; gaps/renewal/stop are explicit |
| 15. Improve | Authorized product/brand changes return to affected roles; workflow changes use frozen evaluation and external promotion | New version/run, invalidation and independent evidence; later retrospective verifies effect |

## Adverse-path checks

- Rejected specification: revise the unaccepted draft with preserved history.
- Missing required assets/Figma capability: explicit producer/tool blocker, no invented deliverable.
- Figma edit after acceptance: new snapshot/package and affected review invalidation.
- Cross-review mismatch: no role overrides another's artifact; existing retry budgets apply.
- Failing mandatory test plus missing check: gate fails and preserves both facts.
- Candidate setup before verification: isolated staging bypasses neither G3 nor release authority.
- Timeout after external write: runner settles the attempt; actual state is reconciled before retry.
- Late/cancelled success: archived but cannot overwrite current attempt or gates.
- Changed spec/brand/design/build/config: dependency closure invalidates affected evidence.
- Irreversible migration: application rollback is not claimed to restore lost data.
- Closed delivery with a later alert: external trigger opens a bounded incident run.
- Exhausted monitoring budget: coverage gap reaches the service owner; no implied continued watching.
- Unmeasured improvement: follow-up remains unverified rather than being declared successful.

## Verification evidence and remaining prerequisites

All ten definitions retain twelve sections and version 0.4.0 draft metadata. There
are 79 unevaluated role-scenario specifications. Local links, ownership identifiers,
new mode references and cross-document consistency were checked. All original
independent findings were closed on re-review; the introduced observation-mode and
environment-record issues were also corrected.

No known blocking definition-level gap remains from this audit. The following are
execution bindings deliberately required before a pilot, not hidden agent work:

1. A selected application and accepted requirements/brand inputs.
2. A supplied/accepted platform profile and tested scaffold. Generating the first
   scaffold from nothing is outside the delivery-cycle starting assumptions.
3. Authorized Figma MCP authoring/export and any required asset capabilities/suppliers.
4. Runner or recorded manual operator, artifact/evidence storage, and executable
   envelope validation/schema binding.
5. Isolated environments, setup/deployment adapters, identity/database integrations,
   configuration/secret access and recovery mechanisms.
6. Numerical budgets, quality/coverage thresholds, monitoring workload/window and
   authority/notification policy.
7. A named service owner and scheduler/operator, or an explicit finite pilot
   observation/teardown policy.

Pilot evidence must test both the successful path and failure/recovery paths above.
Static consistency does not establish that models follow these instructions, that
tools supply the assumed capabilities, or that generated applications are correct.

## Guidance applied

Software Architect, SRE and Multi-Agent Systems Architect definitions informed the
independent reviews; Agents Orchestrator informed coordination changes. Applied the
design-to-code-audit, focus-and-scope-control, product-backlog-continuity and
consumer-perspective skills within the definition-only scope.
