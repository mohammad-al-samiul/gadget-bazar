---
trigger: glob
globs:
  - "**/schema.prisma"
  - "**/migrations/**"
description: Database conventions, Prisma schema rules, append-only tables, and migration safety
---

# Database Rules

- UUID PKs, createdAt/updatedAt, Decimal for money, integer grams for weight, explicit onDelete on every relation.
- Migrations must be backward-compatible (expand -> migrate -> contract). Add indexes for every new query path.
- Append-only tables (ShipmentEvent, AuditLog, LoyaltyLedger) are never updated or deleted by application code.
- Partition big append-only tables by month when they exceed the agreed size.
