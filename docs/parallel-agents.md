# Parallel Agents Workflow Guideline (Manager View)

This guideline coordinates parallel execution of multiple AI agents within the GadgetBazar repository to avoid git conflicts and schema desynchronization.

---

## Core Rules

1. **Isolation**:
   - Every agent operates on its own dedicated branch (or git worktree) and within separate module/app folders.
2. **Core File Ownership**:
   - The following critical shared files have a **single owner agent** at any given time:
     - `prisma/schema.prisma`
     - `apps/api/src/app.module.ts`
     - Root `package.json`
     - `packages/shared/`
   - Other agents cannot directly edit these files; they submit feature requests / requirements to the owner agent.

---

## Parallel Execution Matrix

| Stage | Can Run in Parallel | Must Run Sequentially (Single Agent) | Notes |
| :--- | :--- | :--- | :--- |
| **Foundation** | *None* | `G0` → `G1` → `G2` → `G3` | Establish repo, packages, database, and auth baseline first. |
| **Scale Design** | `Q1` (Planning), `Q2`, `Q3` in separate agents | `Q4` (Modifies transactional outbox schema) | `Q4` must only run after `G2` is stabilized. |
| **Backend** | `B8`, `B9`, `B10`, `B11`, `B12` (Separate module folders once schema is locked) | `B1` → `B2` → `B4` → `B5` → `B6` → `B7` → `B13` | Dependent core domain services run sequentially. |
| **Web Apps** | `F1`–`F3`, `F8`–`F13` in separate agents (Separate app directories after API client is generated) | `F0` first; then `F4` → `F6` → `F7` (Checkout & payment sequence) | Checkout flow requires strict sequential continuity. |
| **Mobile** | `M1`, `M2`, `M5` | `M0` first; then `M3` → `M4` | Foundation (`M0`) must precede dependent screen flows. |
