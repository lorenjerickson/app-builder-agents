# Technology Stack Specification

Status: draft platform specification for a modern web application.

## Objective

This stack is designed for a full-featured web application that needs a strong product experience, secure identity, scalable API services, relational persistence, caching, graph-based relationship modeling, and flexible content authoring. The architecture balances developer velocity, maintainability, and operational flexibility while keeping a single TypeScript-first engineering model across the application.

## Summary

| Layer | Technology | Purpose |
|---|---|---|
| Monorepo | Turbo monorepo | Coordinate apps, packages, and shared tooling across the project |
| Frontend | Next.js + React 19 + compiler | High-performance web UI with server and client rendering, route-level data loading, and modern React capabilities |
| Backend API | NestJS + TypeScript | Structured, modular API layer with validation, authorization, and service-oriented architecture |
| Database | PostgreSQL | Primary transactional data store for application data, accounts, and business workflows |
| Cache / events | Redis | Session storage, caching, queue coordination, rate limiting, and transient application state |
| Identity | Auth0 | Authentication, authorization, user identity management, and enterprise SSO integration |
| Graph data | Neo4j | Relationship-heavy data such as social graphs, recommendations, entity connections, and networked domain logic |
| Business rules | GoRules ZEN Engine + JDM Editor (MIT), run as a separate rules service | Evaluation of operator-authored decision tables and expressions, with a trace, in its own app behind a platform-owned, engine-neutral HTTPS contract. Use only for configurable rules, not authorisation or plain settings |
| CMS | Payload CMS | Headless/content management system for structured marketing, editorial, and product content |
| Language | TypeScript | Consistent typing and shared contracts across frontend, backend, and tooling |
| Testing | Vitest | Fast unit, component, and integration testing across the monorepo |
| Build tooling | Turbopack + Turbo | Fast local development, aggressive caching, and optimized workspace builds |

## Architectural model

The application follows a modular monorepo structure with independent runtime services that share a common TypeScript contract layer:

- `apps/web`: Next.js application for customer-facing web experiences
- `apps/admin`: optional admin or internal dashboard application
- `apps/api`: NestJS API layer for business logic and integrations
- `apps/cms`: Payload CMS for authoring and content publication
- `apps/rules`: optional rules service; the only app that contains the business rules engine, reached through `packages/rules-contract`
- `apps/rules/authoring`: the rules service's engine-specific authoring UI, built as static assets for its own origin
- `packages/ui`: shared React component library
- `packages/types`: shared domain and API contract models
- `packages/rules-contract`: engine-neutral rules service contract (OpenAPI document, generated types and client)
- `packages/eslint-config`: lint and formatting standards
- `packages/db`: shared Prisma-like or typed DB layer and migration tooling (if used)

The system is intentionally split between presentation, business logic, and data ownership. Next.js handles web delivery, NestJS handles backend domain operations, PostgreSQL stores transactional state, Redis accelerates shared state, Neo4j stores graph relationships, and Payload manages content workflows.

## Frontend: Next.js + React 19 + compiler

The frontend should use Next.js as the primary application framework and React 19 as the rendering and component foundation. The React 19 compiler is part of the stack to improve developer ergonomics and reduce the need for manual optimization while preserving fast rendering patterns.

### Frontend requirements

- Use the App Router for route-based layouts, nested pages, and server-first rendering
- Prefer React Server Components for data-heavy or security-sensitive views
- Use client components only where browser interactivity is required
- Keep shared client/server contracts in typed packages
- Use Turbopack in development for rapid iteration and warm caching
- Keep route loading, streaming, and error states consistent across the product experience

### Why this choice

- Next.js provides strong routing, performance optimization, and framework primitives for modern web apps
- React 19 introduces a more efficient and modern component model optimized for modern UI architectures
- The compiler reduces repetitive tuning work while simplifying app design and maintenance
- The stack is well-suited for authenticated product experiences and content-rich pages

## Backend: NestJS + TypeScript

NestJS provides the backend API foundation. It is a structured Node.js framework that fits a modular enterprise-style service design and integrates well with TypeScript, validation, dependency injection, and testing.

### Backend requirements

- Modular service-based architecture with explicit domain boundaries
- Validation pipes and DTO schemas for all inbound requests
- Role-based and resource-based authorization enforcement at the API boundary
- Consistent error handling, rate limiting, and observability hooks
- Integration with PostgreSQL, Redis, Neo4j, and Auth0 services via adapters or client libraries
- Reusable domain services for workflow orchestration and business rules

### Why this choice

- NestJS supports enterprise-grade API architecture with strong code organization
- Dependency injection and decorators make complex backend services easier to scale safely
- TypeScript compatibility keeps the API and frontend contracts aligned
- It is well suited for service layers that need durability, validation, security, and clear ownership

## Data platform

### PostgreSQL

PostgreSQL is the source of truth for transactional business data.

Use PostgreSQL for:

