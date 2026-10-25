# Backlog triage for definition set 0.5.0

Date: 2026-10-25 · Prepared by: Claude (Coordinator, workflow_evaluation) · Decision authority: Loren (workflow/platform authority) · Status: **approved by Loren 2026-10-25 (all items); implemented in 0.5.0 draft**

Evidence base: rental-ops runs RUN-20261025-CR01 (clean-room comparison) and RUN-20261025-DEC01 (decisions DR-01…DR-13, G1). Single domain, single-model sequential execution, so each change is kept small and tied to its evidence to avoid overfitting.

**Groups.** **A** — must land before the pilot's design run (Branding, Architecture, Experience → G2). **B** — Requirements-stage improvements; can land in the same release, or the next one, without blocking design.

**Size.** S = a paragraph or table row in one file; M = a new section or field across 2–3 files; L = a new mode or artifact type touching the contract plus several roles.

## Process prerequisite

| ID | Item | Recommendation |
|---|---|---|
| P20 (new) | **Rollback baseline.** Contract §8 requires preserving a rollback version before activating a new one, but the meta-agents git repo has no commits. | **Approve, do first.** Add a `.gitignore` (node_modules/, runner/.state/, `--help/`), commit the current tree as `v0.4.0`, and tag it. Needs your authorisation to commit, and delete permission in that folder, because git creates and removes lock files. |

## Group A — before design

| ID | Item | Rec. | Files | Proposed change (sketch) | Size |
|---|---|---|---|---|---|
| P1 | Project binding | Approve | contract §2 (new §2a) | A delivery project declares `definition_set: <version>` plus file hashes in each run manifest. Standard layout: `docs/` (accepted baselines), `docs/adr/`, `docs/_deprecated/`, `delivery/runs/<run_id>/` (run_manifest, task_graph, role drafts, gate_<id>.md, run_report, SHA256SUMS), project `BACKLOG.md`. Ledger location: a runner DB path or, in manual mode, gate files. | M |
| P12 + P19 | `decision_record` artifact, binding on named roles | Approve (merged) | contract §3 table + §2; coordinator.md §4; architecture.md §3; requirements.md §3 | New artifact `decision_record`: question, decision (verbatim), interpretation, authority, date, source, affected artifacts, `binding_on: [roles]`, supersedes. Coordinator records a decision whenever an authority decides in conversation. Roles in `binding_on` must consume it; Architecture records an ADR for each binding technical directive and runs the tech-stack departure check. | M |
| P13 | Unknown-provenance artifacts; honest execution mode | Approve | contract §2, §3; coordinator.md §5 | (a) Artifacts without an identity envelope are ingested as `external_baseline` with `provenance: unknown`. They can be inputs to discovery or comparison, never accepted inputs, until re-derived or accepted. (b) run_manifest gains `execution_mode` (`single_model_sequential`, `separate_agents`, `runner`), which the run_report must state. (c) Clean-room re-derivation is a named workflow_evaluation method. | M |
| P14 | Platform profile: tenancy scope, delegation, capacity | Approve | platform-profile.md (Identity row + instance fields) | Identity capability adds: hierarchical tenancy scope (org → group → site) on every role assignment; scope-filtered queries, search, counts and exports; delegation ("acting for") with scope and validity; multiple capacities per person with explicit selection; invited external participants. Instance fields: tenancy model, identity-provider role mapping. | M |
| P11 + P16 | Ownership of permission intent and ranking rules | Approve (merged, generalised) | contract §3 (ownership note); requirements/architecture/experience §2 | One rule: **behavioural policies with fairness or authority risk** (permissions, denied actions, prioritisation factors and exclusions) are Requirements-owned intent. Architecture owns enforcement and computation. Experience owns presentation, unavailable-action behaviour and "why" explanations. Testing derives denial and fairness cases (equal urgency ⇒ equal rank). | S |
| P9 | Experience compatibility package content; text model before Figma | Approve | experience.md §3–§5, §9 | The `compatibility` package must contain surfaces/workspaces, navigation, a screen inventory traced to requirement IDs, journey state tables (state, trigger, guard, next, focus), shared patterns, disclosure rules and proposed operation needs. It is explicitly a text interaction model, not a visual baseline; Figma stays mandatory for `initial` and G2E. | M |
| P10 | Disclosure-surface checklist (Experience) | Approve | experience.md §5 step 6, §4 `journeys_states` | Checklist: lists, search and suggestions, counts, breadcrumbs, previews, attachments, messages, exports/print, notifications (lock screen, shared device), recipient preview. Distinct permission verbs: view / edit / propose / approve / send / download / share. Capacity and "acting for" context. | S |
| P7 (Experience half) | Failure-semantics checklist | Approve | experience.md §5 step 3 | Checklist: duplicate submission/retry; unknown external outcome; partial failure; stale facts at commit; handoff and return; dependency outage/degraded mode; deadline provenance (legal vs target). | S |

