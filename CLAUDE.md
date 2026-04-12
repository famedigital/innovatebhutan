# Project Overview

**Innovate Bhutan** - Next.js 16 ERP system with Supabase backend

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Styling**: Tailwind CSS v4 + Radix UI
- **Validation**: React Hook Form + Zod
- **Deployment**: Vercel
- **Media**: Cloudinary

## Project Structure

- `app/` - Next.js app router pages
- `components/` - React components (ui/, forms/)
- `lib/` - Utilities, database clients
- `supabase/` - Supabase functions & migrations
- `drizzle/` - Database schema & migrations

## Database

- Use Drizzle ORM for all queries
- Schema in `drizzle/`
- Migrations via `drizzle-kit`

## Authentication

- Supabase Auth
- Server-side: `@supabase/ssr`
- Middleware: `middleware.ts`

## Component Patterns

- Use shadcn/ui components from `components/ui/`
- Follow Radix UI patterns
- Client components: `'use client'` directive

## Rules

- Prefer server components by default
- Use TypeScript strict mode
- Follow existing code patterns
- Test builds before deploying