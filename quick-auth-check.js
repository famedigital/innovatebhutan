/**
 * Quick check for existing users
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkUsers() {
  if (!SUPABASE_KEY || SUPABASE_KEY.includes('your-')) {
    console.log('❌ Please set SUPABASE_SERVICE_ROLE_KEY in .env file first');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    console.log('🔍 Checking existing users...\n');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, fullName, email, role, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No users found in the system.');
      console.log('\n💡 You need to create an account first:');
      console.log('   1. Go to http://localhost:3000/login');
      console.log('   2. Click "Create Account"');
      console.log('   3. Register your email');
      console.log('   4. Verify your email');
      console.log('   5. Login with your new credentials');
      return;
    }

    console.log('✅ Found existing users:');
    profiles.forEach(user => {
      console.log(`   📧 ${user.email || 'No email'}`);
      console.log(`   👤 ${user.fullName || 'No name'} - Role: ${user.role || 'N/A'}`);
      console.log(`   📅 Created: ${user.createdAt?.split('T')[0] || 'Unknown'}`);
      console.log('');
    });

    console.log('💡 Try logging in with one of these email addresses.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();