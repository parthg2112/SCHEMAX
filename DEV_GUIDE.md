# Development Guide - Turborepo

## Quick Start

### Option 1: Combined Dev (Single Terminal)
```bash
pnpm dev
```
This starts both web and API servers in a single terminal. Logs will be prefixed with `web:dev:` and `api:dev:`.

### Option 2: Separate Terminals (Recommended)
**Terminal 1 - Backend:**
```bash
pnpm dev:api
```
Starts the API server on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
pnpm dev:web
```
Starts the web frontend on `http://localhost:3000`

This gives you cleaner, separate log outputs for each service.

---

## Project Structure

```
ablelove/
├── apps/
│   ├── web/          # Frontend (Next.js)
│   └── api/          # Backend (Express)
│
├── packages/
│   └── typescript-config/  # Shared TS configs
│
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace config
```

---

## Available Commands

### Development
- `pnpm dev` - Start all apps (combined logs)
- `pnpm dev:web` - Start only frontend
- `pnpm dev:api` - Start only backend
- `pnpm dev:split` - Show instructions for split terminal setup

### Build
- `pnpm build` - Build all apps
- `pnpm --filter=web build` - Build only frontend
- `pnpm --filter=api build` - Build only backend

### Testing
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all apps

### Cleanup
- `pnpm clean` - Remove all build artifacts and node_modules

---

## API Connectivity

### Development Mode
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001`
- **API Proxy**: Frontend requests to `/api/*` are automatically proxied to `http://localhost:3001/api/*`

### Docker Mode
- **Frontend**: `http://localhost:3060`
- **Backend**: Internal (`http://api:80`)
- **API Proxy**: Frontend requests to `/api/*` are proxied to `http://api:80/api/*`

---

## Troubleshooting

### CORS Errors
The backend now has CORS configured for `localhost:3000` and `localhost:3060`. If you see CORS errors:
1. Make sure the backend is running on port 3001
2. Check that CORS middleware is enabled in `apps/api/index.ts`

### 404 Errors on Auth Routes
- Auth routes are at `/api/auth/*`
- Make sure to use relative paths (e.g., `/api/auth/sign-in/email`) not absolute URLs

### Hot Reload Not Working
- Turborepo uses persistent dev tasks
- Changes should trigger automatic reloads
- If not, restart the dev server

---

## Environment Variables

Create a `.env` file in the root or in each app directory:

**apps/api/.env:**
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3001"
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_BACKEND_URL="/api"
```

---

## Docker Deployment

```bash
# Build and start
docker compose up -d --build

# View logs
docker logs -f ablelove-web-1
docker logs -f ablelove-api-1

# Stop
docker compose down
```
