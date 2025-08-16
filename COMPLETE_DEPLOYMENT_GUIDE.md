# 🚀 Netflix Clone - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Local Setup Verification
Before deploying, ensure your app works locally:

```bash
# 1. Install dependencies
npm install

# 2. Check if you have local environment file
# You should have .env.local or .env.development with your actual credentials
ls -la | grep .env

# 3. Test local development
npm run dev
# Visit http://localhost:5173 and test all features:
# - Movie browsing
# - Search functionality  
# - Recommendations
# - User authentication
# - Favorites/watchlist
```

## 🎯 Deployment Strategy: Hybrid (Recommended)

**Frontend**: Vercel (Free tier, global CDN, fast loading)
**Backend + ML**: Heroku (Paid tier, full-stack capabilities)

---

# 📦 PART 1: Backend Deployment (Heroku)

## Step 1: Heroku Account & CLI Setup

### 1.1 Install Heroku CLI
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
# Or via npm:
npm install -g heroku

# Verify installation
heroku --version
```

### 1.2 Login to Heroku
```bash
heroku login
# This will open browser for authentication
```

## Step 2: Create Heroku App

### 2.1 Create Backend App
```bash
# Create app with unique name
heroku create your-netflix-backend
# Replace 'your-netflix-backend' with your desired name

# Example:
heroku create ymovies-backend-2024
```

### 2.2 Add Database
```bash
# Add PostgreSQL database (Essential Plan $5/month)
heroku addons:create heroku-postgresql:essential-0

# Verify database was created
heroku addons
```

### 2.3 Add Buildpacks
```bash
# Add Node.js buildpack for the main backend
heroku buildpacks:add heroku/nodejs

# Add Python buildpack for ML recommendations
heroku buildpacks:add heroku/python

# Verify buildpacks
heroku buildpacks
```

## Step 3: Configure Heroku Environment Variables

### 3.1 Get Your Current Credentials
Check your local `.env.local` or `.env.development` file for these values:

```bash
# View your local environment (don't commit this file!)
cat .env.local
# or
cat .env.development
```

### 3.2 Set Heroku Environment Variables
Replace the placeholder values with your actual credentials:

```bash
# Core Configuration
heroku config:set NODE_ENV=production
heroku config:set PORT=5000

# Database (automatically set by Heroku PostgreSQL addon)
# DATABASE_URL is automatically configured

# TMDB API Keys
heroku config:set TMDB_API_KEY=your_actual_tmdb_api_key_here
heroku config:set TMDB_BEARER_TOKEN=your_actual_tmdb_bearer_token_here

# Firebase Configuration
heroku config:set FIREBASE_PROJECT_ID=your_firebase_project_id
heroku config:set FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
heroku config:set FIREBASE_PRIVATE_KEY="your_firebase_private_key_here"
heroku config:set FIREBASE_CLIENT_EMAIL=your_firebase_client_email
heroku config:set FIREBASE_CLIENT_ID=your_firebase_client_id
heroku config:set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
heroku config:set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
heroku config:set FIREBASE_CLIENT_CERT_URL=your_firebase_client_cert_url

# JWT Configuration
heroku config:set JWT_SECRET=your_secure_jwt_secret_here

# CORS Configuration (will be set to your Vercel URL later)
heroku config:set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Verify all variables are set
heroku config
```

## Step 4: Deploy Backend to Heroku

### 4.1 Deploy Using Git
```bash
# Make sure you're in the project root
pwd
# Should show: /f/Project/NetflixClone

# Deploy to Heroku
git push heroku main

# Monitor the build process
heroku logs --tail
```

### 4.2 Verify Backend Deployment
```bash
# Check if app is running
heroku ps

# Test backend API
heroku open
# Should show your backend API or a simple response

