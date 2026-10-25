# EVAL-050-01 — clean-room rerun under definition set 0.5.0

Date: 2026-10-25 · execution_mode: `separate_agents` (two fresh subagents, one per role, each in its own context) · Inputs: the rental-ops narrative only, plus the 0.5.0 contract, profile, role definitions and template · Agents were **not** shown the scoring list.

| Task | Role / mode | Output | Size |
|---|---|---|---|
| R1 | requirements / discovery | personas.md (25 actor profiles), use-cases.md (39 UCs, ~150 scenarios, 32 cross-cutting rules, DR-01…13) | 38 KB + 57 KB |
| E1 | experience / compatibility | interface-specification.md (screen inventory UC-01…39, journeys J-01…16, disclosure rules DS-01…17, XDR-01…09) | 87 KB |

Subagent token use: ≈ 138 k (R1) + 169 k (E1). Elapsed ≈ 7.5 min each.

## Score against the 20 findings 0.4.0 missed
Baseline: the 0.4.0 clean-room produced **0/20** (by construction, these are the findings it missed).

| Finding | 0.5.0 result | Evidence |
|---|---|---|
| P1 Former-resident lifecycle with closeout route | Partial | Lifecycle variant present; closeout access route not stated ("access revoked") |
| P2 Separate application decision reviewer | Partial | Leasing "proposes"; approval separation raised as DR-06, not a role |
| P3 Temporary coverage, no permission union | Yes | CAP-2, coverage banner |
| P4 Multi-capacity, one per action | Yes | CAP-1, capacity selector |
| P5 Emergency contact ≠ visitor ≠ representative | Yes | ACT-EMC / ACT-GST / ACT-REP |
| P6 Joint applicants' private evidence | Partial | Raised as a validation question only |
| P7 Stated (not inferred) communication/language preference | **Miss** | — |
| U7 Handoff with returned outcome | Yes | CCR-11; J-02 "returned outcome mandatory" |
| U8 Unknown external outcome ≠ success | Yes | CCR-26; AS-04-04, AS-08-05 |
| U9 Dependency outage → pending, not rejection | Yes | AS-08-05, AS-01-04 |
| U10 Payment after proposed notice → reassess | **Miss** | Stale-facts rule exists, not applied to this case |
| U11 Office target vs legal deadline | Yes | CCR-28, PAT-09 |
| S4 Distinct permission verbs | Yes | DS-13 |
| S5 Leakage via search/counts/breadcrumbs/notifications | Yes | DS-01…DS-07 |
| S6 Unavailable-action behaviour | Yes | PAT-04, "not available" vs denied (XDR-08) |
| S7 State vocabulary across dimensions | Partial | PAT-13 single labels; no cross-dimension table |
| S8 Capacity / acting-for / unsaved work on switch | Yes | DS-14, scope/capacity selectors, PAT-07 |
| S9 Internal notes vs participant-facing messages | **Miss** | — |
| S10 Recipient selection, minimal notifications | Yes | DS-07, DS-08 |

**Result: 13 yes, 4 partial, 3 miss (≈ 75% counting partials as half).** No new excess of the kinds seen before: no untagged [K] legal terms, no invented tour modes, no unsourced appearance options. All jurisdiction-dependent values were left open or tagged.

## Caveats
- **Scorer isn't independent.** The scorer (the session that wrote both the findings and the 0.5.0 changes) used keyword search plus reading. A second scorer would strengthen this.
- **Checklists derived from these findings.** Some gain reflects the checklists encoding the evaluation's own findings. Generalisation to another domain is untested, so the second-domain caveat in the review still holds.
- **Verbosity.** Outputs are about three times the size of the 0.4.0 clean-room (182 KB vs 62 KB), with higher reviewer cost. Consider a length or summary discipline (backlog P26).
- **Assignment gap.** The evaluation assignment omitted a run_manifest. E1 reported this correctly as an issue, so the harness should supply one next time.

## New findings from this run
- E1 noticed that a Requirements rule (entry in occupied homes blocked until an entry policy exists) undermines the recommended scope. That's a useful peer-review catch.
- Residual misses map to three small checklist additions (backlog P23–P25).
