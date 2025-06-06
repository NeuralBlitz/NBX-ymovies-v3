# 📚 API Documentation - Complete Reference

This document provides a comprehensive reference for all API endpoints in the Netflix Clone application.

## 🌐 Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

Most endpoints require authentication. Include the Firebase JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token_here
```

## 📖 API Endpoints

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### Get User Profile
```http
GET /api/auth/profile
```

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 🎬 Movie Endpoints

#### Get Popular Movies
```http
GET /api/movies/popular?page=1&limit=20
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "movies": [
    {
      "id": 12345,
      "title": "Amazing Movie",
      "overview": "An incredible story about...",
      "poster_path": "/path/to/poster.jpg",
      "backdrop_path": "/path/to/backdrop.jpg",
      "release_date": "2024-01-15",
      "vote_average": 8.5,
      "vote_count": 1250,
      "genre_ids": [28, 12, 878],
      "popularity": 85.4
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 45,
    "totalResults": 890
  }
}
```

#### Get Trending Movies
```http
GET /api/movies/trending?timeWindow=day
```

**Query Parameters:**
- `timeWindow` (optional): "day" or "week" (default: "day")

**Response:** Same format as popular movies

#### Get Movie Details
```http
GET /api/movies/:id
```

**Path Parameters:**
- `id`: TMDB movie ID

**Response:**
```json
{
  "success": true,
  "movie": {
    "id": 12345,
    "title": "Amazing Movie",
    "overview": "An incredible story about...",
    "poster_path": "/path/to/poster.jpg",
    "backdrop_path": "/path/to/backdrop.jpg",
    "release_date": "2024-01-15",
    "vote_average": 8.5,
    "vote_count": 1250,
    "runtime": 142,
    "genres": [
      {"id": 28, "name": "Action"},
      {"id": 12, "name": "Adventure"}
    ],
    "credits": {
      "cast": [
        {
          "id": 1234,
          "name": "Actor Name",
          "character": "Character Name",
          "profile_path": "/path/to/profile.jpg"
        }
      ],
      "crew": [
        {
          "id": 5678,
          "name": "Director Name",
          "job": "Director"
        }
      ]
    },
    "videos": [
      {
        "key": "dQw4w9WgXcQ",
        "site": "YouTube",
        "type": "Trailer"
      }
    ]
  }
}
```

#### Search Movies
```http
GET /api/movies/search?query=avengers&page=1
```

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 1)

**Response:** Same format as popular movies

#### Get Similar Movies
```http
GET /api/movies/:id/similar
```

**Path Parameters:**
- `id`: TMDB movie ID

**Response:** Array of similar movies

### 🎯 Recommendation Endpoints

#### Get All Recommendation Categories
```http
GET /api/recommendations/categories
```

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "category": "Continue Watching",
      "movies": [...],
      "recommendationType": "continue_watching"
    },
    {
      "category": "Because You Watched Inception",
      "movies": [...],
      "recommendationType": "because_you_watched"
    },
    {
      "category": "Top Picks for You",
      "movies": [...],
      "recommendationType": "personalized"
    }
  ]
}
```

#### Get Personalized Recommendations
```http
GET /api/recommendations/personalized?limit=15
```

**Headers:** `Authorization: Bearer token`

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 15, max: 50)

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 12345,
      "title": "Recommended Movie",
      "score": 0.85,
      "reason": "Based on your love for sci-fi movies"
    }
  ]
}
```

#### Get "Because You Watched" Recommendations
```http
GET /api/recommendations/because-you-watched/:movieId?limit=15
```

**Headers:** `Authorization: Bearer token`

**Path Parameters:**
- `movieId`: ID of the source movie

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 15)

**Response:** Array of recommended movies with similarity scores

#### Get Mood-Based Recommendations
```http
GET /api/recommendations/mood/:mood?limit=15
```

**Headers:** `Authorization: Bearer token`

**Path Parameters:**
- `mood`: One of: happy, sad, excited, relaxed, scared, nostalgic, romantic, adventurous, thoughtful

**Response:** Array of movies matching the specified mood

#### Get Seasonal Recommendations
```http
GET /api/recommendations/seasonal?limit=12
```

**Headers:** `Authorization: Bearer token`

**Response:** Array of movies appropriate for the current season

### 👤 User Data Endpoints

#### Get User's Watchlist
```http
GET /api/user/watchlist
```

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "success": true,
  "watchlist": [
    {
      "id": "watchlist123",
      "movieId": 12345,
      "addedAt": "2024-01-15T10:30:00Z",
      "movie": {
        "id": 12345,
        "title": "Movie Title",
        "poster_path": "/path/to/poster.jpg"
      }
    }
  ]
}
```

#### Add to Watchlist
```http
POST /api/user/watchlist
```

**Headers:** `Authorization: Bearer token`

**Request Body:**
```json
{
  "movieId": 12345
}
```

**Response:**
```json
{
  "success": true,
  "message": "Movie added to watchlist",
  "watchlistItem": {
    "id": "watchlist123",
    "movieId": 12345,
    "addedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Remove from Watchlist
```http
DELETE /api/user/watchlist/:movieId
```

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "success": true,
  "message": "Movie removed from watchlist"
}
```

#### Get Watch History
```http
GET /api/user/history?limit=50&offset=0
```

