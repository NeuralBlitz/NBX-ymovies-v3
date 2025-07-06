// Load environment variables only in development
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Only load .env.local in development, not during build
if (process.env.NODE_ENV !== 'production' && fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

// Import both Firebase Admin SDK namespace and individual functions
import * as admin from 'firebase-admin';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let app;

try {
  // Try to get existing app first
  const apps = getApps();
  
  if (!apps.length) {
    console.log('Firebase Admin SDK not initialized. Initializing...');
    
    let serviceAccount = null;
    
    // First try with env var
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        // First verify that the credential looks like base64
        const credentialStr = process.env.FIREBASE_ADMIN_CREDENTIALS;
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(credentialStr.replace(/\s/g, ''));
        
        if (!isBase64) {
          console.warn('FIREBASE_ADMIN_CREDENTIALS does not appear to be valid base64, trying as file path');          // Try to read as file path
          try {
            const filePath = path.resolve(credentialStr);
            if (fs.existsSync(filePath)) {
              serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              console.log(`Successfully loaded service account from file: ${credentialStr}`);
            }
          } catch (fileError) {
            console.error('Error reading file path from FIREBASE_ADMIN_CREDENTIALS:', fileError);
          }
        } else {
          serviceAccount = JSON.parse(
            Buffer.from(credentialStr, 'base64').toString()
          );
        }
      } catch (error) {
        console.error('Error parsing FIREBASE_ADMIN_CREDENTIALS, falling back to other methods:', error);
        // Continue with other methods instead of throwing
      }
    }

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin initialized with service account credentials');
    } else if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ymovies-development',
      });
      console.log(`Firebase Admin initialized with emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        app = initializeApp({
          credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin initialized with application default credentials');
      } catch (error) {
        console.error('Error initializing with GOOGLE_APPLICATION_CREDENTIALS, falling back:', error);
        // Fall through to default initialization
        app = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'default-project',
        });
        console.log('Firebase Admin initialized with default configuration after credential error');
      }
    } else {
      if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn(
          'FIREBASE_PROJECT_ID is not set. Firebase Admin might not initialize correctly. Trying default initialization.'
        );
      }
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'default-project',
      });
      console.log('Firebase Admin initialized (default or with projectId from env)');
    }
  } else {
    console.log('Firebase Admin SDK already initialized. Using existing app.');
    app = getApp();
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  // Try one last fallback initialization
  try {
    app = initializeApp({ projectId: 'default-project' });
    console.log('Firebase Admin initialized with fallback configuration');
  } catch (finalError) {
    console.error('All Firebase initialization attempts failed:', finalError);
    throw finalError;
  }
}

// Create and export the auth service
const auth = getAuth(app);

// Create a compatible admin object that has the auth method
const compatibleAdmin = {
  ...admin,
  app: () => app,
  auth: () => auth,
};

export { auth };
export default compatibleAdmin;