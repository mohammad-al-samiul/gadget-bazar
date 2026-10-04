---
description: Perform comprehensive pre-release quality, migration compatibility, security, and performance audit
---

# /release-check Workflow

## Workflow Steps
1. **CI & Automated Checks**:
   - Verify that all CI pipelines (lint, typecheck, unit tests, integration tests) are green.
2. **Database & Migration Safety**:
   - Verify that all database migrations are backward-compatible and safe for zero-downtime deployment.
3. **Deployment Readiness**:
   - Ensure all feature flags are properly configured in target environments.
   - Verify that a documented rollback plan is written and ready.
   - Ensure operations runbook is updated.
4. **Performance & Security Audit**:
   - Run Lighthouse audits on modified pages; verify targets are met.
   - Run security audit (`pnpm audit` or equivalent) to confirm zero new high/critical vulnerabilities.
5. **Release Decision**:
   - Output an unambiguous **Go / No-Go** summary report with supporting evidence.
