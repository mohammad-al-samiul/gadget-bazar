---
trigger: always_on
description: Core non-negotiable business rules for payments, PII, group deals, and events
---

# Business Rules

- Never merge product and shipping payment states. Use the shared state machine in packages/shared; illegal
  transitions must throw. Add a test for every new transition.
- Public responses must never contain sourcing_price_cny or customer PII. Shared caches/CDN never hold user-specific data.
- Group-deal join must be atomic (conditional update + unique(dealId,userId)); participants never exceed target.
- Payment webhooks: verify signature, store raw event idempotently, return 200 fast, process via queue/outbox.
- Domain events go through the transactional outbox, written in the same DB transaction as the state change.
