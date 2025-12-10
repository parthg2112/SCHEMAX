FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY backend/package.json ./backend/
# Copy frontend package.json (needed for workspace resolution)
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build backend
WORKDIR /app/backend
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
