# Developer Operations Runbooks (docs/runbooks.md)

---

## 1. Local Development Setup

### Prerequisites

- Node.js >= 20 (Node 24 recommended)
- `pnpm` >= 9
- Docker Desktop or Docker Engine

### Initializing the Monorepo

```bash
# 1. Install all dependencies across apps and packages
pnpm install

# 2. Start local databases and search services
docker compose up -d

# 3. Verify running containers
docker compose ps

# 4. Start all applications in parallel development mode
pnpm dev
```

---

## 2. Common Maintenance Procedures

### Running Verification Suite

```bash
pnpm lint
pnpm typecheck
pnpm test
```

### Formatting Codebase

```bash
pnpm format
```

### Stopping Infrastructure

```bash
docker compose down
```
