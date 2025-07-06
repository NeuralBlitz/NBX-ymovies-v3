@echo off
REM Automatic Vercel Environment Setup Script (Windows)
echo 🚀 Setting up Vercel environment variables from .env.production
echo ==============================================================

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ .env.production file not found!
    echo Please create .env.production with your environment variables.
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Login to Vercel
echo 🔐 Checking Vercel authentication...
vercel whoami || vercel login

echo 🔧 Setting environment variables...

REM Set each environment variable
echo Setting DATABASE_URL...
echo postgresql://netflix-clone_owner:npg_NihPGdF2sLj4@ep-blue-thunder-a4mntkkz-pooler.us-east-1.aws.neon.tech/netflix-clone?sslmode=require | vercel env add DATABASE_URL production
echo postgresql://netflix-clone_owner:npg_NihPGdF2sLj4@ep-blue-thunder-a4mntkkz-pooler.us-east-1.aws.neon.tech/netflix-clone?sslmode=require | vercel env add DATABASE_URL preview

echo Setting TMDB_API_KEY...
echo e28104677eeb4d67bd476af5d0ed9ad6 | vercel env add TMDB_API_KEY production
echo e28104677eeb4d67bd476af5d0ed9ad6 | vercel env add TMDB_API_KEY preview

echo Setting VITE_TMDB_API_KEY...
echo eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI | vercel env add VITE_TMDB_API_KEY production
echo eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI | vercel env add VITE_TMDB_API_KEY preview

echo Setting VITE_TMDB_API_KEY_V3...
echo e28104677eeb4d67bd476af5d0ed9ad6 | vercel env add VITE_TMDB_API_KEY_V3 production
echo e28104677eeb4d67bd476af5d0ed9ad6 | vercel env add VITE_TMDB_API_KEY_V3 preview

echo Setting Firebase variables...
echo AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview

echo ymovies-e4cb4.firebaseapp.com | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo ymovies-e4cb4.firebaseapp.com | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview

echo ymovies-e4cb4 | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo ymovies-e4cb4 | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview

echo ymovies-e4cb4.firebasestorage.app | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo ymovies-e4cb4.firebasestorage.app | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET preview

echo 658873153268 | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo 658873153268 | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID preview

echo 1:658873153268:web:170cb70584bcab36bb10a1 | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo 1:658873153268:web:170cb70584bcab36bb10a1 | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID preview

echo ✅ Environment variables set successfully!
echo.
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo 🎉 Deployment complete!
echo Your YMovies app should now be live with all environment variables configured!
echo.
echo Next steps:
echo 1. Test your app at the provided Vercel URL
echo 2. Test recommendations: https://your-app.vercel.app/api/recommendations
echo 3. Test similar content: https://your-app.vercel.app/api/similar

pause
