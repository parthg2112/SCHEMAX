# SCHEMAX

SCHEMAX is a web tool for designing database schemas: it generates ER diagrams from natural-language requirements using Google Gemini, renders them on an interactive canvas, and generates Prisma schemas. Projects are persisted per user behind authentication.

## Features

- AI ERD generation from plain-English requirements, streamed via Gemini (gemini-2.0-flash)
- Mermaid parsing and rendering to an interactive flow canvas
- Prisma schema generation from generated models
- Interactive code viewing (Monaco Editor, syntax highlighting)
- Project management with Postgres persistence (Prisma)
- Authentication via Better Auth with rate limiting
- Cashfree-based payment flow (order creation and webhook handlers)

## Tech Stack

Next.js, React, TypeScript, Tailwind CSS, @xyflow/react, tldraw, Monaco Editor, Vercel AI SDK; Express, Better Auth, Prisma, PostgreSQL, Google Gemini; Turborepo, pnpm

## Setup

Prerequisites: Node.js 20+, pnpm, PostgreSQL. Docker optional.

```bash
pnpm install
```

Development (both apps):
```bash
pnpm dev
```

Or in separate terminals:
```bash
pnpm dev:api   # API on http://localhost:3001
pnpm dev:web   # Web on http://localhost:3000
```

Environment variables (`apps/api/.env`, see `.env.example`):
```
DATABASE_URL=postgres://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_API_KEY=...
```

`apps/web/.env.local`: `NEXT_PUBLIC_BACKEND_URL=/api` (requests to `/api/*` are proxied to the API).

Docker:
```bash
docker-compose up --build
```
Web available at `http://localhost:3060`.
