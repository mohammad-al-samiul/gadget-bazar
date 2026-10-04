---
description: Plan and execute backward-compatible Prisma migrations using expand-migrate-contract strategy
---

# /db-migrate Workflow

## Workflow Steps
1. **Schema Change Description**:
   - Formulate and describe the migration using the **Expand -> Migrate -> Contract** pattern.
2. **Schema & Migration Generation**:
   - Update `schema.prisma` respecting conventions: UUID PKs, `createdAt`/`updatedAt`, Decimal for money, integer grams for weight, explicit `onDelete` on relations.
   - Generate Prisma migration.
   - Update seed data and associated tests.
3. **Query & Index Inspection**:
   - Verify indexes on newly queried fields.
   - Test query execution plans using `EXPLAIN` on affected queries to verify index coverage.
4. **Safety Verification**:
   - Confirm backward-compatibility so running instances won't crash during deployment.
   - **Never run migrations directly against any shared/production database without explicit human authorization.**
