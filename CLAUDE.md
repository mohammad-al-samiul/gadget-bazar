# GadgetBazar — Master Context & Architectural Guidelines

China-import gadget marketplace for Bangladesh.
One shared NestJS backend; four Next.js sites (GadgetBazar bulk/group-deal/dealer/admin, GadgetOne single-piece retail, GadgetTrack public tracking, GadgetX rider PWA); Expo mobile app planned.
Bengali is the default language, with English supported.

---

## Non-Negotiable Business Rules

1. **Two-Stage Payment**:
   - Product price at checkout; shipping/customs ONLY AFTER goods arrive in Bangladesh and are weighed on digital scales.
   - Two separate PAYMENT records and statuses: `product_payment_status` and `shipping_payment_status`. Never merge them.
2. **Delivery Block**:
   - An order can NEVER reach `out_for_delivery` unless `shipping_payment_status = 'paid'`.
3. **Shipping Is An Estimate**:
   - Shipping charge shown on product pages is strictly an **ESTIMATE** and must be explicitly labelled so.
4. **Data Privacy**:
   - `sourcing_price_cny` is strictly admin-only.
   - Public tracking (`apps/web-track`) exposes NO customer PII (no phone number, name, or street address).
5. **Payment Truth**:
   - Payment truth is determined solely by SSLCommerz IPN webhook callbacks (never the browser redirect).
   - `Idempotency-Key` is mandatory on both checkout stages.
6. **Graceful Degradation**:
   - Degraded mode must never disable browse, cart, checkout, payment, or tracking.

---

## Tech Stack & Brand

- **Monorepo**: pnpm workspaces + Turborepo.
- **Language**: TypeScript Strict (`strict: true`, no implicit any, strict null checks).
- **Backend**: NestJS + Prisma + PostgreSQL + Redis + BullMQ + Elasticsearch + pgvector.
- **Frontend**: Next.js App Router + Tailwind CSS + TanStack Query + Zustand + Zod + `next-intl`.
- **Infrastructure**: Docker Compose (`pgvector/pgvector:pg16`, `redis:7-alpine`, `elasticsearch:8.13.0`).
- **Brand Colors**:
  - Primary Blue: `#1652F0`
  - Near-Black: `#111318`
  - Accent Orange: `#FF7A29`
- **Typography**: Sora / Poppins + Hind Siliguri (Bengali).

---

## Workspace Layout

```
gadgetbazar/
├── apps/
│   ├── api/          # Shared NestJS backend (Port 4000)
│   ├── web-bazar/    # Next.js bulk/group-deal/dealer/admin (Port 3000)
│   ├── web-one/      # Next.js single-piece retail (Port 3001)
│   ├── web-track/    # Next.js public tracking - Zero PII (Port 3002)
│   └── web-x/        # Next.js rider delivery PWA (Port 3003)
├── packages/
│   ├── config/       # Shared strict tsconfig, eslint, prettier presets
│   ├── design-tokens/# Brand colors, typography, layout tokens
│   ├── ui/           # Shared React components with design tokens
│   ├── shared/       # Two-stage payment state machine, models, Zod schemas
│   └── api-client/   # Typed API SDK with bearer auth support
├── docs/             # Architecture, decisions, runbooks, capacity plans
└── docker-compose.yml# Local dev infrastructure
```

---

## Core Commands

```bash
# Start all apps in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Lint all code
pnpm lint

# Typecheck all TypeScript files strictly
pnpm typecheck

# Run unit and integration test suites
pnpm test

# Format codebase
pnpm format

# Start local infrastructure (DB, Redis, Elasticsearch)
docker compose up -d
```

---

## Working Agreement & Git Policy

- Work in small commits on `feat/<id>-<slug>` branches.
- Run `/verify` (`pnpm lint`, `pnpm typecheck`, `pnpm test`) before completing any task.
- Money values must use Decimal / validated string representations. Weights must use integer grams.
- Record architectural and business decisions in `docs/decisions.md`.