- user accounts and application records
- orders, invoices, permissions, and workflow state
- relational domain models and cross-table consistency
- transactional operations that require atomicity and integrity

Requirements:

- schema versioning and migration-based changes
- robust indexing for search and filtering
- support for row-level security or application-level authorization controls where needed
- backup, restore, and operational retention procedures

### Redis

Redis is used as the high-speed operational layer for time-sensitive application state.

Use Redis for:

- session and token caching
- request throttling and rate limiting
- transient caching for expensive computed data
- queue coordination and lightweight pub/sub workflows
- short-lived operational state and job tracking

Requirements:

- TTL-based data policies for cacheable content
- cache invalidation strategy that respects data updates
- isolation between application and background worker flows

### Neo4j

Neo4j is included for graph-oriented relationships and connected domain logic.

Use Neo4j for:

- user-to-user or entity-to-entity relationship maps
- recommendation and discovery graphs
- networked domain data such as teams, communities, and connections
- relationship traversal and graph queries that would be inefficient in a relational store alone

Requirements:

- clear separation between transactional relational data and graph-native relationship data
- explicit consistency and synchronization rules between Neo4j and PostgreSQL when both represent related facts
- data ownership boundaries to avoid duplicated source-of-truth conflicts

## Business rules service: GoRules ZEN Engine

Configurable business rules run in a dedicated **rules service** (`apps/rules`): its own app, process, container and deployment. Other apps reach it only through a platform-owned, engine-neutral, versioned contract. The engine inside it today is the GoRules ZEN Engine, an open-source rules engine written in Rust with Node.js bindings; decisions are JSON Decision Model (JDM) documents (graphs of decision tables, switches, expressions and sub-decisions). The JDM Editor is the matching open-source React editor. Because callers depend only on the contract, the engine can be replaced by changing the rules service, its stored content and its authoring UI alone.

### Use it when
- Business rules must be **configured by non-developer operators** and change without a deployment.
- Rules vary by **tenant, site, region or jurisdiction**, and each decision must record **which rule version** produced it.
- A **"why" trace** for each decision is needed for audit or for explaining it to the user.
- Rules are naturally **tables or conditions** that produce values, lists, targets or advisories.

### Don't use it when
- **Authorisation** is the problem. Enforce that in the API with the identity layer (Auth0 claims plus server-side checks).
- The setting is a **plain value** (a number, a list, a template) with layering. A versioned policy record in PostgreSQL is enough.
- The logic is **core product behaviour** owned by developers and changed through releases. Write it as code, with tests.
- The rule needs **side effects, I/O or long-running work**. Rules must be read-only and deterministic.
- You only need a **single expression**. A full decision graph, and a service hop, are unnecessary.

