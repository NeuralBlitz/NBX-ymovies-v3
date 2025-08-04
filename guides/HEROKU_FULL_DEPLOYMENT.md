# Netflix Clone - Full Heroku Deployment Configuration

## 🎯 Overview
Deploy the complete YMovies application on Heroku with:
- Frontend (React/Vite) served by Node.js/Express
- Backend API (Node.js/Express)  
- Recommendation Service (Python/Flask)
- Database (PostgreSQL - Heroku Postgres)

## 📁 Project Structure for Heroku
```
YMovies/
├── client/                 # React frontend
├── server/                 # Node.js backend  
├── recommendation_service/ # Python ML service
├── Procfile               # Heroku process definition
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
└── heroku-build.sh        # Custom build script
```

## ⚙️ Heroku Configuration

### 1. Buildpacks (Multi-language support)
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python
```

### 2. Environment Variables
Set these in Heroku Dashboard or CLI:

```bash
# Database
DATABASE_URL=postgresql://... # Auto-provided by Heroku Postgres

# TMDB API
TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
VITE_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9...
VITE_TMDB_API_KEY_V3=e28104677eeb4d67bd476af5d0ed9ad6

# Firebase
FIREBASE_PROJECT_ID=ymovies-e4cb4
FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com
FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgFo4DGtkKhMq5irNu-jD0gZVVYVv3cnc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ymovies-e4cb4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ymovies-e4cb4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ymovies-e4cb4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=658873153268
NEXT_PUBLIC_FIREBASE_APP_ID=1:658873153268:web:170cb70584bcab36bb10a1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L72SBYCRZ7
FIREBASE_ADMIN_CREDENTIALS=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsC...

# Heroku Settings
NODE_ENV=production
PORT=$PORT # Auto-provided by Heroku
PYTHON_PATH=/app/recommendation_service
RECOMMENDATION_SERVICE_URL=http://localhost:5100
```

## 📄 Configuration Files

### Procfile (Root level)
```
web: npm start
worker: cd recommendation_service && python app.py
```

### package.json Scripts (Updated)
```json
{
  "scripts": {
    "build": "npm run build:heroku",
    "build:heroku": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
    "start": "node dist/index.js",
    "heroku-postbuild": "npm run build:heroku && pip install -r requirements.txt"
  }
}
```

## 🚀 Deployment Steps

### 1. Heroku CLI Setup
```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create ymovies-netflixclone
```

### 2. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:mini
```

### 3. Configure Buildpacks  
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python
```

### 4. Set Environment Variables
```bash
# Set all environment variables
heroku config:set NODE_ENV=production
heroku config:set TMDB_API_KEY=e28104677eeb4d67bd476af5d0ed9ad6
# ... (set all other env vars)
```

### 5. Deploy
```bash
git add .
git commit -m "Configure for Heroku deployment"
git push heroku main
```

## ✅ Advantages of Full Heroku Deployment
- ✅ Single platform management
- ✅ Integrated PostgreSQL database
- ✅ Automatic SSL certificates
- ✅ Easy scaling options
- ✅ Built-in monitoring and logs
- ✅ Multi-language support (Node.js + Python)
- ✅ Professional domain options
