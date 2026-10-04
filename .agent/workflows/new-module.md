---
description: Scaffold a new NestJS backend module with controllers, services, DTOs, tests, and API client generation
---

# /new-module Workflow (Backend Module)

## Workflow Steps
1. **Clarify Requirements**:
   - Ask for the module name and its specific business rules.
2. **Directory Structure Creation**:
   - Create `src/modules/<name>/`:
     - `controller/<name>.controller.ts` (thin controller)
     - `service/<name>.service.ts` (core business logic)
     - `dto/` (with zod/class-validator validation DTOs)
     - `entities/` (domain entities)
     - `tests/` (`<name>.service.spec.ts` unit tests and `<name>.e2e-spec.ts` integration tests)
3. **Standards Enforcement**:
   - Add Swagger OpenAPI decorators to all endpoints and DTO properties.
   - Enforce DTO validation and error handling without leaking PII.
   - External calls must have timeout, bounded exponential retry with jitter, and circuit breaker.
   - Register module in `app.module.ts`.
4. **Client & Verification**:
   - Run `pnpm gen:client` to regenerate `packages/api-client`.
   - Run `/verify` workflow (`pnpm lint`, `pnpm typecheck`, `pnpm test`).
