# EVAL-060-01: second-domain evaluation of definition set 0.6.0 (draft)

Date: 2026-10-26 · execution_mode: `separate_agents` (one fresh agent each for Requirements `discovery`, Architecture `compatibility` and Experience `compatibility`, plus an independent scorer) · Input: a short invented narrative from a domain unrelated to pilot P-1, written for this evaluation · The scoring list was written before the runs. Narrative, scoring list, outputs and the full scorecard are kept in the pilot repository (P35).

## Results

| ID | Change tested | Result | Note |
|---|---|---|---|
| S1 | P30 state awareness | Yes | Aggregates, scope and freshness given per role; attention thresholds deferred to a decision request |
| S2 | P34 variable obligations as operator-owned rules | Yes | Configurable rules with owner, scope levels and steps; seeds tagged [K] "starting point, not legal advice"; acceptance not tied to per-jurisdiction legal review |
| S3 | P34 engine route | Yes | Rule-evaluation point per step; adopting an engine raised as a preferred-stack departure; no in-house build |
| S4 | P28 subdomain map | Yes | Bought capability classed generic, confirmation requested (approach worded outside the defined enum, minor) |
| S5 | P26 length | Yes | 130 KB in total (0.5.0 produced 182 KB from a longer input); every summary is under a page but follows 10–24 lines of front matter |
| S6 | P30 in Experience landing views | Partial | One generic landing screen referencing role aggregates; no per-role composition |
| S7 | P23–P25 regression | Yes | No inferred attributes; notes separated; re-review on changed facts (one example case not written as a scenario) |
| S8 | P35 neutrality | Yes | No pilot P-1 concepts in any output |
| S9 | P31 authoring self-check | Partial | Check reported `not_run`; list of needed operations incomplete |

**Total: 8 / 9** (7 yes, 2 partial at half).

## Failure modes found
- Experience reported `succeeded` while its operation-backing self-check was `not_run` → backlog P37.
- Experience didn't consume the Architecture compatibility output, because the Coordinator ran the two in parallel without wiring one to the other. Some questions were re-asked that Architecture had already answered → backlog P38.
- Front matter precedes the summary in every file → P38.

## Caveats
- One Experience run saw the scoring list. It was excluded, and a clean rerun was scored.
- There was a single scorer, independent of the authors and of the Coordinator. Pre-G1 modes only; Branding, design-tool authoring and post-G1 roles were not exercised.
- The scoring list targets 0.6.0 changes, so this tests uptake of those changes, not overall quality.
