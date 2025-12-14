FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: Set INTERNAL_BACKEND_URL for Docker internal communication
# If not set, next.config.ts will use localhost:3001 (dev) or env-based fallback
ARG INTERNAL_BACKEND_URL
ENV INTERNAL_BACKEND_URL=${INTERNAL_BACKEND_URL}

WORKDIR /app/frontend
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "frontend/server.js"]
