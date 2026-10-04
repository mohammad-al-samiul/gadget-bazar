---
name: db-migrate
description: Plan and execute backward-compatible Prisma migrations using expand/migrate/contract, update seed data, inspect EXPLAIN query plans, and ensure zero-downtime safety.
---

# DB Migrate Skill

Use this skill when modifying database schemas or running migrations.

## Instructions
1. Describe schema changes in three phases: expand, migrate, contract.
2. Ensure UUID PKs, Decimal for money, integer grams for weight, explicit onDelete, and proper indexes.
3. Update seeds and integration tests.
4. Run EXPLAIN on new queries to verify index efficiency.
5. Guarantee backward compatibility; never execute against shared DB without approval.
