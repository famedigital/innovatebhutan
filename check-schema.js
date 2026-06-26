import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database...');

    // Check what tables exist
    const tables = await sql`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log(`\n📊 Found ${tables.length} tables in public schema:\n`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check for migration-related tables
    const migrationTables = tables.filter(t =>
      t.table_name.includes('migration') ||
      t.table_name.includes('schema') ||
      t.table_name.includes('version')
    );

    if (migrationTables.length > 0) {
      console.log(`\n📋 Migration-related tables:\n`);
      migrationTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log(`\n❌ No migration-related tables found`);
    }

    // Check for amc table specifically
    const amcTable = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'amcs'
      ORDER BY ordinal_position;
    `;

    if (amcTable.length > 0) {
      console.log(`\n🔍 amcs table structure:\n`);
      amcTable.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await sql.end();
  }
}

checkSchema();