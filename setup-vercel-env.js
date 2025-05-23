#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * This script helps you set up all required environment variables for your Netflix clone
 */

import { spawn } from 'child_process';

const requiredEnvVars = [
  'DATABASE_URL',
  'TMDB_API_KEY', 
  'VITE_TMDB_API_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_ADMIN_CREDENTIALS',
  'SESSION_SECRET',
  'NODE_ENV'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'RECOMMENDATION_SERVICE_URL',
  'VITE_USE_DEMO_SERVER'
];

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function addEnvVar(varName) {
  console.log(`\n📝 Setting up: ${varName}`);
  console.log(`Description: ${getDescription(varName)}`);
  
  try {
    await runCommand('vercel', ['env', 'add', varName]);
    console.log(`✅ ${varName} added successfully`);
  } catch (error) {
    console.log(`❌ Failed to add ${varName}: ${error.message}`);
  }
}

function getDescription(varName) {
  const descriptions = {
    'DATABASE_URL': 'PostgreSQL connection string for your database',
    'TMDB_API_KEY': 'TMDB API Bearer token',
    'VITE_TMDB_API_KEY': 'TMDB API Bearer token (client-side)',
    'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API key (from Firebase Console)',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase auth domain (your-project.firebaseapp.com)',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase project ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase storage bucket',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase messaging sender ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase app ID',
    'FIREBASE_PROJECT_ID': 'Firebase project ID (for admin)',
    'FIREBASE_ADMIN_CREDENTIALS': 'Firebase service account JSON (entire content as string)',
    'SESSION_SECRET': 'Random 32-character string for session encryption',
    'NODE_ENV': 'Set to "production"',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': 'Firebase measurement ID (Google Analytics)',
    'RECOMMENDATION_SERVICE_URL': 'URL for recommendation service',
    'VITE_USE_DEMO_SERVER': 'Should be "false" in production'
  };
  
  return descriptions[varName] || 'Environment variable';
}

async function main() {
  console.log('🚀 Vercel Environment Variables Setup');
  console.log('====================================\n');
  
  console.log('This script will help you set up all environment variables for your Netflix clone.');
  console.log('You will be prompted to enter each value.\n');
  
  // Check if project is linked
  try {
    await runCommand('vercel', ['ls']);
  } catch (error) {
    console.log('❌ Project not linked to Vercel. Please run "vercel link" first.');
    process.exit(1);
  }
  
  console.log('📋 Setting up required environment variables:\n');
  
  for (const varName of requiredEnvVars) {
    await addEnvVar(varName);
  }
  
  console.log('\n📋 Optional environment variables:');
  console.log('You can skip these or add them later from the Vercel dashboard.\n');
  
  for (const varName of optionalEnvVars) {
    console.log(`⚪ ${varName}: ${getDescription(varName)}`);
  }
  
  console.log('\n✅ Environment variables setup complete!');
  console.log('\n🚀 Ready to deploy! Run: vercel --prod');
}

main().catch(console.error);
