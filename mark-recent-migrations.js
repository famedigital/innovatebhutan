import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function markRecentMigrations() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database...');

    // Recent diagnostic/fix migrations that are safe to mark as applied
    // since they use IF NOT EXISTS or are diagnostic-only
    const recentMigrations = [
      { version: '0020', name: 'Clients enhanced fields' },
      { version: '0021', name: 'AMC table complete migration' },
      { version: '0022', name: 'Clients meta column' },
      { version: '0023', name: 'AMC full fix' },
      { version: '0024', name: 'AMC diagnostic' },
      { version: '0025', name: 'AMC column fix' },
      { version: '0026', name: 'Diagnostic client names' },
      { version: '0027', name: 'Fix client names' },
    ];

    console.log('\n📝 Marking recent migrations as applied...\n');

    for (const migration of recentMigrations) {
      await sql`
        INSERT INTO drizzle_schema_version (version, name)
        VALUES (${migration.version}, ${migration.name})
        ON CONFLICT (version) DO NOTHING;
      `;
      console.log(`  ✅ Marked ${migration.version}: ${migration.name}`);
    }

    console.log('\n✅ All recent migrations marked as applied!\n');

    // Show final migration state
    const result = await sql`
      SELECT version, name, created_at
      FROM drizzle_schema_version
      ORDER BY version ASC;
    `;

    console.log('📊 Complete migration state:\n');
    result.forEach(row => {
      console.log(`  ${row.version.padEnd(6)}: ${row.name}`);
    });

    console.log(`\n🎉 Migration sync complete! Total migrations tracked: ${result.length}`);

  } catch (error) {
    console.error('❌ Error marking recent migrations:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

markRecentMigrations();