# 🚀 Netflix Clone Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Quiz functionality completely removed
- [x] TypeScript compilation errors fixed  
- [x] Python recommendation service syntax fixed
- [x] Environment variables configured
- [x] Build scripts tested

## 🔥 **DEPLOYMENT STEPS**

### **STEP 1: Deploy Python Recommendation Service to Railway**

1. **Go to Railway**: Visit [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Select your repository** → Choose the `recommendation_service` folder
5. **Set Environment Variables** in Railway dashboard:
   - `TMDB_API_KEY` = `e28104677eeb4d67bd476af5d0ed9ad6`
   - `PORT` = `5100` (Railway will override this automatically)
6. **Deploy** - Railway will auto-detect Python and use your `requirements.txt`
7. **Copy the URL** - Will be like `https://your-service-name.railway.app`

### **STEP 2: Update Recommendation Service URL**

Once Railway gives you the URL, update these files:
- `.env.production` → Replace `RECOMMENDATION_SERVICE_URL`
- In the Vercel environment variables (Step 3)

### **STEP 3: Deploy Main App to Vercel**

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Sign up** with GitHub  
3. **New Project** → Import your Netflix Clone repository
4. **Configure Project**:
   - Framework Preset: **Other**
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

5. **Set Environment Variables** in Vercel dashboard:

```bash
# Database
DATABASE_URL=postgresql://netflix-clone_owner:npg_NihPGdF2sLj4@ep-blue-thunder-a4mntkkz-pooler.us-east-1.aws.neon.tech/netflix-clone?sslmode=require

# TMDB API
TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI
VITE_TMDB_API_KEY_V3=e28104677eeb4d67bd476af5d0ed9ad6

# Firebase Server-side
FIREBASE_PROJECT_ID=ymovies-e4cb4
FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com  
FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc

# Firebase Client-side
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ymovies-e4cb4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ymovies-e4cb4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=658873153268
NEXT_PUBLIC_FIREBASE_APP_ID=1:658873153268:web:170cb70584bcab36bb10a1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L72SBYCRZ7

# Production Settings
NODE_ENV=production
USE_DEMO_SERVER=false
VITE_USE_DEMO_SERVER=false

# Recommendation Service (UPDATE WITH YOUR RAILWAY URL!)
RECOMMENDATION_SERVICE_URL=https://your-recommendation-service.railway.app

# Firebase Admin (Base64 encoded service account)
FIREBASE_ADMIN_CREDENTIALS=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAieW1vdmllcy1lNGNiNCIsCiAgInByaXZhdGVfa2V5X2lkIjogImYwOTA0NjA3MTQiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU21BZ0VBQW9JQkFRQytYcTJWWVNzV1xuQ2hGNVRxWWRZVCsyUFpVRmpOK253K0wrSTZNVnFRb01QRTF4blVQc1R3UndHZzhJME1mSERsZjBEeGhVXG4zNTVrU3g1LzJ6Y2NaWkNBZEY4K2c4RjFsUG1jTmJuU1BpUlIvMzRtNUwxaUpsWi9sQ3JHUEdBZm1DblxuczJPNTFrTkdwcmRrWWNZN1ptRkVtSjI0QUJYZ0Q2VGZ3RGhRbGNaQUZXZGFKNjZwRTZNT2dMWUhIQ0pcbkRIS2VZaE9UYUVEZitZUWNJREpNWWZhTU5LUXljOTNrQU9IeGhKN1hveWZqYzU0ZlI2YzFuUW9zWDdVQ3lcbjZrOFB1OWRyRk1POFNUZGRKUVRwaUJNT3crOFJyaWJGOE5nR2pyMTU2WHFxOWgzOUpqUy85Mlk1RTYyXG5lYjlEcEtSNFI1Wks2cnBCSmVBQ3J5cXpBZ01CQUFFQ2dnRUFiNi9vRXhQdCs3ZWZrd0ZNQnM5WnJ0N1RcbnNmRWhEb1M0eXZTQmJUOEFFK2xYc2JwOEtGa3JRZm43UGRUdVJtRWNGTE9hUlgxY2dJNWRrMDdxOFpLXG5OWW9KMHh1YSsxbmUxVFZPU2c0ZVJnNGV0Z1k4VGdSNGVlVStFdDBpOXVWN3JhVG16WHFraE9rV2lZNVxuNWRQUU5aWGJCQVNSYUhEVVFIMWxVSU9TblVHZTA5T05nT2czZkI3YUFMUzEyL2U3a2Y4ZkQxRGJiUUEzXG5zak1tZkl0L0hLeVJDMFQzckNFQUJoT3kvZnhvSE5zRmN2NmlCYUpLUE1YYzFZOExKNHlYNXZ5WmQ3NlxuOE9LTzF1MDh6U1JhUW9Yb0hKVmhVbEJvWGl0VFI4ZXhieHVzRkRFUTA3MTQrQWRhVXNlUVFqS1pCbGJsXG5scWpNSGNOQW8rM1FLQmdRQzl0cWNhSElSdkdCOXhRTVB0UFNOd2ZLWWcza3FmS1pCOXZsbW5UMHlZYlxuek03emVNbWs4YUwxaDFpaUV0cFJKUHJ5aG5zTytQL0VFU3BlMGhjVWUyYmNKMGVLTUxwcCthaTFqVGszXG4zV1Y4czl1TVNwS2REUkU2SnJ5SWM1YktzdE1NTEI5a1JLMU0wbWxqN1czV2tENnNUSEhxeXJ6ZGJDM0hcbnBKUUJ5UTdRd0tCZ1FDN2JCM25DZGd1ZFpRTUxSbHZMTmFOOGdFWDZmRGZGUlFiOWdJd3BZbFBPZFhWXG40U1dKUUx4OU1MUHpXMlhOT2ZqN3htL0lJWE5YcEJXWFM4ZU9BcDlKOWdmeVNBNGVXOCswdStQSE8xXG43NXJsUk5tbFppTjIrUkk3Zng4Z2VyTlJyMXZuOG53dkZHdkV5OEVFN1V1SlVoRVJUa21jMDUzVUdpbVxueWR0VUhCQm53S0JnRmkwOUtvb3ZwSDVpY1JvZTVLRHNJQ3BpWGI3WkRhS0VtU0tJdW9qN0Y2Q29sOUlcbnN1N1gvYnA3cWNqUTk5cGZmUGlYblM5aE5LT29MN3JwQnRKdk1wbDdFeEorNDU3V1BMcFdZTUhLdkQ1XG5qTkhGMVowQnFycjZjdGNaa2tFRm1OUGwvVW9qOWJHRmNjKzJIaHB4M3pyYjl6UnRZU21zOFpWMjNoT1xuUElPa2JGRGJBb0dCQUt6YWIxOC9sbjhRRGF1R0VHQ1ZoUkl6RFYzbklSaWRTNU1VbGkzTVpzQWJheW9cblNiN2c2Q2ZHd1NoUGFOMGNSeDRUV1BDbUdEbDFxME9JUWFGd21GRVBDbGdJZitNcXV3Zk50dXFmTmszXG5GdDF0azQ2UGRyNU9rYXMzdStyVEpGSkFDMUFrQ2F0YlpJR1orSEFMMzUwYVdaZVVXSGVXeGVJYitUV1RcbklvTGZBb0dCQUt6dFluQlh0ZlFuOUREcE41UG41WEZHZ1I1dkF3anI5KzNPSU1HOG9pb0ppSTEvSGpVXG5DTGpURG1ZZU1nOUt1UDNnMDNVcUR6Um9vYXgzRlRySldRTk1qQThHczNMeHB1c2k1K0tWYm9kc3JKemdcbkdmT1FXMHE3ZXdENnhrMWNyeGRWWEJ5WjlHTWtqRUwzM3hSVGJGSjVqZkJPZ055VlhRK2RQN0VJNnNnclxudHA0OHQ4Q0Q5Vk1zREM2QUozSFpGdTM2VldCYU1Sb1E2OE1sbEQyS1pHQT09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAeW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDg3NTA3MDM1NDIxNTMzMjk0MzciLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQweW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=
```

6. **Deploy** - Vercel will build and deploy automatically

### **STEP 4: Test Your Deployment**

After both services are deployed:

1. **Test Recommendation Service**: 
   - Visit `https://your-service.railway.app/health`
   - Should return JSON with service status

2. **Test Main App**:
   - Visit `https://your-app.vercel.app`
   - Sign up/Login with Firebase
   - Browse movies and test recommendations
   - Check that personalized recommendations work

### **STEP 5: Final Configurations**

1. **Update CORS in recommendation service** (if needed):
   - Railway dashboard → Variables → Add:
   - `CORS_ORIGINS` = `https://your-app.vercel.app`

2. **Firebase Configuration**:
   - Add your Vercel domain to Firebase Auth authorized domains
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add: `your-app.vercel.app`

## 🎉 **YOU'RE LIVE!**

Your Netflix Clone is now live on:
- **Main App**: `https://your-app-name.vercel.app`  
- **Recommendation API**: `https://your-service.railway.app`

## 🔧 **Troubleshooting**

### Common Issues:

1. **Build Fails on Vercel**:
   - Check all environment variables are set
   - Verify `FIREBASE_ADMIN_CREDENTIALS` is properly encoded
   - Check Vercel function logs

2. **Authentication Issues**:
   - Verify Firebase domain is authorized
   - Check Firebase config variables

3. **Recommendations Not Loading**:
   - Test Railway service `/health` endpoint
   - Verify `RECOMMENDATION_SERVICE_URL` is correct
   - Check Network tab for CORS errors

4. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Check Neon database is accessible

### Debug Commands:

```bash
# Test recommendation service locally
cd recommendation_service && python app.py

# Test main app locally  
npm run dev

# Check build locally
npm run build:vercel
```

## 🚀 **Performance Tips**

1. **Railway**: 
   - Use Railway's built-in metrics to monitor performance
   - Scale to higher memory if needed

2. **Vercel**:
   - Monitor function execution time
   - Use Vercel Analytics for user insights

3. **Database**:
   - Monitor Neon database usage
   - Consider connection pooling for high traffic

**Congratulations! Your Netflix Clone is now deployed and ready for users! 🎬✨**
