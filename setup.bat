@echo off
REM YMovies - First-time Setup Script (Windows)
REM This script helps new developers get the project running quickly

echo 🎬 YMovies - First Time Setup
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available.
    pause
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Check if .env.local exists
echo.
echo 🔧 Setting up environment variables...

if not exist ".env.local" (
    REM Copy example environment file
    if exist ".env.example" (
        copy .env.example .env.local >nul
        echo ✅ Created .env.local from .env.example
        echo.
        echo ⚠️  IMPORTANT: Please edit .env.local and add your API keys:
        echo    1. Get TMDB API key from: https://www.themoviedb.org/settings/api
        echo    2. Set up Firebase project at: https://firebase.google.com/
        echo    3. Add your database URL (PostgreSQL)
        echo.
        echo 📝 Required environment variables:
        echo    - TMDB_API_KEY
        echo    - FIREBASE_PROJECT_ID
        echo    - DATABASE_URL
        echo    - JWT_SECRET
    ) else (
        echo ⚠️  .env.example not found. Creating basic .env.local...
        (
        echo # YMovies Environment Variables
        echo # Please fill in your actual values
        echo.
        echo # TMDB API (required)
        echo # Get from: https://www.themoviedb.org/settings/api
        echo TMDB_API_KEY=your_tmdb_api_key_here
        echo VITE_TMDB_API_KEY=your_tmdb_api_key_here
        echo.
        echo # Firebase Configuration (required)
        echo # Get from: https://firebase.google.com/
        echo FIREBASE_PROJECT_ID=your_firebase_project_id
        echo FIREBASE_API_KEY=your_firebase_api_key
        echo FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        echo FIREBASE_STORAGE_BUCKET=your_project.appspot.com
        echo FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        echo FIREBASE_APP_ID=your_app_id
        echo.
        echo # Database (required for full functionality)
        echo DATABASE_URL=postgresql://username:password@localhost:5432/netflix_clone
        echo.
        echo # JWT Secret (required)
        echo JWT_SECRET=your_super_secure_jwt_secret_here
        echo.
        echo # Development Configuration
        echo PORT=5000
        echo NODE_ENV=development
        ) > .env.local
        echo ✅ Created basic .env.local file
    )
) else (
    echo ✅ .env.local already exists
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 🚀 Next Steps:
echo 1. Edit .env.local and add your API keys and database URL
echo 2. Start the development server:
echo    npm run dev
echo.
echo 📚 Documentation:
echo    - Quick Start: docs\QUICK_START.md
echo    - Installation: docs\setup\INSTALLATION.md
echo    - Troubleshooting: docs\TROUBLESHOOTING.md
echo.
echo 🌐 Get your API keys:
echo    - TMDB API: https://www.themoviedb.org/settings/api
echo    - Firebase: https://firebase.google.com/
echo.
echo ❓ Need help? Check docs\FAQ.md or create an issue on GitHub
echo.
pause
