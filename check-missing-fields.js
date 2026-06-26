import postgres from 'postgres';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function checkMissingFields() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔍 Checking for missing fields from recent migrations...\n');

    // Get current clients table columns
    const clientsColumns = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'clients' ORDER BY column_name;
    `;

    const clientFields = clientsColumns.map(c => c.column_name);

    // Fields from migration 0020
    const migration0020Fields = [
      'industry', 'company_size', 'tier', 'preferred_contact_method', 'timezone',
      'sla_level', 'response_time_target', 'client_health_score',
      'last_communication_date', 'next_follow_up_date', 'tags', 'meta'
    ];

    const missing0020 = migration0020Fields.filter(f => !clientFields.includes(f));

    if (missing0020.length > 0) {
      console.log('❌ Missing fields from migration 0020:');
      missing0020.forEach(field => console.log(`   - ${field}`));
    } else {
      console.log('✅ All fields from migration 0020 exist');
    }

    // Check AMC table for migration 0021
    const amcColumns = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'amcs' ORDER BY column_name;
    `;

    const amcFields = amcColumns.map(c => c.column_name);

    // Basic AMC fields that should exist
    const requiredAMCFields = [
      'public_id', 'service_id', 'contract_number', 'amount',
      'hardware_details', 'services_included', 'renewed_from', 'renewed_to', 'status'
    ];

    const missingAMC = requiredAMCFields.filter(f => !amcFields.includes(f));

    if (missingAMC.length > 0) {
      console.log('\n❌ Missing AMC fields from migration 0021:');
      missingAMC.forEach(field => console.log(`   - ${field}`));
    } else {
      console.log('\n✅ All AMC fields from migration 0021 exist');
    }

    // Check for meta column in clients (migration 0022)
    const hasMeta = clientFields.includes('meta');
    if (!hasMeta) {
      console.log('\n❌ Missing meta column from migration 0022');
    } else {
      console.log('\n✅ Meta column from migration 0022 exists');
    }

    console.log('\n📋 Summary:');
    const totalMissing = missing0020.length + missingAMC.length + (hasMeta ? 0 : 1);
    if (totalMissing === 0) {
      console.log('✅ All recent migrations (0020-0022) are already applied!');
    } else {
      console.log(`⚠️  ${totalMissing} fields are still missing and need to be applied.`);
      console.log('    These migrations use IF NOT EXISTS, so they are safe to run.');
    }

  } catch (error) {
    console.error('❌ Error checking missing fields:', error.message);
  } finally {
    await sql.end();
  }
}

checkMissingFields();