import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('📊 Current tables in database:');
    console.log('─'.repeat(50));
    tables.forEach(t => console.log(`   • ${t.table_name}`));
    console.log('─'.repeat(50));
    console.log(`Total: ${tables.length} tables`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkTables();