#!/bin/bash

# YMovies - Secure Heroku Backend Deployment Script
echo "🚀 Deploying YMovies Backend to Heroku"
echo "====================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login check
echo "🔐 Checking Heroku authentication..."
if ! heroku auth:whoami &> /dev/null; then
    echo "🔑 Please login to Heroku:"
    heroku login
fi

# Get app name from user
read -p "📝 Enter Heroku app name for BACKEND: " HEROKU_APP_NAME

if [ -z "$HEROKU_APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

echo "🏗️  Creating Heroku backend app: $HEROKU_APP_NAME"

# Create Heroku app
heroku create $HEROKU_APP_NAME

# Add PostgreSQL database
echo "🗄️  Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini --app $HEROKU_APP_NAME

# Add buildpacks for Node.js and Python
echo "📦 Adding buildpacks..."
heroku buildpacks:add heroku/nodejs --app $HEROKU_APP_NAME
heroku buildpacks:add heroku/python --app $HEROKU_APP_NAME

echo ""
echo "⚠️  IMPORTANT: You need to set environment variables manually"
echo "📋 Go to: https://dashboard.heroku.com/apps/$HEROKU_APP_NAME/settings"
echo ""
echo "Required environment variables (use .env.heroku.template as reference):"
echo "  - DATABASE_URL (auto-provided by Postgres addon)"
echo "  - TMDB_API_KEY"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_AUTH_DOMAIN"
echo "  - FIREBASE_API_KEY"
echo "  - FIREBASE_ADMIN_CREDENTIALS"
echo "  - NODE_ENV=production"
echo "  - USE_DEMO_SERVER=false"
echo "  - ALLOWED_ORIGINS=https://your-frontend.vercel.app"
echo ""

# Add git remote if it doesn't exist
if ! git remote | grep -q heroku; then
    heroku git:remote -a $HEROKU_APP_NAME
fi

echo "🚀 Ready to deploy! After setting environment variables, run:"
echo "   git push heroku main"
echo ""
echo "🌍 Your backend will be available at: https://$HEROKU_APP_NAME.herokuapp.com"
