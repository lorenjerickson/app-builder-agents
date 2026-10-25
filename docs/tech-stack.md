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
- `packages/ui`: shared React component library
- `packages/types`: shared domain and API contract models
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
- `packages/ui`: design-system components used across apps
- `packages/types`: shared interfaces, enums, and DTOs for frontend/backend compatibility
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

These examples assume the repo uses pnpm workspaces and a build script defined per app. If the project uses npm instead, the same structure remains valid with `npm install` and `npm run build` in the corresponding app directories.

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
- Health checks should be defined for API, web, CMS, Postgres, Redis, and Neo4j service readiness
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
