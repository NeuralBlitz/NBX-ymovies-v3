#!/bin/bash

# YMovies - Quick Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "YMovies - Quick Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not found. Please install it first:"
        print_error "https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git first."
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Function to setup Heroku backend
setup_heroku_backend() {
    print_status "Setting up Heroku backend..."
    
    # Prompt for app name
    read -p "Enter your Heroku app name (e.g., your-netflix-backend): " HEROKU_APP_NAME
    
    if [ -z "$HEROKU_APP_NAME" ]; then
        print_error "App name cannot be empty!"
        exit 1
    fi
    
    # Check if user is logged in to Heroku
    if ! heroku auth:whoami &> /dev/null; then
        print_warning "Please log in to Heroku..."
        heroku login
    fi
    
    # Create Heroku app
    print_status "Creating Heroku app: $HEROKU_APP_NAME"
    heroku create $HEROKU_APP_NAME || {
        print_warning "App might already exist or name is taken. Continuing..."
    }
    
    # Add PostgreSQL
    print_status "Adding PostgreSQL database..."
    heroku addons:create heroku-postgresql:essential-0 --app $HEROKU_APP_NAME || {
        print_warning "Database addon might already exist. Continuing..."
    }
    
    # Add buildpacks
    print_status "Adding buildpacks..."
    heroku buildpacks:add heroku/nodejs --app $HEROKU_APP_NAME || true
    heroku buildpacks:add heroku/python --app $HEROKU_APP_NAME || true
    
    print_success "Heroku backend setup complete!"
    
    # Set basic environment variables
    print_status "Setting basic environment variables..."
    heroku config:set NODE_ENV=production --app $HEROKU_APP_NAME
    heroku config:set PORT=5000 --app $HEROKU_APP_NAME
    
    print_warning "IMPORTANT: You need to set the following environment variables manually:"
    echo "heroku config:set TMDB_API_KEY=your_actual_key --app $HEROKU_APP_NAME"
    echo "heroku config:set TMDB_BEARER_TOKEN=your_actual_token --app $HEROKU_APP_NAME"
    echo "heroku config:set JWT_SECRET=your_secure_secret --app $HEROKU_APP_NAME"
    echo "heroku config:set FIREBASE_PROJECT_ID=your_project_id --app $HEROKU_APP_NAME"
    echo "... (see COMPLETE_DEPLOYMENT_GUIDE.md for full list)"
    echo ""
    
    export HEROKU_APP_NAME
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to Heroku..."
    
    # Make sure we're on the main branch
    git checkout main || {
        print_error "Could not switch to main branch"
        exit 1
    }
    
    # Deploy to Heroku
    git push heroku main || {
        print_error "Failed to deploy to Heroku"
        exit 1
    }
    
    print_success "Backend deployed successfully!"
    
    # Get the app URL
    HEROKU_URL=$(heroku info --app $HEROKU_APP_NAME | grep "Web URL" | awk '{print $3}')
    print_success "Backend URL: $HEROKU_URL"
    
    export HEROKU_URL
}

# Function to setup Vercel frontend
setup_vercel_frontend() {
    print_status "Setting up Vercel frontend..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel..."
        vercel login
    fi
    
    print_warning "IMPORTANT: You need to set the following environment variables in Vercel dashboard:"
    echo "VITE_API_URL=$HEROKU_URL"
    echo "VITE_TMDB_API_KEY=your_tmdb_api_key"
    echo "VITE_TMDB_BEARER_TOKEN=your_tmdb_bearer_token"
    echo "VITE_FIREBASE_API_KEY=your_firebase_api_key"
    echo "... (see COMPLETE_DEPLOYMENT_GUIDE.md for full list)"
    echo ""
    
    read -p "Have you set all environment variables in Vercel dashboard? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        print_warning "Please set environment variables first, then run this script again."
        exit 0
    fi
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Deploy to Vercel
    vercel --prod || {
        print_error "Failed to deploy to Vercel"
        exit 1
    }
    
    print_success "Frontend deployed successfully!"
}

# Function to update CORS settings
update_cors() {
    print_status "Updating CORS settings..."
    
    # Get Vercel URL
    read -p "Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL
    
    if [ -z "$VERCEL_URL" ]; then
        print_warning "Skipping CORS update. You can set it manually later."
        return
    fi
    
    # Update CORS settings
    heroku config:set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,$VERCEL_URL" --app $HEROKU_APP_NAME
    
    print_success "CORS settings updated!"
}

# Function to run tests
run_tests() {
    print_status "Running deployment tests..."
    
    # Test backend
    if [ ! -z "$HEROKU_URL" ]; then
        print_status "Testing backend health endpoint..."
        curl -f "$HEROKU_URL/api/health" || {
            print_warning "Backend health check failed. Check heroku logs --tail --app $HEROKU_APP_NAME"
        }
    fi
    
    print_success "Basic tests completed!"
}

# Main deployment flow
main() {
    echo ""
    print_status "Starting YMovies deployment..."
    echo ""
    
    # Ask user what they want to do
    echo "What would you like to deploy?"
    echo "1. Full deployment (Backend + Frontend)"
    echo "2. Backend only (Heroku)"
    echo "3. Frontend only (Vercel)"
    echo "4. Update CORS settings only"
    read -p "Enter your choice (1-4): " CHOICE
    
    case $CHOICE in
        1)
            print_status "Full deployment selected"
            check_prerequisites
            setup_heroku_backend
            deploy_backend
            setup_vercel_frontend
            deploy_frontend
            update_cors
            run_tests
            ;;
        2)
            print_status "Backend only deployment selected"
            check_prerequisites
            setup_heroku_backend
            deploy_backend
            run_tests
            ;;
        3)
            print_status "Frontend only deployment selected"
            check_prerequisites
            setup_vercel_frontend
            deploy_frontend
            ;;
        4)
            print_status "CORS update selected"
            read -p "Enter your Heroku app name: " HEROKU_APP_NAME
            update_cors
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Check your deployed applications"
    echo "2. Test all functionality"
    echo "3. Monitor logs for any issues"
    echo "4. Set up custom domains (optional)"
    echo ""
    print_status "For detailed troubleshooting, see COMPLETE_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
