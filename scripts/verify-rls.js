/**
 * 🔍 RLS POLICY VERIFICATION
 * Verifies that Row-Level Security policies were applied correctly
 *
 * Usage: node scripts/verify-rls.js
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

async function verifyRLS() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('========================================');
    console.log('   RLS POLICY VERIFICATION');
    console.log('========================================\n');

    // 1. Check RLS enabled tables
    console.log('1️⃣  Tables with RLS enabled:');
    console.log('─'.repeat(40));
    const rlsTables = await sql`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND rowsecurity = true
      ORDER BY tablename;
    `;
    console.table(rlsTables);

    // 2. Check policies on profiles
    console.log('\n2️⃣  RLS Policies on profiles table:');
    console.log('─'.repeat(40));
    const profilePolicies = await sql`
      SELECT policyname, permissive, roles
      FROM pg_policies
      WHERE tablename = 'profiles'
      ORDER BY policyname;
    `;
    console.table(profilePolicies);

    // 3. Check policies on clients
    console.log('\n3️⃣  RLS Policies on clients table:');
    console.log('─'.repeat(40));
    const clientPolicies = await sql`
      SELECT policyname, permissive, roles
      FROM pg_policies
      WHERE tablename = 'clients'
      ORDER BY policyname;
    `;
    console.table(clientPolicies);

    // 4. Verify clients table columns
    console.log('\n4️⃣  Clients table columns:');
    console.log('─'.repeat(40));
    const clientColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
        AND column_name IN ('email', 'phone', 'address', 'city', 'country')
      ORDER BY ordinal_position;
    `;
    console.table(clientColumns);

    // 5. Verify profiles table columns
    console.log('\n5️⃣  Profiles table columns:');
    console.log('─'.repeat(40));
    const profileColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
        AND column_name IN ('full_name', 'role', 'created_at')
      ORDER BY ordinal_position;
    `;
    console.table(profileColumns);

    // 6. Count total policies
    console.log('\n6️⃣  Total RLS policies:');
    console.log('─'.repeat(40));
    const policyCount = await sql`
      SELECT COUNT(*) as total_policies
      FROM pg_policies
      WHERE schemaname = 'public';
    `;
    console.log(`   Total: ${policyCount.total_policies} RLS policies created`);

    console.log('\n' + '='.repeat(50));
    console.log('   ✅ VERIFICATION COMPLETE');
    console.log('='.repeat(50));

  } finally {
    await sql.end();
  }
}

verifyRLS().catch(console.error);
