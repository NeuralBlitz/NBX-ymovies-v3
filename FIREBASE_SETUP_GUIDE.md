# Firebase Authentication Setup Guide

## The Problem
You're getting `auth/operation-not-allowed` error when trying to create an account. This means email/password authentication is not enabled in your Firebase Console.

## Solution: Enable Email/Password Authentication

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ymovies-e4cb4**

### Step 2: Enable Authentication Methods
1. In the left sidebar, click on **Authentication**
2. Click on the **Sign-in method** tab
3. You should see a list of sign-in providers

### Step 3: Enable Email/Password
1. Find **Email/Password** in the providers list
2. Click on it to open the configuration
3. Toggle **Enable** to ON
4. Click **Save**

### Step 4: (Optional) Enable Google Sign-In
1. Find **Google** in the providers list
2. Click on it to open the configuration
3. Toggle **Enable** to ON
4. Select your support email from the dropdown
5. Click **Save**

### Step 5: Verify Setup
After enabling the authentication methods, try creating an account again. The signup should now work properly.

## Current Configuration Status
✅ Client-side Firebase config is correct (set in `client/public/env.js`)
✅ Server-side Firebase credentials are properly set (JSON key file exists)
❌ **Email/Password authentication needs to be enabled in Firebase Console**

## Additional Troubleshooting

If you still encounter issues with the email/password signup after enabling it in Firebase Console:

### Symptom: "auth/operation-not-allowed" error still appears 
1. Try clearing your browser cache
2. Make sure you're running the latest version of the app
3. Check that the Firebase Console changes have propagated (sometimes it takes a few minutes)

### Symptom: CORS errors or other network issues
1. Check that your Firebase configuration (API keys, project IDs) match between client and server
2. Make sure your Firebase project allows requests from your domain
3. Check the browser console for more detailed error messages

### Symptom: Email verification not working
1. Make sure email verification is enabled in Firebase Console
2. Check that you've set up a valid email template for verification
3. Test with a real email address that you can access

## For More Help
If you continue to experience issues, please:
1. Check the detailed Firebase Authentication documentation
2. Look at the browser console for specific error messages
3. Check the server logs for backend authentication errors
