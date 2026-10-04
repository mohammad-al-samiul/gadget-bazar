---
trigger: always_on
description: Quality assurance standards, code coverage requirements, and essential test suites
---

# Testing & Quality

- Business logic >= 80% unit coverage. Integration tests use real Postgres+Redis (Testcontainers).
- Required tests: illegal state transitions, idempotent payments, MOQ rejection, concurrent group-deal joins,
  no PII in public tracking, RBAC for dealer/rider/admin.
- Do not mark work done until lint, typecheck and tests pass.
