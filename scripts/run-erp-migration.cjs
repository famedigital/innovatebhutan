const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    console.log('🔄 Connecting to database...');

    console.log('📜 Running migration: 0014_erp_extended_modules.sql');
    const migrationSQL = fs.readFileSync('./drizzle/0014_erp_extended_modules.sql', 'utf8');

    await sql.unsafe(migrationSQL);

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  📦 Inventory: items, warehouses, bins, stock_entries, stock_ledger');
    console.log('  🛒 Procurement: suppliers, purchase_orders, purchase_order_items, rfq_*');
    console.log('  💰 Accounts: parties, accounts, payment_entries, journal_entries, gl_entries');
    console.log('  🏢 Assets: assets, asset_categories, depreciation_schedule, asset_maintenance');
    console.log('');
    console.log('📊 Sample data inserted for testing.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
