# Definition-set review — version 0.6.0 (with 0.6.1 increment)

Date: 2026-10-26. Status: 0.6.0 **promoted by the workflow authority (Loren), 2026-10-26** (tag `v0.6.0`); 0.6.1 is a static, not yet evaluated increment (below). Independent review: pass with minor issues, fixed in fd5676c. EVAL-060-01: 8/9 ([scorecard](evaluations/EVAL-060-01/scorecard.md)); follow-ups P37 and P38 are implemented in 0.6.1. Rollback point: the 0.5.1 hygiene state (a94028f).

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
Run on a narrative from a different domain, with outputs kept outside this repository: **8/9** ([scorecard](evaluations/EVAL-060-01/scorecard.md)). Its failure modes became P37 and P38.

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

## 0.6.1 increment
| Backlog | Change (delta) | Files |
|---|---|---|
| P37 | A self-check applies to every mode unless that mode excludes it (then `not_applicable` citing the mode). An applicable mandatory self-check reported `not_run` cannot yield `succeeded`: the status is `blocked` (or `needs_decision`), naming the check and its missing input. No new status; the existing four are kept. Modes state their exclusions | contract §4; template §9; experience §9, §11; architecture §9; requirements §9; branding §9 |
| P38 | (a) Coordinator gives each parallel Architecture/Experience compatibility pass the peer's available draft, or runs a short reconciliation after both finish; both compatibility modes consume a supplied peer draft. (b) *Artifact presentation*: the summary is the first content, and the identity envelope sits in a separate manifest (preferred) or a trailing block | coordinator §5, §11; architecture §3; experience §3; contract §3; template §4 |
| — | Contract, profile, template and all ten definitions at 0.6.1; README version line | frontmatter; README.md |

Static checks for 0.6.1: ten definitions with twelve sections each at 0.6.1 (pass). The four result statuses are unchanged, and `not_applicable` keeps its policy basis, since the mode definition is that basis (pass). Roles without stated exclusions apply every self-check by default; see the review fixes below for mode-specific checks. Denylist scan of added lines: no domain leaks (pass). Not yet evaluated; a re-run of the EVAL-060-01 Experience compatibility pass would test both items.

### 0.6.1 independent review
A separate agent reviewed `b49d0ca`: **pass with minor issues**; denylist scan clean.

| Finding | Disposition |
|---|---|
| M1 exclusions didn't use recorded check names | fixed: Experience, Architecture, Requirements and Branding exclusions use each role's §9 check names; Branding §9 now lists its checks |
| M2 `failed` omitted | fixed: an unrun applicable self-check returns `blocked`, `failed` or `needs_decision` per the status definitions (contract §4) |
| M3 "self-check" undefined | fixed: a role's own pre-handoff check of its output; checks on an assessed subject (Testing, Monitoring, reviews) follow the gate rules |
| M4 roles with mode-specific checks stated no exclusions | fixed: checks §9 names for one mode only are excluded from other modes (contract §4); Development states its integration-check exclusion explicitly; Testing, Deployment and Monitoring checks are assessment or execution checks, and Coordinator and Retrospective have no mode-specific checks |
| M5 no approval record | fixed: P37/P38 moved to *Approved work* with Loren's 2026-10-26 approval; P37 amendment (existing statuses, no new one) recorded |
| N1 undefined reconciliation step | fixed: a further bounded `compatibility` pass with the peer's draft |
| N2 use of the peer draft unstated | fixed: Architecture records it in `consumed_refs` and doesn't re-ask answered questions |
| N3 trailing front matter | fixed: separate manifest preferred, otherwise a trailing identity block |
| N4 conditional exclusions | fixed: contract §4 allows exclusions conditional on the mode's inputs |
