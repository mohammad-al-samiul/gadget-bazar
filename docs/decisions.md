# Architecture & Business Decisions Log (docs/decisions.md)

This log records major business and architectural decisions made throughout the project lifecycle.

---

## Decision Index

| Decision ID | Date       | Status   | Title                                                | Deciders  |
| :---------- | :--------- | :------- | :--------------------------------------------------- | :-------- |
| **ADR-001** | 2026-10-04 | Approved | Project Initialization & Monorepo Architecture       | Core Team |
| **ADR-002** | 2026-10-04 | Approved | Two-Stage Payment Architecture                       | Core Team |
| **ADR-003** | 2026-10-04 | Approved | Agent Operation, Terminal Safety & Browser Allowlist | Core Team |
| **ADR-004** | 2026-10-28 | Approved | Capacity Targets, SLO Policy & Bottleneck Strategy   | Core Team |

---

### ADR-001: Project Initialization & Monorepo Architecture

- **Date**: 2026-10-04
- **Status**: Approved
- **Context**: GadgetBazar requires a shared NestJS backend and four distinct Next.js frontend applications plus a future Expo mobile app.
- **Decision**:
  - Adopt TypeScript Strict monorepo using `pnpm` + `Turborepo`.
  - Backend: Single shared NestJS application with Prisma, PostgreSQL, Redis, BullMQ, Elasticsearch, and pgvector.
  - Frontends: Four Next.js App Router applications (`apps/web-gadgetbazar`, `apps/web-gadgetone`, `apps/web-gadgettrack`, `apps/web-gadgetx`).
  - Shared packages: `packages/shared`, `packages/ui`, `packages/design-tokens`, `packages/api-client`.
- **Consequences**:
  - Changes to core schemas and contracts must go through transactional outbox and generated clients to ensure zero desynchronization.

---

### ADR-002: Two-Stage Payment Architecture

- **Date**: 2026-10-04
- **Status**: Approved
- **Context**: Goods imported from China cannot be accurately weighed until arriving at the Bangladesh warehouse. Shipping costs can only be calculated post-arrival.
- **Decision**:
  - Payment Stage 1: Product price paid at checkout (`product_payment_status`).
  - Payment Stage 2: Shipping/customs paid only AFTER arrival and weighing (`shipping_payment_status`).
  - Order state machine enforces that an order can NEVER transition to `out_for_delivery` unless `shipping_payment_status = paid`.
  - Payment truth is strictly governed by SSLCommerz IPN webhooks (never browser redirects).
- **Consequences**:
  - DB schema maintains two distinct payment entities and statuses. Client UI reflects shipping charge on product pages strictly as an ESTIMATE.

---

### ADR-003: Agent Operation, Terminal Safety & Browser Allowlist

- **Date**: 2026-10-04
- **Status**: Approved
- **Context**: Autonomous development agents interact with system shells, browsers, and codebase files. Safety boundaries must prevent accidental data destruction or credential leakage.
- **Decision**:
  - **Planning Mode Default**: Complex tasks must begin with an Implementation Plan and Task List approved by the human supervisor. Fast mode is reserved only for trivial fixes or boilerplate.
  - **Terminal Review Policy**: Commands that drop databases, purge volumes, run production migrations, deploy, or install unvetted packages require explicit human confirmation.
  - **Browser Allowlist**: Automated browser testing is strictly restricted to `localhost`, local network ports, and authorized company staging domains. External arbitrary navigation is prohibited.
  - **Branching & Commits**: Small atomic commits on `feat/<id>-<slug>` branches. Verify suite must pass before marking tasks done.

---

### ADR-004: Capacity Targets, SLO Policy & Bottleneck Strategy

- **Date**: 2026-10-28
- **Status**: Approved
- **Context**: Pre-launch capacity planning required to set performance expectations, drive infrastructure decisions, and give the load-testing suite (TASK Q2) concrete pass/fail thresholds.
- **Decision**:
  - **Availability SLO**: 99.9% (≤ 43.8 min downtime/month). Error budget = 0.1% of requests.
  - **Latency SLOs** (p95 at API server): Catalog < 120 ms, Search < 80 ms, Checkout < 300 ms, Webhook receipt < 50 ms, Image search < 500 ms, Tracking < 100 ms, Group deal join < 150 ms.
  - **RPO ≤ 5 minutes** via PostgreSQL WAL streaming + Redis AOF.
  - **RTO ≤ 60 minutes** via automated DB failover + documented runbook.
  - **Top priority bottlenecks** (must be mitigated before public launch): GroupDeal race condition (#1), Payment webhook burst (#2), Transactional outbox consistency (#7).
  - **Redis topology**: Single-node with Sentinel upgrade before 1,000-user milestone.
  - **Flash deal scale**: Design for 1,000 concurrent joins; scale-test to 5,000 before major campaigns.
  - **Degraded-mode contract**: Browse, cart, checkout, payment, and tracking endpoints must NEVER be shed. Image search, loyalty, and admin may shed with 503 + Retry-After.
- **Consequences**:
  - All subsequent infrastructure, caching, and queue tasks must be designed to satisfy these SLOs.
  - Every k6 load-test scenario in TASK Q2 must have a pass/fail threshold derived from this document.
  - SLO breach triggers a change freeze per the error budget policy.
