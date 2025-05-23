#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * This script helps validate that all required environment variables are set for production deployment
 */

const requiredEnvVars = {
  // Database
  'DATABASE_URL': 'PostgreSQL connection string for your database',
  
  // TMDB API
  'TMDB_API_KEY': 'TMDB API Bearer token',
  'VITE_TMDB_API_KEY': 'TMDB API Bearer token (client-side)',
  
  // Firebase Client (Public)
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API key',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase auth domain',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase project ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase storage bucket',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase messaging sender ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase app ID',
  
  // Firebase Admin (Server-side)
  'FIREBASE_PROJECT_ID': 'Firebase project ID for admin',
  'FIREBASE_ADMIN_CREDENTIALS': 'Firebase service account JSON (entire content as string)',
  
  // Security
  'SESSION_SECRET': 'Random string for session encryption',
  'NODE_ENV': 'Should be "production"'
};

const optionalEnvVars = {
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': 'Firebase measurement ID (Google Analytics)',
  'RECOMMENDATION_SERVICE_URL': 'URL for recommendation service',
  'VITE_USE_DEMO_SERVER': 'Should be "false" in production'
};

console.log('🔍 Production Environment Validation\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('📋 Required Environment Variables:');
for (const [varName, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING - ${description}`);
    hasErrors = true;
  } else {
    // Basic validation for some variables
    if (varName === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
      console.log(`⚠️  ${varName}: Should start with 'postgresql://'`);
      hasWarnings = true;
    } else if (varName === 'FIREBASE_ADMIN_CREDENTIALS') {
      try {
        const parsed = JSON.parse(value);
        if (!parsed.type || !parsed.project_id || !parsed.private_key) {
          console.log(`⚠️  ${varName}: Invalid service account format`);
          hasWarnings = true;
        } else {
          console.log(`✅ ${varName}: Valid`);
        }
      } catch (error) {
        console.log(`❌ ${varName}: Invalid JSON format`);
        hasErrors = true;
      }
    } else if (varName === 'NODE_ENV' && value !== 'production') {
      console.log(`⚠️  ${varName}: Should be 'production' (current: '${value}')`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  }
}

// Check optional variables
console.log('\n📋 Optional Environment Variables:');
for (const [varName, description] of Object.entries(optionalEnvVars)) {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚪ ${varName}: Not set - ${description}`);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
}

// Summary
console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('❌ Environment validation failed. Please set the missing required variables.');
  console.log('\n📝 To set environment variables in Vercel:');
  console.log('1. Go to your project dashboard');
  console.log('2. Navigate to Settings → Environment Variables');
  console.log('3. Add each missing variable');
  console.log('4. Deploy your project');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment validation passed with warnings. Review the warnings above.');
  process.exit(0);
} else {
  console.log('✅ All environment variables are properly configured!');
  console.log('\n🚀 Ready for production deployment!');
  process.exit(0);
}
