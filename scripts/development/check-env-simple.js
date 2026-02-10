#!/usr/bin/env node

// Environment Checker for YMovies
// This script checks if required environment variables are set
// Run with: node --env-file=.env check-env-simple.js

const requiredVars = [
    'TMDB_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_API_KEY'
];

const optionalVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_STORAGE_BUCKET'
];

let missingRequired = [];

// Check required variables silently
requiredVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].includes('your_') || process.env[varName].includes('_here')) {
        missingRequired.push(varName);
    }
});

if (missingRequired.length > 0) {
    console.error('\nMissing required environment variables:');
    missingRequired.forEach(varName => {
        console.error(`  ${varName}`);
    });
    console.error('\nGet API keys from:');
    console.error('  TMDB: https://www.themoviedb.org/settings/api');
    console.error('  Firebase: https://firebase.google.com/\n');
    process.exit(1);
}
