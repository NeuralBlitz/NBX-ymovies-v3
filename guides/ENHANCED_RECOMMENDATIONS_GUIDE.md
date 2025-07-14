# Enhanced Netflix-Style Recommendations API Usage Examples

## 🎬 "Because You Liked..." Recommendations

Your YMovies app now supports Netflix-style personalized recommendations with "Because you liked..." messaging!

### Basic Usage

```javascript
// Example API call with user preferences including liked content
const recommendationsResponse = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    type: 'mixed',
    preferences: {
      // Liked content for "Because you liked..." recommendations
      liked_content: [
        {
          id: 550,
          title: 'Fight Club',
          media_type: 'movie',
          genre_ids: [18, 53]
        },
        {
          id: 13,
          title: 'Forrest Gump',
          media_type: 'movie',
          genre_ids: [18, 10749]
        }
      ],
      
      // Watched content for "Because you watched..." recommendations
      watched_content: [
        {
          id: 155,
          title: 'The Dark Knight',
          media_type: 'movie',
          genre_ids: [28, 80, 18]
        }
      ],
      
      // Other preferences
      favoriteGenres: [28, 18, 53], // Action, Drama, Thriller
      preferredLanguage: 'en',
      minRating: 7.0
    }
  })
});

const recommendations = await recommendationsResponse.json();
```

### Expected Response

```json
{
  "recommendation_categories": [
    {
      "category": "Recommended for You",
      "movies": [
        {
          "id": 807,
          "title": "Se7en",
          "overview": "Two homicide detectives are on a desperate hunt...",
          "poster_path": "/6yoghtyTpznpBik8EngEmJskVUO.jpg",
          "vote_average": 8.374,
          "reason": "Because you liked Fight Club",
          "media_type": "movie"
        }
      ]
    },
    {
      "category": "Trending Now",
      "movies": [
        {
          "id": 823464,
          "title": "Godzilla x Kong: The New Empire",
          "reason": "Trending now",
          "media_type": "movie"
        }
      ]
    },
    {
      "category": "Top Picks",
      "movies": [
        {
          "id": 238,
          "title": "The Godfather",
          "reason": "Critically acclaimed",
          "media_type": "movie"
        }
      ]
    },
    {
      "category": "Because you liked Fight Club",
      "movies": [
        {
          "id": 807,
          "title": "Se7en",
          "reason": "Because you liked Fight Club",
          "media_type": "movie"
        }
      ]
    }
  ],
  "recommendation_count": 40,
  "user_id": "user123",
  "type": "mixed",
  "generated_at": "2024-07-06T12:00:00.000Z"
}
```

## 🎯 Different Recommendation Categories

Your app now provides multiple Netflix-style categories:

### 1. **"Recommended for You"** 
- Personalized based on user preferences
- Includes "Because you liked..." reasons

### 2. **"Trending Now"**
- Currently trending movies/TV shows
- Reason: "Trending now"

### 3. **"Top Picks"**
- Highly rated content
- Reason: "Critically acclaimed"

### 4. **"Because you liked [Title]"**
- Similar content to user's liked items
- Dynamic category name based on liked content

### 5. **"Popular TV Shows"** / **"Trending TV Shows"**
- TV-specific recommendations
- Similar reasoning system

## 🔧 Recommendation Reasons

The system now generates various Netflix-style reasons:

### Personalized Reasons
- `"Because you liked [Movie Title]"`
- `"Because you watched [Movie Title]"`
- `"Popular in Action"` (based on favorite genres)

### Content-Based Reasons
- `"Critically acclaimed"` (8.0+ rating)
- `"Highly rated"` (7.5+ rating)
- `"Trending now"` (trending content)
- `"Popular choice"` (1000+ votes)
- `"New release"` (2023+ release year)

## 📱 Frontend Integration

To display these recommendations in your React app:

```jsx
function RecommendationsSection({ recommendations }) {
  return (
    <div className="recommendations">
      {recommendations.recommendation_categories.map((category, index) => (
        <div key={index} className="recommendation-category">
          <h2>{category.category}</h2>
          <div className="movies-grid">
            {category.movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                />
                <h3>{movie.title}</h3>
                <p className="recommendation-reason">{movie.reason}</p>
                <div className="rating">⭐ {movie.vote_average.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🧪 Testing the Enhanced Features

Test your deployed app with these examples:

```bash
# Test with liked content
curl -X POST "https://your-app.vercel.app/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test",
    "type": "movies",
    "preferences": {
      "liked_content": [
        {"id": 550, "title": "Fight Club", "media_type": "movie", "genre_ids": [18, 53]}
      ],
      "favoriteGenres": [28, 18]
    }
  }'

# Test similar content
curl "https://your-app.vercel.app/api/similar?id=550&type=movie"
```

## 🎉 Result

Your YMovies Netflix Clone now provides:

✅ **Netflix-style "Because you liked..." recommendations**  
✅ **Multiple recommendation categories**  
✅ **Personalized reasoning for each suggestion**  
✅ **Trending and top-rated content sections**  
✅ **Similar content based on user preferences**  

The recommendations will feel just like Netflix with personalized messages that explain why each movie or show was recommended!
