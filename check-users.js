/**
 * Check existing users in your system
 * Run this to see what accounts exist
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ldrfdkkkvvcznsprbghf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

async function checkUsers() {
  console.log('🔍 Checking existing users in your system...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Check profiles
    console.log('📋 Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, fullName, email, role')
      .limit(10);

    if (!profileError && profiles) {
      console.log('✅ Existing profiles:');
      profiles.forEach(profile => {
        console.log(`   - ${profile.fullName || 'No name'} (${profile.email}) - Role: ${profile.role || 'N/A'}`);
      });
    } else {
      console.log('❌ No profiles found or error:', profileError?.message);
    }

    console.log('\n💡 To login, use one of the email addresses above.');
    console.log('💡 If no users exist, you need to create an account first.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();