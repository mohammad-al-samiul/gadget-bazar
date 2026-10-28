# Capacity Model & SLOs — GadgetBazar

> **Purpose**: This document defines traffic scenarios, RPS targets, SLOs, error budgets,
> top-10 bottlenecks, and the mapping from each SLO to the component and test that will
> verify it. It drives all subsequent load-testing, caching, and infrastructure tasks.
>
> **Last updated**: 2026-10-28 | **Owner**: Platform Team | **Status**: Baseline (pre-launch)

---

## Table of Contents

1. [Traffic Scenarios](#1-traffic-scenarios)
2. [RPS Estimates per Endpoint Class](#2-rps-estimates-per-endpoint-class)
3. [SLOs & Error Budgets](#3-slos--error-budgets)
4. [Top 10 Bottlenecks & Mitigations](#4-top-10-bottlenecks--mitigations)
5. [SLO → Component → Test Mapping](#5-slo--component--test-mapping)
6. [Assumptions](#6-assumptions)
7. [Revision History](#7-revision-history)

---

## 1. Traffic Scenarios

### 1.1 Normal Traffic — Weekday Steady-State

**Profile**: Organic browse, catalog exploration, occasional checkout.  
**Peak window**: 18:00–22:00 BST (Bangladesh Standard Time).  
**Concurrency model**: ~10,000 active users/day; ~100 concurrent at any moment; avg session 8 min, 12 page-events.

| Behaviour                       | Value               |
| ------------------------------- | ------------------- |
| Concurrent users (steady)       | ~100                |
| Concurrent users (evening peak) | ~400                |
| Browse-to-checkout ratio        | 200:1               |
| Browse-to-search ratio          | 4:1                 |
| Image search share              | ~5% of all searches |
| Payment success rate            | ~85% of initiated   |

---

### 1.2 Campaign Peak — Flash Sale / Eid / 10.10

**Profile**: Marketing-driven surge. Users arrive from push notifications and social ads simultaneously.  
**Duration**: 15–30 min spike, then gradual 2h decay.  
**Multipliers vs. normal**: Browse ×10, Search ×7, Checkout ×5, Webhook ×5.

| Behaviour                     | Value                             |
| ----------------------------- | --------------------------------- |
| Concurrent users (peak 5 min) | ~1,000                            |
| Ramp pattern                  | Sudden (< 60s) — not gradual      |
| Cache hit rate (catalog)      | ~90% (pre-warmed before campaign) |
| DB write amplification        | ×5 on Order + Payment tables      |
| SSLCommerz IPN burst          | ~40 webhooks/s                    |

**Degraded-mode contract**: Browse, cart, checkout, payment, and tracking endpoints MUST remain
available at ≥ 99% during campaign peaks. Non-critical endpoints (image search, loyalty, reviews)
may shed load with 503 + Retry-After.

---

### 1.3 Flash Group-Deal Opening

**Profile**: A single group deal opens at a scheduled time (e.g., 00:00). All waiting users
hit the join endpoint simultaneously.  
**Target scale**: 1,000 concurrent join requests within the first 60 seconds.  
**Write pattern**: Every join = 1 `GroupDealParticipant` INSERT + 1 `currentParticipants` UPDATE (conditional).  
**Hard constraint**: `currentParticipants` must NEVER exceed `targetParticipants`. Zero over-selling.  
**Tech contract**: DB-level `@@unique([dealId, userId])` + conditional UPDATE enforces atomicity. Redis
counter acts as a fast-path gate (pre-check before DB write) to shed obvious duplicates.

| Behaviour                             | Value                                    |
| ------------------------------------- | ---------------------------------------- |
| Concurrent join VUs                   | 1,000                                    |
| Target completion window              | ≤ 60 s                                   |
| Acceptable error rate (non-duplicate) | 0%                                       |
| Duplicate rejection rate (expected)   | ~30% (users trying to join twice)        |
| DB rows written/s                     | ~700 (after Redis gate sheds duplicates) |

---

## 2. RPS Estimates per Endpoint Class

> **Note**: RPS figures are conservative pre-launch estimates. Update after first production
> load-test run with real traffic baselines.

| Endpoint Class            | Example Routes                               | Normal RPS | Campaign Peak RPS | Flash Deal RPS | Cache Layer                             | R/W |
| ------------------------- | -------------------------------------------- | ---------- | ----------------- | -------------- | --------------------------------------- | --- |
| **Cached page**           | Next.js ISR product pages, homepage          | 400        | 4,000             | 4,000          | ✅ CDN (Cloudflare)                     | R   |
| **Catalog API**           | `GET /v1/products`, `GET /v1/products/:id`   | 80         | 800               | 300            | ✅ Redis 5 min TTL                      | R   |
| **Search**                | `GET /v1/search?q=`, `GET /v1/search/filter` | 30         | 210               | 50             | ⚠️ Redis partial (popular queries only) | R   |
| **Image search**          | `POST /v1/search/image`                      | 5          | 20                | 5              | ❌ (vector similarity — not cacheable)  | R   |
| **Checkout Stage 1**      | `POST /v1/orders`                            | 8          | 40                | 100            | ❌                                      | W   |
| **Checkout Stage 2**      | `POST /v1/orders/:id/shipping-payment`       | 3          | 15                | 5              | ❌                                      | W   |
| **Payment webhook (IPN)** | `POST /v1/webhooks/sslcommerz`               | 8          | 40                | 100            | ❌ (must process, never skip)           | W   |
| **Group deal join**       | `POST /v1/deals/:id/join`                    | 2          | 10                | **700**        | ⚠️ Redis gate only                      | W   |
| **Tracking**              | `GET /v1/track/:code`                        | 15         | 60                | 20             | ✅ Redis 30 s TTL                       | R   |

### Throughput Sizing Notes

- **CDN** absorbs >90% of all traffic at campaign peaks — the API never sees 4,000 rps directly.
- **Catalog API** Redis cache must be pre-warmed before campaigns; a cache miss storm (thundering herd)
  is bottleneck #3 (see §4).
- **Group deal join** at 700 rps write is the single highest-risk write scenario in the system.
- **Payment webhook**: SSLCommerz retries up to 3× on non-200. Fast `< 50 ms` acknowledgement
  is mandatory; all processing moves to BullMQ queue.

---

## 3. SLOs & Error Budgets

### 3.1 Availability

| Metric                       | Target                              | Calculation                        |
| ---------------------------- | ----------------------------------- | ---------------------------------- |
| Overall availability         | **99.9%**                           | ≤ 8h 45m downtime/year             |
| Monthly downtime budget      | **43.8 min/month**                  | 99.9% of 43,200 min                |
| Error budget (request-level) | **0.1% of requests** may return 5xx | Measured per rolling 30-day window |

**Degraded-mode guarantee** (from AGENTS.md non-negotiable rules):  
Browse · Cart · Checkout · Payment · Tracking must remain available even under partial failure.
Image search, loyalty, and admin dashboards may be shed first.

---

### 3.2 Latency SLOs per Endpoint Class

> Measured at the **API server** (not CDN edge) unless stated otherwise.
> Baseline collected with k6 at the RPS values in §2 (normal scenario).

| Endpoint Class          | p50 target | **p95 SLO**  | p99 target | Timeout (server-side) |
| ----------------------- | ---------- | ------------ | ---------- | --------------------- |
| Cached page (CDN edge)  | < 20 ms    | **< 50 ms**  | < 150 ms   | —                     |
| Catalog API             | < 50 ms    | **< 120 ms** | < 250 ms   | 5 s                   |
| Search (Elasticsearch)  | < 40 ms    | **< 80 ms**  | < 200 ms   | 5 s                   |
| Image search (pgvector) | < 200 ms   | **< 500 ms** | < 1,500 ms | 10 s                  |
| Checkout Stage 1        | < 150 ms   | **< 300 ms** | < 600 ms   | 10 s                  |
| Checkout Stage 2        | < 150 ms   | **< 300 ms** | < 600 ms   | 10 s                  |
| Payment webhook receipt | < 20 ms    | **< 50 ms**  | < 100 ms   | 3 s                   |
| Group deal join         | < 50 ms    | **< 150 ms** | < 300 ms   | 5 s                   |
| Tracking                | < 30 ms    | **< 100 ms** | < 200 ms   | 5 s                   |

---

### 3.3 RPO & RTO

| Metric                             | Target           | Mechanism                                                                                                                          |
| ---------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **RPO** (Recovery Point Objective) | **≤ 5 minutes**  | PostgreSQL WAL streaming to hot-standby replica (1 replica min); Redis AOF `fsync=everysec`                                        |
| **RTO** (Recovery Time Objective)  | **≤ 60 minutes** | Automated DB failover (patroni/RDS Multi-AZ); Redis Sentinel failover < 30 s; pod restart < 5 min; runbook max 25 min manual steps |

**RPO verification**: Monthly DR drill — kill primary DB, restore from latest WAL, measure data loss window.  
**RTO verification**: Quarterly DR drill — full stack failure simulation, measure time-to-restore.

---

### 3.4 Error Budget Policy

| Burn Rate                                   | Action                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| > 5% of monthly budget consumed in 1 hour   | Page on-call; investigate immediately                                                  |
| > 10% of monthly budget consumed in 6 hours | Incident declared; change freeze on all non-critical PRs                               |
| > 50% of monthly budget consumed in 3 days  | P1 incident; rollback last deployment; root cause analysis required before next deploy |
| Budget fully exhausted                      | Freeze all deployments until next billing window; post-mortem mandatory                |

---

## 4. Top 10 Bottlenecks & Mitigations

| #      | Bottleneck                                                                                                                            | Affected Component         | Risk Level  | Mitigation                                                                                                                                                                                                                                               | Status  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **1**  | **GroupDeal concurrent join race** — multiple users simultaneously try to join the same deal, exceeding `targetParticipants`          | Postgres + Redis           | 🔴 Critical | DB-level `@@unique([dealId, userId])` + `UPDATE … WHERE currentParticipants < targetParticipants` conditional write. Redis `INCR` counter as fast gate — shed requests before hitting DB. Integration test: 1,000 concurrent joins, verify no over-sell. | Planned |
| **2**  | **Payment webhook IPN burst** — SSLCommerz delivers 40–100 webhooks/s during campaign; synchronous DB write blocks                    | API + BullMQ + Postgres    | 🔴 Critical | Receive webhook → verify signature → upsert raw event idempotently (< 50 ms) → enqueue to BullMQ → return 200. Processing happens async. Idempotency-Key on every IPN event.                                                                             | Planned |
| **3**  | **Catalog cache cold start / thundering herd** — all cache keys expire simultaneously post-deployment or cache flush                  | Redis + Postgres           | 🟠 High     | Cache-aside with probabilistic early expiration (PER) or mutex lock (Redis `SET NX PX`). Pre-warm cache before campaigns via a seeding job.                                                                                                              | Planned |
| **4**  | **Elasticsearch query latency under fan-out** — filter + full-text + geo combination generates expensive queries                      | Elasticsearch              | 🟠 High     | `_source` filtering (return only needed fields). Query result caching for top 100 popular terms. Circuit breaker with fallback to Postgres `ILIKE` on ES failure. Shard sizing: 1 primary per index.                                                     | Planned |
| **5**  | **pgvector image search full-table scan** — vector similarity search on `Product.embedding` without HNSW index                        | Postgres + pgvector        | 🟡 Medium   | Create `USING hnsw` index on embedding column (`m=16, ef_construction=64`). Limit candidates to `products WHERE isActive=true`. Consider async processing: queue image → return `jobId` → poll result.                                                   | Planned |
| **6**  | **Checkout Stage 1 DB write latency** — `CREATE ORDER` + `CREATE ORDER_ITEMS` + `DEDUCT_STOCK` is a multi-table transaction           | Postgres                   | 🟡 Medium   | PgBouncer connection pooling (transaction mode). Optimistic locking on stock. Write only to primary; reads from replica. Benchmark: must complete in < 150 ms p50.                                                                                       | Planned |
| **7**  | **Two-stage payment reconciliation inconsistency** — Stage 2 shipping payment IPN arrives but order status update fails               | Postgres + BullMQ + Outbox | 🔴 Critical | Transactional outbox pattern: write domain event + state change in same DB transaction. BullMQ consumer reads outbox. Idempotent consumer: `processedAt` flag. DLQ for failed events with alerting.                                                      | Planned |
| **8**  | **N+1 queries on order detail** — fetching an order with items, shipment events, and payment data naively generates dozens of queries | Prisma ORM                 | 🟡 Medium   | Explicit `include` with nested relations in Prisma queries. DataLoader pattern for list endpoints (batch by `orderId[]`). Monitor with `prisma.$on('query', ...)` in development.                                                                        | Planned |
| **9**  | **Redis single-node SPOF** — cache + idempotency + session all depend on one Redis instance                                           | Redis                      | 🟠 High     | Redis Sentinel (1 primary + 2 replicas) planned before public launch. Graceful degradation: on Redis unavailability, bypass cache (higher DB load, not crash). Idempotency falls back to DB check.                                                       | Planned |
| **10** | **SSLCommerz IPN signature verification CPU** — HMAC-SHA256 recomputation on every IPN event under burst                              | API middleware             | 🟢 Low      | Pre-computed HMAC key stored in memory (not re-parsed from env per request). Verify → enqueue in < 10 ms. No external calls in the verify path. Rate-limit IPN endpoint to SSLCommerz IP ranges.                                                         | Planned |

---

## 5. SLO → Component → Test Mapping

> k6 test file locations under `tests/load/` (created in TASK Q2: Load Tests).

| SLO                                  | Responsible Component(s)        | k6 Scenario File           | Load Profile                                | Acceptance Threshold                       |
| ------------------------------------ | ------------------------------- | -------------------------- | ------------------------------------------- | ------------------------------------------ |
| Catalog p95 < 120 ms                 | Redis (cache) + Postgres (miss) | `baseline_catalog.js`      | 80 VUs, 5 min steady                        | p95 < 120 ms; error rate < 0.1%            |
| Search p95 < 80 ms                   | Elasticsearch                   | `baseline_search.js`       | 30 VUs, 5 min steady                        | p95 < 80 ms; error rate < 0.1%             |
| Image search p95 < 500 ms            | Postgres + pgvector             | `spike_image_search.js`    | Ramp 0→20 VUs over 2 min                    | p95 < 500 ms; error rate < 1%              |
| Checkout Stage 1 p95 < 300 ms        | Postgres + SSLCommerz session   | `baseline_checkout.js`     | 8 VUs, 5 min steady                         | p95 < 300 ms; error rate < 0.1%            |
| Payment webhook p95 < 50 ms          | API + BullMQ                    | `webhook_burst.js`         | 100 VUs, 60 s spike                         | p95 < 50 ms; 100% HTTP 200                 |
| Group deal 0 over-sell               | Postgres + Redis                | `group_deal_concurrent.js` | 1,000 VUs simultaneous join                 | 0 participants > target; 0 duplicate joins |
| Group deal join p95 < 150 ms         | Postgres + Redis                | `group_deal_concurrent.js` | 1,000 VUs simultaneous join                 | p95 < 150 ms                               |
| Tracking p95 < 100 ms                | Redis (cache) + Postgres        | `baseline_tracking.js`     | 15 VUs, 5 min steady                        | p95 < 100 ms; error rate < 0.1%            |
| Availability 99.9%                   | Full stack                      | `soak_overnight.js`        | 100 VUs, 8 h soak                           | error_rate < 0.1%; no 5xx spikes           |
| Campaign peak — catalog survives 10× | Redis + Postgres + CDN          | `campaign_peak.js`         | Ramp 0→800 VUs over 60 s, hold 30 min       | p95 < 250 ms (relaxed); error rate < 0.5%  |
| RPO ≤ 5 min                          | Postgres WAL + Replica          | DR drill (manual runbook)  | Kill primary; measure restore point         | Data loss window < 5 min                   |
| RTO ≤ 60 min                         | Full infra + runbook            | DR drill (manual runbook)  | Full stack failure; measure time-to-restore | All checks green within 60 min             |

---

## 6. Assumptions

| #   | Assumption                                                                                                                            | Revisit Trigger                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| A1  | 10,000 active users/day at launch; 1,000 peak concurrent                                                                              | Update after beta launch metrics        |
| A2  | Bangladesh peak: evenings (18:00–22:00 BST); campaigns: Saturday midday                                                               | Adjust with analytics data              |
| A3  | Average product page = 3 API calls (category nav + product detail + related). Checkout = 2 API calls (stage 1 init + payment session) | After frontend instrumentation          |
| A4  | SSLCommerz IPN: 1 webhook per payment, up to 3 retries on non-200                                                                     | Confirm with SSLCommerz docs            |
| A5  | Image search < 5 rps normal — pgvector on primary Postgres acceptable initially                                                       | Revisit if > 20 rps sustained           |
| A6  | CDN (Cloudflare) handles all Next.js ISR pages; API never sees full CDN rps                                                           | Confirm CDN config before launch        |
| A7  | Redis is single-node initially (risk documented in bottleneck #9); Sentinel planned before public beta                                | Upgrade before 1,000-user milestone     |
| A8  | Flash group deal scale: 1,000 concurrent joins. Business may scale to 5,000 for major events                                          | Revisit with product team before launch |
| A9  | RPS estimates are conservative pre-launch baselines. Actual numbers updated after first k6 baseline run                               | After TASK Q2 (load tests) completes    |
| A10 | All latency SLOs measured at the NestJS API server boundary, not at client or CDN                                                     | Add CDN-edge SLOs post-CDN setup        |

---

## 7. Revision History

| Version | Date       | Author            | Change                                                                   |
| ------- | ---------- | ----------------- | ------------------------------------------------------------------------ |
| 0.1     | 2026-10-28 | Antigravity Agent | Initial capacity model (pre-launch baseline) — all figures are estimates |

---

> [!NOTE]
> All RPS numbers and latency SLOs in this document are **pre-launch estimates** based on comparable
> Bangladesh e-commerce launch profiles. They MUST be updated after the first production load-test run
> (TASK Q2) with real measured baselines.
