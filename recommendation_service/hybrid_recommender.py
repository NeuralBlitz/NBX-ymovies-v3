import pandas as pd
import numpy as np
from collections import defaultdict
from content_based_recommender import ContentBasedRecommender

class HybridRecommender:
    """
    Hybrid recommendation system combining multiple recommendation approaches
    - Content-based filtering using movie features
    - User preference-based recommendations from quiz
    - User interaction history (liked movies, watch history)
    - Weighted recommendations based on recency
    """
    
    def __init__(self, content_recommender=None):
        """
        Initialize the hybrid recommender
        
        Parameters:
        -----------
        content_recommender: ContentBasedRecommender
            Pre-trained content-based recommender (optional)
        """
        self.content_recommender = content_recommender or ContentBasedRecommender()
        self.recency_weight_factor = 0.9  # How much we decay the weight of older interactions
    
    def fit(self, movies_df):
        """
        Fit the recommender with movie data
        
        Parameters:
        -----------
        movies_df: pandas DataFrame with movie features
        """
        if self.content_recommender is None:
            self.content_recommender = ContentBasedRecommender()
        
        self.content_recommender.fit(movies_df)
        return self
    
    def get_because_you_liked_recommendations(self, movie_id, n=10):
        """
        Get "Because You Liked X" recommendations for a specific movie
        
        Parameters:
        -----------
        movie_id: int
            ID of the movie that the user liked
        n: int
            Number of recommendations to generate
            
        Returns:
        --------
        List of dicts with recommended movie details and reason
        """
        similar_movies = self.content_recommender.get_similar_movies(movie_id, n=n, min_similarity=0.15)
        
        # Enrich with recommendation reason
        movie_title = None
        for movie in self.content_recommender.movies_df.to_dict('records'):
            if movie['id'] == movie_id:
                movie_title = movie['title']
                break
        
        if movie_title:
            for movie in similar_movies:
                movie['recommendation_reason'] = f"Because you liked {movie_title}"
        
        return similar_movies
    
    def get_recommendations(self, user_data, n=20):
        """
        Get personalized recommendations for a user
        
        Parameters:
        -----------
        user_data: dict
            Dictionary containing user preference data:
            - quiz_genres (list): Genre preferences from quiz
            - quiz_year_range (str): "recent" or "classic"
            - quiz_duration (str): "short", "medium", or "long"
            - liked_movies (list): IDs of movies the user liked
            - watch_history (list): Dict of movies the user watched with timestamps
            - watchlist_ids (list): IDs of movies in user's watchlist
            
        n: int
            Number of recommendations to generate
            
        Returns:
        --------
        List of recommendation groups, each with a category and list of movies
        """
        # Extract user data
        quiz_genres = user_data.get('quiz_genres', [])
        quiz_year_range = user_data.get('quiz_year_range', None)
        quiz_duration = user_data.get('quiz_duration', None)
        liked_movies = user_data.get('liked_movies', [])
        watch_history = user_data.get('watch_history', [])
        watchlist_ids = user_data.get('watchlist_ids', [])
        
        # Get IDs of movies the user has interacted with (to exclude from recommendations)
        watched_movie_ids = [item.get('movieId') for item in watch_history if 'movieId' in item]
        exclude_ids = set(watched_movie_ids + watchlist_ids)
        
        # For liked movies, we want to use them for recommendations but not recommend them again
        for movie in liked_movies:
            movie_id = movie if isinstance(movie, int) else movie.get('id')
            if movie_id:
                exclude_ids.add(movie_id)
        
        # Extract IDs from liked_movies if they're dictionaries
        liked_movie_ids = []
        for movie in liked_movies:
            if isinstance(movie, dict) and 'id' in movie:
                liked_movie_ids.append(movie['id'])
            elif isinstance(movie, int):
                liked_movie_ids.append(movie)
        
        # Initialize recommendation categories
        recommendations = []
        
        # Special case: If user has liked movies, generate "Because you liked" sections
        if liked_movie_ids:
            # Get the most recent liked movies (up to 3)
            recent_liked_ids = liked_movie_ids[:3]
            
            for movie_id in recent_liked_ids:
                # Get similar movies for this liked movie
                similar_movies = self.get_because_you_liked_recommendations(movie_id, n=10)
                
                # Filter out movies the user has already interacted with
                similar_movies = [movie for movie in similar_movies if movie['id'] not in exclude_ids]
                
                # Get the title of the source movie
                source_movie = None
                for movie in self.content_recommender.movies_df.to_dict('records'):
                    if movie['id'] == movie_id:
                        source_movie = movie
                        break
                
                # If we have results and we know the source movie, add as a category
                if similar_movies and source_movie:
                    recommendations.append({
                        'category': f"Because you liked {source_movie['title']}",
                        'movies': similar_movies[:8],  # Limit to 8 recommendations per category
                        'source_movie': source_movie
                    })
        
        # Generate recommendations based on combined liked movies
        if liked_movie_ids:
            content_based_recs = self.content_recommender.get_recommendations_by_liked_movies(
                liked_movie_ids, n=20
            )
            
            # Filter out movies the user has already interacted with
            content_based_recs = [movie for movie in content_based_recs if movie['id'] not in exclude_ids]
            
            if content_based_recs:
                recommendations.append({
                    'category': "Recommended for you",
                    'movies': content_based_recs[:16],  # Limit to 16 recommendations
                    'based_on': 'Liked Movies'
                })
        
        # Generate recommendations based on quiz preferences
        if quiz_genres:
            quiz_recs = self._get_quiz_based_recommendations(
                quiz_genres, quiz_year_range, quiz_duration, exclude_ids, n=20
            )
            
            if quiz_recs:
                recommendations.append({
                    'category': "Based on your preferences",
                    'movies': quiz_recs[:16],  # Limit to 16 recommendations
                    'based_on': 'Quiz Preferences'
                })
        
        return recommendations
    
    def _get_quiz_based_recommendations(self, genres, year_range, duration, exclude_ids, n=20):
        """
        Generate recommendations based on quiz preferences
        
        Parameters:
        -----------
        genres: list
            List of genre IDs/names from the quiz
        year_range: str
            "recent" or "classic"
        duration: str
            "short", "medium", or "long"
        exclude_ids: set
            Set of movie IDs to exclude
        n: int
            Number of recommendations to generate
            
        Returns:
        --------
        List of movie recommendations
        """
        # Start with all movies
        movies = self.content_recommender.movies_df.copy()
        
        # Filter by genres if specified
        if genres and len(genres) > 0:
            # Filter for movies that have at least one of the specified genres
            filtered_movies = []
            for _, movie in movies.iterrows():
                movie_genres = str(movie['genres']).split() if 'genres' in movie else []
                if any(genre in movie_genres for genre in genres):
                    filtered_movies.append(movie)
            
            if filtered_movies:
                movies = pd.DataFrame(filtered_movies)
        
        # Filter by year range if specified
        if year_range and 'release_date' in movies.columns:
            current_year = pd.Timestamp.now().year
            
            if year_range == 'recent':
                # Recent: last 5 years
                cutoff_year = current_year - 5
                movies = movies[movies['release_date'].str.slice(0, 4).astype(int) >= cutoff_year]
            elif year_range == 'classic':
                # Classic: before 2000
                movies = movies[movies['release_date'].str.slice(0, 4).astype(int) < 2000]
        
        # Filter by duration if specified and if runtime column exists
        if duration and 'runtime' in movies.columns:
            if duration == 'short':
                # Short: under 100 minutes
                movies = movies[movies['runtime'] < 100]
            elif duration == 'medium':
                # Medium: 100-150 minutes
                movies = movies[(movies['runtime'] >= 100) & (movies['runtime'] <= 150)]
            elif duration == 'long':
                # Long: over 150 minutes
                movies = movies[movies['runtime'] > 150]
        
        # Exclude movies the user has already interacted with
        if exclude_ids:
            movies = movies[~movies['id'].isin(exclude_ids)]
        
        # Sort by popularity and rating
        if 'popularity' in movies.columns and 'vote_average' in movies.columns:
            # Create a combined score: 70% popularity, 30% rating
            movies['combined_score'] = (0.7 * movies['popularity'] + 
                                       0.3 * movies['vote_average'] * 10)
            movies = movies.sort_values('combined_score', ascending=False)
        
        # Convert to dict records and return top N
        results = movies.head(n).to_dict('records')
        return results