### Integration pattern
1. **Separate service, standard contract.** The engine is installed only in `apps/rules`, and the editor only in `apps/rules/authoring`. The contract (`rules-service/v1`) is OpenAPI 3.1 over HTTPS with JSON bodies and problem-details errors, URL-major versioned and additive within a major version. It covers: evaluate, simulate, draft, validate and publish rule sets, versions and content export, per-tenant export and disposal, engine identity, regression status, and probes. Types and client live in `packages/rules-contract`.
2. **Isolate builds and images.** Build every app image from a pruned workspace (`turbo prune <app> --docker`, install from the pruned lockfile, `pnpm --filter <app> deploy --prod` into the runner), so each image holds only its own dependency closure, never the workspace root `node_modules`. CI checks that (a) no other app's dependency closure contains an engine package, (b) the SBOM of every other app's image lists no engine package or native binary, and (c) an engine-only version bump leaves the other apps' pruned lockfiles unchanged.
3. **Engine formats stay opaque.** Rule content crosses the contract only as `{format, content}`; the rules service registers the formats it accepts; callers store references and digests and never parse content.
4. **Port in the caller.** The API defines an application-owned evaluation port: request (decision point, scope, whitelisted facts, time) → result (state, values, rule references with version and digest, advisories, engine identity). Its adapter is an HTTP client of the rules service, used by every runtime role of the API codebase that evaluates rules (for example request handlers and background workers). No domain module imports the client directly.
5. **Content in the service, selection in the application.** The rules service stores drafts and immutable, content-addressed published versions (version id, monotonic publish sequence, SHA-256 digest, format, validating engine version, example cases) in its own PostgreSQL schema. The application keeps selection: scope layering, adoption, approval and effective dates, as versioned policy records holding only `{ruleSetKey, versionId, contentDigest}`. The caller passes the pinned references; the service never chooses versions. A sub-decision is pinned inside its parent's content by the `versionId` of a published version in the same scope or the shared seed scope, never by a rule-set key or a draft. Publishing resolves and freezes the parent's dependency closure (distinct versions, each with its digest) and a closure digest computed canonically over the root digest and the sorted, de-duplicated `versionId:digest` pairs; evaluation loads only that closure and checks the digests; results list the dependencies with the rule references, and the caller's audit records them. Scope layering selects root rule sets only and never substitutes a dependency. Exports include the content of referenced shared seed versions, so they are self-contained.
6. **Database roles that cannot bypass isolation.** Use a NOLOGIN schema-owning role, a migrator role used only by the migration job, a runtime role that does not own the schema and has no `BYPASSRLS`, and a read-only regression role. Enable `FORCE ROW LEVEL SECURITY` on every table. Set the organisation scope with a transaction-scoped setting (`SET LOCAL`) at the start of every transaction, so pooled connections carry no scope, and write scope policies as `organisation_id = nullif(current_setting('app.organisation_id', true), '')::uuid`: on a reused connection the custom setting reads back as an empty string, and a plain cast would raise an error instead of returning no rows. A missing setting then returns seed rows only. **Name the role on every policy** (`TO <runtime role>` and so on): a policy without `TO` applies to `PUBLIC`, and under forced row-level security the schema-owning role would then match it. Shared seed content gets a SELECT-only policy for the runtime role. Because forced row-level security also binds the schema-owning role, give that role policies limited to seed rows (`organisation_id IS NULL`) and fixed bootstrap rows, so migrations can write those and no organisation rows; test this with the scope setting set. The schema-owning role can still use DDL that row-level security does not govern. Bound it with an allow-list migration lint (expand-only table changes, indexes and seed DML; policies, grants, ownership, roles, `SECURITY DEFINER`, disabling forced RLS, `TRUNCATE` and setting the scope key only as reviewed changes) and a post-migration catalog assertion (forced RLS on every table, policies, roles, owners and role memberships as expected) that blocks the rollout on any difference. On managed databases, keep the administrative user for role bootstrap and break-glass only, alert on its use, and record that it can always regain these powers. Take the organisation scope from one trusted header only, never from bodies or query strings.
7. **Restrict node types.** Allow input, output, decision table, switch, expression and sub-decision nodes. Refuse function (custom JavaScript) nodes at validate and publish; keep the function timeout low and outbound HTTP disabled as a second line of defence.
8. **Validate in the service.** At publish, check the document against the format schema, compile it with the service's engine and run its example cases. Publishing freezes content; it does not adopt it. Example cases are synthetic and contain no personal data; the validator warns on patterns that look like personal data.
9. **Fail safe, within a budget.** Map every failure (connection, TLS, timeout, overload, open circuit breaker, authentication, contract or format skew, missing rule set, engine error) to an explicit `unavailable{reason}` within the caller's time budget. Clamp each attempt to the remaining budget, allow one retry in total and only for transient errors, refresh tokens in the background and fetch inline at most once, and count only transport errors, timeouts and 5xx toward a per-process circuit breaker. Report the rules capability as degraded while the breaker is open. Callers decide whether a missing result blocks the step.
10. **Audit.** Record rule version ids, content digests, engine identity and a result digest with every evaluation in the caller's audit trail. The service returns a reduced trace (node and row ids) and never stores or logs fact values or full traces.
11. **Secure the hop.** TLS is mandatory on every call to the rules service: a service mesh with mTLS where the platform has one, otherwise app-level TLS with certificates from the secret store. The service refuses plaintext outside a local development profile and fails to start if that exception is enabled in production. Keep the service API on the internal network with no edge route. Enforce that at the network layer as well as with tokens: private subnets with no public address, an internal load balancer only, and firewall rules (security groups or network policies) that admit the service's ports only from the calling roles. Check them with an allow-list infrastructure-as-code policy (only the calling roles' groups as sources; any address range, managed prefix list or other source fails; no CDN, gateway or service-network reference to the service), and add a recurring reachability test, from outside and from an internal non-caller, plus a negative test of the API's forwarding route (no path or method beyond the enumerated operations), to each environment's checks. Authenticate each calling role with its own Auth0 machine-to-machine client (one audience, least-privilege scopes), validated locally from JWKS.
12. **Observe.** Propagate W3C trace context. Emit a `rules.evaluate` span on both sides with decision point, state, reason and engine version; count outcomes and durations, never fact values. Define alerts for missing rule sets (integrity), sustained authentication failures, an open breaker and no ready instance.
13. **Authoring UI.** Build `apps/rules/authoring` to static assets served from their own origin (CDN or object storage, or a stateless static-file container with no secrets). Only that origin is edge-reachable. It is a separate site whose only data destinations are its own origin, the API and the identity provider; it never calls the rules service. Promote one immutable build to every environment; the per-environment values (API origin, identity-provider domain, client id) come from a small runtime configuration file written at release and served uncached from the same origin, and object content types are set at upload and smoke-tested. It signs in with its own Auth0 SPA client using redirect login and rotating refresh tokens kept in memory (no popup, no hidden-iframe renewal, no browser storage), and calls only the **API's** authoring endpoints, which authorise the user and forward to the service. Validation and simulation run in the service; nothing computed in the browser is authoritative. The editor bundles its own WebAssembly build of the engine, versioned separately from the server engine: use it only for editing aids, disable the editor's own simulator or point it at the API, pin the editor exactly, and run a compatibility check (documents normalised through the pinned editor validate and compile on the pinned server engine) on every editor or engine change. Set a strict CSP: `default-src 'none'`; `script-src 'self'`, adding `'wasm-unsafe-eval'` only if the editing aids need the WebAssembly module; `connect-src 'self'` plus the API and identity-provider origins; `img-src` and `font-src` without foreign origins; `frame-ancestors`, `base-uri`, `form-action` and `object-src` restricted. Bundle the code editor (Monaco) locally rather than loading it from a CDN. The editor's styling libraries insert `<style>` elements at run time, which a static origin cannot cover with nonces or hashes: first try build-time style extraction with `style-src 'self'`; otherwise allow `style-src 'self' 'unsafe-inline'`, keep the restrictions above as compensating controls, and record the choice. Give the authoring site its own SBOM, including the editor's WebAssembly engine package, and keep the editor packages out of every container image. Apply cross-origin isolation only if the editor needs it, preferring `COEP: credentialless` with `COOP: same-origin`. Review the editor's styling (Ant Design, Monaco) against the design system and accessibility requirements.

