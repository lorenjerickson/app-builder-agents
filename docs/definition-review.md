# Definition-set review — version 0.5.1

Date: 2026-10-25. Status: **promoted by the workflow authority (Loren), 2026-10-25**, for the rental-ops design run. Tags: `v0.4.0` (rollback), `v0.5.0` (evaluated), `v0.5.1` (current).

## Scope and method
Implements the backlog items approved in [backlog-triage-0.5.0.md](backlog-triage-0.5.0.md) (all 18 open items plus P20). The evidence comes from the rental-ops pilot runs RUN-20261025-CR01 (clean-room comparison) and RUN-20261025-DEC01 (decisions and G1). Each change is small and tied to that evidence. This review is static inspection. The behavioural effect is measured separately by the evaluation run (below).

Historical reviews: [v0.4](definition-review-v0.4.md), [v0.3](definition-review-v0.3.md), [v0.2](definition-review-v0.2.md), [v0.1](definition-review-v0.1.md).

## Changes
| Backlog | Change | Location |
|---|---|---|
| P1 | Delivery-project binding: standard layout, manual-mode gate files | contract §2a |
| P13 | `execution_mode` in run manifest; `external_baseline` provenance rule; clean-room evaluation method | contract §2, §3; coordinator §4, §5, §11 |
| P12, P19 | `decision_record` artifact with `binding_on`; binding decisions are mandatory inputs; Architecture ADR per binding directive | contract §3; coordinator §4, §5; architecture §3, §11; requirements §5 |
| P15 | `decision_request` gains explanation, recommendation, consequence of deferral | contract §3; coordinator §4; requirements §5 |
| P11, P16 | Ownership of behavioural policies with fairness or authority risk (permissions, ranking): Requirements intent / Architecture enforcement / Experience presentation / Testing fairness cases | contract §3; architecture §2; experience §5; testing §6 |
| P7, P10, P18 | Shared checklists: failure semantics, disclosure surfaces, threshold consistency | contract §3; applied in requirements §5, experience §5, architecture §2 |
| P6 | Source tags [S]/[D]/[A]/[P]/[K]; untagged [K] fails self-check | contract §3; requirements §5; template |
| P4 | Actor profiles in `requirements_spec` | contract §3; requirements §4; template |
| P5 | Requirements `discovery` mode | requirements §3, §9, §11 |
| P8 | `cross_cutting_rules` | requirements §4; template |
| P17 | `configurable_targets` separate from fixed thresholds | requirements §4, §11; testing §6; template |
| P9 | Experience `compatibility` package defined as a text interaction model with minimum content | experience §3, §11 |
| P14 | Platform profile: tenancy scope, delegation, capacity | platform-profile (capabilities, instance fields) |
| P20 | Rollback baseline committed and tagged `v0.4.0` | git |
| — | All ten definitions, template, contract and profile at version 0.5.0 | frontmatter |

## 0.5.1 increment
| Backlog | Change | Location |
|---|---|---|
| P23 | Personal attributes that change treatment are stated, never inferred; actor profiles record stated preferences | contract §3; requirements §4 |
| P24 | Disclosure checklist adds internal notes vs participant-facing communication | contract §3 |
| P25 | Failure-semantics checklist adds facts changing after a consequential action is proposed | contract §3 |

These fixes target the three EVAL-050-01 misses. They are static changes, not re-evaluated; the pilot's design run will exercise them.

## Static checks
| Check | Result |
|---|---|
| Ten definitions, twelve numbered sections each, version 0.5.0 | pass |
| New artifact type `decision_record` has producer (Coordinator) and consumers (binding roles, Requirements, Retrospective) | pass |
| New fields (`execution_mode`, `configurable_targets`, `cross_cutting_rules`, actor-profile fields, decision_request fields) each have a consumer | pass. Testing consumes configurable targets; Architecture and Experience consume profiles and rules |
| Checklists defined once (contract §3) and referenced by roles, not duplicated | pass |
| Relative links in definition-set docs | pass, except the pre-existing `docs/blueprint.md → pilot-plan.md` (stale since P3) and absolute provenance paths to `~/.agency-agents` (outside this repo, by design) |

## Known limitations
- **Runner** (`runner/`) still implements contract 0.4.0 rehearsal bookkeeping. It doesn't recognise `decision_record`, `execution_mode` or `external_baseline`. Updating it is runtime implementation and needs a separate request (backlog P21).
- Only Requirements, Experience and Coordinator behaviour has been exercised by a run; the Architecture, Branding and Testing changes are untested until the pilot's design run.
- Evidence comes from one domain. The checklists are generic, but their completeness is unproven.

## Evaluation — EVAL-050-01
A clean-room rerun by two fresh, separate agents under 0.5.0 ([scorecard](evaluations/EVAL-050-01/scorecard.md)) produced **13 of the 20** findings 0.4.0 missed, plus 4 partially; 3 were missed. No new unsourced excess appeared. Caveats: the scorer is not independent, the checklists derive from these findings, there is one domain only, and outputs are about three times larger. Residual gaps are proposed as P23–P26.

**Recommendation:** promote 0.5.0 for the pilot's design run, and fold P23–P25 (three checklist lines) in as 0.5.1 before design starts, since they're tiny. Treat P26 (verbosity) as 0.6.0 work.
