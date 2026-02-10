// Node v20.6+ automatically loads .env files with --env-file flag
import * as fs from 'fs';
import * as path from 'path';

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
    let serviceAccount = null;
    
    // First try with env var
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        // First verify that the credential looks like base64
        const credentialStr = process.env.FIREBASE_ADMIN_CREDENTIALS;
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(credentialStr.replace(/\s/g, ''));
        
        if (!isBase64) {
          // Try to read as file path
          try {
            const filePath = path.resolve(credentialStr);
            if (fs.existsSync(filePath)) {
              serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
          } catch (fileError) {
            // Silent fail, will try other methods
          }
        } else {
          serviceAccount = JSON.parse(
            Buffer.from(credentialStr, 'base64').toString()
          );
        }
      } catch (error) {
        // Silent fail, continue with other methods
      }
    }

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ymovies-development',
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        app = initializeApp({
          credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } catch (error) {
        app = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'default-project',
        });
      }
    } else {
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'default-project',
      });
    }
  } else {
    app = getApp();
  }
} catch (error) {
  // Try one last fallback initialization
  try {
    app = initializeApp({ projectId: 'default-project' });
  } catch (finalError) {
    console.error('Firebase initialization failed:', finalError);
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