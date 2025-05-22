import fetch from 'node-fetch';

// Base URL for the demo server
const BASE_URL = 'http://localhost:5001/api';

// Function to make a request to an endpoint
async function testEndpoint(endpoint) {
  try {
    console.log(`Testing endpoint: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`Success! Response from ${endpoint}:`);
    console.log(JSON.stringify(data, null, 2).slice(0, 500) + (JSON.stringify(data, null, 2).length > 500 ? '...' : ''));
    console.log('---------------------------');
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error);
  }
}

// Test all the endpoints we added
async function runTests() {
  console.log('Testing demo server endpoints...');
  
  // Test movie endpoints
  await testEndpoint('/movie/1'); // The Matrix
  await testEndpoint('/movie/1/similar');
  await testEndpoint('/movie/1/videos');
  await testEndpoint('/movie/1/reviews');
  
  // Test TV show endpoints
  await testEndpoint('/tv/1'); // Breaking Bad
  await testEndpoint('/tv/1/similar');
  await testEndpoint('/tv/1/videos');
  await testEndpoint('/tv/1/reviews');
  
  // Test non-existent movie/TV (should return generic data)
  await testEndpoint('/movie/999');
  await testEndpoint('/tv/999');
  
  console.log('All tests completed!');
}

// Run the tests
runTests();
