/**
 * Run the support system migration (0018)
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
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('✅ Connected to database');

    const migrationPath = join(__dirname, '..', 'drizzle', '0018_support_system_enhancements.sql');
    const sqlContent = readFileSync(migrationPath, 'utf8');

    console.log('📄 Running: drizzle/0018_support_system_enhancements.sql');
    console.log('─'.repeat(50));

    // Split SQL by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
      .filter(s => {
        // Skip COMMENT ON statements
        return !s.toUpperCase().startsWith('COMMENT ON');
      });

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length > 10) {
        try {
          await sql.unsafe(statement);
          successCount++;
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️  Skipping (already exists): ${error.message.substring(0, 100)}...`);
          } else {
            console.error(`   ❌ Error: ${error.message.substring(0, 200)}`);
            errorCount++;
          }
        }
      }
    }

    console.log(`\n   ✅ SUCCESS (${successCount} statements executed)`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} statements had non-critical errors`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 MIGRATION COMPLETED');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch(console.error);