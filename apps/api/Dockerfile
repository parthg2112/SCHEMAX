FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install pnpm and dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .

# Build the API
WORKDIR /app/apps/api
RUN npm run prisma:generate
RUN corepack enable pnpm && pnpm run build

ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "dist/index.js"]
