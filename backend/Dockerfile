FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
