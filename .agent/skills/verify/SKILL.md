---
name: verify
description: Run verification suite (pnpm lint, pnpm typecheck, pnpm test), fix any failures, and report changed files, endpoints/pages, assumptions, and required decisions.
---

# Verify Skill

Run in order and report results: `pnpm lint`, `pnpm typecheck`, `pnpm test`. If failures occur, fix them and rerun.
Then list:
- Changed files
- New endpoints / pages
- Assumptions
- Decisions needing user input
