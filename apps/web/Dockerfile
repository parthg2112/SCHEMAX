FROM node:20-slim AS base
RUN apk add --no-cache libc6-compat

# ------------------------
# Dependencies stage
# ------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN corepack enable
RUN pnpm install --frozen-lockfile

# ------------------------
# Builder stage
# ------------------------
FROM base AS builder
WORKDIR /app

# Copy source first
COPY . .

# Install deps AGAIN (required for pnpm)
RUN corepack enable
RUN pnpm install --frozen-lockfile

ARG INTERNAL_BACKEND_URL
ENV INTERNAL_BACKEND_URL=${INTERNAL_BACKEND_URL}

# Build only web
RUN pnpm --filter web build

# ------------------------
# Runner stage
# ------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output only
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
