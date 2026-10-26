# Definition-set review — version 0.6.0

Date: 2026-10-26. Status: **evaluated draft**. Independent review: pass with minor issues, fixed in fd5676c. EVAL-060-01: 8/9 ([scorecard](evaluations/EVAL-060-01/scorecard.md)); follow-ups P37 and P38 proposed. Awaiting the workflow authority's promotion and the v0.6.0 tag. Rollback point: the 0.5.1 hygiene state (a94028f).

## Scope and method
Implements the items approved in [backlog-triage-0.6.0.md](backlog-triage-0.6.0.md): P22 and P26–P35, with the approval amendment that P34 uses an adopted rules engine from the preferred stack. P36 (adding an engine to the stack) stays proposed and is not implemented; docs/tech-stack.md is unchanged. Every change is a generic mechanism; new artifact fields are optional. This review is static; the behavioural effect is measured separately (below).

Previous review: [0.5.x](definition-review.md).

## Changes
| Backlog | Change (delta) | Files |
|---|---|---|
| P22 | Stale `pilot-plan.md` link removed; the paragraph now points to the README pilot section | docs/blueprint.md |
| P26 | *Artifact presentation* rule: summary of one page or less first, detail in tables, cite the contract instead of restating it, revisions report deltas; each role's §4 points to it | contract §3; template §4; all ten agents §4 |
| P27 | Optional `brand_layers` (platform → customer organisation → sub-brand, per-layer authority) and `theming_contract` (themable vs locked tokens, validation rules); conformance review validates each theme; Experience consumes the locked/themable split | contract §3 table; branding §4, §5, §11; experience §3 |
| P28 | Optional `subdomain_map` (class core/supporting/generic, approach build/buy/customise, rationale, confidence), required before build/buy commitment; unrecorded classes go to the platform authority; buying adds anti-corruption layer and integration duties | contract §3 table; architecture §4, §5, §11 |
| P29 | A saved named design-tool version is an acceptable immutable reference when exports are unavailable; Coordinator records the save as a decision_record; assignments declare design-tool capabilities (author / read / export) | contract §3; coordinator §5; experience §4, §5, §11 |
| P30 | Optional actor-profile `state_awareness` (aggregates, scope, freshness, attention condition); Requirements asks "what must this role know before acting?"; Experience landing views cover tasks and state | contract §3 table; requirements §4, §5, §11; experience §3, §4; templates/requirements.md |
| P31 | (a) prefer `separate_agents` for authoring and review, each with its own tool access; (b) Experience self-check: every user-facing string and action is backed by a peer operation or state; (c) reviewers get the full decision set and pinned prior revisions | contract §2; coordinator §5; experience §5, §11 |
| P32 | Assignments may narrow review scope but never set severity; an unmet accepted criterion is blocking for any gate claiming it | contract §8; coordinator §5, §11 |
| P33 | Review findings carry optional `remedy_checked_against`; a behaviour-changing remedy is routed as a `contract_conflict`; Coordinator merges findings sharing a root | contract §4 (result `issues` entries); architecture §5; experience §5; branding §5; coordinator §5, §11 |
| P34 | *Variable obligations* checklist and optional `configurable_rules` (rule key, rule owner, scope levels, workflow steps, `[K]` seed set "starting point, not legal advice"); no approval depends on exhaustive per-jurisdiction legal review; Architecture defines a rule-evaluation point per step backed by an adopted engine from the preferred stack (absent one, a stack departure); Testing verifies configurability and the seed set, not legal correctness | contract §3; requirements §4, §5, §11; architecture §5, §11; coordinator §5; testing §6; templates/requirements.md |
| P35 | Domain-neutrality rule and pre-commit leak scan against a denylist kept in the pilot repository; §2a stores pilot evaluation outputs in the pilot repository, with only domain-neutral scorecards here; domain-flavoured examples replaced with generic ones (stale facts, shared-device notification, configurable-targets field and scenario) | AGENTS.md; contract §2a, §3; experience §11; requirements §4, §11 |
| — | Contract, profile, template and all ten definitions at version 0.6.0; README version line and links | frontmatter; README.md |

## Static checks
| Check | Result |
|---|---|
| Ten definitions, twelve numbered sections each, version 0.6.0; contract, profile and template at 0.6.0 | pass |
| New fields defined in the contract and used consistently: `brand_layers`/`theming_contract` (Branding produces; Experience consumes), `subdomain_map` (Architecture produces; platform authority confirms), `state_awareness` (Requirements produces; Experience consumes), `configurable_rules` (Requirements produces; Architecture, Testing consume), `remedy_checked_against` (all three reviewer modes produce; Coordinator consumes) | pass |
| New fields optional: artifact-table fields under "Optional"; `remedy_checked_against` optional in the result `issues` | pass |
| Templates match the contract (requirements template gains state awareness and configurable rules) | pass |
| New checklist (*variable obligations*) defined once in contract §3 and referenced by Requirements and Coordinator | pass |
| No orphan references introduced; P22 link fixed | pass |
| No rules engine added to docs/tech-stack.md (P36 stays proposed) | pass |
| Denylist scan of added lines (case-insensitive) | pass: no domain leaks. Remaining hits are process uses (owner of a rule or route) and substrings of ordinary words ("current", "different", "release") |

## Known limitations
- Static changes only; none is evaluated yet. P34's rule-evaluation point depends on P36; until then any engine adoption is a stack departure.
- `[K]` seed rules still need a named reviewer under the source-tag rule; that review covers broad applicability and labelling only, as confirmed by the workflow authority (Loren) on 2026-10-26 and now stated in contract §3 *variable obligations*.
- Evidence still comes from one pilot domain.

## Evaluation — EVAL-060-01
Not yet run. Planned per the triage release plan: fresh separate agents run Requirements discovery and an Experience compatibility pass on a short narrative from a different domain, stored outside this repository; scoring checks P30, P34, P28 and P26 without prompting.

## Independent review
A separate agent reviewed `076223d`: **pass with minor issues**, nothing blocking, denylist scan clean.

| Finding | Disposition |
|---|---|
| M1 undefined "contract question" route | fixed: behaviour-changing remedies route as `contract_conflict` (contract §4, §5; architecture, branding, experience) |
| M2 `remedy_checked_against` had no defined place | fixed: contract §4 places it on `issues` entries from `cross_review` / `conformance_review` |
| M3 unrecorded `[K]` seed-review scope | fixed: scope confirmed by the workflow authority 2026-10-26, stated in contract §3 *variable obligations* |
| M4 coordinator restated contract §8 | fixed: replaced with a reference to contract §8 |
| N1 coordinator restated *variable obligations* | fixed: reference only |
| N2 named version lacks `content_hash` | fixed: file ID plus named-version ID stand in for it (contract §3) |
| N3 named version could be read as replacing asset export | fixed: experience §5 step 9 |
| N4 per-layer authority defined twice | fixed: `theming_contract` references `brand_layers` |
| N5 targets vs rules unclear | fixed: requirements §4 |
| N6 blueprint tense | fixed (past tense) |
| N7 unwrapped lines | fixed |

**Accepted notes (not changed in this release):**
- N2: recording a named-version save as a `decision_record` is a loose fit for an action; kept as approved in the triage.
- N6: the README link to `pilot/borrowbench/README.md` is outside this release; handle it in a separate backlog item.
