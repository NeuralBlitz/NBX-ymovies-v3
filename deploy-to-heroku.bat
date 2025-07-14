@echo off
REM YMovies - Heroku Full Deployment Script (Windows)
echo 🚀 Deploying YMovies Netflix Clone to Heroku
echo =============================================

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

REM Get app name from user or use default
set /p APP_NAME="📝 Enter Heroku app name (default: ymovies-netflixclone): "
if "%APP_NAME%"=="" set APP_NAME=ymovies-netflixclone

echo 🏗️  Creating Heroku app: %APP_NAME%

REM Create Heroku app
heroku create %APP_NAME%

REM Add PostgreSQL database
echo 🗄️  Adding PostgreSQL database...
heroku addons:create heroku-postgresql:mini --app %APP_NAME%

REM Add buildpacks
echo 📦 Adding buildpacks...
heroku buildpacks:add heroku/nodejs --app %APP_NAME%
heroku buildpacks:add heroku/python --app %APP_NAME%

REM Set environment variables
echo 🔧 Setting environment variables...
heroku config:set NODE_ENV=production --app %APP_NAME%
heroku config:set USE_DEMO_SERVER=false --app %APP_NAME%
heroku config:set VITE_USE_DEMO_SERVER=false --app %APP_NAME%
heroku config:set TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6 --app %APP_NAME%
heroku config:set VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI --app %APP_NAME%

REM Add git remote
heroku git:remote -a %APP_NAME%

REM Deploy
echo 🚀 Deploying to Heroku...
git add .
git commit -m "Configure for Heroku deployment"
git push heroku main

echo.
echo ✅ Deployment completed!
echo 🌍 Your app is available at: https://%APP_NAME%.herokuapp.com
echo.
echo 🎉 Your Netflix Clone is now live on Heroku!
pause
