# System Architecture - How Everything Works Together

In this document we explain the architecture of our YMovies application, showing how all the pieces fit together to create a smooth, scalable movie recommendation platform.

## Overview

Our application follows a modern full-stack architecture with clear separation of concerns, making it maintainable, scalable, and easy to understand.
         
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │◄──►│   Backend API    │◄──►│   Database      │
│   (React)       │    │   (Node.js)      │    │   (PostgreSQL)  │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        
         │                        │                        
         ▼                        ▼                        
┌─────────────────┐    ┌──────────────────┐              
│                 │    │                  │              
│   Firebase      │    │   TMDB API       │              
│   (Auth)        │    │   (Movie Data)   │              
│                 │    │                  │              
└─────────────────┘    └──────────────────┘              
```


## Frontend Architecture (React + TypeScript)

### Technology Stack
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Key Frontend Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Lazy Loading** - Components and images load on demand
- **Error Boundaries** - Graceful error handling
- **State Management** - React Context for global state
- **Performance Optimization** - Code splitting and memoization

## Backend Architecture (Node.js + Express)

### Technology Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety on the backend
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Relational database

### API Structure
```
server/
├── routes/              # API route definitions
│   ├── auth.ts         # Authentication endpoints
│   ├── movies.ts       # Movie-related endpoints
│   ├── users.ts        # User management endpoints
│   └── recommendations.ts # Recommendation endpoints
├── services/            # Business logic
│   ├── recommendation-engine.ts # AI recommendation system
│   ├── tmdb-service.ts # TMDB API integration
│   ├── auth-service.ts # Authentication logic
│   └── storage.ts      # Database operations
├── middleware/          # Express middleware
├── utils/              # Utility functions
└── types/              # TypeScript types
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### Movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/search` - Search movies
- `GET /api/movies/:id/similar` - Get similar movies

#### Recommendations
- `GET /api/recommendations/personalized` - Get personalized recommendations
- `GET /api/recommendations/categories` - Get all recommendation categories
- `GET /api/recommendations/because-you-watched/:id` - "Because you watched" recommendations
- `GET /api/recommendations/mood/:mood` - Mood-based recommendations
- `GET /api/recommendations/seasonal` - Seasonal recommendations

#### User Data
- `GET /api/user/watchlist` - Get user's watchlist
- `POST /api/user/watchlist` - Add to watchlist
- `GET /api/user/history` - Get watch history
- `POST /api/user/history` - Update watch progress
- `POST /api/user/rating` - Rate a movie

## Database Architecture (PostgreSQL + Drizzle)

### Schema Design
Our database is designed for efficiency and scalability:

```sql
-- Users table
users (
  id: string (primary key)
  email: string (unique)
  created_at: timestamp
  updated_at: timestamp
)

-- User preferences
user_preferences (
  user_id: string (foreign key)
  liked_genres: string[]
  disliked_genres: string[]
  preferred_runtime_min: number
  preferred_runtime_max: number
)

-- Watch history
watch_history (
  id: string (primary key)
  user_id: string (foreign key)
  movie_id: number
  watch_progress: number (0-1)
  watch_count: number
  rating: number (1-5)
  watched_at: timestamp
)

-- Watchlist
watchlist (
  id: string (primary key)
  user_id: string (foreign key)
  movie_id: number
  added_at: timestamp
)
```

### Database Features
- **Foreign Key Constraints** - Data integrity
- **Indexes** - Fast query performance
- **Migrations** - Version control for schema changes
- **Connection Pooling** - Efficient database connections

## Recommendation Engine Architecture

This is the heart of our application - a sophisticated AI system that provides personalized movie suggestions.

### Core Components

#### 1. **Data Collection Layer**
```typescript
// Tracks all user interactions
interface UserInteraction {
  userId: string;
  movieId: number;
  interactionType: 'view' | 'rate' | 'watchlist' | 'watch';
  value?: number; // rating or watch progress
  timestamp: Date;
}
```

#### 2. **Analysis Engine**
- **Collaborative Filtering** - Finds users with similar tastes
- **Content-Based Filtering** - Analyzes movie attributes
- **Hybrid Approach** - Combines multiple methods