### Requirements
- **Engine upgrades are gated in each environment.** Pin the exact engine version. Each version's example cases run at publish. Before promoting a new rules-service image, a regression job runs that image without traffic, under the read-only regression role, over every published version's example cases in that environment, and records the result with a watermark (highest publish sequence checked). Publishing is paused from the start of the job until the rollout completes; a starting instance re-checks any version past the watermark before it reports ready. Any output change blocks a forward upgrade. CI runs seed and synthetic cases as an early check only.
- **Migrations.** A migration job under the migrator role runs before each rules-service rollout. Use expand/contract changes only, so the previous image always works with the current schema; rollback is then image-only. Deploy the rules service before callers that need a new contract minor.
- **Data lifecycle.** Include the rules schema in per-tenant export, offboarding disposal (with an auditable disposal record) and restore verification (every rule reference pinned in restored audit data resolves with a matching digest).
- **Base image and native module.** Use a supported Node.js LTS line, pinned by image digest, from a registry the environment's egress allows. Build and runner stages use the same base image, so the engine's platform package matches the runner's libc (glibc or musl); the build fails if the engine cannot be loaded in the runner stage. Enforce lockfile integrity, produce an SBOM, scan dependencies and sign the image. The engine packages carry no npm provenance attestations. Copy the base image once by digest into an immutable-tag repository of the environment's registry and pull by digest; where the orchestrator does not verify image signatures at launch, verify them in the pipeline before every service deployment and every one-off job, and keep release images out of lifecycle expiry by tag convention.
- **Probes.** Liveness checks the process only; readiness checks the database, the engine module, JWKS (live or a persisted last-known copy with bounded staleness) and the upgrade catch-up. An instance whose native module fails to load is live but not ready, and callers report the rules capability as degraded. While not ready, an instance also refuses data operations on its contract port with `503 not_ready`, so it never serves when a load balancer routes to it anyway (load balancers commonly route to every target when none is healthy); clients retry such a response, or a reset, on a new connection. On orchestrators without a separate readiness probe, map readiness to the load balancer's target health check and liveness to the container health check; such orchestrators usually replace a persistently unready instance, so alert on repeated replacements and document scaling the non-essential service to zero.
- **Sign-in tests without the real identity provider.** Where no identity-provider development environment is available to a sandbox spike, an OIDC test double may stand in, only with explicit approval. It provides discovery, authorization code with PKCE (S256), rotating refresh tokens with reuse detection, JWKS with key rotation and short token lifetimes, and it flags silent-renewal requests and tokens in browser storage. It is never deployable: no image, manifest or infrastructure resource, outside every app's dependency closure; every deployed environment requires an exact match with its real issuer and refuses to start if an issuer is a loopback name, an IP literal or a reserved test domain; a configuration lint checks the same for every app; and no image trust bundle contains the test CA. Identity-provider-specific behaviour is then checked against a development environment of the real identity provider before the authoring work is accepted.
- **Topology.** The rules service is a separately deployed service. Adding it departs from a single-server baseline, so record that in an ADR with the platform authority's confirmation.
- **Exit cost.** Use tables and expressions only, which map to DMN decision tables, and keep each version's example cases as its portable specification. Keep published versions immutable and exportable, so historical traces (which hold engine-specific node ids) stay explainable after a swap.

## Authentication and identity: Auth0

Auth0 provides centralized identity management and externalized authentication workflows.

### Responsibilities

- user sign-up, sign-in, and session management
- social identity providers and enterprise SSO
- role and permission claims for authenticated users
- token validation and secure API integration
- MFA and policy controls where required

### Integration requirements

- NestJS should validate tokens and enforce authorization policies on the server side
- Next.js should integrate with the Auth0 login flow and secure the client experience
- The app must enforce authorization in the API rather than rely on frontend-only checks
- Sensitive secrets and OAuth configuration should be managed using environment variables or a managed secrets store

