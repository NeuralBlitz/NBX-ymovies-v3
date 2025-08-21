#!/usr/bin/env node

// Environment Checker for YMovies
// This script checks if required environment variables are set

// Load dotenv first
import { config } from 'dotenv';
config();

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
let missingOptional = [];

console.log('🔍 Checking environment variables...\n');

// Check required variables
requiredVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].includes('your_') || process.env[varName].includes('_here')) {
        missingRequired.push(varName);
    } else {
        console.log(`✅ ${varName}: Set`);
    }
});

// Check optional variables
optionalVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].includes('your_') || process.env[varName].includes('_here')) {
        missingOptional.push(varName);
    } else {
        console.log(`✅ ${varName}: Set`);
    }
});

console.log('\n' + '='.repeat(50));

if (missingRequired.length > 0) {
    console.log('\n❌ MISSING REQUIRED VARIABLES:');
    missingRequired.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    
    console.log('\n🚨 Your app may not work properly without these variables!');
    console.log('\n📝 To fix this:');
    console.log('1. Edit your .env.local file');
    console.log('2. Add your actual API keys and configuration');
    console.log('3. Run npm run dev again');
    
    console.log('\n🔗 Get your API keys:');
    console.log('   • TMDB API: https://www.themoviedb.org/settings/api');
    console.log('   • Firebase: https://firebase.google.com/');
    
    process.exit(1);
}

if (missingOptional.length > 0) {
    console.log('\n⚠️  MISSING OPTIONAL VARIABLES:');
    missingOptional.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n💡 These are optional but recommended for full functionality.');
}

console.log('\n✅ Environment check passed! Starting development server...\n');
