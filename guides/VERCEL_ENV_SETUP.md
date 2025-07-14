# Environment Variables for Vercel Deployment

## Copy this to your Vercel Dashboard Environment Variables

### Database
```
DATABASE_URL = postgresql://your_db_connection_string
```

### TMDB API (The Movie Database)
```
TMDB_API_KEY = your_tmdb_api_key_here
VITE_TMDB_API_KEY = your_tmdb_api_key_here
TMDB_API_KEY_V3 = your_tmdb_v3_api_key_here
VITE_TMDB_API_KEY_V3 = your_tmdb_v3_api_key_here
```

### Firebase Client Configuration (Public - Safe to expose)
```
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = your_measurement_id
```

### Firebase Admin (Server-side - KEEP SECRET)
```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_ADMIN_CREDENTIALS = {"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### Session & Security
```
SESSION_SECRET = generate_a_random_32_character_string_here
NODE_ENV = production
```

### Optional (Recommendation Service)
```
RECOMMENDATION_SERVICE_URL = https://your-recommendation-service-url.com
VITE_USE_DEMO_SERVER = false
```

## Important Notes:

1. **FIREBASE_ADMIN_CREDENTIALS**: This should be the ENTIRE content of your Firebase service account JSON file as a single line string.

2. **How to get Firebase Admin Credentials**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy the entire JSON content and paste it as the value for FIREBASE_ADMIN_CREDENTIALS

3. **Session Secret**: Generate a random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Database**: Use a managed PostgreSQL service like:
   - Vercel Postgres
   - Neon
   - Supabase
   - PlanetScale (if migrating to MySQL)

## Vercel CLI Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Set environment variables via CLI:
   ```bash
   vercel env add DATABASE_URL
   vercel env add FIREBASE_ADMIN_CREDENTIALS
   # ... repeat for all variables
   ```

3. Or use the Vercel Dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add each variable with appropriate scope (Production, Preview, Development)