**Headers:** `Authorization: Bearer token`

**Query Parameters:**
- `limit` (optional): Number of items (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "history123",
      "movieId": 12345,
      "watchProgress": 0.75,
      "watchCount": 1,
      "rating": 4,
      "watchedAt": "2024-01-15T20:30:00Z",
      "movie": {
        "id": 12345,
        "title": "Movie Title"
      }
    }
  ]
}
```

#### Update Watch Progress
```http
POST /api/user/history
```

**Headers:** `Authorization: Bearer token`

**Request Body:**
```json
{
  "movieId": 12345,
  "watchProgress": 0.45,
  "sessionTime": 3600
}
```

**Response:**
```json
{
  "success": true,
  "message": "Watch progress updated",
  "historyItem": {
    "id": "history123",
    "movieId": 12345,
    "watchProgress": 0.45
  }
}
```

#### Rate Movie
```http
POST /api/user/rating
```

**Headers:** `Authorization: Bearer token`

**Request Body:**
```json
{
  "movieId": 12345,
  "rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Movie rated successfully",
  "rating": {
    "movieId": 12345,
    "rating": 4,
    "ratedAt": "2024-01-15T22:15:00Z"
  }
}
```

#### Get User Preferences
```http
GET /api/user/preferences
```

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "success": true,
  "preferences": {
    "likedGenres": ["28", "878", "12"],
    "dislikedGenres": ["27"],
    "preferredRuntimeMin": 90,
    "preferredRuntimeMax": 180
  }
}
```

#### Update User Preferences
```http
PUT /api/user/preferences
```

**Headers:** `Authorization: Bearer token`

**Request Body:**
```json
{
  "likedGenres": ["28", "878", "12"],
  "dislikedGenres": ["27"],
  "preferredRuntimeMin": 90,
  "preferredRuntimeMax": 180
}
```

## 🚨 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "MOVIE_NOT_FOUND",
    "message": "The requested movie could not be found",
    "details": "Movie with ID 99999 does not exist"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or invalid token
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request parameters
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## 📊 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Movie endpoints**: 100 requests per minute
- **Recommendation endpoints**: 20 requests per minute
- **User data endpoints**: 50 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## 🎯 Recommendation Algorithm Details

### Personalized Recommendations

The personalized recommendation system uses multiple algorithms:

1. **Collaborative Filtering** (40% weight)
   - Finds users with similar preferences
   - Recommends movies they liked

2. **Content-Based Filtering** (35% weight)
   - Analyzes movie attributes (genre, director, cast)
   - Matches user's historical preferences

3. **Hybrid Scoring** (25% weight)
   - Combines multiple signals
   - Popularity, recency, quality scores

### Recommendation Categories

Each category uses different algorithms optimized for that specific use case:

- **Continue Watching**: Direct database query, sorted by recency
- **Because You Watched**: Content similarity + collaborative filtering
- **Top Picks**: Full hybrid algorithm with high confidence threshold
- **Trending**: Popularity filtering based on user preferences
- **Seasonal**: Time-based content filtering
- **Mood-Based**: Genre and keyword filtering










### 🔧 Recent Algorithm Enhancements

The recommendation engine has been significantly improved to provide more appropriate and relevant suggestions:

#### Content Appropriateness Filtering

**What it does**: Prevents inappropriate content recommendations, especially for family and children's content.

**How it works**:
- Analyzes the source movie's genre and rating
- For family/animated content, excludes horror, thriller, and mature genres
- Applies content-specific quality thresholds

**Example**: After watching "The Garfield Movie", you'll now get suggestions like "Shrek" or "Toy Story" instead of "Mission: Impossible" or other action thrillers.

#### Enhanced Genre Similarity

**What changed**: Increased the importance of genre matching in recommendations.

**Technical details**:
- Genre similarity weight increased from 40% to 50%
- Animation-to-animation recommendations get a +40% bonus
- Family-to-family content gets a +20% bonus
- Inappropriate combinations get a -60% penalty

#### Smart Quality Thresholds

**What it does**: Adjusts quality requirements based on content type.

**How it works**:
- Family content: Higher quality threshold (7.0+ rating)
- General content: Standard threshold (6.5+ rating)
- Ensures better overall recommendation quality

#### Multi-Layer Filtering System

The algorithm now uses multiple filtering layers:

1. **Base Filtering**: Genre, rating, and popularity
2. **Content Appropriateness**: Family-safe filtering
3. **Quality Threshold**: Dynamic quality requirements
4. **Relevance Scoring**: Enhanced similarity calculations
5. **Final Ranking**: Combines all signals for best results

These improvements ensure that recommendations are not only relevant but also appropriate for the content you're watching.

## 🔧 Development & Testing

### Testing Endpoints

You can test endpoints using curl:

```bash
# Get popular movies
curl "http://localhost:3000/api/movies/popular"

# Get recommendations (requires auth)
curl -H "Authorization: Bearer your_token" \
     "http://localhost:3000/api/recommendations/categories"
```

### API Response Times

Expected response times:
- **Movie data**: < 200ms
- **Search**: < 300ms
- **Basic recommendations**: < 500ms
- **Complex recommendations**: < 1000ms

---

This API provides everything needed to build a sophisticated movie recommendation platform. All endpoints are designed for performance, scalability, and ease of use.
