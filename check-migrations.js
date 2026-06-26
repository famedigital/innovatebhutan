import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkMigrations() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database...');

    // Check if drizzle_schema_version table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'drizzle_schema_version'
      );
    `;

    if (!tableCheck[0].exists) {
      console.log('❌ drizzle_schema_version table does not exist');
      console.log('No migrations have been applied yet');
      return;
    }

    // Get all applied migrations
    const result = await sql`
      SELECT version, name
      FROM drizzle_schema_version
      ORDER BY version ASC;
    `;

    console.log(`\n✅ Found ${result.length} applied migrations:\n`);
    result.forEach(row => {
      console.log(`  - ${row.version.padEnd(6)}: ${row.name}`);
    });

    // Get the latest migration version
    const latestResult = await sql`
      SELECT version, name
      FROM drizzle_schema_version
      ORDER BY version DESC
      LIMIT 1;
    `;

    if (latestResult.length > 0) {
      console.log(`\n🔝 Latest migration: ${latestResult[0].version} (${latestResult[0].name})`);
    }

  } catch (error) {
    console.error('❌ Error checking migrations:', error.message);
  } finally {
    await sql.end();
  }
}

checkMigrations();