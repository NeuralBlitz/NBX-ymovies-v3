import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Log the current Firebase configuration
console.log('Firebase debug script running...');

// Check if window.ENV is available
if (typeof window !== 'undefined' && window.ENV) {
  console.log('window.ENV exists:', Object.keys(window.ENV));
  
  if (window.ENV.FIREBASE_CONFIG) {
    console.log('FIREBASE_CONFIG found in window.ENV');
    
    try {
      // Try to initialize Firebase
      const app = initializeApp(window.ENV.FIREBASE_CONFIG);
      const auth = getAuth(app);
      
      console.log('Firebase initialized successfully!');
      console.log('Auth object available:', !!auth);
      
      // Check current user
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser ? 'Logged in' : 'Not logged in');
      
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  } else {
    console.error('FIREBASE_CONFIG not found in window.ENV');
  }
} else {
  console.error('window.ENV is not defined or not accessible');
}

// Export nothing - this is just for debugging
export default {};
