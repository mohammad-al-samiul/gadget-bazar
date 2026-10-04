---
description: Perform comprehensive security audit against 01-security.md, OWASP Top 10, PII leaks, and RBAC rules
---

# /security-review Workflow

## Workflow Steps
1. **Audit Scope**:
   - Compare all changed code against `.agent/rules/01-security.md` and the OWASP Top 10 vulnerabilities.
2. **Key Security Checkpoints**:
   - **Input Validation**: DTO schemas, Zod validation, zero raw SQL injection vectors.
   - **RBAC & Authorization**: Server-side checks (e.g. dealer endpoints requiring `kyc_status = approved`, riders scoped to assigned tasks only, admin privileges).
   - **PII Protection**: Ensure customer phone numbers, addresses, sourcing prices (`sourcing_price_cny`), NIDs, and proofs of delivery are not exposed in logs, public tracking, Sentry, or frontend bundles.
   - **Secrets & Credentials**: Ensure no secrets, tokens, or private keys in code or logs; verify proper `.env.example` usage.
   - **Rate Limiting**: Enforce rate limiting on auth, OTP requests, search, image search, and checkout endpoints.
   - **Signed URLs**: Verify private documents (NID, warranties, delivery signatures) only use short-lived signed URLs.
3. **Reporting & Remediation**:
   - Categorize findings by severity (Critical, High, Medium, Low).
   - Immediately remediate critical and high vulnerabilities before code completion.
