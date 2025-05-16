from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import os
from collections import defaultdict

app = Flask(__name__)

# Cache for movie data to avoid repeated API calls
movie_cache = {}
genre_cache = {}

# Initialize empty dataframes
movies_df = pd.DataFrame()
ratings_df = pd.DataFrame()

# Movie similarity matrix
movie_similarity = None

# TMDB API configuration
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_BASE_URL = "https://api.themoviedb.org/3"


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "recommendation-engine"})


def load_movie_data():
    """Load movie data from TMDB API"""
    global movies_df, genre_cache
    
    # If already loaded, return
    if not movies_df.empty:
        return
    
    # Get genres first
    if not genre_cache:
        genre_url = f"{TMDB_BASE_URL}/genre/movie/list?api_key={TMDB_API_KEY}"
        response = requests.get(genre_url)
        if response.status_code == 200:
            genres = response.json()['genres']
            genre_cache = {genre['id']: genre['name'] for genre in genres}
    
    # Get popular movies as base dataset
    movies = []
    for page in range(1, 6):  # Get first 5 pages (100 movies)
        url = f"{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&page={page}"
        response = requests.get(url)
        if response.status_code == 200:
            page_results = response.json()['results']
            movies.extend(page_results)
    
    # Process movie data
    processed_movies = []
    for movie in movies:
        genre_names = [genre_cache.get(genre_id, '') for genre_id in movie.get('genre_ids', [])]
        processed_movies.append({
            'id': movie['id'],
            'title': movie['title'],
            'genres': ' '.join(genre_names),
            'overview': movie['overview'],
            'popularity': movie['popularity'],
            'vote_average': movie['vote_average'],
            'vote_count': movie['vote_count'],
            'release_date': movie.get('release_date', ''),
            'original_language': movie.get('original_language', '')
        })
    
    movies_df = pd.DataFrame(processed_movies)
    return movies_df


def calculate_similarity():
    """Calculate content-based similarity between movies"""
    global movie_similarity
    
    # Load movie data if not already loaded
    if movies_df.empty:
        load_movie_data()
    
    # Combine features for content-based filtering
    movies_df['combined_features'] = movies_df['overview'] + ' ' + movies_df['genres']
    
    # Create TF-IDF vectorizer
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(movies_df['combined_features'].fillna(''))
    
    # Calculate cosine similarity
    movie_similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    return movie_similarity