## Group B — Requirements stage

| ID | Item | Rec. | Files | Proposed change (sketch) | Size |
|---|---|---|---|---|---|
| P7 (Requirements half) | Same checklist | Approve | requirements.md §5 step 3 | Same list, expressed as business rules and acceptance scenarios. | S |
| P4 | Actor profiles (personas) | Approve | contract §3 (`requirements_spec` payload); requirements.md §4; templates/requirements.md | `actors` gains goals, responsibilities, pressures, information boundary, lifecycle variants (incl. former participants), situational variants, capacity/coverage rules and a validation question. Prohibits invented demographics and biographies; UI hierarchy is excluded (it belongs to Experience). | M |
| P5 | Discovery mode | Approve | requirements.md §3–§5, §9; contract §6 note | New `discovery` mode for sources that aren't product requests (e.g. a domain narrative): domain use cases, data concepts, actors, a scope/priority recommendation and a mandatory scope `decision_request`. Cannot satisfy G1. This is the project's core premise (an app from a narrative), so it's worth naming. | M |
| P6 | Source-tag classification | Approve | requirements.md §5 step 8, §9 checks; contract §3 traceability | Every rule and term is tagged [S] source / [D] derived / [P] proposal / [K] external knowledge (needs a named reviewer) / [A] authority decision. The self-check fails on untagged [K]. Matches the tags already used in rental-ops R1+. | S |
| P8 | Cross-cutting rules section | Approve | templates/requirements.md; contract §3 payload | `cross_cutting_rules`: ID, rule, tag, basis, governed requirements. | S |
| P15 | Usable decision requests | Approve | contract §3 (`decision_request` payload) | Add `explanation` (plain language plus an example), `recommendation` with rationale, and `consequence_of_deferral`. | S |
| P17 | Configurable targets vs fixed thresholds | Approve | contract §3 payload; requirements.md §4; testing.md (one line) | `configurable_targets`: dimensions, defaults (tagged [P] until accepted), override/precedence rules, legal-deadline precedence. Testing verifies configurability and the shipped defaults. | S |
| P18 | Threshold consistency | Approve | requirements.md §5 step 8 | Check thresholds against one another (availability ↔ RTO ↔ degraded limits ↔ maintenance windows); every percentage target needs a measurement window **elicited from the authority with the arithmetic shown**, never assumed; degraded operation requires an elicited essential-functions list. | S |

## Not recommended now
None rejected. Everything above is small and evidence-backed. If you want a smaller 0.5.0, defer **P5** (discovery mode, the largest change) and **P4** to 0.6.0. The rental-ops requirements are already accepted, so they have no effect on the pilot's next stage.

## Release and evaluation plan (contract §8)
1. P20 baseline commit and tag `v0.4.0` (rollback).
2. Implement the approved items, bump every definition's `version` to 0.5.0, and update README and definition-review with a 0.5.0 findings table.
3. **Static review:** consistency of role IDs, artifact owners and producers/consumers; every new field has a consumer; links; the twelve-section format.
4. **Evaluation:** a fresh, separate agent (not this session's context) reruns the rental-ops clean-room requirements and preliminary experience pass under 0.5.0 with only the narrative as input. Metric: how many of the comparison findings 0.4.0 missed (personas P1–P7, use cases U7–U11, interface S4–S10, 20 findings) are now produced, and whether any new excess appears. That run is `separate_agents` mode, so it also tests P13.
5. You decide promotion of 0.5.0. The pilot's design run then pins 0.5.0.
