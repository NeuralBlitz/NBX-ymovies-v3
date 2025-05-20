// check-recommendation-env.js
// Script to check if the recommendation service environment is properly configured
import { config } from 'dotenv';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

// Load environment variables
config();

console.log('Checking recommendation service environment...');

// Check for required environment variables
const requiredEnvVars = [
  'TMDB_API_KEY',
  'RECOMMENDATION_SERVICE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Error: Missing required recommendation service environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env file');
} else {
  console.log('✅ Environment variables found');
}

// Check if recommendation service Python dependencies are installed
console.log('\nChecking recommendation service Python dependencies...');

const recommendationServiceDir = path.join(process.cwd(), 'recommendation_service');
const requirementsFile = path.join(recommendationServiceDir, 'requirements.txt');

if (!fs.existsSync(requirementsFile)) {
  console.error('Error: requirements.txt not found in recommendation_service directory');
  process.exit(1);
}

// Check if venv exists
const venvDir = path.join(recommendationServiceDir, 'venv');
if (!fs.existsSync(venvDir)) {
  console.log('Python virtual environment not found. You may need to run:');
  console.log('- On Windows: start-recommendation-service.bat');
  console.log('- On Mac/Linux: ./start-recommendation-service.sh');
} else {
  console.log('✅ Python virtual environment found');
}

// Check if the recommendation service is running
console.log('\nChecking if recommendation service is running...');

const url = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5100';

import('node-fetch').then(({default: fetch}) => {
  fetch(`${url}/health`, { timeout: 2000 })
    .then(response => {
      if (response.status === 200) {
        console.log('✅ Recommendation service is running correctly');
      } else {
        console.log('⚠️ Recommendation service returned unexpected status:', response.status);
      }
    })
    .catch(error => {
      console.error('❌ Recommendation service is not running. Error:', error.message);
      console.log('\nTo start the recommendation service:');
      console.log('- On Windows: run start-recommendation-service.bat');
      console.log('- On Mac/Linux: run ./start-recommendation-service.sh');
    });
}).catch(err => {
  console.error('Error importing node-fetch:', err);
});
