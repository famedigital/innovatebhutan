/**
 * 🛰️ DATABASE CONNECTIVITY DIAGNOSTICS
 * Run this to pinpoint exactly why the Supabase connection is failing.
 */

const postgres = require('postgres');
require('dotenv').config();

const url = process.env.DATABASE_URL;

console.log("Attempting to connect to the Matrix...");
console.log("Target URL (censored):", url.replace(/:.*@/, ':****@'));

const sql = postgres(url, { ssl: 'require', connect_timeout: 10 });

async function test() {
  try {
    const result = await sql`SELECT 1 as connection_test`;
    console.log("✅ SUCCESS: Matrix Link Established.");
    console.log("Result:", result);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Existing Public Tables:", tables.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error("❌ FAILURE: Matrix Link Broken.");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.message.includes('password authentication failed')) {
      console.log("💡 SUGGESTION: The password provided might be incorrect or has special characters that were not correctly handled.");
    }
  } finally {
    await sql.end();
    process.exit();
  }
}

test();
