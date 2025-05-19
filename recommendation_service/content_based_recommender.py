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
        Combine relevant features into a single string for TF-IDF processing
        """
        features = []
        
        # Add genres (weighted heavily)
        if 'genres' in row and row['genres']:
            # Add each genre three times to increase weight
            genres = row['genres'].split()
            features.extend([g for g in genres for _ in range(3)])
        
        # Add overview
        if 'overview' in row and row['overview']:
            features.append(row['overview'])
        
        # Add cast if available (weighted)
        if 'cast' in row and row['cast']:
            cast_list = row['cast'].split()[:5]  # Consider top 5 cast members
            features.extend([c for c in cast_list for _ in range(2)])  # Add twice for weight
        
        # Add director if available (weighted heavily)
        if 'director' in row and row['director']:
            features.extend([row['director']] * 3)  # Add three times for weight
        
        # Add keywords if available
        if 'keywords' in row and row['keywords']:
            features.append(row['keywords'])
        
        return ' '.join(features)
    
    def get_similar_movies(self, movie_id, n=10, min_similarity=0):
        """
        Get n movies most similar to the given movie_id
        
        Parameters:
        -----------
        movie_id: int
            ID of the movie to find similarities for
        n: int
            Number of similar movies to return
        min_similarity: float
            Minimum similarity score (0-1) to include
            
        Returns:
        --------
        List of dicts with similar movie details and similarity scores
        """
        # Find movie index
        movie_index = self.movies_df[self.movies_df['id'] == movie_id].index
        if len(movie_index) == 0:
            return []
        
        movie_index = movie_index[0]
        
        # Get similarity scores
        sim_scores = list(enumerate(self.similarity_matrix[movie_index]))
        
        # Sort by similarity
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Filter by minimum similarity and exclude the input movie
        sim_scores = [s for s in sim_scores if s[0] != movie_index and s[1] >= min_similarity]
        
        # Get top N
        sim_scores = sim_scores[:n]
        
        # Extract movie indices
        movie_indices = [i[0] for i in sim_scores]
        
        # Get similarity values
        similarities = [i[1] for i in sim_scores]
        
        # Get movie data with similarity scores
        result = self.movies_df.iloc[movie_indices].copy()
        result['similarity'] = similarities
        
        return result.to_dict('records')
    
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
