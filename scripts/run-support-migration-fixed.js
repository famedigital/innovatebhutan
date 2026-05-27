/**
 * Run the support system migration (0018) - Fixed version
 * Handles CREATE TABLE blocks correctly
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

// Split SQL into statements, preserving CREATE TABLE blocks
function splitSQL(sqlContent) {
  const statements = [];
  let current = '';
  let inCreateTable = false;
  let parenCount = 0;

  const lines = sqlContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // Track CREATE TABLE blocks
    if (trimmed.toUpperCase().startsWith('CREATE TABLE') || trimmed.toUpperCase().startsWith('CREATE OR REPLACE FUNCTION')) {
      inCreateTable = true;
    }

    // Count parentheses in CREATE TABLE blocks
    if (inCreateTable) {
      for (const char of line) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
    }

    current += line + '\n';

    // End of statement if:
    // 1. Not in CREATE TABLE and semicolon found
    // 2. In CREATE TABLE, parenCount is 0, and semicolon found
    if (trimmed.endsWith(';')) {
      if (!inCreateTable || parenCount === 0) {
        statements.push(current.trim());
        current = '';
        inCreateTable = false;
        parenCount = 0;
      }
    }
  }

  // Add any remaining content
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
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

    const statements = splitSQL(sqlContent);

    console.log(`   Found ${statements.length} SQL statements`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.length < 10) continue;

      try {
        await sql.unsafe(statement);
        successCount++;

        // Show progress for every 5 statements
        if ((i + 1) % 5 === 0) {
          console.log(`   Progress: ${i + 1}/${statements.length} statements...`);
        }

      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error(`   ❌ Statement ${i + 1} failed: ${error.message.substring(0, 150)}...`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`   ✅ Success: ${successCount} statements`);
    if (skipCount > 0) {
      console.log(`   ⚠️  Skipped: ${skipCount} statements (already exist)`);
    }
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount} statements`);
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