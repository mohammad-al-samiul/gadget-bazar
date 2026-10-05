# GadgetBazar System Architecture

```mermaid
graph TD
    Client1["GadgetBazar Web (Bulk/Dealer/Admin)"] --> API["Shared NestJS Backend (/v1)"]
    Client2["GadgetOne Web (Single-Piece Retail)"] --> API
    Client3["GadgetTrack Web (Public Tracking - No PII)"] --> API
    Client4["GadgetX Rider PWA"] --> API

    API --> PG[("PostgreSQL + pgvector")]
    API --> Redis[("Redis & BullMQ")]
    API --> ES[("Elasticsearch")]
    API --> SSLCommerz["SSLCommerz IPN Webhook"]

    subgraph "Core Domain State Machine"
        SM["Two-Stage Payment & Order State Machine"]
        SM --> S1["Product Payment (Checkout)"]
        SM --> S2["Arrival in BD & Weighing"]
        SM --> S3["Shipping Payment"]
        S3 --> S4["Out for Delivery (Blocked until S3 is Paid)"]
    end
```

## Architectural Highlights

1. **Shared NestJS Backend**: Provides unified APIs under `/v1/` with Swagger documentation and automatic API client generation (`@gadgetbazar/api-client`).
2. **Four Specialized Next.js Frontends**:
   - `web-bazar`: Full bulk, dealer wholesale (KYC-gated), group deals, and admin dashboard.
   - `web-one`: Clean B2C retail; strictly no MOQ/dealer/group-deal elements.
   - `web-track`: Zero-PII public tracking service.
   - `web-x`: Rider PWA scoped strictly to the authenticated rider's assigned deliveries.
3. **Data Layer**:
   - PostgreSQL 16 with `pgvector` for product semantic/image embeddings.
   - Redis 7 for caching and BullMQ background task processing.
   - Elasticsearch 8 for faceted gadget catalog searches.
