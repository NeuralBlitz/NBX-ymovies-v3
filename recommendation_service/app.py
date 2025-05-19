from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import os
from collections import defaultdict
import time
from datetime import datetime
from content_based_recommender import ContentBasedRecommender
from hybrid_recommender import HybridRecommender

app = Flask(__name__)

# Cache for movie data to avoid repeated API calls
movie_cache = {}
genre_cache = {}

# Initialize empty dataframes
movies_df = pd.DataFrame()
ratings_df = pd.DataFrame()

# Recommendation systems
content_recommender = None
hybrid_recommender = None

# TMDB API configuration
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_BASE_URL = "https://api.themoviedb.org/3"


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "recommendation-engine"})


def load_movie_data():
    """Load movie data from TMDB API"""
    global movies_df, genre_cache, content_recommender, hybrid_recommender
    
    # If already loaded, return
    if not movies_df.empty:
        return
    
    print("Loading movie data and initializing recommendation systems...")
    
    # Get genres first
    if not genre_cache:
        genre_url = f"{TMDB_BASE_URL}/genre/movie/list?api_key={TMDB_API_KEY}"
        response = requests.get(genre_url)
        if response.status_code == 200:
            genres = response.json()['genres']
            genre_cache = {genre['id']: genre['name'] for genre in genres}
    
    # Get popular movies as base dataset and add top rated/trending for diversity
    movie_endpoints = [
        {'endpoint': 'movie/popular', 'pages': 10},
        {'endpoint': 'movie/top_rated', 'pages': 5},
        {'endpoint': 'trending/movie/week', 'pages': 5}
    ]
    
    all_movies = {}  # Use dict to avoid duplicates
    
    # Load movies from each endpoint
    for endpoint_info in movie_endpoints:
        endpoint = endpoint_info['endpoint']
        pages = endpoint_info['pages']
        
        print(f"Loading data from {endpoint}...")
        
        for page in range(1, pages+1):
            url = f"{TMDB_BASE_URL}/{endpoint}?api_key={TMDB_API_KEY}&page={page}"
            response = requests.get(url)
            
            if response.status_code == 200:
                page_results = response.json()['results']
                
                # Add each movie to our collection, avoiding duplicates
                for movie in page_results:
                    if 'id' in movie and movie['id'] not in all_movies:
                        all_movies[movie['id']] = movie
            else:
                print(f"Failed to fetch {endpoint} page {page}: {response.status_code}")
            
            # Small delay to avoid rate limiting
            time.sleep(0.25)
    
    # Process movie data
    processed_movies = []
    
    for movie_id, movie in all_movies.items():
        genre_names = [genre_cache.get(genre_id, '') for genre_id in movie.get('genre_ids', [])]
        
        # Get additional details for each movie
        try:
            details = get_movie_details(movie_id)
            
            if details:
                # Extract cast data
                cast = []
                directors = []
                
                if 'credits' in details:
                    # Get top cast members
                    for cast_member in details['credits'].get('cast', [])[:5]:
                        cast.append(cast_member['name'])
                    
                    # Get directors
                    for crew_member in details['credits'].get('crew', []):
                        if crew_member['job'] == 'Director':
                            directors.append(crew_member['name'])
                
                # Extract keywords
                keywords = []
                if 'keywords' in details and 'keywords' in details['keywords']:
                    keywords = [kw['name'] for kw in details['keywords']['keywords']]
                
                processed_movies.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'genres': ' '.join(genre_names),
                    'overview': movie.get('overview', ''),
                    'popularity': movie.get('popularity', 0),
                    'vote_average': movie.get('vote_average', 0),
                    'vote_count': movie.get('vote_count', 0),
                    'release_date': movie.get('release_date', ''),
                    'original_language': movie.get('original_language', ''),
                    'runtime': details.get('runtime', 0),
                    'cast': ' '.join(cast),
                    'director': ' '.join(directors),
                    'keywords': ' '.join(keywords),
                    'poster_path': movie.get('poster_path', None)
                })
            else:
                # Basic data if details not available
                processed_movies.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'genres': ' '.join(genre_names),
                    'overview': movie.get('overview', ''),
                    'popularity': movie.get('popularity', 0),
                    'vote_average': movie.get('vote_average', 0),
                    'vote_count': movie.get('vote_count', 0),
                    'release_date': movie.get('release_date', ''),
                    'original_language': movie.get('original_language', ''),
                    'poster_path': movie.get('poster_path', None)
                })
        except Exception as e:
            print(f"Error processing movie {movie_id}: {str(e)}")
    
    movies_df = pd.DataFrame(processed_movies)
    
    # Initialize recommendation systems
    print(f"Initializing recommendation systems with {len(movies_df)} movies...")
    
    content_recommender = ContentBasedRecommender()
    content_recommender.fit(movies_df)
    
    hybrid_recommender = HybridRecommender(content_recommender)
    
    print("Recommendation systems ready!")
    
    return movies_df


