# YMovies API Documentation

## 🎬 Overview

The YMovies Netflix Clone provides serverless API endpoints for movie and TV show recommendations, powered by The Movie Database (TMDB) API.

## 🔗 Endpoints

### 1. Personalized Recommendations

**Endpoint**: `/api/recommendations`

**Methods**: `GET`, `POST`

**Description**: Get personalized movie and TV show recommendations based on user preferences.

#### GET Request
```bash
GET /api/recommendations?type=movies&user_id=test&genre=28&language=en&min_rating=7
```

#### POST Request
```bash
POST /api/recommendations
Content-Type: application/json

{
  "user_id": "user123",
  "type": "mixed",
  "preferences": {
    "genres": [28, 12, 16],
    "language": "en",
    "min_rating": 7.0,
    "max_rating": 10.0,
    "year_from": 2020,
    "year_to": 2024
  }
}
```

#### Parameters

| Parameter | Type | Description | Options |
|-----------|------|-------------|---------|
| `user_id` | string | User identifier | Any string |
| `type` | string | Content type | `movies`, `tv`, `mixed` |
| `preferences.genres` | array | Genre IDs | TMDB genre IDs |
| `preferences.language` | string | Language code | ISO 639-1 codes |
| `preferences.min_rating` | number | Minimum rating | 0.0 - 10.0 |
| `preferences.max_rating` | number | Maximum rating | 0.0 - 10.0 |
| `preferences.year_from` | number | Start year | Any year |
| `preferences.year_to` | number | End year | Any year |

#### Response
```json
{
  "recommendation_categories": [
    {
      "category": "Recommended for You",
      "movies": [
        {
          "id": 550,
          "title": "Fight Club",
          "overview": "A ticking-time-bomb insomniac...",
          "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          "release_date": "1999-10-15",
          "vote_average": 8.433,
          "reason": "Based on your preferences",
          "media_type": "movie"
        }
      ]
    }
  ],
  "recommendation_count": 10,
  "user_id": "user123",
  "generated_at": "2024-01-01T12:00:00Z"
}
```

### 2. Similar Content

**Endpoint**: `/api/similar`

**Method**: `GET`

**Description**: Get content similar to a specific movie or TV show.

#### Request
```bash
GET /api/similar?id=550&type=movie
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | TMDB content ID |
| `type` | string | No | Content type (`movie` or `tv`) |

#### Response
```json
{
  "similar_content": [
    {
      "id": 807,
      "title": "Se7en",
      "overview": "Two homicide detectives are on a desperate hunt...",
      "poster_path": "/6yoghtyTpznpBik8EngEmJskVUO.jpg",
      "release_date": "1995-09-22",
      "vote_average": 8.374,
      "media_type": "movie"
    }
  ],
  "content_count": 15,
  "based_on": {
    "id": 550,
    "title": "Fight Club",
    "type": "movie"
  }
}
```

## 🎭 Genre IDs

### Movie Genres
| ID | Genre |
|----|-------|
| 28 | Action |
| 12 | Adventure |
| 16 | Animation |
| 35 | Comedy |
| 80 | Crime |
| 99 | Documentary |
| 18 | Drama |
| 10751 | Family |
| 14 | Fantasy |
| 36 | History |
| 27 | Horror |
| 10402 | Music |
| 9648 | Mystery |
| 10749 | Romance |
| 878 | Science Fiction |
| 10770 | TV Movie |
| 53 | Thriller |
| 10752 | War |
| 37 | Western |

### TV Genres
| ID | Genre |
|----|-------|
| 10759 | Action & Adventure |
| 16 | Animation |
| 35 | Comedy |
| 80 | Crime |
| 99 | Documentary |
| 18 | Drama |
| 10751 | Family |
| 10762 | Kids |
| 9648 | Mystery |
| 10763 | News |
| 10764 | Reality |
| 10765 | Sci-Fi & Fantasy |
| 10766 | Soap |
| 10767 | Talk |
| 10768 | War & Politics |
| 37 | Western |

## 🌍 Language Codes

Common ISO 639-1 language codes:

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `pt` | Portuguese |
| `ja` | Japanese |
| `ko` | Korean |
| `zh` | Chinese |
| `ru` | Russian |

## 🔧 Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| HTTP Status | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid parameters or request format |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Content not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or API error |

## 🧪 Testing

### Using cURL

```bash
# Test recommendations
curl "https://your-app.vercel.app/api/recommendations?type=movies&user_id=test"

# Test similar content
curl "https://your-app.vercel.app/api/similar?id=550&type=movie"
```

### Using JavaScript

```javascript
// Get recommendations
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    type: 'movies',
    preferences: { genres: [28, 12] }
  })
});

const recommendations = await response.json();

// Get similar content
const similarResponse = await fetch('/api/similar?id=550&type=movie');
const similar = await similarResponse.json();
```

## 🚀 Performance

- **Cold Start**: ~1-2 seconds for first request
- **Warm Requests**: ~100-300ms response time
- **Rate Limits**: 40 requests per 10 seconds (TMDB limit)
- **Caching**: Responses cached for 5 minutes

## 🔒 Security

- CORS enabled for all origins
- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting via Vercel and TMDB

## 📊 Monitoring

Monitor your API usage in:
- Vercel Dashboard: Function executions and performance
- TMDB Dashboard: API usage and quotas
- Browser DevTools: Network requests and responses
