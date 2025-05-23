// Test Firebase Authentication
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function testFirebaseAuth() {
  try {
    console.log('Testing Firebase Authentication...');
    
    // Check Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    console.log('Firebase Client Config:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey ? '********' : undefined // Hide API key in logs
    });
    
    // Get service account
    const serviceAccountPath = 'ymovies-e4cb4-firebase-adminsdk-fbsvc-f090460714.json';
    
    try {
      console.log(`Reading service account file from: ${serviceAccountPath}`);
      const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);
      console.log('✅ Successfully loaded service account from file');
      console.log('Service Account Project ID:', serviceAccount.project_id);
    } catch (fileError) {
      console.error('❌ Error reading service account file:', fileError.message);
    }
    
    // Display the steps to fix auth/operation-not-allowed
    console.log('\n✅ To fix the auth/operation-not-allowed error:');
    console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
    console.log('2. Select your project: ymovies-e4cb4');
    console.log('3. Click Authentication in the left sidebar');
    console.log('4. Click Sign-in method tab');
    console.log('5. Find Email/Password provider and click on it');
    console.log('6. Enable the "Email/Password" toggle switch');
    console.log('7. Click Save button');
    console.log('8. Try the signup function again');
    
  } catch (error) {
    console.error('❌ Firebase authentication test failed:', error.message);
  }
}

testFirebaseAuth();
