@echo off
REM This script starts the recommendation service on Windows

echo Starting YMovies Recommendation Service...

REM Navigate to the recommendation service directory
cd recommendation_service

REM Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found! Please install Python and make sure it's in your PATH.
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Use the API key from the .env file or prompt for it
set "TMDB_API_KEY="
for /f "tokens=2 delims==" %%a in ('type .env ^| findstr "TMDB_API_KEY"') do (
    set "TMDB_API_KEY=%%a"
)

if "%TMDB_API_KEY%"=="" (
    echo TMDB API Key not found in .env file.
    echo Please enter your TMDB API Key:
    set /p TMDB_API_KEY=
    echo TMDB_API_KEY=%TMDB_API_KEY% > .env
) else (
    echo Found API key: %TMDB_API_KEY%
)

REM Start the service
echo Starting recommendation service on http://localhost:5100
python app.py

REM Deactivate virtual environment when done
deactivate
