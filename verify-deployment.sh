
# Verify that both frontend and backend are working correctly

echo "🎬 YMovies - Deployment Verification"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL (Heroku)
BACKEND_URL="https://ymovies-backend-a306d5f1eff3.herokuapp.com"
# Frontend URL (to be updated with your Vercel URL)
FRONTEND_URL="your-vercel-url.vercel.app"

echo ""
echo -e "${BLUE}📡 Testing Backend API (Heroku)...${NC}"
echo "Backend URL: $BACKEND_URL"

# Test health endpoint
echo -n "• Health check: "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $HEALTH_RESPONSE)"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $HEALTH_RESPONSE)"
fi

# Test CORS headers
echo -n "• CORS configuration: "
CORS_RESPONSE=$(curl -s -I "$BACKEND_URL/api/health" | grep -i "access-control-allow-origin")
if [ ! -z "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✅ PASS${NC} (CORS headers present)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (CORS headers not found)"
fi

# Test API endpoints
echo -n "• Movies endpoint: "
MOVIES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/movies/popular")
if [ "$MOVIES_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $MOVIES_RESPONSE)"
fi

echo -n "• Recommendations endpoint: "
RECOMMENDATIONS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/recommendations/anonymous")
if [ "$RECOMMENDATIONS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $RECOMMENDATIONS_RESPONSE)"
fi

echo ""
echo -e "${BLUE}🌐 Testing Frontend (Vercel)...${NC}"
echo "Frontend URL: https://$FRONTEND_URL"

if [ "$FRONTEND_URL" != "your-vercel-url.vercel.app" ]; then
    # Test frontend availability
    echo -n "• Frontend accessibility: "
    FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$FRONTEND_URL")
    if [ "$FRONTEND_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC} (Status: $FRONTEND_RESPONSE)"
    fi
    
    # Test if frontend can reach backend
    echo -n "• Frontend-Backend connectivity: "
    # This would require JavaScript execution, so we'll check if the frontend loads
    echo -e "${YELLOW}⚠️  MANUAL CHECK REQUIRED${NC}"
    echo "  Please visit https://$FRONTEND_URL and verify:"
    echo "  - Movies load on the homepage"
    echo "  - Recommendations appear"
    echo "  - User authentication works"
else
    echo -e "${YELLOW}⚠️  Frontend URL not configured${NC}"
    echo "Please update FRONTEND_URL in this script with your Vercel deployment URL"
fi

echo ""
echo -e "${BLUE}🔐 Environment Security Check...${NC}"

# Check for sensitive files that shouldn't be in the repository
echo -n "• Checking for .env files: "
if find . -name ".env" -not -path "./node_modules/*" -not -path "./backup/*" | grep -q .; then
    echo -e "${RED}❌ FAIL${NC} - Found .env files in repository!"
    echo "  Run the cleanup script to remove them"
else
    echo -e "${GREEN}✅ PASS${NC}"
fi

echo -n "• Checking for Firebase credentials: "
if find . -name "*firebase*admin*.json" -not -path "./node_modules/*" -not -path "./backup/*" | grep -q .; then
    echo -e "${RED}❌ FAIL${NC} - Found Firebase credentials!"
else
    echo -e "${GREEN}✅ PASS${NC}"
fi

echo ""
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "====================="

# Get backend status
BACKEND_STATUS="Unknown"
if [ "$HEALTH_RESPONSE" = "200" ]; then
    BACKEND_STATUS="✅ Online"
else
    BACKEND_STATUS="❌ Offline"
fi

echo "Backend (Heroku):  $BACKEND_STATUS"
echo "Frontend (Vercel): Manual check required"
echo ""

# API Response Time Test
echo -e "${BLUE}⚡ Performance Test...${NC}"
echo -n "• Backend response time: "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BACKEND_URL/api/health")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc -l 2>/dev/null || echo "N/A")
if [ "$RESPONSE_MS" != "N/A" ]; then
    echo "${RESPONSE_MS%.*}ms"
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null) )); then
        echo "  ${GREEN}✅ Good performance${NC}"
    else
        echo "  ${YELLOW}⚠️  Slow response time${NC}"
    fi
else
    echo "Unable to measure"
fi

echo ""
echo -e "${BLUE}🔍 Next Steps${NC}"
echo "=============="
echo "1. ${GREEN}Update Frontend URL${NC}: Replace 'your-vercel-url.vercel.app' with your actual Vercel URL"
echo "2. ${YELLOW}Manual Testing${NC}: Visit your frontend and test all features"
echo "3. ${BLUE}Performance${NC}: Monitor response times and optimize if needed"
echo "4. ${RED}Security${NC}: Ensure no sensitive data is exposed in the frontend"
echo ""
echo "🎉 Deployment verification complete!"
echo ""

# Final recommendations
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Your backend is successfully deployed and responding!${NC}"
    echo -e "   Backend API: ${BACKEND_URL}"
else
    echo -e "${RED}❌ Backend deployment needs attention${NC}"
fi

echo ""
echo -e "${BLUE}📱 Test your app at:${NC}"
echo "• Backend API: $BACKEND_URL/api/health"
echo "• Frontend: https://$FRONTEND_URL (update this URL)"
echo "• API Documentation: $BACKEND_URL/api/docs (if implemented)"
