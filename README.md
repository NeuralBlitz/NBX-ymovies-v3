# YMovies - A Movie Recommendation Platform

<div align="center">
  
[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-success?style=for-the-badge)](https://ymovies.yerradouani.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**A Netflix-style movie recommendation platform with intelligent movie recommendations powered by advanced AI algorithms and modern web technologies.**

[🚀 Live Demo](https://ymovies.yerradouani.me) • [📖 Documentation](./docs) • [🐛 Issues](../../issues) • [💬 Discussions](../../discussions)

</div>

## ✨ Features

### 🎯 **Smart AI Recommendations**
- **13+ Personalized Categories** - "Continue Watching", "Because You Watched", "Hidden Gems"
- **Collaborative Filtering** - Learn from similar users' preferences  
- **Content-Based Matching** - Advanced genre, cast, and theme analysis
- **Mood-Based Suggestions** - Get recommendations based on your current mood
- **Seasonal Intelligence** - Holiday movies, summer blockbusters, trending content

### 🎬 **Rich Movie Experience**
- **Comprehensive Movie Database** - Powered by TMDB with 800,000+ movies
- **Advanced Search & Filters** - Search by title, genre, year, rating, cast
- **Detailed Movie Information** - Cast, crew, trailers, reviews, ratings
- **Watchlist & Favorites** - Save movies for later viewing
- **User Reviews & Ratings** - Community-driven content discovery

### 🔐 **User Management**
- **Firebase Authentication** - Secure login/signup with email or social providers
- **User Profiles** - Personalized dashboards and viewing history
- **Preference Learning** - AI learns from your interactions and ratings
- **Cross-Device Sync** - Seamless experience across all devices

### 📱 **Modern Interface**
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Netflix-Style UI** - Familiar and intuitive interface
- **Dark/Light Themes** - Customizable viewing experience
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Accessibility** - WCAG compliant with keyboard navigation support

## 🏗️ Architecture

### **Frontend (Vercel)**
- ⚛️ **React 18** with TypeScript for type-safe development
- 🎨 **Tailwind CSS** for responsive, utility-first styling
- 🔄 **React Query** for efficient data fetching and caching
- 🧭 **React Router** for seamless client-side navigation
- 🔒 **Firebase SDK** for authentication and real-time features

### **Backend (Heroku)**
- 🟢 **Node.js + Express** RESTful API server
- 🗄️ **PostgreSQL** with Drizzle ORM for data persistence
- 🤖 **Python Flask** microservice for ML recommendations
- 🔐 **JWT Authentication** with Firebase Admin SDK
- 🌐 **CORS Configuration** for secure cross-origin requests

### **External Services**
- 🎬 **TMDB API** - Comprehensive movie database and metadata
- 🔥 **Firebase** - Authentication, analytics, and real-time features
- 📊 **Recommendation Engine** - Custom ML algorithms for personalization

## 🚀 Quick Start

### 🎯 **One-Command Setup (Recommended)**

**New to the project? Start here:**

```bash
# Linux/Mac users
git clone https://github.com/yassnemo/ymovies-v3.git
cd ymovies-v3
chmod +x setup.sh && ./setup.sh

# Windows users
git clone https://github.com/yassnemo/ymovies-v3.git
cd ymovies-v3
setup.bat
```

This automated setup will:
- ✅ Install all dependencies
- ✅ Create your environment file
- ✅ Guide you through API key setup
- ✅ Check your system requirements

### 🚀 **Start Development**

After setup, you have options:

```bash
# Option 1: Full development (needs database setup)
npm run dev

# Option 2: Simple mode (works without database)
npm run dev:simple

# Option 3: Frontend only (for UI development)
npm run dev:client
```

**🎯 For quickest start**: Use `npm run dev:simple` - it works immediately with just TMDB API key!

### 🔑 **Required API Keys**

You'll need these to get started:

1. **TMDB API Key** (required) - [Get it free here](https://www.themoviedb.org/settings/api)
2. **Firebase Project** (for authentication) - [Setup guide](https://firebase.google.com/)
3. **Database URL** (optional) - Use `npm run dev:simple` to skip this initially

### ⚡ **Troubleshooting**

Having issues? We've got you covered:

- **Setup problems**: Check `docs/TROUBLESHOOTING.md`
- **Environment issues**: Run `node scripts/development/check-env-simple.js`
- **Still stuck**: [Create an issue](../../issues) or check our FAQ

---
```

### 2️⃣ Environment Setup

Create `.env.local` file:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual API keys
```

**Required Environment Variables:**
```env
# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/netflix_clone

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_here
```

### 3️⃣ Database Setup

```bash
# Run database migrations
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

### 4️⃣ Start Development

```bash
# Start the development server
npm run dev

# The app will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:client       # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build            # Build for production
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Database
npm run db:generate      # Generate database migrations
npm run db:push          # Apply migrations to database
npm run db:studio        # Open database management UI

# Linting & Formatting
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier

# Type Checking
npm run type-check       # Check TypeScript types
```

### 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for end-to-end testing:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # End-to-end tests only
```

## 🚀 Deployment

### **Option 1: Hybrid Deployment (Recommended)**

**Frontend**: Deploy to Vercel for fast global CDN
**Backend**: Deploy to Heroku for full-stack capabilities

```bash
# Deploy frontend to Vercel
npm run deploy:frontend

# Deploy backend to Heroku  
npm run deploy:backend
```

### **Option 2: Full Stack Deployment**

Deploy everything to a single platform:

```bash
# Deploy to Railway, Render, or DigitalOcean
npm run deploy:full-stack
```

**📖 Detailed deployment guides available in [docs/deployment](./docs/deployment)**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and **add tests**
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./docs/CODE_OF_CONDUCT.md).


## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ on all metrics
- 🚀 **First Contentful Paint**: < 1.5s
- 📱 **Mobile Responsive**: 100% compatible
- ♿ **Accessibility**: WCAG AA compliant

## 🔧 Tech Stack Details

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React 18, TypeScript | Modern, type-safe UI development |
| **Styling** | Tailwind CSS, Radix UI | Responsive design system |
| **State Management** | React Query, Zustand | Efficient data fetching and state |
| **Backend** | Node.js, Express, TypeScript | RESTful API server |
| **Database** | PostgreSQL, Drizzle ORM | Data persistence and queries |
| **Authentication** | Firebase Auth, JWT | Secure user management |
| **ML/AI** | Python, Flask, scikit-learn | Recommendation algorithms |
| **External APIs** | TMDB API | Movie data and metadata |
| **Deployment** | Vercel, Heroku | Scalable hosting solutions |
| **Monitoring** | Sentry, Analytics | Error tracking and insights |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing comprehensive movie data
- [Firebase](https://firebase.google.com/) for authentication and real-time features
- [Vercel](https://vercel.com/) for excellent frontend hosting
- [Heroku](https://heroku.com/) for reliable backend hosting
- All the amazing open-source libraries that made this possible

## 📞 Support

- 📚 **Documentation**: [docs/](./docs)
- 🐛 **Bug Reports**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: [yassine.erradouani@protonmail.com](mailto:yassine.erradouani@protonmail.com)

---

<div align="center">
**Built with ❤️ By [Yassine Erradouani](https://yerradouani.me) for movie lovers everywhere**

⭐ **Star this project if you found it helpful!**

</div>
