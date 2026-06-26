import postgres from 'postgres';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { glob } from 'glob';

dotenv.config();

async function syncMigrations() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database...');

    // Step 1: Create drizzle_schema_version table
    console.log('\n📋 Creating drizzle_schema_version table...');
    await sql`
      CREATE TABLE IF NOT EXISTS drizzle_schema_version (
        version TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Migration tracking table created');

    // Step 2: Check what already exists
    const existingVersion = await sql`
      SELECT version FROM drizzle_schema_version LIMIT 1;
    `;

    if (existingVersion.length > 0) {
      console.log('⚠️  Migration tracking already exists, skipping sync...');
      return;
    }

    // Step 3: Analyze which migrations have been effectively applied
    console.log('\n🔍 Analyzing current database schema...');

    // Check clients table for enhanced fields
    const clientsFields = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'clients' AND column_name IN ('email', 'phone', 'address', 'city', 'country', 'meta');
    `;

    const hasClientsEnhanced = clientsFields.length >= 5; // At least basic enhanced fields

    // Check AMC table structure
    const amcFields = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'amcs' AND column_name IN ('hardware_details', 'services_included', 'renewed_from', 'renewed_to');
    `;

    const hasAMCSchema = amcFields.length >= 3;

    // Check for other modules
    const hasProjects = await sql`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects');
    `;

    const hasInvoices = await sql`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices');
    `;

    const hasPayroll = await sql`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payslips');
    `;

    // Step 4: Mark migrations as applied based on what exists
    console.log('\n📝 Marking migrations as applied...');

    const migrationsToMark = [
      '0000', // Initial setup
      '0001', // Basic fixes
      '0002', // More fixes (use the comprehensive_fix one)
      '0003', // More fixes
      '0004', // Projects tables
      '0005', // AMC schema
      '0006', // Invoice schema
      '0007', // Payroll schema
      '0008', // Various enhancements (use OAuth tokens one)
      '0009', // Projects constraints
      '0010', // Clients enhanced fields (if exists)
      '0011', // Fix user ID columns OR profiles schema
      '0012', // RLS policies OR project enhancements
      '0013', // ERP core modules (if exists)
      '0014', // ERP extended modules (if exists)
      '0015', // ERP modules clean (if exists)
      '0016', // CMS content tables (if exists)
      '0017', // Hero content table (if exists)
      '0018', // Support system (if exists)
      '0019', // Chat system (if exists)
    ];

    // Determine which versions to actually include based on what exists in DB
    const appliedVersions = [];

    // Always include base setup
    appliedVersions.push('0000', '0001', '0002', '0003');

    if (hasProjects) {
      appliedVersions.push('0004', '0009');
      console.log('  ✅ Projects migrations marked as applied');
    }

    if (hasAMCSchema) {
      appliedVersions.push('0005');
      console.log('  ✅ AMC migration marked as applied');
    }

    if (hasInvoices) {
      appliedVersions.push('0006');
      console.log('  ✅ Invoices migration marked as applied');
    }

    if (hasPayroll) {
      appliedVersions.push('0007');
      console.log('  ✅ Payroll migration marked as applied');
    }

    // Additional modules that clearly exist
    appliedVersions.push('0008', '0011', '0012', '0013', '0014', '0015', '0016', '0017', '0018', '0019');
    console.log('  ✅ Additional module migrations marked as applied');

    // Clients enhanced fields
    if (hasClientsEnhanced) {
      appliedVersions.push('0010');
      console.log('  ✅ Clients enhanced migration marked as applied');
    }

    // Insert the migrations
    for (const version of appliedVersions) {
      // Get meaningful names from the actual migration files
      let migrationName = 'Applied migration';

      try {
        // Try to find migration files to get proper names
        const migrationFiles = await glob(`drizzle/${version}_*.sql`);
        if (migrationFiles.length > 0) {
          // Extract name from filename
          const filename = migrationFiles[0].split('/').pop();
          migrationName = filename.replace(`${version}_`, '').replace('.sql', '_').replace(/_/g, ' ');
          migrationName = migrationName.charAt(0).toUpperCase() + migrationName.slice(1);
        }
      } catch (err) {
        // Use default name
      }

      await sql`
        INSERT INTO drizzle_schema_version (version, name)
        VALUES (${version}, ${migrationName})
        ON CONFLICT (version) DO NOTHING;
      `;
    }

    console.log(`\n✅ Migration tracking sync complete! ${appliedVersions.length} migrations marked as applied.`);

    // Show current state
    const result = await sql`
      SELECT version, name, created_at
      FROM drizzle_schema_version
      ORDER BY version ASC;
    `;

    console.log('\n📊 Current migration state:\n');
    result.forEach(row => {
      console.log(`  ${row.version.padEnd(6)}: ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Error syncing migrations:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

syncMigrations();