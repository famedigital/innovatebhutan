/**
 * Make User Admin Script
 *
 * Updates a user's profile to ADMIN role.
 * Run with: node scripts/make-admin.cjs <user-email>
 */

const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function makeAdmin(email) {
  if (!email) {
    console.log('Usage: node scripts/make-admin.cjs <user-email>');
    console.log('Example: node scripts/make-admin.cjs user@example.com');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Get user by email from Supabase Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\nAvailable users:');
      users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.email} (${user.id})`);

    // Check if profile exists
    let profile = await sql`
      SELECT * FROM profiles WHERE user_id = ${user.id}
    `;

    if (profile.length === 0) {
      console.log('📝 Creating new profile...');
      await sql`
        INSERT INTO profiles (user_id, full_name, role)
        VALUES (${user.id}, ${user.user_metadata?.full_name || user.email}, 'ADMIN')
      `;
    } else {
      console.log(`📝 Current role: ${profile[0].role}`);
      console.log('📝 Updating role to ADMIN...');
      await sql`
        UPDATE profiles
        SET role = 'ADMIN'
        WHERE user_id = ${user.id}
      `;
    }

    // Verify
    const updated = await sql`
      SELECT * FROM profiles WHERE user_id = ${user.id}
    `;

    console.log('\n✅ Success! User now has ADMIN role:');
    console.log(`   ID: ${updated[0].id}`);
    console.log(`   User ID: ${updated[0].user_id}`);
    console.log(`   Name: ${updated[0].full_name || '(not set)'}`);
    console.log(`   Role: ${updated[0].role}`);

    console.log('\n📝 Please refresh the page to see changes.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

makeAdmin(process.argv[2]);
