#!/bin/bash
# This script starts the recommendation service

echo "Starting YMovies Recommendation Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install it before running this service."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install it before running this service."
    exit 1
fi

# Navigate to the recommendation service directory
cd recommendation_service

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Set TMDB API Key from environment variable or ask for it
if [ -z "$TMDB_API_KEY" ]; then
    echo "TMDB API Key not found in environment variables."
    echo "Please enter your TMDB API Key:"
    read -r TMDB_API_KEY
    export TMDB_API_KEY=$TMDB_API_KEY
fi

# Start the service
echo "Starting recommendation service on http://localhost:5100"
python app.py

# Deactivate virtual environment when done
deactivate
