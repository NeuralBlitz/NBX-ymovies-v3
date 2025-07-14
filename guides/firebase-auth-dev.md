# Firebase Auth Development Setup

## Using Auth Emulators for Local Development

For local testing without connecting to a real Firebase project, you can use the Firebase Auth emulator:

1. Install the Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```
   - Select "Emulators" when prompted
   - Choose at least the "Authentication" emulator

3. Start the emulators:
   ```bash
   firebase emulators:start
   ```

4. Update your Firebase configuration in your client code to use the emulators:
   ```javascript
   // In development mode, connect to Firebase Auth emulator
   if (process.env.NODE_ENV === 'development') {
     connectAuthEmulator(auth, 'http://localhost:9099');
   }
   ```

## Testing Authentication in Development

When using emulators:

1. The sign-in page will work as normal, but users will be stored in the local emulator
2. You can create test users with any email and password combination
3. Google Sign-In will simulate authentication without actually connecting to Google

## Troubleshooting

If you encounter issues with Firebase authentication:

1. Check the browser console for errors related to Firebase initialization
2. Ensure your Firebase config is correctly formatted in `env.js`
3. Look for the following message in the console which indicates successful initialization:
   ```
   Firebase: Firebase App named '[DEFAULT]' already exists (app/duplicate-app)
   ```
   This means your Firebase app is correctly initialized

4. Try opening the app in a private/incognito browser window to rule out caching issues