def get_similar_movies(movie_id, top_n=10):
    """Get similar movies based on content similarity"""
    global movie_similarity
    
    # Calculate similarity if not already done
    if movie_similarity is None:
        calculate_similarity()
    
    # Find movie index in dataframe
    movie_index = movies_df[movies_df['id'] == movie_id].index
    if len(movie_index) == 0:
        return []
    
    movie_index = movie_index[0]
    
    # Get similarity scores and top similar movies
    similarity_scores = list(enumerate(movie_similarity[movie_index]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    similarity_scores = similarity_scores[1:top_n+1]  # Exclude the movie itself
    
    similar_movie_indices = [i[0] for i in similarity_scores]
    similar_movies = movies_df.iloc[similar_movie_indices]
    
    return similar_movies.to_dict('records')


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


def calculate_collaborative_recommendations(user_history, top_n=20):
    """Calculate recommendations based on user history and collaborative filtering"""
    # Load movie data if not already loaded
    if movies_df.empty:
        load_movie_data()
    
    if not user_history:
        return []
    
    # Get user's watched movie genres and create a preference profile
    genres_count = defaultdict(float)
    directors_count = defaultdict(float)
    actors_count = defaultdict(float)
    
    # Weight recent watches more heavily
    recency_weight = [1.0 - (0.1 * i) for i in range(min(10, len(user_history)))]
    if len(user_history) > 10:
        recency_weight.extend([0.1] * (len(user_history) - 10))
    
    for i, history_item in enumerate(user_history):
        movie_id = history_item['movie_id']
        watch_progress = history_item.get('watch_progress', 0.5)  # Default to 50% if not provided
        weight = recency_weight[i] * (0.5 + 0.5 * watch_progress)  # Adjust weight by watch progress
        
        # Get movie details
        movie_details = get_movie_details(movie_id)
        if not movie_details:
            continue
        
        # Add genre preferences
        for genre in movie_details.get('genres', []):
            genres_count[genre['id']] += weight
        
        # Add director preferences
        for crew_member in movie_details.get('credits', {}).get('crew', []):
            if crew_member['job'] == 'Director':
                directors_count[crew_member['id']] += weight
                break
        
        # Add actor preferences (top 3 cast)
        for j, cast_member in enumerate(movie_details.get('credits', {}).get('cast', [])[:3]):
            actor_weight = weight * (1.0 - j * 0.2)  # Weight leading actors more
            actors_count[cast_member['id']] += actor_weight
    
    # Normalize preference counts
    def normalize_counts(counts):
        if not counts:
            return {}
        max_count = max(counts.values())
        return {k: v / max_count for k, v in counts.items()}
    
    genres_norm = normalize_counts(genres_count)
    directors_norm = normalize_counts(directors_count)
    actors_norm = normalize_counts(actors_count)
    
    # Score all movies based on user preferences
    movie_scores = []
    
    # Get additional popular movies for diversity
    popular_url = f"{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&page=1"
    popular_response = requests.get(popular_url)
    
    if popular_response.status_code == 200:
        popular_movies = popular_response.json()['results']
        
        # Add movies from user history to avoid duplicates
        watched_movie_ids = {item['movie_id'] for item in user_history}
        
        # Score each movie
        for movie in popular_movies:
            if movie['id'] in watched_movie_ids:
                continue
            
            score = 0.1  # Base score
            
            # Get detailed info for more accurate scoring
            movie_details = get_movie_details(movie['id'])
            if not movie_details:
                continue
            
            # Genre match
            for genre in movie_details.get('genres', []):
                if genre['id'] in genres_norm:
                    score += 0.4 * genres_norm[genre['id']]
            
            # Director match
            for crew_member in movie_details.get('credits', {}).get('crew', []):
                if crew_member['job'] == 'Director' and crew_member['id'] in directors_norm:
                    score += 0.3 * directors_norm[crew_member['id']]
                    break
            
            # Actor match
            for cast_member in movie_details.get('credits', {}).get('cast', [])[:5]:
                if cast_member['id'] in actors_norm:
                    score += 0.2 * actors_norm[cast_member['id']]
            
            # Popularity and rating factors
            score += 0.1 * (movie_details['vote_average'] / 10.0)
            
            movie_scores.append((movie_details, score))
    
    # Sort by score and return top N
    movie_scores.sort(key=lambda x: x[1], reverse=True)
    recommended_movies = [movie for movie, _ in movie_scores[:top_n]]
    
    return recommended_movies


@app.route('/recommendations/content-based/<int:movie_id>', methods=['GET'])
def get_content_based_recommendations(movie_id):
    """Content-based recommendation endpoint"""
    try:
        count = int(request.args.get('count', 10))
        similar_movies = get_similar_movies(movie_id, top_n=count)
        return jsonify({"recommendations": similar_movies})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/collaborative', methods=['POST'])
def get_collaborative_recommendations():
    """Collaborative filtering recommendation endpoint"""
    try:
        data = request.get_json()
        user_history = data.get('user_history', [])
        count = data.get('count', 20)
        
        recommendations = calculate_collaborative_recommendations(user_history, top_n=count)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/recommendations/hybrid/<int:user_id>', methods=['GET'])
def get_hybrid_recommendations(user_id):
    """Hybrid recommendation endpoint combining multiple approaches"""
    try:
        # This would typically fetch user history from a database
        # For this demo, we'll accept it as part of the request
        user_history = request.get_json().get('user_history', [])
        preferences = request.get_json().get('preferences', {})
        count = request.args.get('count', 20)
        
        # Get collaborative filtering recommendations
        collaborative_recs = calculate_collaborative_recommendations(user_history, top_n=count)
        
        # Get content-based recommendations if user has watch history
        content_based_recs = []
        if user_history:
            # Use the most recently watched movie for content-based recommendations
            recent_movie_id = user_history[0]['movie_id']
            content_based_recs = get_similar_movies(recent_movie_id, top_n=count)
        
        # Blend recommendations (simple 50/50 approach)
        # In a real system, you'd use more sophisticated blending
        all_recs = {}
        
        # Add collaborative recs with weight
        for i, movie in enumerate(collaborative_recs):
            score = 1.0 - (i / len(collaborative_recs)) if collaborative_recs else 0
            all_recs[movie['id']] = {
                'movie': movie,
                'score': 0.6 * score  # 60% weight to collaborative
            }
        
        # Add content-based recs with weight
        for i, movie in enumerate(content_based_recs):
            score = 1.0 - (i / len(content_based_recs)) if content_based_recs else 0
            if movie['id'] in all_recs:
                all_recs[movie['id']]['score'] += 0.4 * score  # 40% weight to content-based
            else:
                all_recs[movie['id']] = {
                    'movie': movie,
                    'score': 0.4 * score
                }
        
        # Convert back to list and sort by final score
        final_recs = [item['movie'] for item in sorted(
            all_recs.values(), 
            key=lambda x: x['score'], 
            reverse=True
        )][:int(count)]
        
        return jsonify({
            "recommendations": final_recs,
            "user_id": user_id
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Load data on startup
    load_movie_data()
    calculate_similarity()
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5100, debug=True)