## CMS: Payload CMS

Payload CMS is used for authoring and managing content that is not purely application data.

### Use cases

- landing pages and marketing content
- blog posts, editorial content, and reusable content blocks
- product and catalog copy
- structured content models managed by non-developer authors

### Requirements

- configurable content schemas and rich field modeling
- role-based access for editors, approvers, and administrators
- content publication workflow and preview support
- structured output consumable by the frontend application
- API access designed to support templates, versioning, and content governance

Payload fits well with a TypeScript-first stack and a monorepo organization because it allows content modeling and application modeling to share the same language and tooling contracts.

## Tooling and developer workflow

### TypeScript

TypeScript is the standard language across the full stack, including the frontend, API, CMS, shared packages, and testing configuration.

Expected usage:

- typed application contracts between Next.js and NestJS
- strict validation of domain models and request/response bodies
- shared utility packages with compile-time safety
- migration and configuration support without runtime ambiguity

### Vitest

Vitest provides fast and modern testing for the monorepo.

Use it for:

- unit tests for domain logic and utilities
- component tests for React UI behavior
- integration tests for API routes and validation logic
- workspace-level smoke tests and contract verification

### Turbo monorepo and Turbopack

The project should use Turbo monorepo tooling for workspace orchestration and dependency-aware task execution.

Requirements:

- shared workspace commands for lint, build, test, and typecheck
- task graph-based execution with caching for fast local development
- clear separation between app packages and reusable packages
- parallel task execution without duplicated or stale build output

Turbopack is used for development acceleration in the Next.js ecosystem. It improves rebuild speeds and local feedback cycles, reducing friction during frontend iteration.

## Responsibilities and ownership

Each component has a clear responsibility boundary so the system remains maintainable and the runtime contracts stay explicit.

| Component | Primary responsibility | Secondary responsibilities | Ownership boundary |
|---|---|---|---|
| Next.js / React 19 | User experience, routing, page rendering, client interaction | Server data composition, forms, session-aware UI, SSR/SSG data hydration | Frontend product and UX concerns |
| NestJS API | Business logic, validation, authorization, integrations | Domain services, workflows, API orchestration, permission checks | Backend service layer |
| PostgreSQL | Authoritative transactional data store | User records, domain entities, audit trails, relational joins, workflows | Data integrity and transactional correctness |
| Redis | Cache and transient state | Session acceleration, throttling, queues, ephemeral job state | Performance and operational state |
| Auth0 | Identity and access control | Login flow, token issuance, SSO, MFA, user claims | Security and identity governance |
| Neo4j | Relationship graph data | Recommendation graphs, network data, graph traversals | Graph domain logic |
| Rules service (ZEN Engine + JDM Editor) | Deterministic evaluation of published rule sets through the engine-neutral contract | Rule-set content and immutable versions, validation and publish, upgrade regression, reduced traces for "why", the static engine-specific authoring UI | Evaluation and rule content only; authorisation, scope layering, adoption and approval stay with the API; no other app or image contains the engine |
| Payload CMS | Editorial content workflows | Structured content authoring, content previews, content APIs | Content ownership and publishing |
| TypeScript | Shared contracts and platform consistency | DTOs, API types, domain types, environment config validation | Engineering standards |
| Vitest | Automated validation | Unit tests, integration tests, component tests, contract checks | Quality and regression prevention |
| Turbo + Turbopack | Build orchestration and dev acceleration | Caching, dependency-aware task execution, fast rebuilds | Developer productivity |

A good implementation rule is that no UI layer should be trusted to enforce authorization; the API is the final authority. Similarly, PostgreSQL remains the source of truth for application transactions, while Redis and Neo4j are complementary systems optimized for speed or relationship traversal rather than replacing the transactional store.

## Recommended monorepo layout

The repository should be organized as a monorepo with a clear separation between product applications, shared packages, and infrastructure tooling.

```text
repo/
├── apps/
│   ├── web/                # Next.js customer-facing application
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin/              # optional internal/admin dashboard
│   │   └── ...
│   ├── api/                # NestJS backend service
│   │   ├── src/
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── rules/              # rules service (optional): engine, rule-set store, jobs
│   │   ├── src/
│   │   ├── authoring/      # separate workspace package: static engine-specific editor UI
│   │   ├── migrations/     # own schema and roles only
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cms/                # Payload CMS instance
│       ├── src/
│       ├── collections/
│       ├── blocks/
│       ├── payload.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── ui/                 # shared React components and design primitives
│   ├── types/              # shared TypeScript contracts and DTO types
│   ├── rules-contract/     # engine-neutral rules service OpenAPI document, types and client
│   ├── utils/              # shared helpers
│   ├── eslint-config/
│   ├── tsconfig/
│   └── db/                 # SQL schema or migration utilities if shared
├── infra/
│   ├── docker/
│   ├── compose/
│   ├── scripts/
│   └── env/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── turbo.json
├── tsconfig.base.json
├── vitest.config.ts
└── README.md
```