def initialize_recommenders():
    """Initialize the recommendation systems"""
    global content_recommender, hybrid_recommender
    
    # Load movie data if not already loaded
    if movies_df.empty:
        load_movie_data()
    
    # The recommenders are now initialized in the load_movie_data function
    if content_recommender is None or hybrid_recommender is None:
        print("Re-initializing recommendation systems...")
        
        # Create and train recommenders
        content_recommender = ContentBasedRecommender()
        content_recommender.fit(movies_df)
        
        hybrid_recommender = HybridRecommender(content_recommender)
    
    return content_recommender, hybrid_recommender


def get_similar_movies(movie_id, top_n=10):
    """Get similar movies based on content similarity"""
    global content_recommender
    
    # Initialize recommenders if not already done
    if content_recommender is None:
        initialize_recommenders()
    
    # Get similar movies using our content-based recommender
    similar_movies = content_recommender.get_similar_movies(movie_id, n=top_n, min_similarity=0.1)
    
    # Add movie title for context
    movie_title = None
    movie_row = movies_df[movies_df['id'] == movie_id]
    if not movie_row.empty:
        movie_title = movie_row.iloc[0]['title']
    
    if movie_title:
        for movie in similar_movies:
            movie['recommendation_reason'] = f"Because you liked {movie_title}"
    
    return similar_movies


def get_movie_details(movie_id):
    """Get detailed information about a movie from TMDB API"""
    # Check cache first
    if movie_id in movie_cache:
        return movie_cache[movie_id]
    
    # Fetch movie details from TMDB
    url = f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=credits,videos"
    response = requests.get(url)
    
    if response.status_code == 200:
        movie_data = response.json()
        movie_cache[movie_id] = movie_data
        return movie_data
    
    return None


def calculate_personalized_recommendations(user_data, top_n=20):
    """
    Calculate personalized recommendations based on user data
    
    Parameters:
    -----------
    user_data: dict
        Dictionary containing user preference data including:
        - liked_movies: List of movie IDs the user has liked
        - watch_history: List of movie watch objects with progress info
        - quiz_preferences: Genre, year range, and other quiz info
        
    top_n: int
        Number of recommendations to return
        
    Returns:
    --------
    Dict containing recommendation categories, each with a list of movies
    """
    global hybrid_recommender
    
    # Initialize recommenders if not already done
    if hybrid_recommender is None:
        initialize_recommenders()
    
    # Process user data
    liked_movies = user_data.get('liked_movies', [])
    watch_history = user_data.get('watch_history', [])
    quiz_preferences = user_data.get('quiz_preferences', {})
    watchlist = user_data.get('watchlist', [])
    
    # Format the user data properly for our hybrid recommender
    formatted_user_data = {
        'quiz_genres': quiz_preferences.get('genres', []),
        'quiz_year_range': quiz_preferences.get('yearRange'),
        'quiz_duration': quiz_preferences.get('duration'),
        'liked_movies': liked_movies,
        'watch_history': watch_history,
        'watchlist_ids': [m['movie_id'] if isinstance(m, dict) else m for m in watchlist],
    }
    
    # Get personalized recommendations using our hybrid recommender
    recommendations = hybrid_recommender.get_recommendations(formatted_user_data, n=top_n)
    
    # Format for API response
    response = {
        'recommendation_categories': recommendations,
        'generated_at': datetime.now().isoformat(),
        'recommendation_count': sum(len(cat['movies']) for cat in recommendations),
    }
    
    return response
    
def get_fallback_recommendations(top_n=20):
    """
    Get fallback movie recommendations when user data is unavailable
    
    Returns:
    --------
    List of popular movies
    """
    # Check if we have movies loaded
    if movies_df.empty:
        load_movie_data()
    
    # Simply return top popular movies if no user data available
    sorted_movies = movies_df.sort_values('popularity', ascending=False)
    
    # Return top N most popular movies
    return sorted_movies.head(top_n).to_dict('records')


