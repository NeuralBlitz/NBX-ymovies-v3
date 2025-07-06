@echo off
REM YMovies Deployment Test Script (Windows)
echo 🧪 Testing YMovies Deployment
echo =============================

REM Check if URL is provided
if "%1"=="" (
    echo Usage: test-deployment.bat ^<your-vercel-url^>
    echo Example: test-deployment.bat https://your-app.vercel.app
    exit /b 1
)

set BASE_URL=%1

echo Testing deployment at: %BASE_URL%
echo.

REM Test 1: Main app
echo 1. Testing main app...
curl -s -o nul -w "%%{http_code}" "%BASE_URL%" > temp_response.txt
set /p response=<temp_response.txt
if "%response%"=="200" (
    echo ✅ Main app is accessible
) else (
    echo ❌ Main app failed ^(HTTP %response%^)
)

REM Test 2: Recommendations API (GET)
echo 2. Testing recommendations API ^(GET^)...
curl -s -o nul -w "%%{http_code}" "%BASE_URL%/api/recommendations?type=movies&user_id=test" > temp_response.txt
set /p response=<temp_response.txt
if "%response%"=="200" (
    echo ✅ Recommendations API ^(GET^) is working
) else (
    echo ❌ Recommendations API ^(GET^) failed ^(HTTP %response%^)
)

REM Test 3: Recommendations API (POST)
echo 3. Testing recommendations API ^(POST^)...
curl -s -o nul -w "%%{http_code}" -X POST "%BASE_URL%/api/recommendations" -H "Content-Type: application/json" -d "{\"user_id\": \"test\", \"type\": \"movies\"}" > temp_response.txt
set /p response=<temp_response.txt
if "%response%"=="200" (
    echo ✅ Recommendations API ^(POST^) is working
) else (
    echo ❌ Recommendations API ^(POST^) failed ^(HTTP %response%^)
)

REM Test 4: Similar content API
echo 4. Testing similar content API...
curl -s -o nul -w "%%{http_code}" "%BASE_URL%/api/similar?id=550&type=movie" > temp_response.txt
set /p response=<temp_response.txt
if "%response%"=="200" (
    echo ✅ Similar content API is working
) else (
    echo ❌ Similar content API failed ^(HTTP %response%^)
)

REM Clean up temp file
del temp_response.txt

echo.
echo 🏁 Test Summary:
echo - Main App: %BASE_URL%
echo - Recommendations API: %BASE_URL%/api/recommendations
echo - Similar Content API: %BASE_URL%/api/similar
echo.
echo If all tests passed, your YMovies app is successfully deployed! 🎉

pause
