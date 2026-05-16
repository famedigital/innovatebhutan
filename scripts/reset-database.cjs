/**
 * Database Reset Script
 *
 * WARNING: This will DROP ALL TABLES and recreate from schema.ts
 * All existing data will be lost!
 */

const postgres = require('postgres');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 DATABASE RESET - Starting...\n');
  console.log('⚠️  WARNING: All data will be lost!\n');

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
  });

  try {
    // 1. Get all tables
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log(`📋 Found ${tables.length} existing tables:`);
    console.log('   ', tables.map(t => t.tablename).join(', '));

    // 2. Drop all tables (cascade to handle foreign keys)
    if (tables.length > 0) {
      console.log('\n🗑️  Dropping all tables...');
      for (const table of tables) {
        await sql.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
        console.log(`   ✓ Dropped: ${table.tablename}`);
      }
    }

    // 3. Verify all tables dropped
    const remaining = await sql`
      SELECT COUNT(*) as count
      FROM pg_tables
      WHERE schemaname = 'public'
    `;
    console.log(`\n✅ Tables remaining: ${remaining[0].count}`);

    console.log('\n✨ Database is now clean!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npx drizzle-kit push');
    console.log('   2. Run: npm run db:migrate (if using migrations)');
    console.log('   3. Run: npm run db:rls (to add RLS policies)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

resetDatabase();
