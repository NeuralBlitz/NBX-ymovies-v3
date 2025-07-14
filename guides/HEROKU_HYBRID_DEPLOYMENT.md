# Netflix Clone - Hybrid Deployment (Vercel + Heroku)

## 🎯 Overview
- **Frontend**: Deploy on Vercel (React/Vite) - Fast global CDN
- **Backend**: Deploy on Heroku (Node.js + Python) - Full-stack backend

## 🌐 Architecture
```
Frontend (Vercel) ──→ Backend API (Heroku)
                  ──→ ML Recommendations (Heroku)
                  ──→ Database (Heroku Postgres)
```

## 🔧 Heroku Backend Configuration

### 1. Heroku Setup (Backend Only)
```bash
# Create Heroku app for backend
heroku create ymovies-backend

# Add PostgreSQL  
heroku addons:create heroku-postgresql:mini

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python
```

### 2. Heroku Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
heroku config:set FIREBASE_PROJECT_ID=ymovies-e4cb4
# ... (all backend environment variables)
```

### 3. Heroku Files

#### Procfile (Backend)
```
web: npm run start:heroku
worker: cd recommendation_service && python app.py
```

#### package.json (Backend Scripts)
```json
{
  "scripts": {
    "start:heroku": "node dist/index.js",
    "build:heroku": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
    "heroku-postbuild": "npm run build:heroku && pip install -r requirements.txt"
  }
}
```

## 🌟 Vercel Frontend Configuration

### 1. Vercel Environment Variables
Set in Vercel Dashboard:
```bash
VITE_API_URL=https://ymovies-backend.herokuapp.com
VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc
# ... (all frontend environment variables)
```

### 2. vercel.json (Frontend Only)
```json
{
  "version": 2,
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist/public",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. Frontend API Configuration
Update API base URL to point to Heroku:
```typescript
// client/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ymovies-backend.herokuapp.com';
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Heroku
```bash
# Setup Heroku backend
heroku create ymovies-backend
heroku addons:create heroku-postgresql:mini
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Deploy backend
git push heroku main
```

### Step 2: Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

## ⚖️ Comparison: Full Heroku vs Hybrid

| Feature | Full Heroku | Hybrid (Vercel + Heroku) |
|---------|-------------|---------------------------|
| **Management** | ✅ Single platform | ❌ Two platforms |
| **Frontend Speed** | ✅ Good | ✅✅ Excellent (CDN) |
| **API Performance** | ✅✅ Excellent | ✅ Good |
| **Cost** | ✅ Single bill | ❌ Two bills |
| **Scaling** | ✅ Unified | ❌ Separate |
| **SSL/Domain** | ✅ Included | ✅ Both included |
| **Deploy Complexity** | ✅ Simple | ❌ More complex |

## 🎯 Recommendation

**Go with FULL HEROKU DEPLOYMENT** because:
1. ✅ You already have Heroku subscription
2. ✅ Simpler management (single platform)
3. ✅ Integrated PostgreSQL database
4. ✅ Single domain/SSL setup
5. ✅ Easier environment variable management
6. ✅ Unified logging and monitoring
