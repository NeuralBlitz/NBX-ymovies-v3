# Vercel Deployment Guide

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables
```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_API_KEY=your_tmdb_api_key

# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CREDENTIALS={"type":"service_account","project_id":"..."}

# Session
SESSION_SECRET=your_random_session_secret

# Production Settings
NODE_ENV=production
```

## Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Important Notes

### Firebase Admin Credentials
- **NEVER** commit the Firebase service account JSON file to your repository
- Use environment variables to store Firebase credentials securely
- The `FIREBASE_ADMIN_CREDENTIALS` should be the entire JSON content as a string

### Database
- Make sure your PostgreSQL database is accessible from Vercel
- Use connection pooling for better performance
- Consider using Vercel Postgres or Neon for managed databases

### Environment Setup
- Copy `.env.example` to create your local `.env` file
- Set environment variables in Vercel dashboard for production
- Use different values for development and production

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles without errors
- Verify environment variables are set correctly

### Runtime Errors
- Check Vercel function logs for detailed error messages
- Ensure database connections are working
- Verify Firebase configuration is correct

### Static Files
- Make sure `dist/public` contains all built assets
- Check that paths are correct in production

## Security Checklist

- [ ] Firebase service account file is NOT committed
- [ ] Environment variables are set in Vercel dashboard
- [ ] Database credentials are secure
- [ ] Session secret is randomly generated
- [ ] CORS is properly configured
- [ ] API keys are not exposed in client code
