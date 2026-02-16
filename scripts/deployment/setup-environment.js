// Environment Variable Setup and Validation Script
const fs = require('fs');
const path = require('path');

console.log('🔧 YMovies Environment Setup and Validation');
console.log('==========================================');

// Required environment variables
const requiredVars = [
    'TMDB_API_KEY'
];

// Optional environment variables
const optionalVars = [
    'DATABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];

// Check for .env file
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    });
    console.log('✅ Found .env file');
} else {
    console.log('⚠️  No .env file found (this is okay for production deployment)');
}

// Check required variables
console.log('\n📋 Required Environment Variables:');
let missingRequired = [];

requiredVars.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
    } else {
        console.log(`❌ ${varName}: Missing`);
        missingRequired.push(varName);
    }
});

// Check optional variables
console.log('\n📝 Optional Environment Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
    } else {
        console.log(`⚪ ${varName}: Not set`);
    }
});

// Validation summary
console.log('\n📊 Validation Summary:');
if (missingRequired.length === 0) {
    console.log('✅ All required environment variables are set!');
    console.log('🚀 Ready for deployment to Vercel!');
} else {
    console.log(`❌ Missing ${missingRequired.length} required variable(s): ${missingRequired.join(', ')}`);
    console.log('⚠️  Please set these before deploying to Vercel.');
}

// Deployment instructions
console.log('\n🚀 Deployment Instructions:');
console.log('1. Install Vercel CLI: npm install -g vercel');
console.log('2. Login to Vercel: vercel login');
console.log('3. Set environment variables in Vercel:');

requiredVars.concat(optionalVars).forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (value) {
        console.log(`   vercel env add ${varName} production`);
    }
});

console.log('4. Deploy: vercel --prod');
console.log('\n✨ Or use the automated script: ./deploy-to-vercel.sh');

// Test TMDB API connectivity
const tmdbKey = process.env.TMDB_API_KEY || envVars.TMDB_API_KEY;
if (tmdbKey) {
    console.log('\n🧪 Testing TMDB API connectivity...');
    
    const https = require('https');
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}&page=1`;
    
    https.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ TMDB API key is valid and working!');
        } else {
            console.log(`❌ TMDB API test failed (HTTP ${res.statusCode})`);
        }
    }).on('error', (err) => {
        console.log(`❌ TMDB API test failed: ${err.message}`);
    });
}
