// check-firebase-env.js
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('Checking Firebase environment variables...');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Error: Missing required Firebase environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env.local file');
  process.exit(1);
}

// Check if we're running in production and need server-side Firebase variables
if (process.env.NODE_ENV === 'production') {
  const requiredServerVars = [
    'FIREBASE_ADMIN_CREDENTIALS',
    'FIREBASE_PROJECT_ID'
  ];
  
  const missingServerVars = requiredServerVars.filter(varName => !process.env[varName]);
  
  if (missingServerVars.length > 0) {
    console.error('Error: Missing required server-side Firebase environment variables:');
    missingServerVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these variables in your production environment');
    process.exit(1);
  }
}

// Update client/public/env.js to include Firebase config
try {
  const envJsPath = 'client/public/env.js';
  let envJsContent = fs.readFileSync(envJsPath, 'utf8');
  
  // Check if Firebase config already exists
  if (!envJsContent.includes('FIREBASE_CONFIG')) {
    // Insert Firebase config before the closing brace
    const firebaseConfig = `  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
    authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
    measurementId: "${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}"
  },`;
    
    // Find the position to insert (before the closing brace)
    const insertPos = envJsContent.lastIndexOf('};');
    if (insertPos !== -1) {
      envJsContent = envJsContent.slice(0, insertPos) + firebaseConfig + envJsContent.slice(insertPos);
      fs.writeFileSync(envJsPath, envJsContent);
      console.log('Updated Firebase configuration in client/public/env.js');
    }
  }
} catch (error) {
  console.error('Error updating client/public/env.js:', error);
}

console.log('Firebase environment check complete!');