#### 3. **Recommendation Generator**
```typescript
class RecommendationEngine {
  // Main method that orchestrates all recommendations
  async getPersonalizedCategories(userId: string): Promise<Category[]>
  
  // Individual recommendation strategies
  async getCollaborativeFilteringRecs(userId: string): Promise<Movie[]>
  async getContentBasedRecs(userId: string): Promise<Movie[]>
  async getBecauseYouWatchedRecs(userId: string, movieId: number): Promise<Movie[]>
  async getMoodBasedRecs(userId: string, mood: string): Promise<Movie[]>
  async getSeasonalRecs(userId: string): Promise<Movie[]>
}
```

### Algorithms Used

#### Collaborative Filtering
1. **User Similarity Calculation**
   - Pearson Correlation
   - Cosine Similarity
   - Jaccard Similarity

2. **Recommendation Generation**
   - Find similar users
   - Recommend movies they liked
   - Weight by similarity scores

#### Content-Based Filtering
1. **Movie Analysis**
   - Genre preferences
   - Director/cast preferences
   - Rating patterns
   - Runtime preferences

2. **User Profile Building**
   - Learn from watch history
   - Analyze rating patterns
   - Track genre preferences

## External Service Integration

### TMDB API Integration
- **Movie Data** - Rich metadata for 500,000+ movies
- **Images** - High-quality posters and backdrops
- **Search** - Powerful movie search capabilities
- **Trending** - Real-time trending data

### Firebase Authentication
- **Secure Login** - Email/password authentication
- **User Management** - Profile and session management
- **Token Verification** - Secure API access

## Deployment Architecture

### Development Environment
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Vite Dev    │    │ Express     │    │ Local       │
│ Server      │◄──►│ Server      │◄──►│ PostgreSQL  │
│ :5173       │    │ :3000       │    │ :5432       │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production Environment (Vercel)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Vercel      │    │ Vercel      │    │ Hosted      │
│ Static      │◄──►│ Serverless  │◄──►│ PostgreSQL  │
│ Frontend    │    │ Functions   │    │ Database    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Data Flow

### User Action Flow
1. **User Interaction** - User watches/rates a movie
2. **Data Capture** - Frontend sends data to API
3. **Database Update** - Watch history/ratings updated
4. **Recommendation Update** - AI recalculates recommendations
5. **UI Update** - New recommendations appear in real-time

### Recommendation Generation Flow
1. **User Request** - Frontend requests recommendations
2. **Data Gathering** - Collect user history and preferences
3. **Algorithm Execution** - Run multiple recommendation algorithms
4. **Result Blending** - Combine and score recommendations
5. **Response** - Return categorized recommendations

## Security Architecture

### Authentication Security
- **Firebase JWT Tokens** - Secure, stateless authentication
- **Token Validation** - Every API request is validated
- **HTTPS Only** - All communications encrypted

### Data Security
- **Input Validation** - All inputs validated and sanitized
- **SQL Injection Prevention** - Parameterized queries only
- **Rate Limiting** - Prevent abuse of API endpoints

### Privacy
- **Data Minimization** - Only collect necessary data
- **Secure Storage** - Sensitive data encrypted
- **User Control** - Users can delete their data

## Performance Optimizations

### Frontend Performance
- **Code Splitting** - Load only what's needed
- **Image Optimization** - Lazy loading and responsive images
- **Caching** - Smart caching strategies
- **Bundle Size** - Optimized build output

### Backend Performance
- **Database Indexing** - Fast query execution
- **Connection Pooling** - Efficient database connections
- **Caching Layer** - Redis for frequently accessed data
- **Query Optimization** - Efficient database queries

### Recommendation Engine Performance
- **Batch Processing** - Process multiple recommendations together
- **Caching** - Cache recommendation results
- **Parallel Processing** - Run algorithms in parallel
- **Smart Updates** - Only recalculate when necessary

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design** - Easy to add more servers
- **Database Sharding** - Split data across multiple databases
- **Microservices** - Break into smaller, focused services

### Vertical Scaling
- **Resource Monitoring** - Track CPU, memory, and database usage
- **Performance Profiling** - Identify bottlenecks
- **Optimization** - Continuously improve performance

---

This architecture provides a solid foundation for a Netflix-quality movie recommendation platform while remaining maintainable and scalable. Each component is designed to work independently while contributing to the overall user experience.


