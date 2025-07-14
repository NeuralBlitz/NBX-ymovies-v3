# 🆓 FREE Netflix Clone Deployment Guide

## 🎯 **100% FREE DEPLOYMENT PLAN**

### **FREE PLATFORMS:**
- **Main App**: Vercel (Free forever - 100GB bandwidth/month)
- **Recommendation Service**: Render (Free - 750 hours/month, sleeps after 15min idle)
- **Database**: Neon (Free - 500MB storage, already configured)
- **Authentication**: Firebase (Free - 50,000 monthly active users)

---

## 🚀 **STEP 1: Deploy Recommendation Service to Render (FREE)**

### **1.1 Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (100% free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select your repository → Choose `recommendation_service` folder

### **1.2 Configure Render Deployment**
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
- **Instance Type**: `Free` (this is important!)

### **1.3 Set Environment Variables in Render**
Add these in Render dashboard:
```
TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
PORT=10000
FLASK_ENV=production
```

### **1.4 Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Copy your service URL: `https://your-service-name.onrender.com`

---

## 🚀 **STEP 2: Deploy Main App to Vercel (FREE)**

### **2.1 Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (100% free)
3. Click "New Project"
4. Import your Netflix Clone repository

### **2.2 Configure Vercel Project**
- **Framework Preset**: Other
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### **2.3 Set Environment Variables in Vercel**
Copy these to Vercel dashboard (replace RENDER_URL with your actual Render URL):

```bash
# Database (FREE Neon)
DATABASE_URL=postgresql://netflix-clone_owner:npg_NihPGdF2sLj4@ep-blue-thunder-a4mntkkz-pooler.us-east-1.aws.neon.tech/netflix-clone?sslmode=require

# TMDB API (FREE)
TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI
VITE_TMDB_API_KEY_V3=e28104677eeb4d67bd476af5d0ed9ad6

# Firebase (FREE)
FIREBASE_PROJECT_ID=ymovies-e4cb4
FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com
FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc

# Firebase Client (FREE)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ymovies-e4cb4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ymovies-e4cb4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=658873153268
NEXT_PUBLIC_FIREBASE_APP_ID=1:658873153268:web:170cb70584bcab36bb10a1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L72SBYCRZ7

# Production
NODE_ENV=production
USE_DEMO_SERVER=false
VITE_USE_DEMO_SERVER=false

# Render Service URL (UPDATE THIS!)
RECOMMENDATION_SERVICE_URL=https://your-service-name.onrender.com

# Firebase Admin
FIREBASE_ADMIN_CREDENTIALS=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAieW1vdmllcy1lNGNiNCIsCiAgInByaXZhdGVfa2V5X2lkIjogImYwOTA0NjA3MTQiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU21BZ0VBQW9JQkFRQytYcTJWWVNzV1xuQ2hGNVRxWWRZVCsyUFpVRmpOK253K0wrSTZNVnFRb01QRTF4blVQc1R3UndHZzhJME1mSERsZjBEeGhVXG4zNTVrU3g1LzJ6Y2NaWkNBZEY4K2c4RjFsUG1jTmJuU1BpUlIvMzRtNUwxaUpsWi9sQ3JHUEdBZm1DblxuczJPNTFrTkdwcmRrWWNZN1ptRkVtSjI0QUJYZ0Q2VGZ3RGhRbGNaQUZXZGFKNjZwRTZNT2dMWUhIQ0pcbkRIS2VZaE9UYUVEZitZUWNJREpNWWZhTU5LUXljOTNrQU9IeGhKN1hveWZqYzU0ZlI2YzFuUW9zWDdVQ3lcbjZrOFB1OWRyRk1POFNUZGRKUVRwaUJNT3crOFJyaWJGOE5nR2pyMTU2WHFxOWgzOUpqUy85Mlk1RTYyXG5lYjlEcEtSNFI1Wks2cnBCSmVBQ3J5cXpBZ01CQUFFQ2dnRUFiNi9vRXhQdCs3ZWZrd0ZNQnM5WnJ0N1RcbnNmRWhEb1M0eXZTQmJUOEFFK2xYc2JwOEtGa3JRZm43UGRUdVJtRWNGTE9hUlgxY2dJNWRrMDdxOFpLXG5OWW9KMHh1YSsxbmUxVFZPU2c0ZVJnNGV0Z1k4VGdSNGVlVStFdDBpOXVWN3JhVG16WHFraE9rV2lZNVxuNWRQUU5aWGJCQVNSYUhEVVFIMWxVSU9TblVHZTA5T05nT2czZkI3YUFMUzEyL2U3a2Y4ZkQxRGJiUUEzXG5zak1tZkl0L0hLeVJDMFQzckNFQUJoT3kvZnhvSE5zRmN2NmlCYUpLUE1YYzFZOExKNHlYNXZ5WmQ3NlxuOE9LTzF1MDh6U1JhUW9Yb0hKVmhVbEJvWGl0VFI4ZXhieHVzRkRFUTA3MTQrQWRhVXNlUVFqS1pCbGJsXG5scWpNSGNOQW8rM1FLQmdRQzl0cWNhSElSdkdCOXhRTVB0UFNOd2ZLWWcza3FmS1pCOXZsbW5UMHlZYlxuek03emVNbWs4YUwxaDFpaUV0cFJKUHJ5aG5zTytQL0VFU3BlMGhjVWUyYmNKMGVLTUxwcCthaTFqVGszXG4zV1Y4czl1TVNwS2REUkU2SnJ5SWM1YktzdE1NTEI5a1JLMU0wbWxqN1czV2tENnNUSEhxeXJ6ZGJDM0hcbnBKUUJ5UTdRd0tCZ1FDN2JCM25DZGd1ZFpRTUxSbHZMTmFOOGdFWDZmRGZGUlFiOWdJd3BZbFBPZFhWXG40U1dKUUx4OU1MUHpXMlhOT2ZqN3htL0lJWE5YcEJXWFM4ZU9BcDlKOWdmeVNBNGVXOCswdStQSE8xXG43NXJsUk5tbFppTjIrUkk3Zng4Z2VyTlJyMXZuOG53dkZHdkV5OUVFN1V1SlVoRVJUa21jMDUzVUdpbVxueWR0VUhCQm53S0JnRmkwOUtvb3ZwSDVpY1JvZTVLRHNJQ3BpWGI3WkRhS0VtU0tJdW9qN0Y2Q29sOUlcbnN1N1gvYnA3cWNqUTk5cGZmUGlYblM5aE5LT29MN3JwQnRKdk1wbDdFeEorNDU3V1BMcFdZTUhLdkQ1XG5qTkhGMVowQnFycjZjdGNaa2tFRm1OUGwvVW9qOWJHRmNjKzJIaHB4M3pyYjl6UnRZU21zOFpWMjNoT1xuUElPa2JGRGJBb0dCQUt6YWIxOC9sbjhRRGF1R0VHQ1ZoUkl6RFYzbklSaWRTNU1VbGkzTVpzQWJheW9cblNiN2c2Q2ZHd1NoUGFOMGNSeDRUV1BDbUdEbDFxME9JUWFGd21GRVBDbGdJZitNcXV3Zk50dXFmTmszXG5GdDF0azQ2UGRyNU9rYXMzdStyVEpGSkFDMUFrQ2F0YlpJR1orSEFMMzUwYVdaZVVXSGVXeGVJYitUV1RcbklvTGZBb0dCQUt6dFluQlh0ZlFuOUREcE41UG41WEZHZ1I1dkF3anI5KzNPSU1HOG9pb0ppSTEvSGpVXG5DTGpURG1ZZU1nOUt1UDNnMDNVcUR6Um9vYXgzRlRySldRTk1qQThHczNMeHB1c2k1K0tWYm9kc3JKemdcbkdmT1FXMHE3ZXdENnhrMWNyeGRWWEJ5WjlHTWtqRUwzM3hSVGJGSjVqZkJPZ055VlhRK2RQN0VJNnNnclxudHA0OHQ4Q0Q5Vk1zREM2QUozSFpGdTM2VldCYU1Sb1E2OE1sbEQyS1pHQT09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAeW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDg3NTA3MDM1NDIxNTMzMjk0MzciLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQweW1vdmllcy1lNGNiNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=
```

