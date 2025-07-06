@echo off
REM YMovies Netflix Clone - Vercel Deployment Script (Windows)
echo 🎬 YMovies Netflix Clone - Vercel Deployment Setup
echo ==================================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Login to Vercel
echo 🔐 Checking Vercel authentication...
vercel whoami || vercel login

REM Set environment variables
echo 🔧 Setting up environment variables...

REM TMDB API Key
set /p TMDB_API_KEY="Please provide your TMDB API Key: "
echo %TMDB_API_KEY% | vercel env add TMDB_API_KEY production
echo %TMDB_API_KEY% | vercel env add TMDB_API_KEY preview

REM Database URL (optional)
set /p HAS_DB="Do you have a Database URL? (y/n): "
if /i "%HAS_DB%"=="y" (
    set /p DATABASE_URL="Please provide your Database URL: "
    echo %DATABASE_URL% | vercel env add DATABASE_URL production
    echo %DATABASE_URL% | vercel env add DATABASE_URL preview
)

REM Firebase Config (optional)
set /p HAS_FIREBASE="Do you have Firebase config? (y/n): "
if /i "%HAS_FIREBASE%"=="y" (
    set /p VITE_FIREBASE_API_KEY="Please provide your Firebase API Key: "
    echo %VITE_FIREBASE_API_KEY% | vercel env add VITE_FIREBASE_API_KEY production
    echo %VITE_FIREBASE_API_KEY% | vercel env add VITE_FIREBASE_API_KEY preview
    
    set /p VITE_FIREBASE_AUTH_DOMAIN="Please provide your Firebase Auth Domain: "
    echo %VITE_FIREBASE_AUTH_DOMAIN% | vercel env add VITE_FIREBASE_AUTH_DOMAIN production
    echo %VITE_FIREBASE_AUTH_DOMAIN% | vercel env add VITE_FIREBASE_AUTH_DOMAIN preview
    
    set /p VITE_FIREBASE_PROJECT_ID="Please provide your Firebase Project ID: "
    echo %VITE_FIREBASE_PROJECT_ID% | vercel env add VITE_FIREBASE_PROJECT_ID production
    echo %VITE_FIREBASE_PROJECT_ID% | vercel env add VITE_FIREBASE_PROJECT_ID preview
)

echo ✅ Environment variables configured!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo 🎉 Deployment complete!
echo.
echo Your YMovies app should now be live on Vercel!
echo The following endpoints are available:
echo - Main App: https://your-app.vercel.app
echo - Recommendations API: https://your-app.vercel.app/api/recommendations
echo - Similar Content API: https://your-app.vercel.app/api/similar
echo.
echo 🔧 Post-deployment steps:
echo 1. Test the recommendation endpoints
echo 2. Verify search functionality
echo 3. Check that all features work as expected
echo 4. Monitor the Vercel dashboard for any errors

pause
