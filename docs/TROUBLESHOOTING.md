# 🔧 Troubleshooting Guide

Common issues and their solutions for the Netflix Clone application.

## 🚀 Installation & Startup Issues

### ❌ "Node.js version not supported"
**Problem**: Error about Node.js version compatibility

**Solution**:
```bash
# Check your Node.js version
node --version

# Should be 18.0.0 or higher
# If not, install the latest LTS version from nodejs.org
```

**Alternative**: Use Node Version Manager (nvm):
```bash
# Install and use Node.js 18
nvm install 18
nvm use 18
```

### ❌ "Cannot find module" errors
**Problem**: Missing dependencies after cloning

**Solution**:
```bash
# Clean install all dependencies
rm -rf node_modules package-lock.json
npm install

# For persistent issues, try clearing npm cache
npm cache clean --force
npm install
```

### ❌ "Port 3000 is already in use"
**Problem**: Development server can't start due to port conflict

**Solution**:
```bash
# Option 1: Kill the process using port 3000
npx kill-port 3000

# Option 2: Use a different port
npm run dev -- --port 3001

# Option 3: Find and kill the process manually
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### ❌ "Environment variables not found"
**Problem**: Missing or incorrect `.env.local` file

**Solution**:
1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required values**:
   ```env
   # TMDB API (required)
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   
   # Firebase (required)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   
   # Database (required)
   DATABASE_URL=your_postgresql_connection_string
   ```

3. **Restart the development server**

## 🔐 Authentication Issues

### ❌ "Firebase configuration error"
**Problem**: Firebase authentication not working

**Solution**:
1. **Check Firebase configuration**:
   - Verify all Firebase environment variables are set
   - Ensure your Firebase project is active
   - Check that Authentication is enabled in Firebase Console

2. **Verify domain authorization**:
   - In Firebase Console → Authentication → Settings → Authorized domains
   - Add `localhost` for development
   - Add your production domain when deploying

3. **Test Firebase connection**:
   ```bash
   npm run test:firebase
   ```

### ❌ "Authentication state not persisting"
**Problem**: Users get logged out on page refresh

**Solution**:
1. **Check Firebase persistence**:
   ```javascript
   // Ensure this is set in your Firebase config
   setPersistence(auth, browserLocalPersistence)
   ```

2. **Verify local storage**:
   - Open browser dev tools → Application → Local Storage
   - Check for Firebase auth tokens
   - Clear local storage and try logging in again

3. **Check for console errors** in browser dev tools

### ❌ "Sign-in methods not configured"
**Problem**: Email/password or Google sign-in not working

**Solution**:
1. **Enable sign-in methods in Firebase Console**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password and/or Google
   - Configure OAuth consent screen if using Google

2. **Check provider configuration** in your code

## 🗄️ Database Issues

### ❌ "Database connection failed"
**Problem**: Cannot connect to PostgreSQL database

**Solution**:
1. **Verify connection string**:
   ```bash
   # Test database connection
   npm run test:db
   ```

2. **Check database URL format**:
   ```env
   # Correct format
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   
   # For hosted databases (like Vercel Postgres)
   DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
   ```

3. **Ensure database exists**:
   ```sql
   -- Create database if it doesn't exist
   CREATE DATABASE netflix_clone;
   ```

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

### ❌ "Migration failed" or "Table does not exist"
**Problem**: Database schema not properly set up

**Solution**:
1. **Reset and run migrations**:
   ```bash
   # Reset database (WARNING: This will delete all data)
   npm run db:reset
   
   # Run fresh migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

2. **Check migration files** in `migrations/` directory

3. **Manual table creation** if needed:
   ```sql
   -- Check if tables exist
   \dt  -- In psql
   
   -- Or check specific table
   SELECT * FROM information_schema.tables WHERE table_name = 'users';
   ```

### ❌ "Foreign key constraint error"
**Problem**: Database operations failing due to relationship constraints

**Solution**:
1. **Check data integrity**:
   ```sql
   -- Find orphaned records
   SELECT * FROM user_ratings WHERE user_id NOT IN (SELECT id FROM users);
   ```

2. **Run database fixes**:
   ```bash
   npm run db:fix-foreign-keys
   ```

## 🎬 API Issues

### ❌ "TMDB API rate limit exceeded"
**Problem**: Too many requests to TMDB API

**Solution**:
1. **Check your API usage**:
   - TMDB allows 40 requests per 10 seconds
   - Implement request throttling in your code

2. **Use caching**:
   ```javascript
   // Cache popular movies for better performance
   const cachedMovies = localStorage.getItem('popular_movies');
   ```

3. **Wait and retry**:
   - Wait 10 seconds before making more requests
   - Implement exponential backoff in your code

### ❌ "TMDB API key invalid"
**Problem**: API key not working or expired

**Solution**:
1. **Verify API key**:
   - Check that your TMDB API key is correct
   - Test it directly: `https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY`

2. **Check API key permissions**:
   - Ensure your TMDB account is approved
   - Some endpoints require special permissions

3. **Regenerate API key** if necessary in TMDB settings

### ❌ "Network request failed"
**Problem**: API requests failing due to network issues

**Solution**:
1. **Check internet connection**

2. **Verify API endpoints**:
   ```bash
   # Test TMDB API directly
   curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"
   ```

3. **Check for CORS issues** in browser console

