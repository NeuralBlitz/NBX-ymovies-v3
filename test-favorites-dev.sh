#!/bin/bash

echo "🎬 YMovies Development Server with Favorites Testing"
echo "=================================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        netstat -tuln 2>/dev/null | grep ":$port " >/dev/null
    elif command -v ss >/dev/null 2>&1; then
        ss -tuln 2>/dev/null | grep ":$port " >/dev/null
    else
        # Fallback: try to connect to the port
        timeout 1 bash -c "echo >/dev/tcp/localhost/$port" >/dev/null 2>&1
    fi
}

# Check if server is already running
if check_port 5000; then
    echo "✅ Server appears to be running on port 5000"
else
    echo "🚀 Starting development server..."
    # Start the server in the background
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if check_port 5000; then
            echo "✅ Server is now running on port 5000"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Server failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
fi

# Wait a bit more for full initialization
sleep 3

echo ""
echo "🧪 Running favorites functionality tests..."
echo "=========================================="

# Run the favorites test
node test-favorites-complete.js

echo ""
echo "🌐 Opening test page in browser..."
echo "================================="

# Try to open the test page in the default browser
TEST_URL="http://localhost:5000/test-favorites-functionality.html"

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$TEST_URL" >/dev/null 2>&1
elif command -v open >/dev/null 2>&1; then
    open "$TEST_URL" >/dev/null 2>&1
elif command -v start >/dev/null 2>&1; then
    start "$TEST_URL" >/dev/null 2>&1
else
    echo "Please manually open: $TEST_URL"
fi

echo ""
echo "📋 Manual Testing Instructions:"
echo "==============================="
echo "1. Open your browser to: http://localhost:5000"
echo "2. Sign in with your test account"
echo "3. Browse movies and click the heart (❤️) icon to add favorites"
echo "4. Go to 'My List' to see your favorites"
echo "5. Return to a previously favorited movie and verify the heart icon is filled"
echo "6. Try refreshing the page and verify favorites persist"
echo ""
echo "🔍 Test the favorites functionality in these scenarios:"
echo "- ✅ Add a movie to favorites"
echo "- ✅ Remove a movie from favorites"
echo "- ✅ Refresh page and verify favorites persist"
echo "- ✅ Sign out and sign back in - verify favorites persist"
echo "- ✅ Check favorites appear in 'My List' page"
echo "- ✅ Verify favorite button shows correct state on movie detail pages"
echo ""
echo "💡 If you find any issues, check the browser console for error messages"
echo "   and look at the server logs above for API call details."

# Keep the script running so server doesn't terminate
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "🔄 Server is running. Press Ctrl+C to stop."
    wait $SERVER_PID
fi
