import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ContentBasedRecommender:
    """
    Content-based recommendation system using movie features like plot, genres, cast, etc.
    """
    
    def __init__(self):
        self.movies_df = None
        self.tfidf_matrix = None
        self.feature_names = None
        self.similarity_matrix = None
        
    def fit(self, movies_df):
        """
        Fit the recommender with movie data
        
        Parameters:
        -----------
        movies_df: pandas DataFrame with movie features
            Must contain columns: id, title, overview, genres
            Optional: cast, crew, keywords
        """
        self.movies_df = movies_df.copy()
        
        # Create combined features for content similarity
        self.movies_df['combined_features'] = self.movies_df.apply(self._combine_features, axis=1)
        
        # Create TF-IDF vectorizer
        tfidf = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),  # Include bigrams for better context
            min_df=2,  # Minimum document frequency
            max_features=5000  # Limit features to avoid dimensionality issues
        )
        
        # Create TF-IDF matrix
        self.tfidf_matrix = tfidf.fit_transform(self.movies_df['combined_features'].fillna(''))
        
        # Store feature names for later analysis
        self.feature_names = tfidf.get_feature_names_out()
          # Calculate cosine similarity matrix
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        
        return self
    
    def _combine_features(self, row):
        """
        Enhanced feature combination with better weighting strategy
        """
        features = []
        
        # Add genres (heavily weighted - core identity of a movie)
        if 'genres' in row and row['genres']:
            genres = row['genres'].split()
            # Weight genres based on specificity - more specific genres get higher weight
            for genre in genres:
                weight = 4 if genre in ['Thriller', 'Horror', 'Romance', 'Comedy'] else 3
                features.extend([f"genre_{genre}"] * weight)
        
        # Add director (high weight - strong indicator of style)
        if 'director' in row and row['director']:
            features.extend([f"director_{row['director']}"] * 4)
        
        # Add main cast (medium-high weight)
        if 'cast' in row and row['cast']:
            cast_list = row['cast'].split()[:3]  # Top 3 cast members
            for actor in cast_list:
                features.extend([f"actor_{actor}"] * 2)
        
        # Add keywords (medium weight - thematic elements)
        if 'keywords' in row and row['keywords']:
            keywords = row['keywords'].split()[:10]  # Top 10 keywords
            features.extend([f"keyword_{kw}" for kw in keywords])
        
        # Add production companies (low-medium weight)
        if 'production_companies' in row and row['production_companies']:
            companies = row['production_companies'].split()[:2]  # Top 2 companies
            features.extend([f"studio_{comp}" for comp in companies])
        
        # Add decade (temporal similarity)
        if 'release_date' in row and row['release_date']:
            try:
                year = int(row['release_date'][:4])
                decade = (year // 10) * 10
                features.extend([f"decade_{decade}"] * 2)
            except (ValueError, TypeError):
                pass
        
        # Add rating category (audience similarity)
        if 'vote_average' in row and row['vote_average']:
            try:
                rating = float(row['vote_average'])
                if rating >= 8.0:
                    features.extend(["rating_excellent"] * 2)
                elif rating >= 7.0:
                    features.extend(["rating_good"] * 2)
                elif rating >= 6.0:
                    features.extend(["rating_decent"] * 1)
            except (ValueError, TypeError):
                pass
        
        # Add runtime category
        if 'runtime' in row and row['runtime']:
            try:
                runtime = int(row['runtime'])
                if runtime < 90:
                    features.append("runtime_short")
                elif runtime < 120:
                    features.append("runtime_medium")
                else:
                    features.append("runtime_long")
            except (ValueError, TypeError):
                pass
        
        # Add overview (processed for key themes)
        if 'overview' in row and row['overview']:            # Extract key thematic words from overview
            overview_words = row['overview'].lower().split()
            thematic_words = [word for word in overview_words if len(word) > 4 and 
                            word not in ['movie', 'film', 'story', 'about', 'when', 'after', 'before']]
            features.extend(thematic_words[:15])  # Top 15 thematic words
        
        return ' '.join(features)
    
    def get_similar_movies(self, movie_id, n=10, min_similarity=0, diversity_factor=0.3):
        """
        Enhanced similarity calculation with multiple approaches and diversity
        
        Parameters:
        -----------
        movie_id: int
            ID of the movie to find similarities for
        n: int
            Number of similar movies to return
        min_similarity: float
            Minimum similarity score (0-1) to include
        diversity_factor: float
            Factor to promote diversity (0-1): higher means more diverse
            
        Returns:
        --------
        List of dicts with similar movie details and similarity scores
        """
        # Find movie index
        movie_index = self.movies_df[self.movies_df['id'] == movie_id].index
        if len(movie_index) == 0:
            return []
        
        movie_index = movie_index[0]
        movie_data = self.movies_df.iloc[movie_index]
        
        # Get multiple similarity approaches
        content_sim_scores = self._get_content_similarity_scores(movie_index)
        genre_sim_scores = self._get_genre_similarity_scores(movie_data)
        cast_sim_scores = self._get_cast_similarity_scores(movie_data)
        
        # Combine similarity scores with weights
        combined_scores = []
        for i in range(len(self.movies_df)):
            if i == movie_index:
                continue
                
            # Weighted combination of different similarity types
            content_score = content_sim_scores[i] * 0.5  # Content features
            genre_score = genre_sim_scores[i] * 0.3      # Genre similarity
            cast_score = cast_sim_scores[i] * 0.2        # Cast similarity
            
            combined_score = content_score + genre_score + cast_score
            
            # Apply diversity penalty for very similar movies
            if diversity_factor > 0:
                diversity_penalty = self._calculate_diversity_penalty(
                    movie_data, self.movies_df.iloc[i], diversity_factor
                )
                combined_score *= (1 - diversity_penalty)
            
            combined_scores.append((i, combined_score))
        
        # Sort by combined similarity
        combined_scores = sorted(combined_scores, key=lambda x: x[1], reverse=True)
        
        # Filter by minimum similarity and get top N
        filtered_scores = [s for s in combined_scores if s[1] >= min_similarity][:n]
        
        # Extract movie indices and scores
        movie_indices = [i[0] for i in filtered_scores]
        similarities = [i[1] for i in filtered_scores]
        
        # Get movie data with similarity scores and recommendation reasons
        result = self.movies_df.iloc[movie_indices].copy()
        result['similarity'] = similarities
        
        # Add detailed recommendation reasons
        for idx, (result_idx, sim_score) in enumerate(zip(movie_indices, similarities)):
            result.iloc[idx] = self._add_recommendation_reason(
                movie_data, self.movies_df.iloc[result_idx], sim_score
            )
        
        return result.to_dict('records')
    
    def _get_content_similarity_scores(self, movie_index):
        """Get content-based similarity scores using TF-IDF"""
        return self.similarity_matrix[movie_index]
    
    def _get_genre_similarity_scores(self, source_movie):
        """Calculate genre-based similarity"""
        if 'genres' not in source_movie or not source_movie['genres']:
            return np.zeros(len(self.movies_df))
        
        source_genres = set(source_movie['genres'].split())
        scores = []
        
        for _, movie in self.movies_df.iterrows():
            if 'genres' not in movie or not movie['genres']:
                scores.append(0)
                continue
                
            movie_genres = set(movie['genres'].split())
            
            # Jaccard similarity for genres
            intersection = len(source_genres & movie_genres)
            union = len(source_genres | movie_genres)
            
            if union == 0:
                scores.append(0)
            else:
                jaccard_score = intersection / union
                # Boost score if key genres match
                key_genres = {'Thriller', 'Horror', 'Romance', 'Comedy', 'Action', 'Drama'}
                key_match_boost = len((source_genres & movie_genres) & key_genres) * 0.1
                scores.append(min(1.0, jaccard_score + key_match_boost))
        
        return np.array(scores)
    
    def _get_cast_similarity_scores(self, source_movie):
        """Calculate cast-based similarity"""
        if 'cast' not in source_movie or not source_movie['cast']:
            return np.zeros(len(self.movies_df))
        
        source_cast = set(source_movie['cast'].split()[:5])  # Top 5 cast
        scores = []
        
        for _, movie in self.movies_df.iterrows():
            if 'cast' not in movie or not movie['cast']:
                scores.append(0)
                continue
                
            movie_cast = set(movie['cast'].split()[:5])
            
            # Calculate cast overlap
            overlap = len(source_cast & movie_cast)
            max_possible = min(len(source_cast), len(movie_cast))
            
            if max_possible == 0:
                scores.append(0)
            else:
                scores.append(overlap / max_possible)
        
        return np.array(scores)
    
    def _calculate_diversity_penalty(self, source_movie, target_movie, diversity_factor):
        """Calculate penalty for movies that are too similar (to promote diversity)"""
        penalty = 0
        
        # Same director penalty
        if ('director' in source_movie and 'director' in target_movie and 
            source_movie['director'] == target_movie['director']):
            penalty += 0.2
        
        # Same year penalty
        if ('release_date' in source_movie and 'release_date' in target_movie):
            try:
                source_year = int(source_movie['release_date'][:4])
                target_year = int(target_movie['release_date'][:4])
                if abs(source_year - target_year) <= 1:
                    penalty += 0.1
            except (ValueError, TypeError):
                pass
        
        # Same franchise/series penalty (if titles are very similar)
        if ('title' in source_movie and 'title' in target_movie):
            source_title_words = set(source_movie['title'].lower().split())
            target_title_words = set(target_movie['title'].lower().split())
            word_overlap = len(source_title_words & target_title_words)
            if word_overlap >= 2:
                penalty += 0.15
        
        return min(penalty * diversity_factor, 0.5)  # Cap penalty at 50%
    
    def _add_recommendation_reason(self, source_movie, target_movie, similarity_score):
        """Add detailed reasoning for why this movie was recommended"""
        reasons = []
        
        # Check genre matches
        if 'genres' in source_movie and 'genres' in target_movie:
            source_genres = set(source_movie['genres'].split())
            target_genres = set(target_movie['genres'].split())
            common_genres = source_genres & target_genres
            if common_genres:
                reasons.append(f"Similar genres: {', '.join(list(common_genres)[:2])}")
        
        # Check director match
        if ('director' in source_movie and 'director' in target_movie and 
            source_movie['director'] == target_movie['director']):
            reasons.append(f"Same director: {source_movie['director']}")
        
        # Check cast overlap
        if 'cast' in source_movie and 'cast' in target_movie:
            source_cast = set(source_movie['cast'].split()[:3])
            target_cast = set(target_movie['cast'].split()[:3])
            common_actors = source_cast & target_cast
            if common_actors:
                reasons.append(f"Shared cast: {', '.join(list(common_actors)[:2])}")
        
        # Add the reason to the movie data
        enhanced_movie = target_movie.copy()
        enhanced_movie['recommendation_reason_details'] = '; '.join(reasons) if reasons else 'Similar themes and style'
        enhanced_movie['similarity'] = similarity_score
        
        return enhanced_movie
    
    def get_recommendations_by_liked_movies(self, liked_movie_ids, n=20, diversity_factor=0.5):
        """
        Get recommendations based on a list of movies the user liked
        
        Parameters:
        -----------
        liked_movie_ids: list
            List of movie IDs that the user liked
        n: int
            Number of recommendations to generate
        diversity_factor: float
            Factor to control diversity (0-1): higher means more diverse
            
        Returns:
        --------
        List of dicts with recommended movie details and relevance scores
        """
        if not liked_movie_ids or len(liked_movie_ids) == 0:
            return []
        
        # Filter for valid movie IDs that exist in our dataset
        valid_ids = [mid for mid in liked_movie_ids if mid in self.movies_df['id'].values]
        
        if len(valid_ids) == 0:
            return []
        
        # Get similar movies for each liked movie
        all_similar_movies = {}
        for movie_id in valid_ids:
            similar_movies = self.get_similar_movies(movie_id, n=50, min_similarity=0.1)
            
            for movie in similar_movies:
                # Skip if it's one of the liked movies
                if movie['id'] in liked_movie_ids:
                    continue
                    
                # If movie already in results, update score
                if movie['id'] in all_similar_movies:
                    # Use a diminishing returns approach for diversity
                    current_score = all_similar_movies[movie['id']]['relevance_score']
                    new_score = current_score + (movie['similarity'] * (1 - current_score * diversity_factor))
                    all_similar_movies[movie['id']]['relevance_score'] = new_score
                else:
                    # Add new movie to results
                    movie_copy = dict(movie)
                    movie_copy['relevance_score'] = movie['similarity']
                    movie_copy['source_movie_id'] = movie_id
                    all_similar_movies[movie['id']] = movie_copy
        
        # Convert to list and sort by relevance score
        recommendations = list(all_similar_movies.values())
        recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Return top N recommendations
        return recommendations[:n]
    
    def get_movie_feature_importance(self, movie_id):
        """
        Extract the most important features for a movie based on TF-IDF
        
        Parameters:
        -----------
        movie_id: int
            ID of the movie to analyze
            
        Returns:
        --------
        Dict with feature importance information
        """
        # Find movie index
        movie_index = self.movies_df[self.movies_df['id'] == movie_id].index
        if len(movie_index) == 0 or self.tfidf_matrix is None:
            return {}
        
        movie_index = movie_index[0]
        
        # Get the movie's feature vector
        feature_vector = self.tfidf_matrix[movie_index].toarray()[0]
        
        # Get feature names and their importance
        feature_importance = [(name, score) for name, score in zip(self.feature_names, feature_vector) if score > 0]
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        # Return top features
        return {
            'movie_id': movie_id,
            'title': self.movies_df.iloc[movie_index]['title'],
            'top_features': feature_importance[:20]
        }
