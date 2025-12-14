# Raw SQL Template

This template uses **raw PostgreSQL SQL** with the `pg` library.

## Setup

1. Copy `.env.example` to `.env` and update the `DATABASE_URL`
2. Run `npm install`
3. Run `npm run db:init` to initialize the database with your schema
4. Run `npm run dev` to start the development server

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:init` - Initialize database with schema
- `npm run db:migrate` - Run migrations

## Schema

The database schema is defined in `db/init.sql`.
