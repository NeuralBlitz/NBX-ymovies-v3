// Test script for verifying key database functionality
import dotenv from 'dotenv';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Force reload .env file contents directly
const envContent = fs.readFileSync('./\.env', 'utf8');
const envVars = dotenv.parse(envContent);

// Override environment variables with the fresh values
for (const key in envVars) {
  process.env[key] = envVars[key];
}

console.log('ENV file loaded directly');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
});

async function testDatabaseFunctions() {
  console.log('🔍 Testing database functionality...');
  
  let client;
  try {
    // Connect to the database
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Test 1: Check if users table exists
    console.log('\nTest 1: Checking if users table exists...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Test 2: Try to query user preferences if that table exists
    console.log('\nTest 2: Attempting to query user preferences...');
    try {
      const prefsResult = await client.query(`
        SELECT * FROM user_preferences LIMIT 5
      `);
      console.log(`✅ Found ${prefsResult.rowCount} user preferences`);
      if (prefsResult.rows.length > 0) {
        console.log('Sample user preference:', prefsResult.rows[0]);
      }
    } catch (error) {
      console.log('❌ Could not query user preferences:', error.message);
    }
    
    // Test 3: Try to query watch history if that table exists
    console.log('\nTest 3: Attempting to query watch history...');
    try {
      const historyResult = await client.query(`
        SELECT * FROM watch_history LIMIT 5
      `);
      console.log(`✅ Found ${historyResult.rowCount} watch history entries`);
      if (historyResult.rows.length > 0) {
        console.log('Sample watch history:', historyResult.rows[0]);
      }
    } catch (error) {
      console.log('❌ Could not query watch history:', error.message);
    }
    
    console.log('\n✅ Database tests completed');
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Run the tests
testDatabaseFunctions().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
