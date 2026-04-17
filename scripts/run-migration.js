const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const supabaseUrl = 'https://ldrfdkkkvvcznsprbghf.supabase.co';
const supabaseKey = 'sb_publishable_p8LfB3Az5Z4Byrw4DrxTsQ_VKijL3WV'; // Publishable key

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Connecting to Supabase database...');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../drizzle/comprehensive_table_fix.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');

    // Execute the SQL using RPC (requires a function, or we can use direct SQL)
    // Since Supabase client doesn't support direct SQL execution, we'll use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SQL execution failed: ${error}`);
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

runMigration().catch(console.error);