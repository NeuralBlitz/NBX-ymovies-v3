import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local if in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// Function to initialize Firebase Admin
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    // If running in production, use service account credentials
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        console.log('Firebase Admin initialized with service account credentials');
      } catch (error) {
        console.error('Error initializing Firebase Admin with credentials:', error);
        throw error;
      }
    } 
    // Check for emulator mode
    else if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      // Initialize with emulator settings
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ymovies-development'
      });
      
      console.log(`Firebase Admin initialized with emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    }
    // Try application default credentials
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('Firebase Admin initialized with application default credentials');
    }
    // Last resort - try to initialize without explicit credentials
    else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ymovies'
      });
      
      console.log('Firebase Admin initialized without explicit credentials');
    }
    
    return admin;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Initialize and export Firebase Admin
const firebaseAdmin = initializeFirebaseAdmin();
export default firebaseAdmin;
