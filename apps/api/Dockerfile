# Multi-stage Dockerfile for GadgetBazar NestJS API & BullMQ Workers

# Stage 1: Prune & Dependencies
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@12.8.1

COPY . .

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@12.8.1

COPY --from=pruner /app ./

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @gadgetbazar/api prisma generate
RUN pnpm --filter @gadgetbazar/shared build
RUN pnpm --filter @gadgetbazar/design-tokens build
RUN pnpm --filter @gadgetbazar/api-client build
RUN pnpm --filter @gadgetbazar/api build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=4000

# Run as non-privileged node user
USER node

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4000/v1/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/api/dist/main.js"]
