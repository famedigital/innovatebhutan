import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkClientsSchema() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database...');

    // Check clients table structure
    const clientsTable = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position;
    `;

    console.log(`\n📋 clients table structure:\n`);
    clientsTable.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})${col.column_default ? ` default: ${col.column_default}` : ''}`);
    });

    // Check what fields are missing from the expected schema
    const expectedFields = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'city', 'country'];
    const currentFields = clientsTable.map(c => c.column_name);
    const missingFields = expectedFields.filter(f => !currentFields.includes(f));

    if (missingFields.length > 0) {
      console.log(`\n❌ Missing expected fields:\n`);
      missingFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    } else {
      console.log(`\n✅ All expected fields present!`);
    }

  } catch (error) {
    console.error('❌ Error checking clients schema:', error.message);
  } finally {
    await sql.end();
  }
}

checkClientsSchema();