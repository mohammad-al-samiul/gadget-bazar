---
description: Run verification suite (lint, typecheck, tests) and summarize status
---

# /verify Workflow

Run the following validation sequence in order:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Protocol
1. **Execution**: Run each command in order.
2. **Failure Handling**: If any command fails, inspect error logs, diagnose root cause, fix the issue, and rerun from the beginning until all checks pass.
3. **Summary Report**: Once all checks pass, output a structured report containing:
   - **Changed Files**: List of modified/created files.
   - **New Endpoints / Pages**: Any new API routes or frontend pages introduced.
   - **Assumptions**: Technical or business assumptions made during implementation.
   - **Decisions Needed**: Any pending decisions requiring user confirmation or input.
