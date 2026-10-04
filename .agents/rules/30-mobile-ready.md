---
trigger: glob
globs:
  - "apps/mobile/**"
  - "packages/api-client/**"
  - "packages/shared/**"
description: Mobile readiness, shared zod schemas, API client reuse, and versioning
---

# Mobile-Ready Rules

- Keep logic in the API/shared packages so the Expo app can reuse them. Use packages/shared zod schemas and the
  generated api-client; never duplicate types. Support Bearer-token auth alongside cookies.
- Breaking API changes need a version bump and a note in docs/api-changes.md.
