#!/bin/bash

# 🎬 Netflix Clone - First-time Setup Script
# This script helps new developers get the project running quickly

echo "🎬 Netflix Clone - First Time Setup"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check if .env.local exists
echo ""
echo "🔧 Setting up environment variables..."

if [ ! -f ".env.local" ]; then
    # Copy example environment file
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env.local and add your API keys:"
        echo "   1. Get TMDB API key from: https://www.themoviedb.org/settings/api"
        echo "   2. Set up Firebase project at: https://firebase.google.com/"
        echo "   3. Add your database URL (PostgreSQL)"
        echo ""
        echo "📝 Required environment variables:"
        echo "   - TMDB_API_KEY"
        echo "   - FIREBASE_PROJECT_ID"
        echo "   - DATABASE_URL"
        echo "   - JWT_SECRET"
    else
        echo "⚠️  .env.example not found. Creating basic .env.local..."
        cat > .env.local << 'EOF'
# Netflix Clone Environment Variables
# Please fill in your actual values

# TMDB API (required)
# Get from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Firebase Configuration (required)
# Get from: https://firebase.google.com/
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Database (required for full functionality)
DATABASE_URL=postgresql://username:password@localhost:5432/netflix_clone

# JWT Secret (required)
JWT_SECRET=your_super_secure_jwt_secret_here

# Development Configuration
PORT=5000
NODE_ENV=development
EOF
        echo "✅ Created basic .env.local file"
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 Next Steps:"
echo "1. Edit .env.local and add your API keys and database URL"
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: docs/QUICK_START.md"
echo "   - Installation: docs/setup/INSTALLATION.md"
echo "   - Troubleshooting: docs/TROUBLESHOOTING.md"
echo ""
echo "🌐 Get your API keys:"
echo "   - TMDB API: https://www.themoviedb.org/settings/api"
echo "   - Firebase: https://firebase.google.com/"
echo ""
echo "❓ Need help? Check docs/FAQ.md or create an issue on GitHub"
