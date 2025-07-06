// check-firebase-env.js
import { config } from 'dotenv';
import fs from 'fs';

// Skip environment checks in Vercel build environment
if (process.env.VERCEL || process.env.CI) {
  console.log('Skipping Firebase environment check in CI/build environment');
  process.exit(0);
}

// Load environment variables from .env.local (if it exists)
if (fs.existsSync('.env.local')) {
  config({ path: '.env.local' });
}

console.log('Checking Firebase environment variables...');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

// Only check if we're not in production build
if (process.env.NODE_ENV !== 'production') {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Warning: Missing Firebase environment variables (this is okay for production build):');
    missingVars.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
  }
}

// Update client/public/env.js to include Firebase config (only in development)
if (process.env.NODE_ENV !== 'production') {
  try {
    const envJsPath = 'client/public/env.js';
    
    if (fs.existsSync(envJsPath)) {
      let envJsContent = fs.readFileSync(envJsPath, 'utf8');
      
      // Check if Firebase config already exists
      if (!envJsContent.includes('FIREBASE_CONFIG')) {
        // Insert Firebase config before the closing brace
        const firebaseConfig = `  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
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
    }
  } catch (error) {
    console.warn('Warning: Could not update client/public/env.js:', error.message);
  }
}

console.log('Firebase environment check complete!');
