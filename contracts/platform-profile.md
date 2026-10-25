# Shared application platform profile

Profile family: `web-app-v1`. Version: 0.4.0. Status: draft architecture assumptions;
vendor/runtime bindings remain open. All ten definitions reference this profile.

## Supported application family

Authenticated database-backed web applications with explicit roles, forms, lists,
detail views, and business state transitions. Browser UI, one modular server, and
one relational database. No default assumption of mobile clients, microservices,
hard real-time processing, multi-region operation, or arbitrary integrations.

## Preferred technology stack

[docs/tech-stack.md](../docs/tech-stack.md) is the preferred stack for binding this
profile. It is a menu of approved technologies, not a required bill of materials:
include a technology only to solve a defined problem traced to an accepted
requirement, quality objective or recorded constraint. Not every technology in the
stack will be used on every project. The baseline above (browser UI, one modular
server, one relational database) stays the default; additional stack components such
as caching, graph storage, a CMS or extra apps are added only when a stated need
justifies them, and Architecture records that need in `platform_conformance`.

Using a technology outside the preferred stack, or replacing one of its components, is
a departure. A departure requires explicit confirmation from the platform authority
and an architecture decision record (ADR) before any dependent design is accepted;
see [the Architecture definition](../agents/architecture.md).

## Required capabilities

| Area | Contract assumed by agents |
|---|---|
| UI | Reusable accessible components; navigation and loading/empty/success/error/denied states; responsive behavior |
| Identity | Existing identity-provider adapter; server-side role/resource authorization; independent denied-action tests |
| Domain/API | Explicit schemas, validation, transactions, consistent error semantics, concurrency and idempotency rules where needed |
| Data | Versioned migrations, fixtures, backup/restore interfaces, migration compatibility and data-loss assessment |
| Build | Reproducible documented commands, pinned dependencies, immutable candidate artifact and source/build manifest |
| Verification | Isolated unit/integration/acceptance environments and provision for security/accessibility/performance checks |
| Deployment | Isolated environments, external secret injection, artifact promotion without rebuild, health/readiness/smoke commands |
| Recovery | Explicit application rollback and data recovery procedures, compatibility checks, evidence of recovery rehearsal |
| Telemetry | Correlated logs and metrics, health signals, audit events, user-journey signals; defined retention/redaction |
| Design tooling | Scoped Figma MCP authoring/export for Experience, stable document/node identities and immutable visual snapshots; missing capabilities block required design work |

## Profile instance required before execution

The platform authority supplies or accepts an immutable profile instance with:

- Stack/framework/dependency versions, selected from the preferred stack (with ADR
  references for any approved departures); scaffold identity and verification evidence.
- Repository layout and build/test/lint/typecheck/migration commands as applicable.
- Identity, database, hosting, and supported integration bindings.
- Artifact registry and deployment adapter; environment/configuration schemas.
- Telemetry names and query interfaces; secret provider references; access policy.
- Supported capacity and workload constraints; default quality objectives and which
  application-specific values Requirements must establish.
- Recovery capabilities and limits; supported migration patterns and authorization.
- Isolated candidate staging/provisioning interfaces usable before G3; versions of
  operational scripts/configuration; service owner and scheduler/operator bindings.

Do not execute placeholder commands or invent missing credentials/capabilities.
Requirements identifies unsupported needs; Architecture supplies a technical compatibility decision
request. A new profile is an explicit versioned platform change with evaluation.
Development and Deployment must use the same accepted profile revision.

The profile's existence does not prove its scaffold works. Testing verifies relevant
capabilities and Deployment records recovery readiness before release. A later pilot
binds this profile and evaluates the agent definitions against it.
