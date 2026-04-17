const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

require('dotenv').config();

async function checkTables() {
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log('🔍 Checking database connection...');

    // Check if tables exist
    const result = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('businesses', 'business_categories', 'locations')
      ORDER BY table_name;
    `;

    console.log('📊 Found tables:', result.length);
    result.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    if (result.length === 0) {
      console.log('❌ Directory tables not found!');
      console.log('📋 You need to run the SQL migration file:');
      console.log('   drizzle/0002_sloppy_orphan.sql');
      console.log('');
      console.log('💡 Go to Supabase Dashboard > SQL Editor > Execute the file');
    } else {
      console.log('✅ Directory tables exist! Database integration is working.');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();