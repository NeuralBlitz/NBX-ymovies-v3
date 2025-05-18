# Environment Variables Setup

This project uses environment variables to configure API keys and other settings.

## Setting up your environment

1. Copy `client/public/env.example.js` to `client/public/env.js`
2. Fill in your own values for:
   - TMDB API Keys (for movie data)
   - Firebase Configuration (for authentication)

```bash
cp client/public/env.example.js client/public/env.js
# Then edit env.js with your API keys
```

## Security Notes

- The `env.js` file is in `.gitignore` and should NEVER be committed to your repository
- If you accidentally committed API keys to a public repository, rotate those keys immediately
- For production, consider using a more secure method of handling environment variables

## Getting API Keys

### TMDB API
1. Create an account at [TMDB](https://www.themoviedb.org)
2. Go to Settings > API and request an API key
3. Use both the JWT Bearer token and the V3 API key in your env.js file

### Firebase
1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and select the providers you want to use
3. Go to Project Settings to find your Firebase configuration
4. Copy the values into your env.js file
