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
      def get_because_you_liked_recommendations(self, movie_id, n=10, user_context=None):
        """
        Enhanced "Because You Liked X" recommendations with contextual awareness
        
        Parameters:
        -----------
        movie_id: int
            ID of the movie that the user liked
        n: int
            Number of recommendations to generate
        user_context: dict
            Additional user context (watch history, preferences, etc.)
            
        Returns:
        --------
        List of dicts with recommended movie details and detailed reasoning
        """
        # Get similar movies with enhanced algorithm
        similar_movies = self.content_recommender.get_similar_movies(
            movie_id, n=n*2, min_similarity=0.1, diversity_factor=0.4
        )
        
        # If we have user context, apply personalized filtering
        if user_context:
            similar_movies = self._apply_user_context_filtering(similar_movies, user_context)
        
        # Re-rank based on multiple factors
        ranked_movies = self._rerank_recommendations(movie_id, similar_movies, user_context)
        
        # Get the source movie details
        source_movie = self._get_movie_details(movie_id)
        source_title = source_movie.get('title', 'this movie') if source_movie else 'this movie'
        
        # Enhance with recommendation reasons
        for movie in ranked_movies[:n]:
            movie['recommendation_reason'] = f"Because you liked {source_title}"
            movie['source_movie_id'] = movie_id
            movie['recommendation_type'] = 'because_you_liked'
        
        return ranked_movies[:n]
    
    def _apply_user_context_filtering(self, movies, user_context):
        """Apply user-specific filtering to recommendations"""
        if not user_context:
            return movies
        
        filtered_movies = []
        user_genres = set(user_context.get('preferred_genres', []))
        watched_ids = set(user_context.get('watched_movie_ids', []))
        user_decade_pref = user_context.get('decade_preference')
        
        for movie in movies:
            # Skip already watched movies
            if movie['id'] in watched_ids:
                continue
            
            score_boost = 0
            
            # Boost if movie matches user's preferred genres
            if user_genres and 'genres' in movie:
                movie_genres = set(movie.get('genres', '').split())
                genre_overlap = len(user_genres & movie_genres)
                if genre_overlap > 0:
                    score_boost += 0.1 * genre_overlap
            
            # Boost if movie matches user's decade preference
            if user_decade_pref and 'release_date' in movie:
                try:
                    movie_year = int(movie['release_date'][:4])
                    movie_decade = (movie_year // 10) * 10
                    if abs(movie_decade - user_decade_pref) <= 10:
                        score_boost += 0.15
                except (ValueError, TypeError):
                    pass
            
            # Apply boost to similarity score
            movie['similarity'] = min(1.0, movie['similarity'] + score_boost)
            filtered_movies.append(movie)
        
        return sorted(filtered_movies, key=lambda x: x['similarity'], reverse=True)
    
    def _rerank_recommendations(self, source_movie_id, movies, user_context):
        """Re-rank recommendations based on multiple quality factors"""
        source_movie = self._get_movie_details(source_movie_id)
        
        for movie in movies:
            # Base score from similarity
            score = movie.get('similarity', 0)
            
            # Quality boost (higher rated movies get slight boost)
            if 'vote_average' in movie:
                try:
                    rating = float(movie['vote_average'])
                    if rating >= 7.5:
                        score += 0.05
                    elif rating >= 8.5:
                        score += 0.1
                except (ValueError, TypeError):
                    pass
            
            # Popularity boost (but not too much to avoid mainstream bias)
            if 'popularity' in movie:
                try:
                    popularity = float(movie['popularity'])
                    if popularity > 50:  # Reasonable popularity threshold
                        score += 0.02
                except (ValueError, TypeError):
                    pass
            
            # Recency factor (slightly favor newer movies unless user prefers classics)
            if 'release_date' in movie and source_movie and 'release_date' in source_movie:
                try:
                    movie_year = int(movie['release_date'][:4])
                    source_year = int(source_movie['release_date'][:4])
                    current_year = 2024
                    
                    # If source movie is recent, slightly favor recent recommendations
                    if source_year >= current_year - 5 and movie_year >= current_year - 5:
                        score += 0.03
                    # If source movie is classic, don't penalize older recommendations
                    elif source_year < current_year - 20 and movie_year < current_year - 10:
                        score += 0.02
                except (ValueError, TypeError):
                    pass
            
            # Diversity factor - penalize if too many similar recommendations
            score -= self._calculate_recommendation_diversity_penalty(movie, movies)
            
            movie['final_score'] = max(0, score)
        
        return sorted(movies, key=lambda x: x.get('final_score', 0), reverse=True)
    
    def _calculate_recommendation_diversity_penalty(self, movie, all_movies):
        """Calculate penalty to promote diversity in recommendations"""
        penalty = 0
        movie_genres = set(movie.get('genres', '').split())
        movie_director = movie.get('director', '')
        
        similar_count = 0
        for other_movie in all_movies:
            if other_movie['id'] == movie['id']:
                continue
            
            # Count movies with same director
            if movie_director and other_movie.get('director') == movie_director:
                similar_count += 1
            
            # Count movies with high genre overlap
            other_genres = set(other_movie.get('genres', '').split())
            if len(movie_genres & other_genres) >= 2:
                similar_count += 0.5
        
        # Apply penalty based on similarity count
        if similar_count > 2:
            penalty = min(0.1, similar_count * 0.02)
        
        return penalty
    
    def _get_movie_details(self, movie_id):
        """Get movie details by ID"""
        movie_rows = self.content_recommender.movies_df[
            self.content_recommender.movies_df['id'] == movie_id
        ]
        return movie_rows.iloc[0].to_dict() if not movie_rows.empty else None
      def get_recommendations(self, user_data, n=20):
        """
        Enhanced personalized recommendations with behavioral analysis
        
        Parameters:
        -----------
        user_data: dict
            Dictionary containing comprehensive user data
            
        Returns:
        --------
        List of recommendation groups with enhanced categorization
        """
        # Extract and analyze user data
        quiz_genres = user_data.get('quiz_genres', [])
        quiz_year_range = user_data.get('quiz_year_range', None)
        quiz_duration = user_data.get('quiz_duration', None)
        liked_movies = user_data.get('liked_movies', [])
        watch_history = user_data.get('watch_history', [])
        watchlist_ids = user_data.get('watchlist_ids', [])
        
        # Analyze user behavior patterns
        user_patterns = self._analyze_user_behavior(watch_history, liked_movies)
        
        # Build user context for personalization
        user_context = {
            'preferred_genres': self._extract_preferred_genres(liked_movies, watch_history, quiz_genres),
            'decade_preference': self._extract_decade_preference(liked_movies, watch_history),
            'watched_movie_ids': [item.get('movieId') for item in watch_history if 'movieId' in item],
            'behavior_patterns': user_patterns
        }
        
        # Get exclude IDs
        watched_movie_ids = user_context['watched_movie_ids']
        exclude_ids = set(watched_movie_ids + watchlist_ids)
        
        # Add liked movies to exclude list (don't recommend what they already liked)
        for movie in liked_movies:
            movie_id = movie if isinstance(movie, int) else movie.get('id')
            if movie_id:
                exclude_ids.add(movie_id)
        
        liked_movie_ids = [
            movie['id'] if isinstance(movie, dict) else movie 
            for movie in liked_movies 
            if (isinstance(movie, dict) and 'id' in movie) or isinstance(movie, int)
        ]
        
        recommendations = []
        
        # 1. Enhanced "Because You Liked" sections for recent favorites
        if liked_movie_ids:
            # Get most impactful liked movies (based on user engagement)
            prioritized_liked = self._prioritize_liked_movies(liked_movie_ids, user_patterns)
            
            for movie_id in prioritized_liked[:3]:  # Top 3 most relevant
                similar_movies = self.get_because_you_liked_recommendations(
                    movie_id, n=12, user_context=user_context
                )
                
                # Filter out excluded movies
                similar_movies = [movie for movie in similar_movies if movie['id'] not in exclude_ids]
                
                if similar_movies:
                    source_movie = self._get_movie_details(movie_id)
                    category_name = f"Because you liked {source_movie['title']}" if source_movie else "Similar to your favorites"
                    
                    recommendations.append({
                        'category': category_name,
                        'movies': similar_movies[:8],
                        'source_movie': source_movie,
                        'recommendation_type': 'because_you_liked'
                    })
        
        # 2. Trending in your favorite genres
        if user_context['preferred_genres']:
            trending_in_genres = self._get_trending_in_genres(
                user_context['preferred_genres'], exclude_ids, n=12
            )
            if trending_in_genres:
                genre_names = ', '.join(user_context['preferred_genres'][:2])
                recommendations.append({
                    'category': f"Trending {genre_names}",
                    'movies': trending_in_genres[:8],
                    'recommendation_type': 'trending_genres'
                })
        
        # 3. Hidden gems based on user taste
        if liked_movie_ids:
            hidden_gems = self._get_hidden_gems(liked_movie_ids, user_context, exclude_ids, n=12)
            if hidden_gems:
                recommendations.append({
                    'category': "Hidden Gems for You",
                    'movies': hidden_gems[:8],
                    'recommendation_type': 'hidden_gems'
                })
        
        # 4. Enhanced content-based recommendations
        if liked_movie_ids:
            content_based_recs = self.content_recommender.get_recommendations_by_liked_movies(
                liked_movie_ids, n=24, diversity_factor=0.6
            )
            
            # Apply user context filtering
            content_based_recs = self._apply_user_context_filtering(content_based_recs, user_context)
            content_based_recs = [movie for movie in content_based_recs if movie['id'] not in exclude_ids]
            
            if content_based_recs:
                recommendations.append({
                    'category': "More Like What You Love",
                    'movies': content_based_recs[:12],
                    'recommendation_type': 'content_based'
                })
        
        # 5. Quiz-based recommendations with behavioral adjustments
        if quiz_genres:
            quiz_recs = self._get_enhanced_quiz_recommendations(
                quiz_genres, quiz_year_range, quiz_duration, user_patterns, exclude_ids, n=16
            )
            
            if quiz_recs:
                recommendations.append({
                    'category': "Picked for You",
                    'movies': quiz_recs[:12],
                    'recommendation_type': 'quiz_based'
                })
        
        # 6. Director/Actor deep dive (if user shows pattern of following creators)
        if user_patterns.get('follows_directors') or user_patterns.get('follows_actors'):
            creator_recs = self._get_creator_recommendations(liked_movie_ids, user_patterns, exclude_ids, n=12)
            if creator_recs:
                recommendations.append({
                    'category': "From Your Favorite Creators",
                    'movies': creator_recs[:8],
                    'recommendation_type': 'creator_based'
                })
        
        return recommendations
    
    def _analyze_user_behavior(self, watch_history, liked_movies):
        """Analyze user behavior patterns for personalization"""
        patterns = {
            'completion_rate': 0,
            'rewatch_tendency': 0,
            'genre_diversity': 0,
            'follows_directors': False,
            'follows_actors': False,
            'prefers_popular': False,
            'average_rating_preference': 0
        }
        
        if not watch_history:
            return patterns
        
        # Analyze completion rates
        completed_count = sum(1 for item in watch_history if item.get('completed', False))
        patterns['completion_rate'] = completed_count / len(watch_history) if watch_history else 0
        
        # Analyze rewatch tendency
        movie_counts = {}
        for item in watch_history:
            movie_id = item.get('movieId')
            if movie_id:
                movie_counts[movie_id] = movie_counts.get(movie_id, 0) + 1
        
        rewatched_count = sum(1 for count in movie_counts.values() if count > 1)
        patterns['rewatch_tendency'] = rewatched_count / len(movie_counts) if movie_counts else 0
        
        # Analyze genre diversity
        all_genres = set()
        for movie in liked_movies:
            if isinstance(movie, dict) and 'genres' in movie:
                movie_genres = movie['genres'].split() if movie['genres'] else []
                all_genres.update(movie_genres)
        
        patterns['genre_diversity'] = len(all_genres)
        
        # Check if user follows specific directors/actors (simplified)
        patterns['follows_directors'] = patterns['genre_diversity'] < 4  # Less diverse suggests following specific creators
        patterns['follows_actors'] = patterns['rewatch_tendency'] > 0.1
        
        return patterns
    
    def _extract_preferred_genres(self, liked_movies, watch_history, quiz_genres):
        """Extract user's preferred genres from behavior"""
        genre_counts = {}
        
        # Count from liked movies (higher weight)
        for movie in liked_movies:
            if isinstance(movie, dict) and 'genres' in movie and movie['genres']:
                for genre in movie['genres'].split():
                    genre_counts[genre] = genre_counts.get(genre, 0) + 3
        
        # Count from quiz preferences (medium weight)
        for genre in quiz_genres:
            genre_counts[genre] = genre_counts.get(genre, 0) + 2
        
        # Count from watch history (lower weight but volume matters)
        for item in watch_history:
            if item.get('genres'):
                for genre in item['genres'].split():
                    genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        # Return top genres
        sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
        return [genre for genre, count in sorted_genres[:5]]
    
    def _extract_decade_preference(self, liked_movies, watch_history):
        """Extract user's decade preference"""
        decade_counts = {}
        
        all_movies = []
        if isinstance(liked_movies, list):
            all_movies.extend(liked_movies)
        if isinstance(watch_history, list):
            all_movies.extend(watch_history)
        
        for movie in all_movies:
            release_date = movie.get('release_date') if isinstance(movie, dict) else None
            if release_date:
                try:
                    year = int(release_date[:4])
                    decade = (year // 10) * 10
                    decade_counts[decade] = decade_counts.get(decade, 0) + 1
                except (ValueError, TypeError):
                    continue
        
        if decade_counts:
            return max(decade_counts.items(), key=lambda x: x[1])[0]
        return None
    
    def _prioritize_liked_movies(self, liked_movie_ids, user_patterns):
        """Prioritize liked movies based on user engagement patterns"""
        # For now, return most recent (later can add engagement scoring)
        return liked_movie_ids[:5]  # Return up to 5 most relevant
    
    def _get_trending_in_genres(self, preferred_genres, exclude_ids, n=12):
        """Get trending movies in user's preferred genres"""
        # Simplified implementation - in production, this would connect to trending data
        genre_movies = []
        
        for movie in self.content_recommender.movies_df.to_dict('records'):
            if movie['id'] in exclude_ids:
                continue
                
            if 'genres' in movie and movie['genres']:
                movie_genres = movie['genres'].split()
                if any(genre in preferred_genres for genre in movie_genres):
                    # Add popularity/recency boost
                    movie['trending_score'] = movie.get('popularity', 0) * 0.7 + movie.get('vote_average', 0) * 30
                    genre_movies.append(movie)
        
        return sorted(genre_movies, key=lambda x: x.get('trending_score', 0), reverse=True)[:n]
    
    def _get_hidden_gems(self, liked_movie_ids, user_context, exclude_ids, n=12):
        """Find hidden gems (lower popularity but high quality) matching user taste"""
        hidden_gems = []
        
        # Get similar movies to liked ones
        for movie_id in liked_movie_ids[:3]:
            similar = self.content_recommender.get_similar_movies(movie_id, n=20, min_similarity=0.2)
            hidden_gems.extend(similar)
        
        # Filter for hidden gems criteria
        filtered_gems = []
        for movie in hidden_gems:
            if movie['id'] in exclude_ids:
                continue
                
            popularity = movie.get('popularity', 0)
            rating = movie.get('vote_average', 0)
            
            # Hidden gem criteria: decent rating but lower popularity
            if rating >= 7.0 and popularity < 50 and popularity > 5:
                movie['gem_score'] = rating * 10 + (50 - popularity) * 0.1
                filtered_gems.append(movie)
        
        # Remove duplicates and sort by gem score
        seen_ids = set()
        unique_gems = []
        for movie in sorted(filtered_gems, key=lambda x: x.get('gem_score', 0), reverse=True):
            if movie['id'] not in seen_ids:
                seen_ids.add(movie['id'])
                unique_gems.append(movie)
        
        return unique_gems[:n]
    
    def _get_enhanced_quiz_recommendations(self, genres, year_range, duration, user_patterns, exclude_ids, n=16):
        """Enhanced quiz-based recommendations with behavioral adjustments"""
        base_recs = self._get_quiz_based_recommendations(genres, year_range, duration, exclude_ids, n)
        
        # Apply behavioral adjustments
        for movie in base_recs:
            score_adjustment = 0
            
            # Adjust based on user's completion rate preference
            if user_patterns.get('completion_rate', 0) > 0.8:
                # User finishes movies - slightly favor higher-rated ones
                rating = movie.get('vote_average', 0)
                if rating >= 8.0:
                    score_adjustment += 0.1
            
            # Adjust based on popularity preference
            popularity = movie.get('popularity', 0)
            if user_patterns.get('prefers_popular', False) and popularity > 100:
                score_adjustment += 0.05
            elif not user_patterns.get('prefers_popular', False) and popularity < 50:
                score_adjustment += 0.05
            
            # Apply adjustment
            current_score = movie.get('combined_score', movie.get('popularity', 0))
            movie['combined_score'] = current_score + score_adjustment
        
        return sorted(base_recs, key=lambda x: x.get('combined_score', 0), reverse=True)
    
    def _get_creator_recommendations(self, liked_movie_ids, user_patterns, exclude_ids, n=12):
        """Get recommendations from directors/actors the user seems to follow"""
        creator_recs = []
        
        # Extract directors and actors from liked movies
        directors = set()
        actors = set()
        
        for movie_id in liked_movie_ids:
            movie = self._get_movie_details(movie_id)
            if movie:
                if 'director' in movie and movie['director']:
                    directors.add(movie['director'])
                if 'cast' in movie and movie['cast']:
                    actors.update(movie['cast'].split()[:3])  # Top 3 actors
        
        # Find other movies by these creators
        for movie in self.content_recommender.movies_df.to_dict('records'):
            if movie['id'] in exclude_ids:
                continue
                
            movie_director = movie.get('director', '')
            movie_cast = set(movie.get('cast', '').split()[:5])
            
            score = 0
            if movie_director in directors:
                score += 0.8
            
            actor_overlap = len(actors & movie_cast)
            if actor_overlap > 0:
                score += actor_overlap * 0.3
            
            if score > 0:
                movie['creator_score'] = score
                creator_recs.append(movie)
        
        return sorted(creator_recs, key=lambda x: x.get('creator_score', 0), reverse=True)[:n]
    
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
