@echo off
echo 🎬 YMovies Development Server with Favorites Testing
echo ==================================================

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

:: Check if server is already running by trying to connect
echo 🔍 Checking if server is already running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server appears to be running on port 5000
    goto :test_favorites
)

echo 🚀 Starting development server...
start /b npm run dev
timeout /t 5 /nobreak >nul

:: Wait for server to start
echo ⏳ Waiting for server to start...
for /l %%i in (1,1,30) do (
    curl -s http://localhost:5000/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Server is now running on port 5000
        goto :test_favorites
    )
    timeout /t 1 /nobreak >nul
)

echo ❌ Server failed to start within 30 seconds
pause
exit /b 1

:test_favorites
:: Wait a bit more for full initialization
timeout /t 3 /nobreak >nul

echo.
echo 🧪 Running favorites functionality tests...
echo ==========================================
node test-favorites-complete.js

echo.
echo 🌐 Opening test page in browser...
echo =================================
start http://localhost:5000/test-favorites-functionality.html

echo.
echo 📋 Manual Testing Instructions:
echo ===============================
echo 1. Open your browser to: http://localhost:5000
echo 2. Sign in with your test account
echo 3. Browse movies and click the heart (❤️) icon to add favorites
echo 4. Go to 'My List' to see your favorites
echo 5. Return to a previously favorited movie and verify the heart icon is filled
echo 6. Try refreshing the page and verify favorites persist
echo.
echo 🔍 Test the favorites functionality in these scenarios:
echo - ✅ Add a movie to favorites
echo - ✅ Remove a movie from favorites
echo - ✅ Refresh page and verify favorites persist
echo - ✅ Sign out and sign back in - verify favorites persist
echo - ✅ Check favorites appear in 'My List' page
echo - ✅ Verify favorite button shows correct state on movie detail pages
echo.
echo 💡 If you find any issues, check the browser console for error messages
echo    and look at the server logs above for API call details.
echo.
echo 🔄 Server is running. Press any key to stop.
pause >nul
