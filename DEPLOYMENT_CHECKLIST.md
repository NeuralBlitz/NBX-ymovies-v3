# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Build Test ✅
- [x] Vite build completes successfully
- [x] Server bundle builds correctly 
- [x] Static assets are generated
- [x] API function is created

### 2. Environment Variables Setup
Run the validation script to check:
```bash
npm run validate:env
```

Required variables:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `TMDB_API_KEY` - TMDB Bearer token
- [ ] `VITE_TMDB_API_KEY` - TMDB Bearer token (client)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- [ ] `FIREBASE_PROJECT_ID` - Firebase project ID (server)
- [ ] `FIREBASE_ADMIN_CREDENTIALS` - Firebase service account JSON
- [ ] `SESSION_SECRET` - Random 32-character string
- [ ] `NODE_ENV` - Set to "production"

### 3. Database Setup
- [ ] PostgreSQL database is accessible from internet
- [ ] Database connection string is correct
- [ ] Database schema is up to date
- [ ] Consider using Vercel Postgres, Neon, or Supabase

### 4. Firebase Configuration
- [ ] Enable Email/Password authentication in Firebase Console
- [ ] Firebase service account key is generated
- [ ] Firebase Admin credentials are properly formatted as JSON string
- [ ] Test authentication works in development

### 5. Security Checklist
- [ ] Service account file is in `.gitignore` ✅
- [ ] Environment variables are set in Vercel dashboard, not in code
- [ ] Session secret is randomly generated
- [ ] Database credentials are secure

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Set Environment Variables
Either use the Vercel dashboard or CLI:
```bash
vercel env add DATABASE_URL
vercel env add FIREBASE_ADMIN_CREDENTIALS
# ... repeat for all variables
```

### Step 4: Deploy
```bash
vercel --prod
```

## 🔧 Build Configuration

### Files Created/Modified ✅
- [x] `vercel.json` - Vercel configuration
- [x] `api/index.js` - Serverless function entry point
- [x] `package.json` - Added `build:vercel` script
- [x] `server/index.ts` - Added `createServer()` export
- [x] `server/vite.ts` - Fixed static file serving
- [x] `server/firebaseAdmin.ts` - Production-ready Firebase config

### Build Process ✅
1. Client builds with Vite → `dist/public/`
2. Server builds with esbuild → `dist/index.js`
3. Vercel serves static files from `dist/public/`
4. API requests go to `api/index.js` → `dist/index.js`

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run check`
   - Verify all dependencies: `npm install`
   - Test build locally: `npm run build:vercel`

2. **Environment Variable Issues**
   - Use the validation script: `npm run validate:env`
   - Check Vercel dashboard environment variables
   - Ensure JSON format for Firebase credentials

3. **Database Connection Issues**
   - Test connection string locally
   - Check firewall settings
   - Verify SSL requirements

4. **Firebase Authentication Issues**
   - Enable Email/Password auth in Firebase Console
   - Check Firebase project ID matches
   - Verify service account permissions

5. **Static File Issues**
   - Check `dist/public/` contains all assets
   - Verify paths in production
   - Check Vercel function logs

### Debugging Commands
```bash
# Test build locally
npm run build:vercel

# Validate environment
npm run validate:env

# Check for TypeScript errors
npm run check

# Test Vercel deployment locally
vercel dev
```

## 📊 Performance Optimizations

### Bundle Size Warnings ⚠️
The build shows a large chunk (775KB). Consider:

1. **Code Splitting**: Use dynamic imports for large components
2. **Tree Shaking**: Remove unused Firebase modules
3. **Manual Chunks**: Configure Rollup to split vendor libraries

### Suggested Optimizations
```typescript
// Example: Dynamic import for large components
const MovieDetail = lazy(() => import('./pages/MovieDetail'));

// Example: Selective Firebase imports
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Instead of importing entire firebase
```

## ✅ Post-Deployment

1. **Test Core Features**
   - [ ] Homepage loads correctly
   - [ ] User registration works
   - [ ] User login works
   - [ ] Movie browsing works
   - [ ] Search functionality works

2. **Monitor Performance**
   - [ ] Check Vercel function execution time
   - [ ] Monitor database connection usage
   - [ ] Watch for Firebase quota limits

3. **Set up Monitoring**
   - [ ] Enable Vercel Analytics
   - [ ] Set up error tracking (e.g., Sentry)
   - [ ] Monitor Firebase usage

---

## 🎯 Quick Deployment

If everything is configured correctly:

```bash
# 1. Final build test
npm run build:vercel

# 2. Validate environment
npm run validate:env

# 3. Deploy to Vercel
vercel --prod
```

Your Netflix clone will be live on Vercel! 🎬
