// A simple script to test if the database connection works
import dotenv from 'dotenv';
import pkg from 'pg';
import fs from 'fs';
const { Pool } = pkg;

// Force reload .env file contents directly
const envContent = fs.readFileSync('./\.env', 'utf8');
const envVars = dotenv.parse(envContent);

// Override environment variables with the fresh values
for (const key in envVars) {
  process.env[key] = envVars[key];
}

console.log('ENV file loaded directly to ensure freshness');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('Connection string:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')); // Hide password in logs
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000, // 10 seconds timeout
    query_timeout: 10000
  });

  try {
    console.log('Attempting to connect to database...');
    // Try to connect and run a simple query with a timeout
    const connectPromise = pool.connect();
    
    // Add timeout for connection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    const client = await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('Authentication error - check username and password in the connection string');
    } else if (error.message.includes('timeout')) {
      console.error('Connection timed out - the database server may be unavailable or blocked by a firewall');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('DNS resolution failed - check the hostname in the connection string');
    }
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
