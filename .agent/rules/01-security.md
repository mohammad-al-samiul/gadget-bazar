---
trigger: always_on
description: Critical security policies, input validation, RBAC, secrets, and command safety
---

# Security

- Validate every input with DTOs/zod. No raw SQL. No secrets in code or logs; use env + .env.example only.
- RBAC enforced server-side: dealer endpoints must check kyc_status=approved; riders see only their own tasks.
- Rate-limit auth/OTP/search/image-search/checkout. Non-enumerating auth errors. argon2 for passwords.
- Private files (NID, warranty, delivery proof) only via short-lived signed URLs. No PII in logs, Sentry, analytics.
- Ask me before adding any dependency; justify it. Never run destructive or production commands without approval.
