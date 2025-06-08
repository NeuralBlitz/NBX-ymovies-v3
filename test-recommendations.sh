#!/bin/bash

echo "🎬 Testing Enhanced Recommendation System..."
echo "============================================"

# Test Fight Club (should get thriller/drama recommendations)
echo ""
echo "📽️ Testing Fight Club (ID: 550) - Should get thriller/drama recommendations:"
echo "Making API call..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "http://localhost:5040/api/recommendations/similar/550")
http_code=$(echo "$response" | tail -n1 | cut -d: -f2)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ API call successful (HTTP $http_code)"
    movie_count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "Unable to parse JSON")
    echo "📊 Number of recommendations: $movie_count"
    
    if [ "$movie_count" != "null" ] && [ "$movie_count" -gt 0 ]; then
        echo "🎯 First 3 recommendations:"
        echo "$body" | jq -r '.[0:3] | .[] | "  • \(.title) (\(.release_date[:4] // "N/A")) - Rating: \(.vote_average // "N/A")/10"' 2>/dev/null || echo "  Unable to parse movie details"
    fi
else
    echo "❌ API call failed (HTTP $http_code)"
    echo "Response: $body"
fi

# Test The Garfield Movie (should get family-friendly recommendations)
echo ""
echo "📽️ Testing The Garfield Movie (ID: 748783) - Should get family-friendly recommendations:"
echo "Making API call..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "http://localhost:5040/api/recommendations/similar/748783")
http_code=$(echo "$response" | tail -n1 | cut -d: -f2)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ API call successful (HTTP $http_code)"
    movie_count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "Unable to parse JSON")
    echo "📊 Number of recommendations: $movie_count"
    
    if [ "$movie_count" != "null" ] && [ "$movie_count" -gt 0 ]; then
        echo "🎯 First 3 recommendations:"
        echo "$body" | jq -r '.[0:3] | .[] | "  • \(.title) (\(.release_date[:4] // "N/A")) - Rating: \(.vote_average // "N/A")/10"' 2>/dev/null || echo "  Unable to parse movie details"
    fi
else
    echo "❌ API call failed (HTTP $http_code)"
    echo "Response: $body"
fi

echo ""
echo "🎉 Test Complete!"
echo ""
echo "Key things to verify:"
echo "• Fight Club should get thriller/drama/action movies (not family content)"
echo "• Garfield should get family/animation/comedy movies (not action/thriller)"
echo "• All movies should have decent ratings (typically 6.0+ average)"
echo "• Should get 15 recommendations instead of the old 8"
