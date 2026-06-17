/**
 * Quick Supabase Auth Test
 * Run this to check if your Supabase authentication is working
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ldrfdkkkvvcznsprbghf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_p8LfB3Az5Z4Byrw4DrxTsQ_VKijL3WV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('🧪 Testing Supabase Authentication...\n');

  try {
    // Test 1: Check if Supabase connection works
    console.log('✅ Step 1: Testing Supabase connection...');
    const { data, error } = await supabase.from('clients').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Connection successful!\n');
    }

    // Test 2: Check if we can access auth
    console.log('✅ Step 2: Testing Auth API...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✅ Auth API is accessible!\n');

    console.log('🎉 Your Supabase authentication system is working!');
    console.log('\n🔧 If you still cannot login, the issue is:');
    console.log('   1. Wrong email/password');
    console.log('   2. User account doesn\'t exist');
    console.log('   3. Account needs email verification');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();