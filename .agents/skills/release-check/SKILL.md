---
name: release-check
description: Verify CI status, migration backward compatibility, feature flags, rollback plan, runbooks, Lighthouse performance, and vulnerability reports before production deployment.
---

# Release Check Skill

Use this skill prior to promoting code to production.

## Instructions
1. Verify CI test passes across all workspaces.
2. Confirm database migrations are backward-compatible.
3. Check feature flags, rollback procedures, and runbook updates.
4. Verify Lighthouse performance and accessibility scores on changed pages.
5. Confirm no critical/high security vulnerabilities.
6. Provide an unambiguous Go/No-Go summary.
