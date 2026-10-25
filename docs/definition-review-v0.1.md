# Definition review — version 0.1.0

Date: 2026-10-24. Scope: static document review and scenario walkthroughs only.
No agents, runner, application, deployment, or empirical evaluations were executed.

## Deliverables checked

- Eight definitions follow the same twelve-section format and draft version metadata.
- Shared contract defines artifact ownership, envelopes, statuses, gates, authority,
  retries, invalidation, side effects, recovery, and improvement promotion.
- Platform profile defines shared capabilities and explicit future bindings.
- Definitions include 40 unevaluated behavioral cases in total. These are a starting
  evaluation inventory, not evidence that the system passes an evaluation suite.

Structural checks inspected all eight role IDs, frontmatter, exact heading order,
minimum scenario counts, and local Markdown link targets. All passed after integration.

## Cross-role walkthroughs

| Case | Contract path checked | Static result |
|---|---|---|
| Successful delivery | Requirements G1 → Design G2 → Development → Testing G3 → Deployment preparation/readiness/G4 → G5 → Monitoring G6 → Retrospective G7 | Every stage has a producer, consumer and gate; runner acceptance remains separate from agent claims |
| Ambiguous or unsupported intent | Requirements decision request; optional preliminary Design compatibility assessment; product/platform authority; new accepted revision | No requirement to accept an unresolved spec merely to get feasibility input |
| Failed acceptance check | Testing completes report with failing verdict; Coordinator routes defect; Development repairs; Testing checks new candidate | Task success cannot override failed G3; criteria remain unchanged |
| Broken test environment before build | Testing/Development fault evidence → Deployment environment_repair → environment_record → affected checks rerun | No candidate or incident report prerequisite for isolated environment repair |
| Recovery readiness before release | Deployment prepares → authorized isolated rehearsal after G3 → Testing readiness assessment → G4 | Rehearsal does not require production approval and does not grant it |
| Uncertain deployment | Persisted action ID → inspect actual state → reconcile → bounded retry or blocked record | No blind repeated side effect; application/data recovery distinguished |
| Incident needs code repair | Monitoring incident or deployment failure evidence → Development repair → independent Testing → authorized Deployment → recovery observation | Operational evidence can start repair without a Testing-authored defect report |
| Missing checks plus known failure | Known blocking failure dominates verdict; missing evidence remains recorded | Neither inconclusive nor incomplete reporting can mask an established failure |
| Spec changes while tests run | Coordinator invalidates dependency closure; late report retained historically | Stale candidate cannot pass current release gates |
| Workflow-only improvement | Retrospective proposal → separately authorized change/evaluation → Development/Testing → external promotion for later runs | Frozen workflow baseline replaces irrelevant product G1/G2; active scorer/rules cannot self-modify |

## Integration findings resolved

Independent review identified operational repair intake, pre-release environment
repair ownership, and an overbroad accepted-requirements prerequisite. Parent review
also resolved failure-verdict precedence, independent readiness verification/rehearsal,
and pre-G1 compatibility triage. The definitions and shared contract were revised
together; no additional permanent agent roles were introduced.

## Still unproven or unbound

Document consistency does not establish agent reliability, tool correctness, test
independence in practice, production safety, or application quality. Before execution,
bind the stack/scaffold, runner or manual operator procedure, tools/storage, executable
schemas, environment permissions, budgets, service objectives, and evaluation corpus.
The pilot comes after definition review and tests the roles together. Its observations
may justify revisions; do not label these drafts validated before that evidence exists.

## Agency guidance used

Agents Orchestrator; Product Manager; Software Architect; Minimal Change Engineer;
Test Automation Engineer; DevOps Automator; SRE; Feedback Synthesizer. Each definition
records its source and adaptations. Sources informed these drafts but are not runtime
dependencies or substitutes for the local shared contract.
