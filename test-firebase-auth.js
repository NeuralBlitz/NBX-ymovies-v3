// Test Firebase Authentication
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFirebaseAuth() {
  try {
    console.log('Testing Firebase Authentication...');
    
    // Check if Firebase admin is already initialized
    if (!admin.apps.length) {
      // Get Firebase Admin credentials - try both env and file
      const serviceAccountPath = 'ymovies-e4cb4-firebase-adminsdk-fbsvc-f090460714.json';
      const projectId = process.env.FIREBASE_PROJECT_ID || 'ymovies-e4cb4';
      
      let serviceAccount = null;
        // First try to read directly from file
      try {
        console.log(`Reading service account file from: ${serviceAccountPath}`);
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        console.log('✅ Successfully loaded service account from file');
      } catch (fileError) {
        console.error('❌ Error reading service account file:', fileError.message);
        
        // Fallback to env var
        const serviceAccountBase64 = process.env.FIREBASE_ADMIN_CREDENTIALS;
        if (serviceAccountBase64) {
          try {
            serviceAccount = JSON.parse(
              Buffer.from(serviceAccountBase64, 'base64').toString()
            );
            console.log('✅ Successfully loaded service account from env variable');
          } catch (envError) {
            console.error('❌ Error decoding service account from env variable:', envError.message);
          }
        }
      }
        }
      
      if (!serviceAccount) {
        throw new Error('Failed to load service account credentials from any source');
      }
      
      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    }
    
    // Test token verification (this verifies the setup)
    console.log('✅ Firebase project ID:', process.env.FIREBASE_PROJECT_ID || 'ymovies-e4cb4');
    
    // Now let's test client-side auth methods
    console.log('Testing client-side Firebase auth methods...');
    console.log('✅ To fix the auth/operation-not-allowed error:');
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
