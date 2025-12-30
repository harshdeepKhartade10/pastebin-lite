// Test deployed API from backend directory
const axios = require('axios');

const BASE_URL = 'https://pastebin-lite-backend-6uu2.onrender.com';

async function testDeployedAPI() {
  console.log(' Testing Deployed Pastebin Lite API...\n');
  console.log(` Backend URL: ${BASE_URL}\n`);

  try{
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/healthz`);
    console.log(' Health check passed');
    console.log('   Status:', healthResponse.status);
    console.log('   Redis connected:', healthResponse.data.redis_connected);
    console.log('   Persistence working:', healthResponse.data.persistence_working);
    console.log('');

    // Test 2: Create paste
    console.log('2. Creating test paste...');
    const createResponse = await axios.post(`${BASE_URL}/api/pastes`,{
      content: 'This is a test paste from deployed API test!',
      ttl_seconds:3600,
      max_views: 10
    });
    console.log(' Paste created successfully');
    console.log('   Paste ID:', createResponse.data.id);
    console.log('   URL:', `${BASE_URL}/p/${createResponse.data.id}`);
    console.log('');

    const pasteId = createResponse.data.id;

    // Test 3: Fetch paste via API
    console.log('3. Fetching paste via API...');
    const fetchResponse = await axios.get(`${BASE_URL}/api/pastes/${pasteId}`);
    console.log(' Paste fetched via API');
    console.log('   Content:', fetchResponse.data.content);
    console.log('   Views remaining:',fetchResponse.data.remaining_views);
    console.log('');

    // Test 4: View paste via HTML
    console.log('4. Viewing paste via HTML page...');
    const htmlResponse = await axios.get(`${BASE_URL}/p/${pasteId}`);
    console.log(' HTML page loaded');
    console.log('   Status:', htmlResponse.status);
    console.log('   Content-Type:', htmlResponse.headers['content-type']);
    console.log('');

    console.log(' All tests passed! Deployed API is working correctly.');
    console.log('\n Live URLs:');
    console.log('   Frontend: https://pastebin-lite-phi.vercel.app');
    console.log('   Backend:  https://pastebin-lite-backend-6uu2.onrender.com');
    console.log('   Test paste:', `${BASE_URL}/p/${pasteId}`);

  } catch(error){
    console.error(' Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDeployedAPI();
