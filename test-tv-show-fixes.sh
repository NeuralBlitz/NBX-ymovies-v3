#!/bin/bash

echo "🧪 Testing TV Show Favorites and Watchlist Functionality"
echo "======================================================="

# Check if the server is running
echo "📡 Checking server connection..."

if curl -f -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start the development server first:"
    echo "   npm run dev"
    exit 1
fi

echo ""
echo "🔧 Testing TV show API endpoints..."

# Test TV show details endpoint
echo "📺 Testing TV show details (Breaking Bad - ID: 1)..."
RESPONSE=$(curl -s http://localhost:5000/api/tv/1)

if echo "$RESPONSE" | jq -e '.name' > /dev/null 2>&1; then
    TV_NAME=$(echo "$RESPONSE" | jq -r '.name')
    echo "✅ TV show details working: $TV_NAME"
else
    echo "❌ TV show details endpoint failed"
    echo "Response: $RESPONSE"
fi

# Test TV show videos endpoint
echo "🎬 Testing TV show videos endpoint..."
VIDEOS_RESPONSE=$(curl -s http://localhost:5000/api/tv/1/videos)
if echo "$VIDEOS_RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    echo "✅ TV show videos endpoint working"
else
    echo "❌ TV show videos endpoint failed"
fi

# Test TV show similar endpoint
echo "🔗 Testing TV show similar endpoint..."
SIMILAR_RESPONSE=$(curl -s http://localhost:5000/api/tv/1/similar)
if echo "$SIMILAR_RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    echo "✅ TV show similar endpoint working"
else
    echo "❌ TV show similar endpoint failed"
fi

echo ""
echo "🎯 Testing Instructions:"
echo "========================"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to TV Shows section"
echo "3. Click on any TV show to view details"
echo "4. Verify that:"
echo "   - ✅ No play button appears in the background"
echo "   - ✅ 'Add to My List' button works"
echo "   - ✅ 'Favorite' button works"
echo "   - ✅ 'Play Trailer' button opens trailers (if available)"
echo "   - ✅ TV shows appear in 'My List' page after adding"
echo ""
echo "🧪 Manual Test Scenarios:"
echo "========================="
echo "A. Test Add to Favorites:"
echo "   1. Go to any TV show detail page"
echo "   2. Click the 'Favorite' button"
echo "   3. Button should turn red and show 'Favorited'"
echo "   4. Go to My List page and check Favorites tab"
echo ""
echo "B. Test Add to Watchlist:"
echo "   1. Go to any TV show detail page"
echo "   2. Click 'Add to My List' button"
echo "   3. Button should show 'In My List' with checkmark"
echo "   4. Go to My List page and check Watchlist tab"
echo ""
echo "C. Test Background (No Play Button):"
echo "   1. Go to any TV show detail page"
echo "   2. Verify there's NO large play button in the center of the backdrop"
echo "   3. Only the 'Play Trailer' button should exist in the info section"
echo ""
echo "📝 If you find any issues:"
echo "- Check browser console for errors"
echo "- Ensure you're logged in for list/favorites functionality"
echo "- Check that TV shows appear correctly in My List page"