@app.route('/recommendations/similar/<int:movie_id>', methods=['GET'])
def get_content_based_recommendations(movie_id):
    """Get content-based similar movie recommendations"""
    try:
        count = int(request.args.get('count', 10))
        similar_movies = get_similar_movies(movie_id, top_n=count)
        return jsonify({
            "recommendations": similar_movies,
            "movie_id": movie_id,
            "recommendation_type": "similar"
        })
    except Exception as e:
        print(f"Error generating similar movie recommendations: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/because-you-liked/<int:movie_id>', methods=['GET'])
def get_because_you_liked(movie_id):
    """Get 'Because you liked X' style recommendations"""
    try:
        count = int(request.args.get('count', 10))
        
        # Initialize recommenders if not already done
        if hybrid_recommender is None:
            initialize_recommenders()
        
        # Get recommendations
        similar_movies = hybrid_recommender.get_because_you_liked_recommendations(movie_id, n=count)
        
        # Get the source movie title
        source_movie = None
        movie_row = movies_df[movies_df['id'] == movie_id]
        if not movie_row.empty:
            source_movie = movie_row.iloc[0].to_dict()
        
        return jsonify({
            "recommendations": similar_movies,
            "source_movie": source_movie,
            "recommendation_type": "because_you_liked"
        })
    except Exception as e:
        print(f"Error generating 'because you liked' recommendations: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/personalized', methods=['POST'])
def get_personalized_recommendations():
    """Get personalized recommendations based on full user data"""
    try:
        data = request.get_json() or {}
        count = int(request.args.get('count', 20))
        
        print(f"Received personalization request with data keys: {data.keys() if data else 'No data'}")
        
        # Validate required data
        if not data:
            return jsonify({"error": "No user data provided"}), 400
        
        # Get personalized recommendations
        recommendations = calculate_personalized_recommendations(data, top_n=count)
        
        # Log what we're returning
        if recommendations and 'recommendation_categories' in recommendations:
            categories = recommendations['recommendation_categories']
            print(f"Returning {len(categories)} recommendation categories")
            for i, category in enumerate(categories):
                print(f"  Category {i+1}: '{category.get('category')}' with {len(category.get('movies', []))} movies")
        
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error generating personalized recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/quiz-based', methods=['POST'])
def get_quiz_based_recommendations():
    """Get recommendations based solely on quiz preferences"""
    try:
        quiz_data = request.get_json() or {}
        count = int(request.args.get('count', 20))
        
        print(f"Received quiz data: {quiz_data}")
        
        # Validate required data
        if not quiz_data:
            return jsonify({"error": "No quiz data provided"}), 400
        
        # Initialize recommenders if not already done
        if hybrid_recommender is None:
            initialize_recommenders()
        
        # Format the user data for our hybrid recommender
        user_data = {
            'quiz_genres': quiz_data.get('genres', []),
            'quiz_year_range': quiz_data.get('yearRange'),
            'quiz_duration': quiz_data.get('duration'),
            'liked_movies': [],  # No liked movies yet
            'watch_history': [],  # No watch history yet
            'watchlist_ids': [],  # No watchlist yet
        }
        
        print(f"Formatted user data for recommender: {user_data}")
        
        # Get quiz-based recommendations
        recommendations = hybrid_recommender.get_recommendations(user_data, n=count)
        
        print(f"Got recommendation categories: {[cat.get('category') for cat in recommendations]}")
        
        # Filter for "Based on your preferences" category only
        quiz_recs = next((cat for cat in recommendations 
                          if cat.get('category') == "Based on your preferences"), 
                         {'movies': []})
        
        print(f"Returning {len(quiz_recs.get('movies', []))} quiz-based recommendations")
        
        return jsonify({
            "recommendations": quiz_recs.get('movies', []),
            "recommendation_type": "quiz_based"
        })
    except Exception as e:
        print(f"Error generating quiz-based recommendations: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/trending', methods=['GET'])
def get_trending_recommendations():
    """Get trending movie recommendations"""
    try:
        count = int(request.args.get('count', 20))
        
        # Simply return top popular/trending movies
        if movies_df.empty:
            load_movie_data()
        
        # Sort by popularity
        trending_movies = movies_df.sort_values('popularity', ascending=False).head(count).to_dict('records')
        
        return jsonify({
            "recommendations": trending_movies,
            "recommendation_type": "trending"
        })
    except Exception as e:
        print(f"Error generating trending recommendations: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "service": "recommendation-engine",
        "version": "1.0.0",
        "movie_count": len(movies_df) if not movies_df.empty else 0,
        "recommenders_initialized": content_recommender is not None and hybrid_recommender is not None,
        "timestamp": datetime.now().isoformat()
    }
    return jsonify(status)


if __name__ == '__main__':
    # Load data and initialize recommenders on startup
    print("Starting recommendation service - loading movie data...")
    load_movie_data()
    
    # Initialize recommenders
    content_recommender, hybrid_recommender = initialize_recommenders()
    print("Recommendation systems initialized successfully")
    
    # Start the Flask app
    print("Starting Flask web server on port 5100...")
    app.run(host='0.0.0.0', port=5100, debug=False)