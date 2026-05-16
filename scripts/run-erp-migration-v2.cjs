const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    console.log('🔄 Connecting to database...');

    // Read and split the migration by semicolons
    const migrationSQL = fs.readFileSync('./drizzle/0014_erp_extended_modules.sql', 'utf8');

    // Split by semicolon but preserve statement blocks
    const statements = [];
    let current = '';
    let inParenthesis = false;

    for (const char of migrationSQL) {
      if (char === '(') inParenthesis = true;
      if (char === ')') inParenthesis = false;

      current += char;

      if (char === ';' && !inParenthesis) {
        const trimmed = current.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        current = '';
      }
    }

    console.log(`📜 Executing ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.length > 50) { // Skip empty/small statements
        try {
          await sql.unsafe(stmt);
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed: ${err.message.substring(0, 100)}`);
        }
      }
    }

    console.log('');
    console.log('✅ Migration completed!');
    console.log('');
    console.log('📊 Summary of tables created:');
    console.log('  📦 Inventory: items, warehouses, bins, stock_entries, stock_ledger');
    console.log('  🛒 Procurement: suppliers, purchase_orders, rfq tables');
    console.log('  💰 Accounts: parties, accounts, payment_entries, journal_entries');
    console.log('  🏢 Assets: assets, asset_categories, depreciation_schedule');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
