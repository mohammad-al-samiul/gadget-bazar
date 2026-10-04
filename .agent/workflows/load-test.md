---
description: Create and execute k6 load testing scripts for baseline, spike, soak, group-deal concurrency, and webhook bursts
---

# /load-test Workflow

## Workflow Steps
1. **Scenario Definition**:
   - Determine the target scenario:
     - Baseline load
     - Spike: 10x traffic surge over 60 seconds
     - Stress test to breaking point
     - Soak test for memory leaks / connection pool exhaustion
     - Group-deal concurrent joins: 1,000 simultaneous users racing for deal capacity
     - Webhook burst: simultaneous SSLCommerz IPN callbacks
2. **Script Generation**:
   - Create or update k6 test scripts in `tests/load/` simulating realistic HTTP requests, bearer tokens, and payloads.
3. **Execution Safety**:
   - Run tests against **local** or **staging** environments only. Never execute against production.
4. **Metrics & Logging**:
   - Record p95 latency, requests per second (RPS), and error rates.
   - Compare results against SLOs and document in `docs/capacity.md`.
   - Identify performance bottlenecks and document remediation steps.
