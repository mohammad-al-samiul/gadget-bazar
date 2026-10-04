---
name: security-review
description: Review changed code against 01-security.md and OWASP Top 10 for input validation, RBAC, PII leaks, secret leakage, rate limiting, and signed URL usage.
---

# Security Review Skill

Use this skill to audit changed code for security vulnerabilities.

## Instructions
1. Inspect code changes against `.agents/rules/01-security.md` and OWASP Top 10.
2. Check DTO/zod validation, RBAC server-side verification, PII leak protection, secrets avoidance, and signed URL generation.
3. List findings grouped by severity (Critical, High, Medium, Low).
4. Resolve critical findings immediately.
