FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install pnpm and dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

# Optional: Set INTERNAL_BACKEND_URL for Docker internal communication
# If not set, next.config.ts will use localhost:3001 (dev) or env-based fallback
ARG INTERNAL_BACKEND_URL
ENV INTERNAL_BACKEND_URL=${INTERNAL_BACKEND_URL}

# Build the web app
WORKDIR /app
RUN corepack enable pnpm && pnpm --filter=web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
