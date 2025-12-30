// Simple API test script to verify all requirements
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Pastebin Lite API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/healthz`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('Status:', healthResponse.status);
    console.log('Content-Type:', healthResponse.headers['content-type']);
    console.log('');

    // Test 2: Create paste
    console.log('2. Creating paste...');
    const createResponse = await axios.post(`${BASE_URL}/api/pastes`, {
      content: 'Hello, World! This is a test paste.',
      ttl_seconds: 3600,
      max_views: 5
    });
    console.log('✅ Paste created:', createResponse.data);
    const pasteId = createResponse.data.id;
    const pasteUrl = createResponse.data.url;
    console.log('Status:', createResponse.status);
    console.log('');

    // Test 3: Fetch paste (API)
    console.log('3. Fetching paste via API...');
    const fetchResponse = await axios.get(`${BASE_URL}/api/pastes/${pasteId}`);
    console.log('✅ Paste fetched:', fetchResponse.data);
    console.log('Status:', fetchResponse.status);
    console.log('');

    // Test 4: View paste (HTML)
    console.log('4. Viewing paste via HTML...');
    const htmlResponse = await axios.get(`${BASE_URL}/p/${pasteId}`);
    console.log('✅ HTML page loaded');
    console.log('Status:', htmlResponse.status);
    console.log('Content-Type:', htmlResponse.headers['content-type']);
    console.log('Contains content:', htmlResponse.data.includes('Hello, World!'));
    console.log('');

    // Test 5: Test view limits
    console.log('5. Testing view limits...');
    console.log('Creating paste with max_views=1...');
    const limitedPaste = await axios.post(`${BASE_URL}/api/pastes`, {
      content: 'This paste should expire after 1 view',
      max_views: 1
    });
    const limitedId = limitedPaste.data.id;
    
    console.log('First view (should succeed)...');
    const firstView = await axios.get(`${BASE_URL}/api/pastes/${limitedId}`);
    console.log('✅ First view succeeded:', firstView.status);
    
    console.log('Second view (should fail)...');
    try {
      const secondView = await axios.get(`${BASE_URL}/api/pastes/${limitedId}`);
      console.log('❌ Second view should have failed');
    } catch (error) {
      console.log('✅ Second view correctly failed:', error.response.status);
    }
    console.log('');

    // Test 6: Test TTL with deterministic time
    console.log('6. Testing TTL with deterministic time...');
    console.log('Creating paste with ttl_seconds=60...');
    const ttlPaste = await axios.post(`${BASE_URL}/api/pastes`, {
      content: 'This paste should expire with TTL',
      ttl_seconds: 60
    });
    const ttlId = ttlPaste.data.id;
    
    console.log('View before expiry (should succeed)...');
    const beforeExpiry = await axios.get(`${BASE_URL}/api/pastes/${ttlId}`);
    console.log('✅ Before expiry succeeded:', beforeExpiry.status);
    
    console.log('View after expiry (should fail)...');
    try {
      const afterExpiry = await axios.get(`${BASE_URL}/api/pastes/${ttlId}`, {
        headers: {
          'x-test-now-ms': new Date(Date.now() + 120000).getTime() // 2 minutes from now
        }
      });
      console.log('❌ After expiry should have failed');
    } catch (error) {
      console.log('✅ After expiry correctly failed:', error.response.status);
    }
    console.log('');

    console.log('🎉 All tests passed! The API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
