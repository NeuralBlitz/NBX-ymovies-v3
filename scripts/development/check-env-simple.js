#!/usr/bin/env node

// Environment Checker for YMovies
// This script checks if required environment variables are set
// Run with: node --env-file=.env check-env-simple.js

const requiredVars = [
    'TMDB_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
];

const optionalVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
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
    console.error('  Supabase: https://supabase.com/dashboard\n');
    process.exit(1);
}
