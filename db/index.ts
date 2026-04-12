import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * 🛰️ DATABASE CORE LINK
 * High-performance Supabase Postgres connection.
 */
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from environment variables');
}

// Disable prefetch as it is not supported for "Transaction" mode in Supabase
const client = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });

export type DbClient = typeof db;
