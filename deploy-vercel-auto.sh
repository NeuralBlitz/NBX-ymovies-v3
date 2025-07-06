#!/bin/bash

# Automatic Vercel Environment Setup Script
echo "🚀 Setting up Vercel environment variables from .env.production"
echo "=============================================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your environment variables."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Read and set environment variables from .env.production
echo "🔧 Setting environment variables..."

while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ $line =~ ^#.*$ ]] || [[ -z "$line" ]]; then
        continue
    fi
    
    # Extract key=value
    if [[ $line =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        echo "Setting $key..."
        echo "$value" | vercel env add "$key" production
        echo "$value" | vercel env add "$key" preview
    fi
done < .env.production

echo "✅ Environment variables set successfully!"
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Your YMovies app should now be live with all environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Test your app at the provided Vercel URL"
echo "2. Test recommendations: https://your-app.vercel.app/api/recommendations"
echo "3. Test similar content: https://your-app.vercel.app/api/similar"
