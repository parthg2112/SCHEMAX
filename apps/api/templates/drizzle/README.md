# Drizzle ORM Template

This template uses **Drizzle ORM** with PostgreSQL.

## Setup

1. Copy `.env.example` to `.env` and update the `DATABASE_URL`
2. Run `npm install`
3. Run `npm run db:push` to sync the schema with your database
4. Run `npm run dev` to start the development server

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Schema

The database schema is defined in `src/db/schema.ts`.
