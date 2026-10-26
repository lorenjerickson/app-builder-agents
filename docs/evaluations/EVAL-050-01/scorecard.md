# EVAL-050-01 — clean-room rerun under definition set 0.5.0

Date: 2026-10-25 · execution_mode: `separate_agents` (two fresh subagents, one per role, each in its own context) · Inputs: the P-1 narrative only, plus the 0.5.0 contract, profile, role definitions and template · Agents were **not** shown the scoring list.

The evaluated outputs are retained in the pilot repository; only this scorecard is kept here.

| Task | Role / mode | Output | Size |
|---|---|---|---|
| R1 | requirements / discovery | personas.md (25 actor profiles), use-cases.md (39 use cases, ~150 scenarios, 32 cross-cutting rules, 13 decision requests) | 38 KB + 57 KB |
| E1 | experience / compatibility | interface-specification.md (screen inventory covering all 39 use cases, 16 journeys, 17 disclosure rules, 9 decision requests) | 87 KB |

Subagent token use: ≈ 138 k (R1) + 169 k (E1). Elapsed ≈ 7.5 min each.

## Score against the 20 findings 0.4.0 missed
Baseline: the 0.4.0 clean-room produced **0/20** (by construction, these are the findings it missed).

| Finding | 0.5.0 result | Evidence |
|---|---|---|
| P1 Former-participant lifecycle with closeout route | Partial | Lifecycle variant present; closeout access route not stated ("access revoked") |
| P2 Separate reviewer for a consequential intake decision | Partial | The intake role "proposes"; approval separation raised as a decision request, not a role |
| P3 Temporary coverage, no permission union | Yes | Coverage capability rule, coverage banner |
| P4 Multi-capacity, one per action | Yes | Capacity capability rule, capacity selector |
| P5 Emergency contact ≠ visitor ≠ representative | Yes | Three distinct actor profiles |
| P6 Joint participants' private evidence | Partial | Raised as a validation question only |
| P7 Stated (not inferred) communication/language preference | **Miss** | — |
| U7 Handoff with returned outcome | Yes | Cross-cutting rule; a journey marks "returned outcome mandatory" |
| U8 Unknown external outcome ≠ success | Yes | Cross-cutting rule; acceptance scenarios in two use cases |
| U9 Dependency outage → pending, not rejection | Yes | Acceptance scenarios in two use cases |
| U10 Fulfilling event after a proposed adverse action → reassess | **Miss** | Stale-facts rule exists, not applied to this case |
| U11 Internal target vs legal deadline | Yes | Cross-cutting rule, shared pattern |
| S4 Distinct permission verbs | Yes | Disclosure rule |
| S5 Leakage via search/counts/breadcrumbs/notifications | Yes | Seven disclosure rules |
| S6 Unavailable-action behaviour | Yes | Shared pattern, "not available" vs denied (decision request) |
| S7 State vocabulary across dimensions | Partial | Shared pattern with single labels; no cross-dimension table |
| S8 Capacity / acting-for / unsaved work on switch | Yes | Disclosure rule, scope/capacity selectors, shared pattern |
| S9 Internal notes vs participant-facing messages | **Miss** | — |
| S10 Recipient selection, minimal notifications | Yes | Two disclosure rules |

**Result: 13 yes, 4 partial, 3 miss (≈ 75% counting partials as half).** No new excess of the kinds seen before: no untagged [K] legal terms, no invented interaction modes, no unsourced appearance options. All jurisdiction-dependent values were left open or tagged.

## Caveats
- **Scorer isn't independent.** The scorer (the session that wrote both the findings and the 0.5.0 changes) used keyword search plus reading. A second scorer would strengthen this.
- **Checklists derived from these findings.** Some gain reflects the checklists encoding the evaluation's own findings. Generalisation to another domain is untested, so the second-domain caveat in the review still holds.
- **Verbosity.** Outputs are about three times the size of the 0.4.0 clean-room (182 KB vs 62 KB), with higher reviewer cost. Consider a length or summary discipline (backlog P26).
- **Assignment gap.** The evaluation assignment omitted a run_manifest. E1 reported this correctly as an issue, so the harness should supply one next time.

## New findings from this run
- E1 noticed that a Requirements rule (a gated action blocked until a governing policy exists) undermines the recommended scope. That's a useful peer-review catch.
- Residual misses map to three small checklist additions (backlog P23–P25).
