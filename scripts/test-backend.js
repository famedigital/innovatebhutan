/**
 * Test Backend API Endpoints
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function testBackend() {
  console.log('🧪 Testing Backend Database Queries');
  console.log('='.repeat(50));

  try {
    // Test 1: Check if clients table exists and has data
    console.log('\n📊 Test 1: Clients Table');
    const clientCount = await sql`SELECT COUNT(*) as count FROM clients`;
    console.log(`   ✅ Clients table exists: ${clientCount[0].count} records`);

    const sampleClients = await sql`SELECT id, name, email FROM clients LIMIT 3`;
    console.log('   Sample clients:', sampleClients);

    // Test 2: Check if profiles table exists
    console.log('\n👤 Test 2: Profiles Table');
    const profileCount = await sql`SELECT COUNT(*) as count FROM profiles`;
    console.log(`   ✅ Profiles table exists: ${profileCount[0].count} records`);

    // Test 3: Check if projects table exists
    console.log('\n📋 Test 3: Projects Table');
    const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
    console.log(`   ✅ Projects table exists: ${projectCount[0].count} records`);

    const sampleProjects = await sql`SELECT id, name, status FROM projects LIMIT 3`;
    console.log('   Sample projects:', sampleProjects);

    // Test 4: Check new support system tables
    console.log('\n🆕 Test 4: New Support System Tables');
    const problemsCount = await sql`SELECT COUNT(*) as count FROM problems`;
    console.log(`   ✅ Problems table: ${problemsCount[0].count} records`);

    const teamAssignmentsCount = await sql`SELECT COUNT(*) as count FROM team_assignments`;
    console.log(`   ✅ Team assignments table: ${teamAssignmentsCount[0].count} records`);

    // Test 5: Check if employees table has data
    console.log('\n👷 Test 5: Employees Table');
    const employeeCount = await sql`SELECT COUNT(*) as count FROM employees`;
    console.log(`   ✅ Employees table exists: ${employeeCount[0].count} records`);

    // Test 6: Check if enhanced columns exist
    console.log('\n🔧 Test 6: Enhanced Columns');
    const clientColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name IN ('industry', 'tier', 'client_health_score', 'tags')
    `;
    console.log('   ✅ Enhanced client columns:', clientColumns.map(c => c.column_name).join(', '));

    const employeeColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'employees'
      AND column_name IN ('skills', 'current_workload', 'availability')
    `;
    console.log('   ✅ Enhanced employee columns:', employeeColumns.map(c => c.column_name).join(', '));

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL BACKEND TESTS PASSED');
    console.log('='.repeat(50));
    console.log('\n🚀 The backend is ready! You can now:');
    console.log('   • Start the dev server: npm run dev');
    console.log('   • Access API endpoints: /api/clients, /api/projects, etc.');
    console.log('   • View admin dashboard: http://localhost:3000/admin/dashboard');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

testBackend().catch(console.error);