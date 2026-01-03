FROM oven/bun:1-alpine

# Install OpenSSL for Prisma (it needs libssl)
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY prisma ./prisma/

# Install dependencies (Bun is ~25x faster than npm)
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build
RUN bun run build

ENV NODE_ENV=production
EXPOSE 80

CMD ["bun", "run", "dist/index.js"]