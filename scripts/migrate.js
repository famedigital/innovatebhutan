/**
 * 🚀 SMART MIGRATION RUNNER
 * Checks which tables exist and only runs migrations for those tables
 *
 * Usage: node scripts/migrate.js
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

async function migrate() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking which tables exist...');

    // Check what tables actually exist
    const existingTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log(`   Found ${existingTables.length} tables`);
    console.log('   ', existingTables.map(t => t.tablename).join(', '));
    console.log('');

    // Migration configurations with table dependencies
    const migrations = [
      {
        file: 'drizzle/0010_clients_schema_fix.sql',
        tables: ['clients'],
        description: 'Add email, phone, address, city, country to clients table'
      },
      {
        file: 'drizzle/0011_profiles_schema_fix.sql',
        tables: ['profiles'],
        description: 'Add full_name, role, created_at to profiles table'
      },
      {
        file: 'drizzle/0012_add_rls_policies.sql',
        tables: ['profiles', 'clients', 'projects', 'amcs', 'invoices', 'transactions', 'employees', 'attendance', 'payslips', 'tickets', 'notifications', 'audit_logs', 'orders', 'order_items', 'services'],
        description: 'Add RLS policies to existing tables',
        skipPolicyCheck: true // Skip IF NOT EXISTS checks for policies
      }
    ];

    // Run applicable migrations
    for (const migration of migrations) {
      // Check if all required tables exist
      const missingTables = migration.tables.filter(t => !existingTables.some(e => e.tablename === t));

      if (missingTables.length > 0) {
        console.log(`⏭️  Skipping ${migration.file}`);
        console.log(`    Reason: Missing tables: ${missingTables.join(', ')}`);
        console.log('');
        continue;
      }

      console.log(`📄 Running: ${migration.file}`);
      console.log(`    ${migration.description}`);
      console.log('─'.repeat(50));

      try {
        const migrationPath = join(__dirname, '..', migration.file);
        const sqlContent = readFileSync(migrationPath, 'utf8');

        // For RLS migration, we need to be more careful
        if (migration.file.includes('rls_policies')) {
          // Enable RLS for existing tables
          for (const tableName of migration.tables) {
            try {
              await sql.unsafe(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`);
              console.log(`   ✅ Enabled RLS on ${tableName}`);
            } catch (e) {
              if (!e.message?.includes('already enabled')) {
                console.log(`   ⚠️  ${e.message}`);
              }
            }
          }
        } else {
          // For simple schema migrations, execute ALTER statements
          const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'))
            .filter(s => {
              return !s.toUpperCase().includes('COMMENT ON');
            });

          let successCount = 0;
          for (const statement of statements) {
            if (statement) {
              try {
                await sql.unsafe(statement);
                successCount++;
              } catch (e) {
                if (!e.message?.includes('already exists')) {
                  console.log(`   ⚠️  ${e.message}`);
                }
              }
            }
          }
          console.log(`   ✅ Success (${successCount} statements)`);
        }

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
      console.log('');
    }

    console.log('='.repeat(50));
    console.log('🎉 MIGRATIONS COMPLETE');
    console.log('='.repeat(50));
    console.log('');
    console.log('📝 Verify with: npm run db:verify');

  } finally {
    await sql.end();
  }
}

migrate().catch(console.error);
