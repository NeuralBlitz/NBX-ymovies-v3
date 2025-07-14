# YMovies - Authentication System

This document provides comprehensive instructions for setting up and using the authentication system in the YMovies project.

## Table of Contents
1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Authentication Features](#authentication-features)
4. [User Data Persistence](#user-data-persistence)
5. [Troubleshooting](#troubleshooting)

## Overview

The YMovies authentication system uses Firebase Authentication for handling user accounts, providing:

- Google Sign-In integration
- Email/password authentication
- User data persistence (favorites, watch history, preferences)
- Email verification
- Password reset functionality

## Setup Instructions

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Once your project is created, click on "Web" to add a web app to your project
4. Register your app with a nickname and click "Register app"
5. Copy the Firebase configuration object

### Step 2: Add Firebase Configuration

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# For server-side Firebase Admin
FIREBASE_ADMIN_CREDENTIALS=base64_encoded_service_account_json
FIREBASE_PROJECT_ID=your_project_id
```

### Step 3: Enable Authentication Methods in Firebase

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the following providers:
   - Email/Password
   - Google

### Step 4: Get Firebase Admin Credentials

1. In the Firebase Console, go to "Project settings" > "Service accounts"
2. Click "Generate new private key" to download your service account key
3. Base64 encode the JSON file content: 
   ```
   cat your-service-account.json | base64
   ```
4. Add the encoded string to your `.env.local` file as `FIREBASE_ADMIN_CREDENTIALS`

### Step 5: Install Required Dependencies

```bash
npm install firebase firebase-admin @firebase/auth
```

## Authentication Features

### Google Sign-In

The application includes a Google sign-in button that allows users to authenticate with their Google account:

```tsx
<SocialLoginButtons showGoogle={true} onSuccess={handleSuccess} />
```

### Email/Password Authentication

Users can create an account and sign in using their email and password:

1. **Sign Up**: Users provide their email, password, and basic profile information
2. **Email Verification**: After signing up, users receive a verification email
3. **Sign In**: Users can sign in with their email and password
4. **Password Reset**: Users can request a password reset via email

### Authentication State Management

The `useAuth` hook provides access to the current authentication state:

```tsx
const { 
  user,                // Current user object
  isAuthenticated,     // Boolean indicating if user is authenticated
  isLoading,           // Boolean indicating if auth state is loading
  signIn,              // Function to sign in with email/password
  signUp,              // Function to create a new account
  signInWithGoogle,    // Function to sign in with Google
  signOut,             // Function to sign out
  resetPassword        // Function to send password reset email
} = useAuth();
```

## User Data Persistence

User data is stored in two places:

1. **Local Storage**: For quick access and offline functionality
2. **Server Database**: For persistent storage across devices

### Preference Management

The `useUserPreferences` hook provides methods to manage user preferences:

```tsx
const {
  preferences,           // User preferences object
  isLoading,             // Boolean indicating if preferences are loading
  addToFavorites,        // Add a movie/show to favorites
  removeFromFavorites,   // Remove a movie/show from favorites
  addToWatchlist,        // Add a movie/show to watchlist
  removeFromWatchlist,   // Remove a movie/show from watchlist
  addToWatchHistory,     // Add a movie/show to watch history
  isFavorite,            // Check if a movie/show is in favorites
  isInWatchlist,         // Check if a movie/show is in watchlist
  clearWatchHistory      // Clear watch history
} = useUserPreferences();
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Make sure your Firebase API keys are correct and the authentication methods are enabled in the Firebase Console.

2. **Server Authentication Failure**: Ensure your Firebase Admin credentials are correctly base64 encoded and the environment variable is set properly.

3. **CORS Issues**: If encountering CORS errors when making API calls, make sure your server is properly configured to accept requests from your client domain.

4. **Token Expiration**: Firebase tokens expire after an hour. The system should automatically refresh tokens, but if you encounter authentication errors, try signing out and back in.

### Debugging Tips

1. Check the browser console for error messages
2. Verify the Firebase configuration in the developer console
3. Use the Firebase Authentication dashboard to view user accounts
4. Check server logs for API authentication issues

For further assistance, please open an issue on the repository.
# Testing Authentication Flow

## Testing Steps
1. **Verify Environment Setup**
   ```
   npm run check:firebase
   ```

2. **Start the Application**
   ```
   npm run dev
   ```
   
3. **Test Authentication Features**
   - Sign up with a new email and password
   - Verify email verification flow
   - Sign in with email/password
   - Test Google sign-in
   - Test password reset flow
   - Verify user preferences are saved correctly

## Troubleshooting
If you encounter issues during testing:

1. **Check Firebase Console**
   - Ensure Authentication is enabled for Email/Password and Google providers
   - Verify that your application is properly registered

2. **Check Browser Console**
   - Look for Firebase authentication errors
   - Confirm that Firebase is properly initialized

3. **Server Logs**
   - Check for token verification issues
   - Ensure Firebase Admin is properly initialized