4. **Implement retry logic**:
   ```javascript
   const retryRequest = async (url, retries = 3) => {
     try {
       return await fetch(url);
     } catch (error) {
       if (retries > 0) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         return retryRequest(url, retries - 1);
       }
       throw error;
     }
   };
   ```

## 🤖 Recommendation Engine Issues

### ❌ "No recommendations showing"
**Problem**: Recommendation engine not working

**Solution**:
1. **Check user data**:
   ```sql
   -- Verify user has ratings/preferences
   SELECT * FROM user_ratings WHERE user_id = 'your_user_id';
   SELECT * FROM user_watchlist WHERE user_id = 'your_user_id';
   ```

2. **Seed recommendation data**:
   ```bash
   npm run seed:recommendations
   ```

3. **Debug recommendation service**:
   ```bash
   # Check recommendation service logs
   npm run dev:recommendations
   ```

4. **Minimum interaction requirement**:
   - Rate at least 5 movies
   - Add movies to watchlist
   - Browse different genres

### ❌ "Recommendation service not responding"
**Problem**: Recommendation API endpoints failing

**Solution**:
1. **Check service status**:
   ```bash
   # Test recommendation endpoint
   curl http://localhost:3001/api/recommendations/user/123
   ```

2. **Restart recommendation service**:
   ```bash
   npm run restart:recommendations
   ```

3. **Check logs for errors**:
   ```bash
   npm run logs:recommendations
   ```

## 🎨 UI/UX Issues

### ❌ "Styles not loading" or "Layout broken"
**Problem**: CSS/Tailwind styles not applied

**Solution**:
1. **Check Tailwind build**:
   ```bash
   # Rebuild Tailwind styles
   npm run build:css
   ```

2. **Clear browser cache**:
   - Press Ctrl+F5 (hard refresh)
   - Or clear cache in browser settings

3. **Verify Tailwind config**:
   ```javascript
   // Check tailwind.config.js
   module.exports = {
     content: [
       "./client/src/**/*.{js,ts,jsx,tsx}",
       "./client/index.html"
     ],
     // ...
   };
   ```

4. **Check for CSS conflicts** in browser dev tools

### ❌ "Images not loading"
**Problem**: Movie posters/backdrops not displaying

**Solution**:
1. **Check image URLs**:
   - TMDB images use: `https://image.tmdb.org/t/p/w500/image_path`
   - Verify the image path exists

2. **Check CORS settings**:
   - TMDB images should work without CORS issues
   - If using a custom image proxy, check its configuration

3. **Add image fallbacks**:
   ```javascript
   <img 
     src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
     onError={(e) => {
       e.target.src = '/placeholder-movie.jpg';
     }}
     alt={movie.title}
   />
   ```

### ❌ "Mobile layout issues"
**Problem**: App not responsive on mobile devices

**Solution**:
1. **Check viewport meta tag**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Test responsive breakpoints**:
   - Use browser dev tools device emulation
   - Test on actual devices

3. **Review Tailwind responsive classes**:
   ```javascript
   // Use responsive classes
   <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
   ```

## 🚀 Performance Issues

### ❌ "App loading slowly"
**Problem**: Poor performance and slow loading times

**Solution**:
1. **Check bundle size**:
   ```bash
   npm run analyze
   ```

2. **Optimize images**:
   - Use appropriate image sizes
   - Implement lazy loading
   - Consider using WebP format

3. **Implement code splitting**:
   ```javascript
   // Use React.lazy for component lazy loading
   const MovieDetail = React.lazy(() => import('./MovieDetail'));
   ```

4. **Check network requests**:
   - Minimize API calls
   - Implement caching
   - Use pagination for large datasets

### ❌ "Memory leaks"
**Problem**: App becomes slow over time

**Solution**:
1. **Check for memory leaks**:
   - Use browser dev tools Performance tab
   - Look for growing memory usage

2. **Clean up side effects**:
   ```javascript
   useEffect(() => {
     const interval = setInterval(() => {
       // Some repeating task
     }, 1000);
     
     // Cleanup function
     return () => clearInterval(interval);
   }, []);
   ```

3. **Avoid memory leaks in event listeners**:
   ```javascript
   useEffect(() => {
     const handleScroll = () => {
       // Handle scroll
     };
     
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
   }, []);
   ```

## 🔍 Debugging Tips

### General Debugging Steps

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API requests
3. **Check application tab** for localStorage/sessionStorage issues
4. **Use React Developer Tools** for component debugging
5. **Check server logs** for backend issues

### Useful Commands

```bash
# Check all services status
npm run status

# Run comprehensive tests
npm run test:all

# Check for common issues
npm run doctor

# Generate debug report
npm run debug:report

# Clear all caches
npm run clean:all
```

### Environment-Specific Issues

**Development**:
- Check that all environment variables are set
- Ensure development servers are running
- Verify hot reload is working

**Production**:
- Check build process completed successfully
- Verify environment variables are set in deployment platform
- Check production logs for errors

## 📞 Getting Additional Help

If these solutions don't resolve your issue:

1. **Search existing issues** on GitHub
2. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages/screenshots
   - Environment details (OS, browser, Node.js version)
   - What you've already tried

3. **Join community discussions** for real-time help

4. **Check documentation** for more detailed explanations:
   - [Installation Guide](./INSTALLATION.md)
   - [Architecture Overview](./ARCHITECTURE.md)
   - [API Documentation](./API_DOCUMENTATION.md)

---

**Still having issues?** Don't hesitate to reach out - we're here to help! 🎬
