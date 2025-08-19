#!/bin/bash

# YMovies Deployment Test Script
echo "🧪 Testing YMovies Deployment"
echo "============================="

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./test-deployment.sh <your-vercel-url>"
    echo "Example: ./test-deployment.sh https://your-app.vercel.app"
    exit 1
fi

BASE_URL="$1"

echo "Testing deployment at: $BASE_URL"
echo ""

# Test 1: Main app
echo "1. Testing main app..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$response" = "200" ]; then
    echo "✅ Main app is accessible"
else
    echo "❌ Main app failed (HTTP $response)"
fi

# Test 2: Recommendations API (GET)
echo "2. Testing recommendations API (GET)..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/recommendations?type=movies&user_id=test")
if [ "$response" = "200" ]; then
    echo "✅ Recommendations API (GET) is working"
else
    echo "❌ Recommendations API (GET) failed (HTTP $response)"
fi

# Test 3: Recommendations API (POST)
echo "3. Testing recommendations API (POST)..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "type": "movies"}')
if [ "$response" = "200" ]; then
    echo "✅ Recommendations API (POST) is working"
else
    echo "❌ Recommendations API (POST) failed (HTTP $response)"
fi

# Test 4: Similar content API
echo "4. Testing similar content API..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/similar?id=550&type=movie")
if [ "$response" = "200" ]; then
    echo "✅ Similar content API is working"
else
    echo "❌ Similar content API failed (HTTP $response)"
fi

# Test 5: Get actual recommendations data
echo "5. Testing recommendations data..."
recommendations=$(curl -s "$BASE_URL/api/recommendations?type=movies&user_id=test" | grep -o '"recommendation_count":[0-9]*' | cut -d':' -f2)
if [ ! -z "$recommendations" ] && [ "$recommendations" -gt 0 ]; then
    echo "✅ Recommendations returning data ($recommendations items)"
else
    echo "❌ Recommendations not returning data"
fi

echo ""
echo "🏁 Test Summary:"
echo "- Main App: $BASE_URL"
echo "- Recommendations API: $BASE_URL/api/recommendations"
echo "- Similar Content API: $BASE_URL/api/similar"
echo ""
echo "If all tests passed, your YMovies app is successfully deployed! 🎉"