### Package responsibilities

- `apps/web`: customer-facing portal or product frontend
- `apps/admin`: internal operations or admin functions
- `apps/api`: backend service that exposes authenticated APIs and orchestrates domain logic
- `apps/cms`: content authoring and structured content publication
- `apps/rules`: rules service; the only app with the rules engine; owns rule-set content, its schema, migration and regression jobs
- `apps/rules/authoring`: static authoring UI for the rules service; the only package with the engine's editor
- `packages/ui`: design-system components used across apps
- `packages/types`: shared interfaces, enums, and DTOs for frontend/backend compatibility
- `packages/rules-contract`: the rules service contract; the only rules dependency other apps may take
- `packages/db`: migration and schema utilities shared across backend services when relevant
- `infra`: local development environment, Docker setup, secrets templates, and helper scripts

This layout keeps runtime boundaries explicit and reduces cross-app coupling. The shared packages are intentionally tiny and purpose-driven rather than a large generic abstraction layer.

## Container-based deployment in Docker

The application should be packaged as a set of Docker containers so each runtime service can be built, deployed, and scaled independently while sharing the same TypeScript-first codebase. This keeps local development, testing, and production deployment consistent.

### Deployment model

The monorepo uses a containerized runtime model with dedicated services for each app and dependency:

- `web`: containerized Next.js application
- `api`: containerized NestJS backend
- `cms`: containerized Payload CMS application
- `rules`: containerized rules service (optional; internal network only, TLS, no edge route)
- `rules-migrate` and `rules-regression`: one-off jobs run from the `rules` image before each rollout
- rules authoring UI: static assets on their own origin (CDN or object storage)
- `postgres`: PostgreSQL container
- `redis`: Redis container
- `neo4j`: Neo4j container
- optional `worker` or `queue` container for background jobs if needed

Each app owns its own `Dockerfile`, and the repo uses a root-level `docker-compose.yml` for local orchestration and a deployment pipeline for cloud hosting. Container images should be built from a minimal base image, include installed dependencies, and run non-root where possible.

### Example Docker layout

```text
repo/
├── apps/
│   ├── web/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── api/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── rules/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── cms/
│       ├── Dockerfile
│       └── .dockerignore
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   └── scripts/
│       ├── start-dev.sh
│       └── migrate-db.sh
├── .env.example
├── .dockerignore
├── package.json
└── README.md
```

### Example compose configuration

```yaml
version: '3.9'
services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      - api
      - postgres
      - redis

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - '3005:3005'
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - neo4j
      - rules             # start order only; the API runs while rules is unavailable (capability degraded)

  cms:
    build:
      context: ./apps/cms
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    env_file:
      - .env
    depends_on:
      - postgres

  rules:
    build:
      context: .
      dockerfile: apps/rules/Dockerfile
      args:
        NODE_IMAGE: ${NODE_IMAGE}        # supported Node.js LTS, pinned by digest
    expose:
      - '3010'                           # contract API: internal network only, no host port
    environment:
      RULES_ALLOW_PLAINTEXT: 'true'      # local profile only; refused with NODE_ENV=production
    env_file:
      - .env
    secrets:
      - rules_db_password
    depends_on:
      - postgres
    healthcheck:
      test: ['CMD', 'node', 'dist/healthcheck.js']   # probes :3012/health/ready; no wget
      interval: 10s
      timeout: 2s
      retries: 6
      start_period: 60s

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: ${NEO4J_USERNAME}/${NEO4J_PASSWORD}
    ports:
      - '7474:7474'
      - '7687:7687'
    volumes:
      - neo4j_data:/data

volumes:
  postgres_data:
  neo4j_data:

secrets:
  rules_db_password:
    file: ./infra/env/rules_db_password.txt   # local only; never committed
```

### Sample Dockerfiles

#### `apps/web/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
EXPOSE 3000
CMD ["pnpm", "--dir", "apps/web", "start"]
```

#### `apps/api/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
EXPOSE 3005
CMD ["node", "apps/api/dist/main.js"]
```

#### `apps/cms/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/cms/package.json ./apps/cms/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm --filter cms build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/cms/dist ./apps/cms/dist
COPY --from=builder /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/cms/node_modules ./apps/cms/node_modules
EXPOSE 3001
CMD ["node", "apps/cms/dist/server.js"]
```

These examples assume pnpm workspaces. Production images should be built from a pruned workspace so that an image contains only its own app's dependencies (the samples above copy the root `node_modules`, which with pnpm holds every workspace's packages). Pin a supported Node.js LTS base image by digest from a registry the build environment can reach; the `node:20-alpine` tag above is a placeholder, and Node.js 20 is past end of life. The rules service outline shows the pattern:

#### `apps/rules/Dockerfile` (outline)

```dockerfile
ARG NODE_IMAGE                      # supported Node.js LTS, pinned by digest, from an allowed registry
FROM ${NODE_IMAGE} AS base
RUN corepack enable
WORKDIR /repo

