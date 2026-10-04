# GadgetBazar — project identity
China-import gadget marketplace for Bangladesh. One shared NestJS backend; four Next.js sites
(GadgetBazar bulk/group-deal/dealer/admin, GadgetOne single-piece retail, GadgetTrack public tracking,
GadgetX rider PWA); Expo mobile app later. Bengali default language, English supported.

NON-NEGOTIABLE BUSINESS RULES
- Two-stage payment: product price at checkout; shipping/customs only AFTER goods arrive in Bangladesh and are
  weighed. Two separate PAYMENT records and statuses (product_payment_status, shipping_payment_status). Never merge.
- Order can never reach out_for_delivery unless shipping_payment_status = paid.
- Shipping on product pages is an ESTIMATE and must be labelled so.
- sourcing_price_cny is admin-only. Public tracking exposes no PII.
- Payment truth = SSLCommerz IPN webhook only (never the browser redirect). Idempotency-Key on both checkout stages.
- Degraded mode never disables browse, cart, checkout, payment, tracking.

STACK: TypeScript strict; pnpm + Turborepo; NestJS + Prisma + PostgreSQL + Redis + BullMQ; Elasticsearch; pgvector;
Next.js App Router + Tailwind + TanStack Query + Zustand + zod; next-intl; Docker; GitHub Actions; Expo (later).
BRAND: blue #1652F0, near-black #111318, orange #FF7A29; Sora/Poppins + Hind Siliguri.

WORKING AGREEMENT
- Always start in Planning mode: produce an Implementation Plan + Task List, wait for approval.
- Small commits on feat/<id> branches. Run the /verify workflow before finishing. Never skip tests.
- Money = Decimal, weight = integer grams, UUID PKs, no raw SQL, DTO validation everywhere, no PII in logs.
- State assumptions in the Walkthrough; record business decisions in docs/decisions.md.