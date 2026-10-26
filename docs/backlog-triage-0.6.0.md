# Backlog triage for definition set 0.6.0

Date: 2026-10-26 · Prepared by: Coordinator (workflow_evaluation) · Decision authority: Loren (workflow/platform authority) · Status: **approved by Loren 2026-10-26 (all items as described)**. Amendment at approval: P34 uses an adopted open-source rules engine from the preferred stack; it never builds one (P36, proposed and deferred)

Evidence comes from pilot P-1, through its design stage (G2): clean-room, decision, branding and design runs, with separate-agent authoring and review from the second design round onward. It is still one domain, so every change below is written as a generic mechanism, and the evaluation (below) uses a different domain.

Scope: P22 and P26–P35. P21 (runner code) stays proposed.

## Recommendations

| Item | Change | Recommendation | Target | Delta | Size |
|---|---|---|---|---|---|
| P22 | Stale blueprint link | Approve | docs/blueprint.md | Fix the link or remove it | XS |
| P26 | Output length discipline | Approve | contract §3 (artifact presentation); each role's output section | Every artifact opens with a summary of one page or less (decisions, open items, gate-relevant results); details go in tables; never restate the contract; revisions report deltas, not full restatements | S |
| P27 | Layered / multi-tenant brands | Approve | branding.md, contract artifact table, experience.md inputs | Optional `brand_layers` (platform → customer → sub-brand) and `theming_contract` (themable vs locked tokens, per-layer authority, theme validation rules, scope of platform-brand appearance); conformance review validates each theme; Experience consumes the locked/themable split | M |
| P28 | Subdomain classification before build/buy | Approve | architecture.md, contract `architecture_package` | `subdomain_map` (subdomain, use cases, class core/supporting/generic, approach build/buy/customise, rationale, confidence); unconfirmed classes go to the platform authority as a decision_request; build/buy choices cite it; buying adds anti-corruption-layer and integration duties | M |
| P29 | Visual baseline without exports | Approve | experience.md, coordinator.md, contract (immutable references) | A named version in the design tool is an acceptable immutable reference when exports are unavailable; Coordinator asks the authority to save it and records the save as a decision_record; assignments declare design-tool capabilities (author / read / export) | S |
| P30 | State awareness, not just tasks | Approve | requirements.md (actor profiles, step 3), experience.md | Actor profiles gain `state_awareness` (the aggregates each role needs, with scope and freshness, and when an aggregate needs attention); Requirements asks "what must this role know before acting?"; Experience landing views cover both tasks and state | S |
| P31 | Separate-agent authoring | Approve (a, b, c) | coordinator.md, experience.md, contract execution_mode | (a) prefer `separate_agents` for authoring as well as review, giving authors their own tool access; (b) Experience self-check: every user-facing string and action is backed by a peer operation or state; (c) reviewers get the full decision set (ADRs) and pinned prior revisions | S |
| P32 | No severity pre-classification | Approve | coordinator.md §5, contract §8 | Assignments may narrow review scope but never set severity; an unmet accepted criterion is blocking for any gate that claims to cover it; add an evaluation scenario | XS |
| P33 | Check remedies against the counterpart contract | Approve | contract review-finding shape, all reviewer sections, coordinator.md | Findings carry `remedy_checked_against` (peer revision); a remedy that changes behaviour is routed as a contract question; Coordinator merges duplicate findings that share a root before routing | S |
| P34 | Variable obligations as operator-owned rules | Approve | requirements.md, contract §3 checklist, architecture.md, coordinator.md | Requirements identifies regulated or customer-specific variability and records it as `configurable_rules` (rule key, owner, scope levels, workflow steps affected, seed set tagged [K] "starting point, not legal advice"); approval never depends on exhaustive jurisdictional legal review; Architecture provides a rule-evaluation point per workflow step, backed by an adopted engine from the preferred stack (P36), not one built in house; Testing verifies configurability and the seed set, not legal correctness. Generalises `configurable_targets` (P17) | M |
| P35 | Domain-neutrality guard | Approve | AGENTS.md, contract §2a project binding, three definition lines | Rule: the library stays domain-neutral; pilot artifacts, IDs and evaluation outputs live in the pilot repository; findings are written as generic mechanisms; a leak scan runs before each commit against a denylist kept in the pilot repo. Remove the three remaining domain-flavoured examples in definitions: contract §3 stale-facts example, experience.md evaluation scenario (notification on a shared device), and requirements.md configurable-targets example | S |

## Already done (pre-triage hygiene, under P35, approved 2026-10-26)
- Pilot-domain outputs from EVAL-050-01 moved to the pilot repository. The scorecard here is neutral.
- Backlog, 0.5.0 triage, definition review and README provenance reworded as "pilot P-1". Git history still contains the earlier text; it wasn't rewritten, by decision.

## Release plan
1. **Approval:** Loren approves, edits or defers items.
2. **Rollback point:** the current tree is committed as the 0.5.1 hygiene state.
3. **Implementation:** one commit for the definition changes; contract version 0.6.0 (new optional artifact fields: `subdomain_map`, `brand_layers`, `theming_contract`, `state_awareness`, `configurable_rules`, `remedy_checked_against`).
4. **Independent review:** a separate agent reviews the diff for consistency, scope creep and domain leaks (denylist scan plus reading).
5. **Evaluation (EVAL-060-01):** fresh separate agents run Requirements discovery and an Experience compatibility pass on a short narrative from a **different domain**, written for the evaluation and stored outside this repo. Scoring checks whether P30 (state awareness), P34 (variable obligations as rules), P28 (subdomain map at a design-entry check) and P26 (length) show up without prompting.
6. **Commit and tag `v0.6.0`** after approval of the evaluation result.
