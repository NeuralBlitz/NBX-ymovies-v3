#!/bin/bash

# YMovies Netflix Clone - Vercel Deployment Script
echo "🎬 YMovies Netflix Clone - Vercel Deployment Setup"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables
echo "🔧 Setting up environment variables..."

# TMDB API Key
echo "Please provide your TMDB API Key:"
read -s TMDB_API_KEY
vercel env add TMDB_API_KEY production <<< "$TMDB_API_KEY"
vercel env add TMDB_API_KEY preview <<< "$TMDB_API_KEY"

# Database URL (if using a database)
echo "Do you have a Database URL? (y/n):"
read HAS_DB
if [ "$HAS_DB" = "y" ]; then
    echo "Please provide your Database URL:"
    read -s DATABASE_URL
    vercel env add DATABASE_URL production <<< "$DATABASE_URL"
    vercel env add DATABASE_URL preview <<< "$DATABASE_URL"
fi

# Firebase Config (if using Firebase)
echo "Do you have Firebase config? (y/n):"
read HAS_FIREBASE
if [ "$HAS_FIREBASE" = "y" ]; then
    echo "Please provide your Firebase API Key:"
    read -s VITE_FIREBASE_API_KEY
    vercel env add VITE_FIREBASE_API_KEY production <<< "$VITE_FIREBASE_API_KEY"
    vercel env add VITE_FIREBASE_API_KEY preview <<< "$VITE_FIREBASE_API_KEY"
    
    echo "Please provide your Firebase Auth Domain:"
    read VITE_FIREBASE_AUTH_DOMAIN
    vercel env add VITE_FIREBASE_AUTH_DOMAIN production <<< "$VITE_FIREBASE_AUTH_DOMAIN"
    vercel env add VITE_FIREBASE_AUTH_DOMAIN preview <<< "$VITE_FIREBASE_AUTH_DOMAIN"
    
    echo "Please provide your Firebase Project ID:"
    read VITE_FIREBASE_PROJECT_ID
    vercel env add VITE_FIREBASE_PROJECT_ID production <<< "$VITE_FIREBASE_PROJECT_ID"
    vercel env add VITE_FIREBASE_PROJECT_ID preview <<< "$VITE_FIREBASE_PROJECT_ID"
fi

echo "✅ Environment variables configured!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "Your YMovies app should now be live on Vercel!"
echo "The following endpoints are available:"
echo "- Main App: https://your-app.vercel.app"
echo "- Recommendations API: https://your-app.vercel.app/api/recommendations"
echo "- Similar Content API: https://your-app.vercel.app/api/similar"
echo ""
echo "🔧 Post-deployment steps:"
echo "1. Test the recommendation endpoints"
echo "2. Verify search functionality"
echo "3. Check that all features work as expected"
echo "4. Monitor the Vercel dashboard for any errors"
