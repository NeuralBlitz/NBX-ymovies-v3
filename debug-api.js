// Debug script to test TMDB API directly
import fetch from 'node-fetch';
import 'dotenv/config';

// Get both types of keys
const regularApiKey = process.env.TMDB_API_KEY;
const bearerToken = process.env.VITE_TMDB_API_KEY;

console.log('TMDB API Key Test Script');
console.log('=======================');
console.log(`Regular API Key: ${regularApiKey ? regularApiKey.substr(0, 5) + '...' : 'Not found'}`);
console.log(`Bearer Token: ${bearerToken ? bearerToken.substr(0, 5) + '...' : 'Not found'}`);
console.log('');

async function testWithApiKey() {
  try {
    console.log('Testing with regular API key...');
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${regularApiKey}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`❌ API key test failed with status ${response.status}: ${text}`);
    } else {
      const data = await response.json();
      console.log('✅ API key test succeeded!');
      console.log(`Found ${data.results.length} trending movies`);
      console.log(`First movie: "${data.results[0].title}"`);
    }
  } catch (error) {
    console.log(`❌ API key test error: ${error.message}`);
  }
}

async function testWithBearerToken() {
  try {
    console.log('Testing with bearer token...');
    const response = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`❌ Bearer token test failed with status ${response.status}: ${text}`);
    } else {
      const data = await response.json();
      console.log('✅ Bearer token test succeeded!');
      console.log(`Found ${data.results.length} trending movies`);
      console.log(`First movie: "${data.results[0].title}"`);
    }
  } catch (error) {
    console.log(`❌ Bearer token test error: ${error.message}`);
  }
}

// Run both tests
async function runTests() {
  await testWithApiKey();
  console.log('');
  await testWithBearerToken();
}

runTests();
