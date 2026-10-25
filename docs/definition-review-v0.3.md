# Definition review — version 0.3.0

Date: 2026-10-24. Scope: static definition and workflow review only; no pilot or
runtime execution. Previous reviews: [v0.2](definition-review-v0.2.md) and
[v0.1](definition-review-v0.1.md).

## Change

Added Branding as the tenth agent. Branding owns product identity, personality,
positioning expression, voice/tone, terminology/editorial style, visual identity and
asset usage rules. Experience applies these to UI tokens, components, layouts,
state-specific content and interactions. Requirements retains product truth and
business rules; Architecture retains technical design.

Added brand_package, brand_conflict routing, G2B brand acceptance, and exact
brand/experience conformance checks. Existing brands may be adopted with recorded
authority. Experience may draft provisionally, but G2E requires accepted branding.
Joint G2 now records brand, architecture and experience revisions and all required
cross-review evidence. Independent Testing verifies the implemented brand application.

## Walkthroughs

| Case | Expected contract behavior |
|---|---|
| No Experience draft yet | Branding defines or adopts identity independently after G1; no circular prerequisite |
| Brand acceptance pending | Experience may draft structure, but G2E/joint G2 cannot pass |
| Existing accepted identity | Normalize and reuse authorized guidance; no automatic rebrand or new approval ceremony |
| Playful voice conflicts with serious recovery message | Preserve truth and clarity; Branding supplies contextual tone, Experience supplies exact UI content |
| Style conflicts with accessibility | Correct application or revise brand within authority; no waiver of mandatory accessibility |
| Proposed claim exceeds product capabilities | Route to Requirements; branding cannot create a product promise |
| Brand or Experience revision changes | Invalidate brand conformance and affected gates; preserve unrelated technical content while reassessing affected compatibility |
| Design conformance passes but implementation differs | Testing records independent implementation failure; brand review cannot substitute for G3 |

## Verification and limits

All ten agents retain the exact twelve-section common format and version 0.3.0
draft metadata. The set contains 64 unevaluated scenario specifications. Structural
checks cover role IDs, sections, versions, local links and whitespace. Integration
review checks ownership, consumer inputs, gate prerequisites and invalidation.
Independent review found no circular gate dependencies; its findings were resolved by
clarifying applied UI versus brand identity ownership and routing contract conflicts
to all affected owners, including Branding.

Brand definitions are reusable instructions, not an actual product identity or created
assets. No audience research, visual generation, trademark clearance, or empirical
agent evaluation is claimed. Existing tool/runtime/environment bindings remain open;
the future pilot must validate these agents together.

Brand Guardian guidance informed the new role; its provenance and scoped adaptations
are recorded in agents/branding.md. Existing orchestration rules informed integration.
