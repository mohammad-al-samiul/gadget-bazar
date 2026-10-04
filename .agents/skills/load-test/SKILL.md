---
name: load-test
description: Create and execute k6 load test scripts for baseline, spike 10x/60s, stress, soak, group-deal 1000 joins, and webhook bursts, recording p95 and error rates in docs/capacity.md.
---

# Load Test Skill

Use this skill when designing or running performance and load tests.

## Instructions
1. Define test scenario (baseline, 10x spike, stress, soak, 1000 group-deal joins, webhook burst).
2. Author/update k6 scripts in `tests/load/`.
3. Execute solely against local/staging environments.
4. Record p95 latencies and error rates against SLOs in `docs/capacity.md`.
5. Identify and report bottlenecks.