# Test specific endpoints
curl https://your-netflix-backend.herokuapp.com/api/health
curl https://your-netflix-backend.herokuapp.com/api/movies
```

### 4.3 Run Database Migrations (if needed)
```bash
# If you have database schema/migrations
heroku run npm run db:push
# or
heroku run npx drizzle-kit push
```

---

# 🌐 PART 2: Frontend Deployment (Vercel)

## Step 1: Vercel Account & CLI Setup

### 1.1 Install Vercel CLI
```bash
npm install -g vercel

# Verify installation
vercel --version
```

### 1.2 Login to Vercel
```bash
vercel login
# Follow the authentication steps
```

## Step 2: Configure Frontend for Production

### 2.1 Update API Configuration
Get your Heroku backend URL:
```bash
heroku info
# Note the "Web URL" - this is your backend API URL
# Example: https://your-netflix-backend.herokuapp.com
```

Create/update your frontend API configuration:
```bash
# Check if apiConfig.ts exists
cat client/src/lib/apiConfig.ts
```

### 2.2 Set Vercel Environment Variables

#### Option A: Via Vercel CLI
```bash
# Set production API URL (replace with your actual Heroku URL)
vercel env add VITE_API_URL production
# Enter: https://your-netflix-backend.herokuapp.com

# Set TMDB API keys for frontend
vercel env add VITE_TMDB_API_KEY production
# Enter your TMDB v3 API key

vercel env add VITE_TMDB_BEARER_TOKEN production  
# Enter your TMDB Bearer token

# Set Firebase frontend config
vercel env add VITE_FIREBASE_API_KEY production
# Enter your Firebase web API key

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Enter: your-project.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Enter your Firebase project ID

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Enter: your-project.appspot.com

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Enter your Firebase messaging sender ID

vercel env add VITE_FIREBASE_APP_ID production
# Enter your Firebase app ID
```

#### Option B: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all the VITE_ variables listed above

## Step 3: Deploy Frontend to Vercel

### 3.1 Deploy via CLI
```bash
# Build and deploy to production
vercel --prod

# Follow the prompts:
# Set up and deploy "NetflixClone"? Y
# In which directory is your code located? ./
# Link to existing project? N (for first deployment)
# What's your project's name? your-netflix-frontend
# In which directory is your code located? ./
```

### 3.2 Verify Frontend Deployment
```bash
# Get deployment URL
vercel ls

# Test the frontend
# Visit the provided URL and test:
# - Homepage loads
# - Movies display
# - Search works
# - Authentication works
# - Recommendations load
```

---

# 🔗 PART 3: Connect Frontend to Backend

## Step 1: Update CORS Settings

### 1.1 Add Vercel URL to Heroku CORS
```bash
# Get your Vercel deployment URL
vercel ls

# Update CORS settings on Heroku (replace with your actual Vercel URL)
heroku config:set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,https://your-netflix-frontend.vercel.app"
```

### 1.2 Verify Connection
```bash
# Test API connection from frontend
# Visit your Vercel app and check browser console for any CORS errors
```

---

# 🧪 PART 4: Testing & Verification

## Step 1: Full Application Testing

### 4.1 Test Backend Endpoints
```bash
# Health check
curl https://your-netflix-backend.herokuapp.com/api/health

# Movies endpoint
curl https://your-netflix-backend.herokuapp.com/api/movies

# Search endpoint
curl "https://your-netflix-backend.herokuapp.com/api/search?q=action"

# Recommendations endpoint (may require auth)
curl https://your-netflix-backend.herokuapp.com/api/recommendations
```

### 4.2 Test Frontend Application
Visit your Vercel URL and test:

1. **Homepage Loading**: Movies should display
2. **Search Functionality**: Search for movies
3. **Movie Details**: Click on movie cards
4. **Authentication**: Sign up/login with Firebase
5. **Recommendations**: Check personalized recommendations
6. **Favorites**: Add/remove movies from favorites
7. **Responsive Design**: Test on mobile devices

### 4.3 Monitor Logs
```bash
# Monitor Heroku backend logs
heroku logs --tail

