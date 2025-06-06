# 🚀 Quick Start Guide - Get Running in 5 Minutes

Ready to see this Netflix-style recommendation system in action? This guide will get you up and running quickly!

## 🏃‍♂️ Prerequisites

Before we start, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **A TMDB API Key** - [Get one free here](https://www.themoviedb.org/settings/api)
- **Firebase Project** - [Create one here](https://console.firebase.google.com/)

## 📦 Step 1: Get the Code

```bash
# Clone the repository
git clone [your-repo-url]
cd NetflixClone

# Install dependencies
npm install
```

## 🔧 Step 2: Environment Setup

Copy the example environment file and fill in your details:

```bash
# Copy the example file
cp .env.example .env
```

Now edit `.env` with your credentials:

```env
# TMDB API (Required)
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# Database (Required)
DATABASE_URL=your_postgresql_connection_string

# Firebase (Required for auth)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Application
PORT=3000
NODE_ENV=development
```

### 🔑 Getting Your API Keys

#### TMDB API Key
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account (it's free!)
3. Go to Settings → API
4. Request an API key (choose "Developer")
5. Copy your API key to the `.env` file

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Sign-in method → Email/Password
4. Go to Project Settings → Service Accounts
5. Generate a new private key
6. Copy the details to your `.env` file

## 🗄️ Step 3: Database Setup

Set up your PostgreSQL database:

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

## 🚀 Step 4: Start the Application

```bash
# Start the development server
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🎬 Step 5: Test the Recommendations

1. **Sign up** for a new account
2. **Browse movies** and add some to your watchlist
3. **Watch a few movies** (you can simulate this by clicking on movies)
4. **Rate some movies** to help the AI learn your preferences
5. **Check out the "For You" section** to see personalized recommendations!

## 🔍 What You Should See

Once everything is running, you'll see:

### 🏠 Homepage
- Beautiful Netflix-style interface
- Movie carousels and categories
- Search functionality
- Trending and popular movies

### 🎯 Personalized Recommendations
As you interact with the app, you'll start seeing:
- "Continue Watching" for partially watched movies
- "Because You Watched X" sections
- "Top Picks for You" based on your preferences
- Seasonal and mood-based recommendations

### 🎬 Movie Details
- Rich movie information from TMDB
- Trailers and cast information
- Rating and watchlist functionality
- Similar movie suggestions

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database operations
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
npm run db:seed       # Add sample data

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

#### "TMDB API Error"
- Check your TMDB API key in `.env`
- Make sure the key is active and has the right permissions

#### "Database Connection Error"
- Verify your `DATABASE_URL` is correct
- Make sure PostgreSQL is running
- Check that the database exists

#### "Firebase Auth Error"
- Verify your Firebase credentials in `.env`
- Make sure Authentication is enabled in Firebase Console
- Check that the service account has the right permissions

#### "Port Already in Use"
- Change the `PORT` in `.env` to something else (like 3001)
- Or kill the process using that port

### Still Having Issues?

1. Check the [Environment Setup Guide](./ENVIRONMENT.md) for detailed configuration
2. Look at the [Installation Guide](./INSTALLATION.md) for step-by-step instructions
3. Check the console for error messages
4. Make sure all environment variables are set correctly

## 🎉 Next Steps

Now that you have the app running:

1. **Explore the Code** - Check out the [Architecture Guide](./ARCHITECTURE.md)
2. **Understand the AI** - Read about the [Recommendation Engine](./RECOMMENDATION_ENGINE_ENHANCEMENT.md)
3. **Deploy It** - Follow the [Deployment Guide](./DEPLOYMENT.md)
4. **Contribute** - See the [Contributing Guide](./CONTRIBUTING.md)

## 💡 Pro Tips

- **Create multiple test accounts** to see how collaborative filtering works
- **Rate movies** to get better recommendations
- **Try different times of day** to see time-based recommendations
- **Check seasonal recommendations** during holidays
- **Use the mood-based features** to find movies for different occasions

---

Enjoy exploring your new Netflix-style movie recommendation system! 🍿
