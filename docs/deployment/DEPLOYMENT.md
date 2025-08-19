# 🚀 Deployment Guide - Going Live with Your Netflix Clone

Ready to share your YMovies with the world? This guide covers everything you need to deploy your application to production using modern cloud platforms.

## 🎯 Deployment Overview

Our YMovies can be deployed in several ways:
- **Vercel** (Recommended) - Easy deployment for full-stack apps
- **Netlify + Railway** - Frontend on Netlify, backend on Railway
- **AWS/Google Cloud** - For enterprise-scale deployments
- **Docker** - Containerized deployment anywhere

## 🌟 Recommended: Vercel Deployment

Vercel is perfect for this project because it handles both frontend and serverless functions seamlessly.

### Prerequisites
- Vercel account (free) - [Sign up here](https://vercel.com/signup)
- GitHub repository with your code
- Production database (we'll set this up)

### Step 1: Prepare Your Database

#### Option A: Vercel Postgres (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create netflix-clone-db
```

#### Option B: External Provider
Popular options:
- **Supabase** - Free tier, PostgreSQL-based
- **PlanetScale** - MySQL-compatible, generous free tier
- **Railway** - Simple PostgreSQL hosting
- **AWS RDS** - Enterprise-grade but requires more setup

For Supabase:
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database

### Step 2: Environment Variables

Create production environment variables in Vercel:

```bash
# Using Vercel CLI
vercel env add DATABASE_URL
# Paste your production database URL

vercel env add TMDB_API_KEY
# Paste your TMDB API key

vercel env add FIREBASE_PROJECT_ID
# Your Firebase project ID

vercel env add FIREBASE_PRIVATE_KEY
# Your Firebase private key (keep quotes!)

vercel env add FIREBASE_CLIENT_EMAIL
# Your Firebase client email
```

Or use the Vercel dashboard:
1. Go to your project settings
2. Environment Variables section
3. Add each variable

### Step 3: Configure Vercel

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/**/*",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 4: Update Package.json

Add build scripts for Vercel:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && tsc",
    "vercel-build": "npm run build"
  }
}
```

### Step 5: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repo for auto-deploys
# 1. Push code to GitHub
# 2. Import repo in Vercel dashboard
# 3. Configure build settings
# 4. Deploy!
```

## 🛠️ Alternative: Netlify + Railway

### Frontend on Netlify

1. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build:client"
     publish = "client/dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend.railway.app/api/:splat"
     status = 200
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build:client`
   - Set publish directory: `client/dist`

### Backend on Railway

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway create netflix-clone-api
   railway connect
   railway up
   ```

2. **Add Database**
   - Add PostgreSQL plugin in Railway dashboard
   - Copy connection string to environment variables

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend /app/dist ./server
COPY --from=backend /app/node_modules ./node_modules

# Copy frontend
COPY --from=frontend /app/dist ./client

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server/index.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/netflix_clone
      - TMDB_API_KEY=${TMDB_API_KEY}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=netflix_clone
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and run locally
docker-compose up --build

# Deploy to any Docker host
docker build -t netflix-clone .
docker run -p 3000:3000 netflix-clone
```

## ☁️ Cloud Provider Deployments

### AWS Deployment

#### Using AWS Amplify + RDS

1. **Setup RDS Database**
   ```bash
   # Create RDS PostgreSQL instance
   aws rds create-db-instance \
     --db-instance-identifier netflix-clone-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username postgres \
     --master-user-password your-password \
     --allocated-storage 20
   ```

2. **Deploy with Amplify**
   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli
   
   # Initialize project
   amplify init
   amplify add hosting
   amplify publish
   ```

#### Using Elastic Beanstalk

1. **Create application package**
   ```bash
   # Create deployment package
   zip -r netflix-clone.zip . -x "node_modules/*" ".git/*"
   ```

2. **Deploy**
   - Upload zip to Elastic Beanstalk
   - Configure environment variables
   - Deploy!

### Google Cloud Platform

#### Using App Engine

```yaml
# app.yaml
runtime: nodejs18

env_variables:
  DATABASE_URL: "your-database-url"
  TMDB_API_KEY: "your-api-key"
  FIREBASE_PROJECT_ID: "your-project-id"

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

```bash
# Deploy to App Engine
gcloud app deploy
```

## 🔒 Production Considerations

### Security Checklist

- [ ] **HTTPS Enabled** - All production deployments should use SSL
- [ ] **Environment Variables** - Never commit secrets to code
- [ ] **Database Security** - Use connection pooling and SSL
- [ ] **API Rate Limiting** - Prevent abuse
- [ ] **CORS Configuration** - Restrict origins appropriately
- [ ] **Input Validation** - Sanitize all user inputs

### Performance Optimization

#### Database
```sql
-- Add indexes for better performance
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_movie_id ON watch_history(movie_id);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
```

#### Caching
```typescript
// Add Redis for caching recommendations
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache recommendations for 1 hour
await redis.setex(`recs:${userId}`, 3600, JSON.stringify(recommendations));
```

#### CDN Setup
```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || '';

export const getImageUrl = (path) => {
  return `${CDN_URL}/images${path}`;
};
```

### Monitoring & Analytics

#### Error Tracking
```bash
# Add Sentry for error tracking
npm install @sentry/node @sentry/react
```

#### Performance Monitoring
```javascript
// Add performance monitoring
import { performance } from 'perf_hooks';

const startTime = performance.now();
// ... your code ...
const duration = performance.now() - startTime;
console.log(`Recommendation generation took ${duration}ms`);
```

### Environment-Specific Configuration

```typescript
// config/production.ts
export const productionConfig = {
  database: {
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 1000,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};
```

## 📊 Post-Deployment

### Domain Setup

1. **Purchase Domain** (optional)
   - Namecheap, GoDaddy, or Google Domains

2. **Configure DNS**
   ```
   # Add CNAME record
   CNAME  www  your-app.vercel.app
   
   # Add A record for root domain
   A      @    76.76.21.21
   ```

### SSL Certificate

Most platforms (Vercel, Netlify) provide free SSL automatically. For custom setups:

```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Analytics & Monitoring

#### Google Analytics
```html
<!-- Add to your index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Application Monitoring
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
  });
});
```

## 🚀 Continuous Deployment

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Database Scaling
- **Read Replicas** - For high read traffic
- **Connection Pooling** - Manage database connections efficiently
- **Caching Layer** - Redis for frequently accessed data

### Application Scaling
- **Horizontal Scaling** - Multiple server instances
- **Load Balancing** - Distribute traffic
- **Microservices** - Split into smaller services

### Cost Optimization
- **Cold Start Optimization** - For serverless functions
- **Efficient Queries** - Optimize database operations
- **Resource Monitoring** - Track usage and costs

---

Congratulations! 🎉 Your YMovies is now live and ready for users. Remember to monitor performance, gather user feedback, and iterate on your features!
