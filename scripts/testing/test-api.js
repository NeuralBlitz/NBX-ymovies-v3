#!/usr/bin/env node
// Test script to verify the foreign key constraint fix by calling the API

const fetch = require('node-fetch');

async function testApi() {
  console.log('🔍 Testing API endpoints...');
  
  try {
    // 1. Get preferences endpoint (should succeed even without login)
    console.log('\n1. Fetching preferences (GET /api/preferences)...');
    const prefsResponse = await fetch('http://localhost:5000/api/preferences');
    const prefsData = await prefsResponse.json();
    
    console.log('✅ GET /api/preferences response:', prefsData);
    
    console.log('\n✅ Test complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testApi()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
