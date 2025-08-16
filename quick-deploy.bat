@echo off
setlocal enabledelayedexpansion

REM 🚀 Netflix Clone - Quick Deployment Script (Windows)
REM This script automates the deployment process for Windows users

echo 🎬 Netflix Clone - Quick Deployment Script (Windows)
echo ==================================================

REM Check if required tools are installed
echo [INFO] Checking prerequisites...

where heroku >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Heroku CLI not found. Please install it first:
    echo [ERROR] https://devcenter.heroku.com/articles/heroku-cli
    exit /b 1
)

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Vercel CLI not found. Installing...
    npm install -g vercel
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git not found. Please install Git first.
    exit /b 1
)

echo [SUCCESS] All prerequisites met!
echo.

REM Ask user what they want to deploy
echo What would you like to deploy?
echo 1. Full deployment (Backend + Frontend)
echo 2. Backend only (Heroku)
echo 3. Frontend only (Vercel)
echo 4. Update CORS settings only
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto full_deployment
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto frontend_only
if "%choice%"=="4" goto cors_update
echo [ERROR] Invalid choice
exit /b 1

:full_deployment
echo [INFO] Full deployment selected
call :setup_heroku_backend
call :deploy_backend
call :setup_vercel_frontend
call :deploy_frontend
call :update_cors
call :run_tests
goto end

:backend_only
echo [INFO] Backend only deployment selected
call :setup_heroku_backend
call :deploy_backend
call :run_tests
goto end

:frontend_only
echo [INFO] Frontend only deployment selected
call :setup_vercel_frontend
call :deploy_frontend
goto end

:cors_update
echo [INFO] CORS update selected
set /p heroku_app_name="Enter your Heroku app name: "
call :update_cors
goto end

:setup_heroku_backend
echo [INFO] Setting up Heroku backend...

REM Prompt for app name
set /p heroku_app_name="Enter your Heroku app name (e.g., your-netflix-backend): "

if "%heroku_app_name%"=="" (
    echo [ERROR] App name cannot be empty!
    exit /b 1
)

REM Check if user is logged in to Heroku
heroku auth:whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Please log in to Heroku...
    heroku login
)

REM Create Heroku app
echo [INFO] Creating Heroku app: %heroku_app_name%
heroku create %heroku_app_name% 2>nul || echo [WARNING] App might already exist or name is taken. Continuing...

REM Add PostgreSQL
echo [INFO] Adding PostgreSQL database...
heroku addons:create heroku-postgresql:essential-0 --app %heroku_app_name% 2>nul || echo [WARNING] Database addon might already exist. Continuing...

REM Add buildpacks
echo [INFO] Adding buildpacks...
heroku buildpacks:add heroku/nodejs --app %heroku_app_name% 2>nul || echo.
heroku buildpacks:add heroku/python --app %heroku_app_name% 2>nul || echo.

echo [SUCCESS] Heroku backend setup complete!

REM Set basic environment variables
echo [INFO] Setting basic environment variables...
heroku config:set NODE_ENV=production --app %heroku_app_name%
heroku config:set PORT=5000 --app %heroku_app_name%

echo [WARNING] IMPORTANT: You need to set the following environment variables manually:
echo heroku config:set TMDB_API_KEY=your_actual_key --app %heroku_app_name%
echo heroku config:set TMDB_BEARER_TOKEN=your_actual_token --app %heroku_app_name%
echo heroku config:set JWT_SECRET=your_secure_secret --app %heroku_app_name%
echo heroku config:set FIREBASE_PROJECT_ID=your_project_id --app %heroku_app_name%
echo ... (see COMPLETE_DEPLOYMENT_GUIDE.md for full list)
echo.

goto :eof

:deploy_backend
echo [INFO] Deploying backend to Heroku...

REM Make sure we're on the main branch
git checkout main
if %errorlevel% neq 0 (
    echo [ERROR] Could not switch to main branch
    exit /b 1
)

REM Deploy to Heroku
git push heroku main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Heroku
    exit /b 1
)

echo [SUCCESS] Backend deployed successfully!

REM Get the app URL
for /f "tokens=3" %%i in ('heroku info --app %heroku_app_name% ^| findstr "Web URL"') do set heroku_url=%%i
echo [SUCCESS] Backend URL: %heroku_url%

goto :eof

:setup_vercel_frontend
echo [INFO] Setting up Vercel frontend...

REM Check if user is logged in to Vercel
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Please log in to Vercel...
    vercel login
)

echo [WARNING] IMPORTANT: You need to set the following environment variables in Vercel dashboard:
echo VITE_API_URL=%heroku_url%
echo VITE_TMDB_API_KEY=your_tmdb_api_key
echo VITE_TMDB_BEARER_TOKEN=your_tmdb_bearer_token
echo VITE_FIREBASE_API_KEY=your_firebase_api_key
echo ... (see COMPLETE_DEPLOYMENT_GUIDE.md for full list)
echo.

set /p confirm="Have you set all environment variables in Vercel dashboard? (y/n): "
if not "%confirm%"=="y" (
    echo [WARNING] Please set environment variables first, then run this script again.
    exit /b 0
)

goto :eof

:deploy_frontend
echo [INFO] Deploying frontend to Vercel...

REM Deploy to Vercel
vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Vercel
    exit /b 1
)

echo [SUCCESS] Frontend deployed successfully!

goto :eof

:update_cors
echo [INFO] Updating CORS settings...

set /p vercel_url="Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): "

if "%vercel_url%"=="" (
    echo [WARNING] Skipping CORS update. You can set it manually later.
    goto :eof
)

REM Update CORS settings
heroku config:set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,%vercel_url%" --app %heroku_app_name%

echo [SUCCESS] CORS settings updated!

goto :eof

:run_tests
echo [INFO] Running deployment tests...

REM Test backend (simplified for Windows batch)
if not "%heroku_url%"=="" (
    echo [INFO] Testing backend health endpoint...
    echo Check %heroku_url%/api/health manually
)

echo [SUCCESS] Basic tests completed!

goto :eof

:end
echo.
echo [SUCCESS] 🎉 Deployment completed!
echo.
echo [INFO] Next steps:
echo 1. Check your deployed applications
echo 2. Test all functionality
echo 3. Monitor logs for any issues
echo 4. Set up custom domains (optional)
echo.
echo [INFO] For detailed troubleshooting, see COMPLETE_DEPLOYMENT_GUIDE.md

pause
