/**
 * Test API Endpoints
 */

async function testAPIEndpoints() {
  console.log('🌐 Testing API Endpoints');
  console.log('='.repeat(50));

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Clients API
    console.log('\n📊 Test 1: GET /api/clients');
    try {
      const clientsResponse = await fetch(`${baseUrl}/api/clients`);
      const clientsData = await clientsResponse.json();

      console.log(`   Status: ${clientsResponse.status}`);
      console.log(`   Response:`, JSON.stringify(clientsData, null, 2).substring(0, 200) + '...');

      if (clientsData.success) {
        console.log(`   ✅ SUCCESS - Found ${clientsData.count || 0} clients`);
      } else {
        console.log(`   ❌ FAILED - ${clientsData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
    }

    // Test 2: Projects API
    console.log('\n📋 Test 2: GET /api/projects');
    try {
      const projectsResponse = await fetch(`${baseUrl}/api/projects`);
      const projectsData = await projectsResponse.json();

      console.log(`   Status: ${projectsResponse.status}`);
      console.log(`   Response:`, JSON.stringify(projectsData, null, 2).substring(0, 200) + '...');

      if (projectsData.success) {
        console.log(`   ✅ SUCCESS - Found ${projectsData.data?.length || 0} projects`);
      } else {
        console.log(`   ❌ FAILED - ${projectsData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
    }

    // Test 3: Profiles API
    console.log('\n👤 Test 3: GET /api/profiles');
    try {
      const profilesResponse = await fetch(`${baseUrl}/api/profiles`);
      const profilesData = await profilesResponse.json();

      console.log(`   Status: ${profilesResponse.status}`);
      console.log(`   Response:`, JSON.stringify(profilesData, null, 2).substring(0, 200) + '...');

      if (profilesData.success) {
        console.log(`   ✅ SUCCESS - Found ${profilesData.data?.length || 0} profiles`);
      } else {
        console.log(`   ❌ FAILED - ${profilesData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 API TESTING COMPLETE');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ API testing failed:', error.message);
  }
}

testAPIEndpoints();