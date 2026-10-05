# Capacity & Performance SLOs (docs/capacity.md)

This document tracks system capacity targets, SLOs, and load testing records.

---

## Performance Service Level Objectives (SLOs)

| Metric                         | Target SLO               | High Load Threshold | Notes                                      |
| :----------------------------- | :----------------------- | :------------------ | :----------------------------------------- |
| **API Latency (p95)**          | < 120ms                  | < 250ms             | Excludes external gateway round-trips      |
| **Product Search (p95)**       | < 80ms                   | < 150ms             | Elasticsearch cluster queries              |
| **Checkout Stage 1 (p95)**     | < 300ms                  | < 500ms             | Atomic DB reservation + SSLCommerz session |
| **Group Deal Concurrent Join** | < 100ms                  | < 200ms             | Redis conditional update + DB outbox       |
| **Webhook Burst Handling**     | 100% 200 OK fast (<50ms) | < 100ms             | Stored in DB outbox, processed via BullMQ  |

---

## Load Testing Log

| Date       | Scenario      | Target RPS | Actual p95 | Error Rate | Status  |
| :--------- | :------------ | :--------- | :--------- | :--------- | :------ |
| _Baseline_ | Setup Pending | —          | —          | —          | Planned |
