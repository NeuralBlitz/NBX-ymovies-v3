@echo off
REM YMovies - Secure Heroku Backend Deployment Script (Windows)
echo 🚀 Deploying YMovies Backend to Heroku
echo =====================================

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI not found. Please install it first:
    echo    https://devcenter.heroku.com/articles/heroku-cli
    exit /b 1
)

REM Login check
echo 🔐 Checking Heroku authentication...
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Please login to Heroku:
    heroku login
)

REM Get app name from user
set /p HEROKU_APP_NAME="📝 Enter Heroku app name for BACKEND: "

if "%HEROKU_APP_NAME%"=="" (
    echo ❌ App name is required
    exit /b 1
)

echo 🏗️  Creating Heroku backend app: %HEROKU_APP_NAME%

REM Create Heroku app
heroku create %HEROKU_APP_NAME%

REM Add PostgreSQL database
echo 🗄️  Adding PostgreSQL database...
heroku addons:create heroku-postgresql:mini --app %HEROKU_APP_NAME%

REM Add buildpacks
echo 📦 Adding buildpacks...
heroku buildpacks:add heroku/nodejs --app %HEROKU_APP_NAME%
heroku buildpacks:add heroku/python --app %HEROKU_APP_NAME%

echo.
echo ⚠️  IMPORTANT: You need to set environment variables manually
echo 📋 Go to: https://dashboard.heroku.com/apps/%HEROKU_APP_NAME%/settings
echo.
echo Required environment variables (use .env.heroku.template as reference):
echo   - DATABASE_URL (auto-provided by Postgres addon)
echo   - TMDB_API_KEY
echo   - FIREBASE_PROJECT_ID
echo   - FIREBASE_AUTH_DOMAIN
echo   - FIREBASE_API_KEY
echo   - FIREBASE_ADMIN_CREDENTIALS
echo   - NODE_ENV=production
echo   - USE_DEMO_SERVER=false
echo   - ALLOWED_ORIGINS=https://your-frontend.vercel.app
echo.

REM Add git remote
heroku git:remote -a %HEROKU_APP_NAME%

echo 🚀 Ready to deploy! After setting environment variables, run:
echo    git push heroku main
echo.
echo 🌍 Your backend will be available at: https://%HEROKU_APP_NAME%.herokuapp.com
pause
