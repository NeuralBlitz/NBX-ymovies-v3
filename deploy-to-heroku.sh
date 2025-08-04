#!/bin/bash

# YMovies - Heroku Full Deployment Script
echo "🚀 Deploying YMovies Netflix Clone to Heroku"
echo "============================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login check
echo "🔐 Checking Heroku authentication..."
if ! heroku auth:whoami &> /dev/null; then
    echo "🔑 Please login to Heroku:"
    heroku login
fi

# Get app name from user or use default
read -p "📝 Enter Heroku app name (default: ymovies-netflixclone): " APP_NAME
APP_NAME=${APP_NAME:-ymovies-netflixclone}

echo "🏗️  Creating Heroku app: $APP_NAME"

# Create Heroku app
heroku create $APP_NAME

# Add PostgreSQL database
echo "🗄️  Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

# Add buildpacks for Node.js and Python
echo "📦 Adding buildpacks..."
heroku buildpacks:add heroku/nodejs --app $APP_NAME
heroku buildpacks:add heroku/python --app $APP_NAME

# Set environment variables
echo "🔧 Setting environment variables..."

# Production settings
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set USE_DEMO_SERVER=false --app $APP_NAME
heroku config:set VITE_USE_DEMO_SERVER=false --app $APP_NAME

# TMDB API
heroku config:set TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6 --app $APP_NAME
heroku config:set VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI --app $APP_NAME
heroku config:set VITE_TMDB_API_KEY_V3=e28104677eeb4d67bd476af5d0ed9ad6 --app $APP_NAME

# Firebase Configuration
heroku config:set FIREBASE_PROJECT_ID=ymovies-e4cb4 --app $APP_NAME
heroku config:set FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com --app $APP_NAME
heroku config:set FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc --app $APP_NAME

# Firebase Client Configuration
heroku config:set NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_PROJECT_ID=ymovies-e4cb4 --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ymovies-e4cb4.firebasestorage.app --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=658873153268 --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_APP_ID=1:658873153268:web:170cb70584bcab36bb10a1 --app $APP_NAME
heroku config:set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L72SBYCRZ7 --app $APP_NAME

