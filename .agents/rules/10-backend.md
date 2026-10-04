---
trigger: glob
globs: "apps/api/**"
description: NestJS backend architecture, external call resiliency, Swagger, and health endpoints
---

# Backend Rules

- Structure: src/modules/<domain>/{controller,service,dto,entities,tests}. Thin controllers, logic in services.
- Every external call (gateway, SMS, embedding, storage, search) has a timeout, bounded retry with backoff+jitter,
  and a circuit breaker. Every queue consumer is idempotent. Version routes under /v1.
- Add Swagger decorators; regenerate packages/api-client after API changes (pnpm gen:client).
- Admin mutations are audit-logged. Expose /health/live and /health/ready.
