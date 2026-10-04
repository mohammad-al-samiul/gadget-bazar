---
trigger: glob
globs:
  - "apps/web-*/**"
  - "packages/ui/**"
description: Next.js frontend rules, accessibility, localization, design tokens, and browser testing
---

# Frontend Rules

- Mobile-first, WCAG 2.1 AA, keyboard accessible. Bengali default (next-intl); no hard-coded strings.
- Use packages/ui and packages/design-tokens only; no ad-hoc colors. Server components/ISR where possible.
- Never compute order state or prices on the client; render what the API returns. Shipping shown on product pages is
  labelled ESTIMATE. The "Pay Shipping Charge" CTA appears only when status = weighed_awaiting_shipping_payment.
- GadgetOne shows no MOQ/dealer/group-deal UI. GadgetTrack never requests or renders PII.
- Verify every UI task in the browser at 390px and 1280px widths; attach screenshots to the Walkthrough.
