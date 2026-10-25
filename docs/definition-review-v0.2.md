# Definition review — version 0.2.0

Date: 2026-10-24. Scope: static definitions and state-flow review. No agents were
executed against a pilot and no runtime/deployment evidence is claimed.

## Change from version 0.1.0

The former Design role is replaced by Architecture and Experience, bringing the set
to nine agents: eight lifecycle roles and Coordinator. Architecture owns technical
design; Experience owns visual look/feel and user-facing behavior. The
[previous review](definition-review-v0.1.md) is retained as historical evidence for
the original eight-agent draft, not the current definition set.

Both new definitions retain the common twelve-section format. Existing consumers
now reference separate `architecture_package` and `experience_package` artifacts.
Technical, experience, and cross-package conflicts have explicit routing.

## State-flow walkthroughs

| Case | Expected route and static check |
|---|---|
| Both roles begin after G1 | Independent drafting uses the same requirements/profile; no accepted-peer prerequisite blocks either |
| Architecture completes first | G2A can record technical completeness, but Development remains gated on joint G2 |
| Experience completes first | G2E can record experience completeness, but neither role's acceptance bypasses pair review |
| Both drafts complete | Coordinator assigns both `cross_review` tasks on exact revisions; result checks are stored outside hashed packages; G2 joins G2A/G2E and both passing reviews |
| API completes asynchronously but UI shows immediate success | `contract_conflict` routes to both owners; map pending/completion/error UI states to real operation semantics before G2 |
| UI promises undo for irreversible deletion | Resolve Experience or Architecture changes within authority, or return business tradeoff to Requirements; no silent new domain transition |
| One design package changes after acceptance | Invalidate joint G2 and pair checks; preserve unchanged peer content but reassess compatibility; invalidate affected downstream acceptance |
| Technical telemetry misses a user-outcome signal | Experience owns outcome meaning; Architecture owns event/schema/collection design; Coordinator reconciles the two |
| Candidate API passes but visual/keyboard behavior fails | Testing records independent user-facing evidence and blocks G3 according to mandatory criteria |
| Design review disagreement repeats | Shared attempt/no-progress/run limits stop unbounded negotiation; unresolved intent or authority gets a decision request |

## Verification

Structural checks cover nine role IDs, draft version 0.2.0 metadata, exact twelve
headings, local document links, scenario counts, and absence of obsolete Design
artifact/routing identifiers in active definitions. The current set contains 53
unevaluated scenario specifications.

An independent integration review checked downstream ownership, gate prerequisites,
freshness, and terminology. Parent integration aligned the `cross_review` mode and
kept pair evidence outside packages to avoid circular hash dependencies.
Review findings also aligned Deployment's Experience input with the accepted pair
and preserved the separate baseline for workflow-only changes.

## Remaining limits

Visual specifications and state-transition rules are definition requirements, not
rendered designs or executed usability tests. The exact stack, tooling, schemas,
runtime, environment policy, and numerical budgets remain unbound as before. A later
pilot must establish that the agents can produce and reconcile these artifacts in
practice. No task scope was expanded into pilot implementation.

## Guidance used for this revision

Software Architect, UI Designer, UX Architect, and Agents Orchestrator. The two new
role definitions record the source paths and adaptations.
