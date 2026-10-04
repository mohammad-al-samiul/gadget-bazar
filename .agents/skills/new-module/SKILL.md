---
name: new-module
description: Scaffold a new NestJS backend module with controllers, services, validated DTOs, unit and integration tests, Swagger docs, app.module registration, and api-client generation.
---

# New Module Skill

Use this skill when scaffolding or implementing a new backend domain module in NestJS.

## Instructions
1. Inquire about the module name and business rules if not already provided.
2. Scaffold `src/modules/<name>/{controller,service,dto,entities,tests}`.
3. Add strict DTOs with validation, Swagger decorators, unit + integration tests.
4. Register the module in `app.module.ts`.
5. Regenerate the API client (`pnpm gen:client`).
6. Execute `/verify`.