FROM base AS pruned
COPY . .
RUN pnpm dlx turbo@<pinned> prune rules --docker          # out/json, out/pnpm-lock.yaml, out/full

FROM base AS build
COPY --from=pruned /repo/out/json/ .
COPY --from=pruned /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile                        # installs the engine's platform package for this image's libc
COPY --from=pruned /repo/out/full/ .
RUN pnpm --filter rules build \
 && pnpm --filter rules deploy --prod /out/rules          # self-contained production closure

FROM ${NODE_IMAGE} AS runner                              # same base image: same libc as the build stage
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /out/rules ./
RUN node -e "require('@gorules/zen-engine')"              # fail the build if the native module cannot load
USER node
EXPOSE 3010 3012
HEALTHCHECK CMD ["node", "dist/healthcheck.js"]
CMD ["node", "dist/main.js"]
```

Notes: build one image per target architecture. Check the pnpm version's requirements for `deploy` (some versions need injected workspace packages or a legacy flag). The authoring UI is built separately (`pnpm --filter rules-authoring build`) and published as static assets.

### `.dockerignore` example

```dockerignore
node_modules
.next
out
dist
.git
.env
Dockerfile*
README.md
coverage
npm-debug.log*
pnpm-debug.log*
```

### Container requirements

- Each application should have a dedicated image and service definition
- Services should communicate over the Docker network, not the host machine, for internal traffic
- Secrets must be injected as environment variables or mounted secret files at runtime
- The app should fail fast on missing required config values
- Health checks should be defined for API, web, CMS, rules service, Postgres, Redis, and Neo4j service readiness, using the runtime (for example a small Node script) rather than tools a slim base image may not include
- Map orchestrator probes explicitly: liveness (restart) to a process-only endpoint, readiness (traffic) to a dependency-checking endpoint, and a startup probe where start-up work is long, so an instance with a failed optional dependency is not restarted in a loop
- Each app image contains only its own pruned dependency closure; an image SBOM check enforces that engine or other app-specific packages do not appear in other apps' images
- Internal-only services publish no host or edge port, admit traffic only from their callers through network rules, and internal service-to-service traffic is encrypted (mesh mTLS or app-level TLS)
- Container startup should be documented and reproducible for local, staging, and production environments

### Production deployment diagram

```mermaid
flowchart LR
    User[Internet Users] --> CDN[CDN / Edge Layer]
    CDN --> Web[Next.js Web Container]
    Web --> API[NestJS API Container]
    Web --> CMS[Payload CMS Container]

    API --> PG[(PostgreSQL)]
    API --> Redis[(Redis)]
    API --> Neo4j[(Neo4j)]
    API --> Auth0[Auth0 Identity]
    API -->|HTTPS + M2M| Rules[Rules Service Container]
    Worker[API worker role] -->|HTTPS + M2M| Rules
    Rules --> PG
    Rules --> Monitor
    Registry --> Rules
    CDN --> RulesUI[Rules authoring static origin]
    User -. "authoring calls from the browser (CORS)" .-> API

    CMS --> PG
    CMS --> Storage[Object / Media Storage]

    Web --> Monitor[Monitoring / Logs / Alerts]
    API --> Monitor
    CMS --> Monitor
    PG --> Monitor
    Redis --> Monitor
    Neo4j --> Monitor

    Deploy[CI/CD Pipeline] --> Build[Build Images]
    Build --> Registry[Container Registry]
    Registry --> Web
    Registry --> API
    Registry --> CMS
```

This diagram represents the target production model: end users reach the web app through a public edge layer, the frontend app interacts with the API and CMS, the API consumes the core data stores and identity provider, and all services emit operational signals to monitoring and logging.

### Production deployment guidance

For production, the same container images can be deployed to any Docker-capable platform such as a managed Kubernetes cluster, container service, or a VM-based Docker environment. The deployment contract should include:

- image tagging strategy
- environment-specific config injection
- database migration execution before app startup or as a pre-deploy step
- restart policies and resource limits
- log aggregation and health monitoring
- rollback procedures using previously tagged images

### Deployment principles

- treat each service as independently buildable and deployable
- keep application code and infrastructure config versioned together
- enforce resource isolation between the app, CMS, data stores, and background jobs
- prefer immutable deployment artifacts over ad hoc runtime edits
- maintain parity between local Docker development and production container behavior wherever feasible

## Environment setup and local development

A production-ready monorepo needs a repeatable local environment and explicit configuration contracts. The team should use a single root-level dependency manager and an `.env.example` for all required runtime services.

### Recommended development environment

- Node.js LTS version
- pnpm or npm with workspaces; package manager should be declared in the root `package.json`
- Docker Desktop or equivalent local container runtime for Postgres, Redis, Neo4j, and optional Payload/CMS database services
- A local `.env` file per environment with no secrets committed to source control

### Example root configuration

`package.json` should include workspace scripts such as:

```json
{
  "name": "web-app-monorepo",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "vitest",
    "typecheck": "turbo run typecheck"
  }
}
```

`turbo.json` should define task dependencies and caching rules.

### Example `.env.example`

```env
# App runtime
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app_db
POSTGRES_USER=app_user
POSTGRES_PASSWORD=change_me
DATABASE_URL=postgresql://app_user:change_me@localhost:5432/app_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=change_me

# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.yourapp.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.us.auth0.com
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.yourapp.com

# Payload CMS
PAYLOAD_SECRET=replace_with_strong_secret
PAYLOAD_PUBLIC_URL=http://localhost:3001
PAYLOAD_DATABASE_URL=postgresql://app_user:change_me@localhost:5432/app_db

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_PUBLIC_SITE_NAME=My App

# NestJS API
API_PORT=3005
JWT_ALGORITHM=RS256

# Rules service (callers)
RULES_SERVICE_URL=https://rules:3010/v1
RULES_SERVICE_AUDIENCE=rules-service
RULES_SERVICE_CLIENT_ID=your_m2m_client_id          # one M2M client per calling role
RULES_SERVICE_CLIENT_SECRET=your_m2m_client_secret

# Rules service (service)
RULES_DATABASE_HOST=postgres
RULES_DATABASE_PORT=5432
RULES_DATABASE_NAME=app_db
RULES_DATABASE_USER=rules_runtime                   # search_path set on the role: ALTER ROLE rules_runtime SET search_path = rules
RULES_DATABASE_PASSWORD_FILE=/run/secrets/rules_db_password
RULES_TLS_CERT_FILE=/run/secrets/rules_tls_cert     # unset where a mesh terminates mTLS
RULES_TLS_KEY_FILE=/run/secrets/rules_tls_key
RULES_ALLOW_PLAINTEXT=false
RULES_AUTHORING_ORIGIN=http://localhost:3011        # allowed CORS origin on the API
```

### Local services setup

Use Docker Compose or equivalent to start local infrastructure. A typical service set includes:

- PostgreSQL on port 5432
- Redis on port 6379
- Neo4j on ports 7474 and 7687
- optional admin dashboards or local monitoring tools

Example service startup flow:

```bash
pnpm install
cp .env.example .env
pnpm turbo run dev
```

For backend and CMS services, start each project individually if they are isolated apps:

```bash
pnpm --filter api dev
pnpm --filter cms dev
pnpm --filter web dev
```

### Environment rules

- Never commit `.env` files or secrets
- Keep all secrets in a managed secret store in production
- Validate required environment variables at startup
- Distinguish between public and private environment values
- Keep local development parity with production configuration as much as possible

### Operational expectations

- PostgreSQL should be available before running migrations
- Redis should be configured before cache-enabled endpoints or sessions are used
- Neo4j should be initialized only for graph features that require it
- Auth0 configuration must be verified before authentication-enabled routes are tested
- Payload CMS should have its own access control rules separate from the app's business permissions

## Security and operations

This stack must enforce modern secure defaults:

- Auth0 handles identity and session trust
- NestJS enforces authorization on all protected endpoints
- PostgreSQL stores application records with transactional integrity
- Redis is used only for transient or derived state and must not be the source of truth for critical business records
- Neo4j must not duplicate regulatory or transactional data without controlled synchronization
- Payload CMS must separate editorial privileges from application admin privileges
- all service-to-service communication should use environment-controlled secrets and validated tokens
- the rules service is reached only by the API's runtime roles, over TLS, each with its own machine-to-machine token; it receives the tenant scope from the API, enforces forced row-level security with roles that cannot bypass it, and never stores or logs fact values

## Recommended delivery constraints

1. Use a single TypeScript language standard across the repo.
2. Treat PostgreSQL as the authoritative relational store.
3. Use Redis for speed and transient state, not as the primary source of truth.
4. Use Neo4j only for relationship-heavy functionality with explicit data ownership boundaries.
5. Use Auth0 as the identity layer and do not implement custom auth logic in application code.
6. Use Payload CMS for structured editorial content and not as a replacement for transactional application storage.
7. Standardize on Turbo for monorepo orchestration and Turbopack for local dev performance.
8. Use Vitest as the default test framework for all logic and API validation.

## Final specification

The proposed platform is a TypeScript-first, monorepo-based web application stack built around:

- Next.js for web delivery
- React 19 with compiler for UI rendering
- NestJS for backend services
- PostgreSQL for transactional data
- Redis for caching and transient state
- Auth0 for identity
- Neo4j for graph relationships
- Payload CMS for content management
- Vitest for automated testing
- Turbo monorepo for orchestration and task execution
- Turbopack for high-speed local development

This combination supports a scalable, maintainable product application with strong frontend experience, robust API architecture, secure identity management, and content flexibility while preserving a consistent development workflow across the entire platform.
