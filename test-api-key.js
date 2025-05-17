// Test TMDB API Key
import 'dotenv/config';
import fetch from 'node-fetch';

const apiKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;

async function testApiKey() {
  console.log('Testing TMDB API connection...');
  
  try {
    // Try with bearer token first
    const bearerResponse = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (bearerResponse.ok) {
      const data = await bearerResponse.json();
      console.log('✅ API connection successful with Bearer token!');
      console.log(`Found ${data.results.length} trending movies`);
      console.log(`Sample movie: ${data.results[0].title}`);
      return;
    } else {
      console.log('❌ Bearer token authentication failed, trying API key parameter...');
    }
    
    // Try with api_key parameter
    const apiKeyResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
    
    if (apiKeyResponse.ok) {
      const data = await apiKeyResponse.json();
      console.log('✅ API connection successful with api_key parameter!');
      console.log(`Found ${data.results.length} trending movies`);
      console.log(`Sample movie: ${data.results[0].title}`);
    } else {
      const error = await apiKeyResponse.text();
      console.error('❌ API connection failed:', apiKeyResponse.status, error);
      console.log('Please check your API key in .env file');
    }
  } catch (error) {
    console.error('❌ Error testing API key:', error.message);  }
}

// Run the test
testApiKey();
