# CI/CD Deployment & Rollback Runbook

This document outlines the deployment lifecycle, automated pipelines, database migration rules, and one-command rollback procedures for GadgetBazar.

---

## 1. Pipeline Overview

```
[Pull Request] -> Lint -> Typecheck -> Guards (SQL/DTO/a11y/CVE) -> Unit -> Integration -> Build -> Smoke
                                           │
                                           ▼ (PR Merged)
[Merge to Main] -> Safe Prisma Migrate (Expand/Contract)
                -> Build & Push Docker Images to GHCR
                -> Automatic Staging Deploy & Health Check
                -> Manual Gate: Production Deployment Approval
                -> Rolling Restart (Zero-Downtime) & /health Verification
```

---

## 2. CI Quality & Security Gates

Every Pull Request must satisfy the following checks before merge:

1. **Lint & Typecheck**: No ESLint or TypeScript compiler errors across all packages and apps.
2. **Raw SQL Guard (`scripts/ci/check-no-raw-sql.js`)**:
   - Zero occurrences of `$queryRawUnsafe`, `$executeRawUnsafe`, or direct SQL driver bypass.
3. **DTO Input Validation Guard (`scripts/ci/check-dtos.js`)**:
   - Every NestJS controller `@Body()` and `@Query()` parameter must map to a concrete validated DTO class.
4. **Vulnerability Audit**:
   - `pnpm audit --audit-level=high` blocks PRs introducing high/critical CVEs.
5. **Critical Accessibility Guard (`scripts/ci/check-a11y.js`)**:
   - Ensures all `<img>` tags have `alt` attributes and icon-only buttons have accessible names.
6. **Tests**:
   - All unit and integration tests (with PostgreSQL pgvector and Redis) must pass.

---

## 3. Database Migration Protocol (Expand/Contract)

Prisma migrations run as a pre-deployment step (`prisma migrate deploy`):

- **Expand**: Add new columns/tables with nullable constraints or default values. Existing app versions continue running without crash.
- **Migrate**: Backfill or dual-write data if required.
- **Contract**: In a subsequent release, remove deprecated columns or tighten constraints after all running instances are updated.
- **Rule**: _Never run raw destructive schema alters or drop columns while older container versions are actively serving traffic._

---

## 4. Production Release & Rolling Restart

1. When a PR merges to `main`, GitHub Actions automatically:
   - Migrates the staging database.
   - Builds container images tagged with `sha-<COMMIT_SHA>` and `latest`.
   - Deploys to staging and validates `/v1/health`.
2. **Production Gate**:
   - An authorized maintainer approves the `production` environment release in GitHub Actions.
   - The deployment executes a **start-first** rolling update: new container instances spin up, achieve healthy state via `/v1/health`, and old containers are cleanly terminated.

---

## 5. One-Command Rollback Procedures

If an incident or regression occurs post-deployment:

### Option A: From GitHub Actions (Recommended)

1. Go to **Actions** -> **One-Command Rollback**.
2. Click **Run workflow**.
3. Enter the target tag (e.g. `sha-a1b2c3d` or `previous`) and select environment (`production` or `staging`).
4. Click **Run workflow**. The script will revert image tags, perform a rolling restart, and confirm health.

### Option B: From Server Shell / CLI

Run the rollback script directly:

```bash
./scripts/rollback.sh --target sha-<TARGET_SHA> --env production
```

Or to revert to previous image tag:

```bash
./scripts/rollback.sh --target previous --env production
```

The script pulls the target image, runs `docker compose up -d --no-deps`, and loops until the `/health` endpoint responds with HTTP 200 OK.