# Monitor Vercel logs via dashboard:
# https://vercel.com/dashboard → Your Project → Functions tab
```

---

# 🔧 PART 5: Post-Deployment Configuration

## Step 1: Domain Configuration (Optional)

### 5.1 Custom Domain for Frontend (Vercel)
```bash
# Add custom domain via Vercel dashboard:
# Settings → Domains → Add Domain
```

### 5.2 Custom Domain for Backend (Heroku)
```bash
# Add custom domain (requires paid plan)
heroku domains:add api.yourdomain.com
```

## Step 2: Performance Optimization

### 5.1 Enable Heroku Metrics
```bash
# Add metrics (optional, paid feature)
heroku addons:create heroku-metrics:hobby
```

### 5.2 Configure CDN (Vercel automatically provides this)

---

# 🛠️ PART 6: Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Backend Build Fails
```bash
# Check build logs
heroku logs --tail

# Common solutions:
# - Ensure Node.js version is specified in package.json
# - Check all dependencies are in package.json
# - Verify buildpacks are correctly set
```

### Issue 2: Frontend Can't Connect to Backend
```bash
# Check CORS settings
heroku config:get ALLOWED_ORIGINS

# Verify API URL in frontend
vercel env ls

# Check network tab in browser developer tools
```

### Issue 3: Database Connection Issues
```bash
# Verify database addon
heroku addons

# Check database URL
heroku config:get DATABASE_URL

# Test database connection
heroku run node -e "console.log(process.env.DATABASE_URL)"
```

### Issue 4: Environment Variables Missing
```bash
# List all Heroku config vars
heroku config

# List all Vercel env vars
vercel env ls

# Add missing variables using the commands from earlier steps
```

---

# 📝 PART 7: Final Deployment Checklist

## ✅ Pre-Deployment
- [ ] App works perfectly locally
- [ ] All environment variables identified
- [ ] Git repository is clean (no credentials committed)
- [ ] Dependencies are up to date

## ✅ Backend (Heroku)
- [ ] Heroku CLI installed and authenticated
- [ ] Heroku app created with unique name
- [ ] PostgreSQL addon added
- [ ] Node.js and Python buildpacks added
- [ ] All environment variables set correctly
- [ ] Backend deployed successfully
- [ ] API endpoints responding correctly
- [ ] Database connected and working

## ✅ Frontend (Vercel)
- [ ] Vercel CLI installed and authenticated
- [ ] API configuration points to Heroku backend
- [ ] All VITE_ environment variables set
- [ ] Frontend deployed successfully
- [ ] Frontend loads without errors
- [ ] All features working (search, auth, recommendations)

## ✅ Integration
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend
- [ ] Authentication flow working
- [ ] Recommendations loading
- [ ] No console errors

## ✅ Testing
- [ ] Full user journey tested
- [ ] Mobile responsiveness verified
- [ ] Performance is acceptable
- [ ] Error handling works correctly

---

# 🎯 Quick Deploy Commands Summary

After completing all setup steps, future deployments are simple:

```bash
# Deploy backend changes
git add .
git commit -m "Backend updates"
git push heroku main

# Deploy frontend changes  
vercel --prod
```

---

# 📞 Support

If you encounter issues:

1. **Check logs**: `heroku logs --tail` and Vercel dashboard
2. **Verify environment variables**: `heroku config` and `vercel env ls`
3. **Test locally first**: Ensure local development works
4. **Check network connectivity**: Browser developer tools
5. **Review this guide**: Ensure all steps were completed

---

## 🎉 Congratulations!

Your Netflix Clone is now deployed and running in production! 

- **Frontend**: Fast global delivery via Vercel
- **Backend**: Scalable API and ML recommendations via Heroku
- **Database**: Reliable PostgreSQL on Heroku
- **Security**: All credentials properly configured

Your app is ready for users! 🚀