### **2.4 Deploy**
- Click "Deploy"
- Wait 3-5 minutes
- Your app will be live at `https://your-app-name.vercel.app`

---

## 🔧 **STEP 3: Optimize for Free Tier Limits**

### **3.1 Handle Render Sleep (Free Tier)**
Render free services sleep after 15 minutes of inactivity. Let's add a keep-alive mechanism:

Add this to your main app to prevent recommendation service from sleeping:

### **3.2 Update Firebase Settings**
1. Go to Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `your-app-name.vercel.app`
   - `your-service-name.onrender.com`

---

## 📊 **FREE TIER LIMITS**

| Service | Free Limits | Notes |
|---------|-------------|--------|
| **Vercel** | 100GB bandwidth/month | More than enough |
| **Render** | 750 hours/month | Sleeps after 15min idle |
| **Neon DB** | 500MB storage | Perfect for demo |
| **Firebase** | 50k monthly users | Very generous |
| **TMDB API** | 40 requests/10sec | More than enough |

---

## 🎯 **QUICK START COMMANDS**

```bash
# Test locally first
npm run dev

# Build for production
npm run build:vercel

# Test recommendation service
cd recommendation_service
python app.py
```

---

## 🆓 **100% FREE FEATURES INCLUDED**

✅ User Authentication (Firebase)  
✅ Movie Database (TMDB API)  
✅ Personalized Recommendations (Python ML)  
✅ User Watchlists & Favorites  
✅ Responsive Design  
✅ Real-time Database (Neon PostgreSQL)  

---

## 🚨 **IMPORTANT NOTES**

1. **Render Sleep**: Free services sleep after 15min. First request after sleep takes ~30 seconds to wake up.

2. **Cold Starts**: Both Vercel and Render have cold starts, but they're usually under 3 seconds.

3. **Storage**: Neon free tier gives 500MB - enough for thousands of users.

4. **Traffic**: Vercel free tier handles 100GB/month - perfect for personal/portfolio projects.

---

## 🎉 **RESULT**

Your Netflix Clone will be **100% FREE** and fully functional:
- **Main App**: `https://your-app.vercel.app`
- **API Service**: `https://your-service.onrender.com`

**Total Cost: $0.00/month** 💰

**Perfect for portfolios, demos, and learning!** 🚀
