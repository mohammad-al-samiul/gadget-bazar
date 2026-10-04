---
description: Build a frontend page with packages/ui, design tokens, bilingual strings, and responsive browser validation
---

# /new-page Workflow (Frontend Page)

## Workflow Steps
1. **Requirements Gathering**:
   - Ask for target app (`apps/web-gadgetbazar`, `apps/web-gadgetone`, `apps/web-gadgettrack`, or `apps/web-gadgetx`), route path, and required data models.
2. **Page Construction**:
   - Build page using `packages/ui` components and `packages/design-tokens` (no ad-hoc colors).
   - Ensure Bengali default strings via `next-intl` with English translations provided.
   - Implement loading, empty, and error states.
   - Enforce WCAG 2.1 AA accessibility and mobile-first responsiveness.
   - Ensure GadgetOne shows no MOQ/dealer/group-deal UI, and GadgetTrack never displays or requests PII.
3. **Visual Verification**:
   - Open page using the browser subagent at `390px` (mobile viewport) and `1280px` (desktop viewport).
   - Capture screenshots and attach them to the Walkthrough artifact.
4. **Verification**:
   - Run `/verify` workflow.
