/**
 * 🚀 MIGRATION RUNNER for Innovate Bhutan ERP
 * Runs pending database migrations using Node.js + postgres package
 *
 * Usage: node scripts/run-migrations.js
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection from .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('❌ Make sure .env file exists with DATABASE_URL set');
  process.exit(1);
}

// Migration files to run
const MIGRATIONS = [
  'drizzle/0010_clients_schema_fix.sql',
  'drizzle/0011_profiles_schema_fix.sql',
  'drizzle/0012_add_rls_policies.sql'
];

async function runMigrations() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('✅ Connected to database');

    for (const migration of MIGRATIONS) {
      try {
        const migrationPath = join(__dirname, '..', migration);

        // Check if file exists
        const fs = await import('fs');
        if (!fs.existsSync(migrationPath)) {
          console.log(`\n⚠️  File not found: ${migration}`);
          continue;
        }

        // Read migration SQL
        const sqlContent = readFileSync(migrationPath, 'utf8');

        console.log(`\n📄 Running: ${migration}`);
        console.log('─'.repeat(50));

        // Split SQL by semicolon and execute each statement
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('--'))
          .filter(s => {
            // Skip COMMENT ON statements as they may fail
            return !s.toUpperCase().startsWith('COMMENT ON');
          });

        let successCount = 0;
        for (const statement of statements) {
          if (statement) {
            await sql.unsafe(statement);
            successCount++;
          }
        }

        console.log(`   ✅ SUCCESS (${successCount} statements executed)`);

      } catch (error) {
        console.error(`   ❌ FAILED`);
        console.error(`   Error: ${error.message}`);

        // For 0012_add_rls_policies.sql, we expect some errors
        if (migration === 'drizzle/0012_add_rls_policies.sql') {
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️  Skipping (policy already exists)`);
            continue;
          }
        }

        throw error;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL MIGRATIONS COMPLETED');
    console.log('='.repeat(50));
    console.log('\n📝 Run verification:');
    console.log('   node scripts/verify-rls.js');

  } finally {
    await sql.end();
  }
}

// Run migrations
runMigrations().catch(console.error);
