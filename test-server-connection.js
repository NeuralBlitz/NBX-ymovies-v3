// Test script for the application server's database connection
import { execSync } from 'child_process';
import fetch from 'node-fetch';

console.log('Testing server startup and database connection...');

// Define the server port
const PORT = 3001;
let serverProcess;

async function testServer() {
  try {
    console.log(`Starting server on port ${PORT}...`);
    
    // Start the server in the background
    serverProcess = execSync(`node server/index.js`, { 
      env: { ...process.env, PORT },
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000
    });
    
    // Wait for server to start
    console.log('Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test the API endpoints
    console.log('\nTesting API endpoints:');
    
    // Test health endpoint
    console.log('\n1. Testing /api/health endpoint...');
    try {
      const healthResponse = await fetch(`http://localhost:${PORT}/api/health`);
      const healthData = await healthResponse.json();
      console.log('Health endpoint response:', healthData);
    } catch (error) {
      console.error('❌ Health endpoint error:', error.message);
    }
    
    // Test genres endpoint
    console.log('\n2. Testing /api/genres endpoint...');
    try {
      const genresResponse = await fetch(`http://localhost:${PORT}/api/genres`);
      const genresData = await genresResponse.json();
      console.log(`Found ${genresData.length} genres`);
      console.log('Sample genres:', genresData.slice(0, 3));
    } catch (error) {
      console.error('❌ Genres endpoint error:', error.message);
    }
    
    console.log('\n✅ Server tests completed');
    
  } catch (error) {
    console.error('\n❌ Server test failed:');
    console.error(error.message);
    if (error.stdout) {
      console.log('Server output:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('Server error output:', error.stderr.toString());
    }
  } finally {
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
    }
  }
}

// Run the tests
try {
  testServer();
} catch (err) {
  console.error('Test script error:', err);
}