# Firebase Admin (Base64 encoded service account)
heroku config:set FIREBASE_ADMIN_CREDENTIALS=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAieW1vdmllcy1lNGNiNCIsCiAgInByaXZhdGVfa2V5X2lkIjogImYwOTA0NjA3MTQiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU21BZ0VBQW9JQkFRQytYcTJWWVNzV1xuQ2hGNVRxWWRZVCsyUFpVRmpOK253K0wrSTZNVnFRb01QRTF4blVQc1R3UndHZzhJME1mSERsZjBEeGhVXG4zNTVrU3g1LzJ6Y2NaWkNBZEY4K2c4RjFsUG1jTmJuU1BpUlIvMzRtNUwxaUpsWi9sQ3JHUEdBZm1DblxuczJPNTFrTkdwcmRrWWNZN1ptRkVtSjI0QUJYZ0Q2VGZ3RGhRbGNaQUZXZGFKNjZwRTZNT2dMWUhIQ0pcbkRIS2VZaE9UYUVEZitZUWNJREpNWWZhTU5LUXljOTNrQU9IeGhKN1hveWZqYzU0ZlI2YzFuUW9zWDdVQ3lcbjZrOFB1OWRyRk1POFNUZGRKUVRwaUJNT3crOFJyaWJGOE5nR2pyMTU2WHFxOWgzOUpqUy85Mlk1RTYyXG5lYjlEcEtSNFI1Wks2cnBCSmVBQ3J5cXpBZ01CQUFFQ2dnRUFiNi9vRXhQdCs3ZWZrd0ZNQnM5WnJ0N1RcbnNmRWhEb1M0eXZTQmJUOEFFK2xYc2JwOEtGa3JRZm43UGRUdVJtRWNGTE9hUlgxY2dJNWRrMDdxOFpLXG5OWW9KMHh1YSsxbmUxVFZPU2c0ZVJnNGV0Z1k4VGdSNGVlVStFdDBpOXVWN3JhVG16WHFraE9rV2lZNVxuNWRQUU5aWGJCQVNSYUhEVVFIMWxVSU9TblVHZTA5T05nT2czZkI3YUFMUzEyL2U3a2Y4ZkQxRGJiUUEzXG5zak1tZkl0L0hLeVJDMFQzckNFQUJoT3kvZnhvSE5zRmN2NmlCYUpLUE1YYzFZOExKNHlYNXZ5WmQ3NlxuOE9LTzF1MDh6U1JhUW9Yb0hKVmhVbEJvWGl0VFI4ZXhieHVzRkRFUTA3MTQrQWRhVXNlUVFqS1pCbGJsXG5scWpNSGNOQW8rM1FLQmdRQzl0cWNhSElSdkdCOXhRTVB0UFNOd2ZLWWcza3FmS1pCOXZsbW5UMHlZYlxuek03emVNbWs4YUwxaDFpaUV0cFJKUHJ5aG5zTytQL0VFU3BlMGhjVWUyYmNKMGVLTUxwcCthaTFqVGszXG4zV1Y4czl1TVNwS2REUkU2SnJ5SWM1YktzdE1NTEI5a1JLMU0wbWxqN1czV2tENnNUSEhxeXJ6ZGJDM0hcbnBKUUJ5UTdRd0tCZ1FDN2JCM25DZGd1ZFpRTUxSbHZMTmFOOGdFWDZmRGZGUlFiOWdJd3BZbFBPZFhWXG40U1dKUUx4OU1MUHpXMlhOT2ZqN3htL0lJWE5YcEJXWFM4ZU9BcDlKOWdmeVNBNGVXOCswdStQSE8xXG43NXJsUk5tbFppTjIrUkk3Zng4Z2VyTlJyMXZuOG53dkZHdkV5OEVFN1V1SlVoRVJUa21jMDUzVUdpbVxueWR0VUhCQm53S0JnRmkwOUtvb3ZwSDVpY1JvZTVLRHNJQ3BpWGI3WkRhS0VtU0tJdW9qN0Y2Q29sOUlcbnN1N1gvYnA3cWNqUTk5cGZmUGlYblM5aE5LT29MN3JwQnRKdk1wbDdFeEorNDU3V1BMcFdZTUhLdkQ1XG5qTkhGMVowQnFycjZjdGNaa2tFRm1OUGwvVW9qOWJHRmNjKzJIaHB4M3pyYjl6UnRZU21zOFpWMjNoT1xuUElPa2JGRGJBb0dCQUt6YWIxOC9sbjhRRGF1R0VHQ1ZoUkl6RFYzbklSaWRTNU1VbGkzTVpzQWJheW9cblNiN2c2Q2ZHd1NoUGFOMGNSeDRUV1BDbUdEbDFxME9JUWFGd21GRVBDbGdJZitNcXV3Zk50dXFmTmszXG5GdDF0azQ2UGRyNU9rYXMzdStyVEpGSkFDMUFrQ2F0YlpJR1orSEFMMzUwYVdaZVVXSGVXeGVJYitUV1RcbklvTGZBb0dCQUt6dFluQlh0ZlFuOUREcE41UG41WEZHZ1I1dkF3anI5KzNPSU1HOG9pb0ppSTEvSGpVXG5DTGpURG1ZZU1nOUt1UDNnMDNVcUR6Um9vYXgzRlRySldRTk1qQThHczNMeHB1c2k1K0tWYm9kc3JKemdcbkdmT1FXMHE3ZXdENnhrMWNyeGRWWEJ5WjlHTWtqRUwzM3hSVGJGSjVqZkJPZ055VlhRK2RQN0VJNnNnclxudHA0OHQ4Q0Q5Vk1zREM2QUozSFpGdTM2VldCYU1Sb1E2OE1sbEQyS1pHQT09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAeW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDg3NTA3MDM1NDIxNTMzMjk0MzciLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQweW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo= --app $APP_NAME

# Recommendation Service Configuration
heroku config:set RECOMMENDATION_SERVICE_URL=http://localhost:5100 --app $APP_NAME

echo "🚀 Deploying to Heroku..."

# Add git remote if it doesn't exist
if ! git remote | grep -q heroku; then
    heroku git:remote -a $APP_NAME
fi

# Deploy
git add .
git commit -m "Configure for Heroku deployment" || echo "Nothing to commit"
git push heroku main

echo ""
echo "✅ Deployment completed!"
echo "🌍 Your app is available at: https://$APP_NAME.herokuapp.com"
echo ""
echo "📊 Useful commands:"
echo "   heroku logs --tail --app $APP_NAME              # View logs"
echo "   heroku ps --app $APP_NAME                       # View processes"
echo "   heroku config --app $APP_NAME                   # View environment variables"
echo "   heroku addons --app $APP_NAME                   # View add-ons"
echo ""
echo "🎉 Your Netflix Clone is now live on Heroku!"
