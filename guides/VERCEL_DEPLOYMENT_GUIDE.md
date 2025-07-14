# YMovies Netflix Clone - Vercel Deployment Guide

## 🎬 Overview

This guide will help you deploy your YMovies Netflix Clone application to Vercel with serverless Python functions for recommendations.

## 🏗️ Architecture

- **Frontend**: React/Vite application
- **Backend**: Node.js/Express serverless functions
- **Recommendations**: Python serverless functions
- **Database**: PostgreSQL (Neon/Supabase)
- **APIs**: TMDB API for movie/TV data

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **TMDB API Key**: Get from [themoviedb.org](https://www.themoviedb.org/settings/api)
4. **Database**: PostgreSQL instance (Neon/Supabase recommended)

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

#### Windows:
```bash
./deploy-to-vercel.bat
```

#### Linux/macOS:
```bash
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

### Option 2: Manual Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Set Environment Variables
```bash
# TMDB API Key (Required)
vercel env add TMDB_API_KEY production
vercel env add TMDB_API_KEY preview

# Database URL (Required if using database features)
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview

# Firebase Config (Required if using authentication)
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
```

#### Step 4: Deploy
```bash
vercel --prod
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TMDB_API_KEY` | The Movie Database API key | `32c9dd8c0f9c57b5a40cefb94b2ea9ea` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL database connection string | `postgresql://user:pass@host:5432/db` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `your-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |

## 📁 Project Structure

```
f:\Project\NetflixClone\
├── api/                      # Serverless functions
│   ├── index.js             # Main backend API
│   ├── recommendations.py    # Python recommendations service
│   └── similar.py           # Python similar content service
├── client/                   # React frontend
├── server/                   # Backend source
├── vercel.json              # Vercel configuration
├── requirements.txt         # Python dependencies
└── package.json            # Node.js dependencies
```

## 🌐 API Endpoints

After deployment, your app will have these endpoints:

### Main Application
- `https://your-app.vercel.app` - Main YMovies app

### API Endpoints
- `https://your-app.vercel.app/api/recommendations` - Personalized recommendations
- `https://your-app.vercel.app/api/similar` - Similar content recommendations
- `https://your-app.vercel.app/api/*` - Other backend APIs

## 🧪 Testing Deployment

### 1. Test Recommendations API
```bash
# GET request
curl "https://your-app.vercel.app/api/recommendations?type=movies&user_id=test"

# POST request
curl -X POST "https://your-app.vercel.app/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "type": "movies", "preferences": {"genres": ["Action"]}}'
```

### 2. Test Similar Content API
```bash
curl "https://your-app.vercel.app/api/similar?id=550&type=movie"
```

### 3. Test Main App
- Visit your app URL and test:
  - Search functionality
  - Browse movies/TV shows
  - Recommendations section
  - User authentication (if enabled)

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
- **Issue**: Build fails during deployment
- **Solution**: Check build logs in Vercel dashboard
- **Common causes**: 
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

#### 2. Python Function Errors
- **Issue**: Recommendations API returns 500 errors
- **Solution**: Check function logs in Vercel dashboard
- **Common causes**:
  - Missing `TMDB_API_KEY`
  - Network timeouts
  - Invalid request format

#### 3. CORS Issues
- **Issue**: Frontend can't access API endpoints
- **Solution**: CORS headers are already configured in Python functions
- **Check**: Ensure requests are made to correct domain

#### 4. Database Connection Issues
- **Issue**: Database queries fail
- **Solution**: Verify `DATABASE_URL` environment variable
- **Check**: Database instance is accessible from Vercel

### Debug Commands

```bash
# Check Vercel project status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

## 📊 Performance Optimization

### Frontend Optimizations
- Vite handles code splitting and bundling
- Images are optimized via Vercel
- Static assets are cached

### API Optimizations
- Python functions are cached between requests
- TMDB API responses can be cached
- Database queries use connection pooling

### Monitoring
- Use Vercel Analytics for performance insights
- Monitor function execution time in dashboard
- Set up error alerting

## 🔒 Security

### Environment Variables
- All sensitive data stored as environment variables
- Separate environments for production/preview
- No hardcoded secrets in code

### API Security
- CORS properly configured
- Rate limiting via Vercel
- Input validation in all endpoints

## 📈 Scaling

### Automatic Scaling
- Vercel automatically scales based on traffic
- Serverless functions scale independently
- No infrastructure management required

### Performance Limits
- Free tier: 100GB bandwidth, 6000 build minutes
- Pro tier: Unlimited bandwidth, faster builds
- Function timeout: 30 seconds (configurable)

## 🆘 Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Python on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [TMDB API Docs](https://developers.themoviedb.org/3)

### Getting Help
1. Check Vercel dashboard for errors
2. Review deployment logs
3. Test APIs individually
4. Check environment variable configuration

## 🎉 Success Checklist

After deployment, verify:

- [ ] Main app loads correctly
- [ ] Search functionality works
- [ ] Movie/TV show details display
- [ ] Recommendations are generated
- [ ] Similar content suggestions work
- [ ] User authentication (if enabled)
- [ ] All images load properly
- [ ] Mobile responsiveness
- [ ] Performance is acceptable

## 📝 Next Steps

1. **Custom Domain**: Configure a custom domain in Vercel
2. **Analytics**: Set up Vercel Analytics for insights
3. **Monitoring**: Configure error alerts and monitoring
4. **CDN**: Leverage Vercel's global CDN for better performance
5. **CI/CD**: Set up automatic deployments from Git
