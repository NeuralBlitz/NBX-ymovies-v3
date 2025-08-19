# 📋 Installation Guide - Detailed Setup Instructions

This comprehensive guide will walk you through setting up the Netflix Clone application from scratch. Whether you're a beginner or experienced developer, this guide has you covered!

## 🎯 Prerequisites

Before we begin, make sure you have these tools installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (v13 or higher) - [Download here](https://www.postgresql.org/download/)

### Accounts You'll Need
- **TMDB Account** (free) - [Sign up here](https://www.themoviedb.org/signup)
- **Firebase Account** (free) - [Sign up here](https://console.firebase.google.com/)

### Recommended Tools
- **VS Code** - Great editor with TypeScript support
- **PostgreSQL GUI** - pgAdmin, DBeaver, or similar
- **API Testing Tool** - Postman, Insomnia, or similar

## 🚀 Step 1: Get the Code

### Clone the Repository
```bash
# Clone the repo (replace with your actual repo URL)
git clone https://github.com/your-username/netflix-clone.git
cd netflix-clone

# Or download and extract the ZIP file
```

### Install Dependencies
```bash
# Install all dependencies
npm install

# This installs both frontend and backend dependencies
# and may take a few minutes
```

## 🔧 Step 2: Database Setup

### Install PostgreSQL

#### On Windows
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember your postgres user password!
4. Add PostgreSQL to your PATH

#### On macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or download the app from postgresapp.com
```

#### On Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (in PostgreSQL shell)
CREATE DATABASE netflix_clone;

# Create user (optional but recommended)
CREATE USER netflix_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE netflix_clone TO netflix_user;

# Exit PostgreSQL shell
\q
```

### Get Connection String
Your database URL will look like:
```
postgresql://username:password@localhost:5432/netflix_clone
```

Example:
```
postgresql://netflix_user:your_secure_password@localhost:5432/netflix_clone
```

## 🔑 Step 3: Get API Keys

### TMDB API Key

1. **Create Account**
   - Go to [TMDB](https://www.themoviedb.org/)
   - Click "Join TMDB" and create account
   - Verify your email

2. **Request API Key**
   - Go to Settings → API
   - Click "Create" → "Developer"
   - Fill out the form:
     - **Application Name**: "Netflix Clone (Personal Project)"
     - **Application URL**: "http://localhost:3000"
     - **Application Summary**: "Learning project to build Netflix-like app"
   - Accept terms and submit

3. **Get Your Key**
   - Copy your "API Read Access Token" (v4 auth)
   - This is what you'll use in your `.env` file

### Firebase Setup

1. **Create Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Project name: "YMovies"
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - In your project, go to "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"

3. **Get Service Account**
   - Go to Project Settings (gear icon)
   - Go to "Service accounts" tab
   - Click "Generate new private key"
   - Download the JSON file
   - Keep this file secure!

4. **Extract Credentials**
   From the downloaded JSON file, you'll need:
   - `project_id`
   - `private_key`
   - `client_email`

## ⚙️ Step 4: Environment Configuration

### Create Environment File
```bash
# Copy the example file
cp .env.example .env
```

### Fill in Your Environment Variables
Edit `.env` with your credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://netflix_user:your_password@localhost:5432/netflix_clone

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Application Configuration
PORT=3000
NODE_ENV=development

# Optional: Recommendation Engine Configuration
RECOMMENDATION_CACHE_TTL=3600
RECOMMENDATION_BATCH_SIZE=50
```

### Environment Variable Details

#### DATABASE_URL
- Format: `postgresql://user:password@host:port/database`
- Make sure PostgreSQL is running
- Test connection: `psql "your_database_url"`

#### TMDB_API_KEY
- This is your API Read Access Token
- Starts with "eyJhbGciOiJIUzI1NiJ9..."
- Test it: `curl -H "Authorization: Bearer your_key" "https://api.themoviedb.org/3/movie/popular"`

#### Firebase Keys
- **PROJECT_ID**: Found in Firebase project settings
- **PRIVATE_KEY**: From the service account JSON (keep the quotes and newlines!)
- **CLIENT_EMAIL**: Service account email from the JSON

## 🗄️ Step 5: Database Migration

### Run Migrations
```bash
# Create tables and initial schema
npm run db:migrate

# You should see output like:
# ✅ Migration 001_initial_schema.sql completed
# ✅ Migration 002_user_preferences.sql completed
# ✅ All migrations completed successfully
```

### Verify Database Setup
```bash
# Check if tables were created
npm run db:check

# Or manually check in PostgreSQL
psql "your_database_url" -c "\dt"
```

### Optional: Seed Sample Data
```bash
# Add some sample data for testing
npm run db:seed

# This adds:
# - Sample user preferences
# - Some watch history entries
# - Test watchlist items
```

## 🚀 Step 6: Start the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# This starts:
# - Frontend dev server on http://localhost:5173
# - Backend API server on http://localhost:3000
```

### Individual Services
```bash
# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build
```

## ✅ Step 7: Verify Everything Works

### Test Database Connection
```bash
# Check database connectivity
npm run test:db
```

### Test API Endpoints
```bash
# Test TMDB integration
npm run test:tmdb

# Test recommendation engine
npm run test:recommendations
```

### Test Frontend
1. Open http://localhost:5173
2. You should see the Netflix Clone homepage
3. Try searching for movies
4. Create an account and test login

### Test Full Flow
1. **Sign up** for a new account
2. **Browse movies** and add some to watchlist
3. **"Watch" a few movies** (simulate viewing)
4. **Rate movies** to improve recommendations
5. **Check recommendations** - you should see personalized categories

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Error: "database does not exist"
# Solution: Create the database first
psql -U postgres -c "CREATE DATABASE netflix_clone;"

# Error: "password authentication failed"
# Solution: Check your username/password in DATABASE_URL

# Error: "could not connect to server"
# Solution: Make sure PostgreSQL is running
# Windows: Check Services
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

#### TMDB API Errors
```bash
# Error: "Invalid API key"
# Solution: Double-check your TMDB_API_KEY in .env

# Error: "Request count exceeded"
# Solution: You hit the rate limit, wait a bit

# Test your API key:
curl -H "Authorization: Bearer YOUR_KEY" \
     "https://api.themoviedb.org/3/movie/popular"
```

#### Firebase Authentication Errors
```bash
# Error: "Firebase project not found"
# Solution: Check FIREBASE_PROJECT_ID

# Error: "Private key parsing error"
# Solution: Make sure private key has proper quotes and newlines

# Error: "Service account permissions"
# Solution: Re-download service account key from Firebase
```

#### Port Conflicts
```bash
# Error: "Port 3000 already in use"
# Solution: Change PORT in .env or kill the process
# Find process: lsof -i :3000
# Kill process: kill -9 PID

# Or use different port
echo "PORT=3001" >> .env
```

### Performance Issues

#### Slow Database Queries
```bash
# Add database indexes for better performance
npm run db:optimize

# Check query performance
npm run db:analyze
```

#### Slow API Responses
```bash
# Enable API response caching
echo "ENABLE_CACHING=true" >> .env

# Check API response times
npm run test:performance
```

### Development Tips

#### Database Management
```bash
# Reset database (careful - deletes all data!)
npm run db:reset

# Create new migration
npm run db:create-migration "add_new_feature"

# Backup database
npm run db:backup

# Restore database
npm run db:restore backup_file.sql
```

#### Debugging
```bash
# Enable debug logging
echo "LOG_LEVEL=debug" >> .env

# Check logs
npm run logs

# Test specific component
npm run test:component recommendations
```

## 🚀 Next Steps

Once everything is working:

1. **Explore the Code** - Check out the [Architecture Guide](./ARCHITECTURE.md)
2. **Customize Features** - Modify recommendation algorithms
3. **Add Your Touch** - Change UI, add features, etc.
4. **Deploy It** - Follow the [Deployment Guide](./DEPLOYMENT.md)

## 🆘 Getting Help

If you're still having issues:

1. **Check the Logs** - Look for error messages in terminal
2. **Verify Environment** - Double-check all .env variables
3. **Test Components** - Use the test scripts to isolate issues
4. **Check Dependencies** - Make sure all npm packages installed correctly
5. **Read Error Messages** - They often contain helpful information

### Useful Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Test database connection
psql "your_database_url" -c "SELECT version();"

# Check if ports are available
npx check-port 3000 5173
```

---

Congratulations! 🎉 You now have a fully functional Netflix-style movie recommendation system running locally. Time to start exploring and customizing!
