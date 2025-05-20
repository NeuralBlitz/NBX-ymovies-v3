import { db } from "../db";
import { TMDBService } from "./tmdb";
import { storage } from "../storage";
import { UserPreferences, WatchHistory } from "@shared/schema";
import { Movie } from "@/types/movie";
import { sql } from "drizzle-orm";

type UserMovieRating = {
  userId: string;
  movieId: number;
  rating: number; // Implicit rating based on watch progress or explicit rating
};

type MovieSimilarity = {
  movieId: number;
  similarityScore: number;
};

export class RecommendationEngine {
  private tmdbService: TMDBService;
  
  constructor(tmdbApiKey: string) {
    this.tmdbService = new TMDBService(tmdbApiKey);
  }

  /**
   * Get recommendations for a user based on collaborative filtering
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 20): Promise<Movie[]> {
    try {
      // Get user's preferences
      const userPreferences = await storage.getUserPreferences(userId);
      
      // Get user's watch history
      const watchHistory = await storage.getWatchHistory(userId);
      
      // Get user's watchlist
      const watchlist = await storage.getWatchlistItems(userId);
      
      // Calculate already watched movie IDs to exclude from recommendations
      const watchedMovieIds = new Set(watchHistory.map(item => item.movieId));
      const watchlistMovieIds = new Set(watchlist.map(item => item.movieId));
      
      // If user has preferences, use them for content-based filtering
      if (userPreferences) {
        const contentBasedRecs = await this.getContentBasedRecommendations(
          userPreferences,
          Array.from(watchedMovieIds),
          Array.from(watchlistMovieIds),
          limit
        );
        
        // If user has watch history, blend with collaborative filtering
        if (watchHistory.length > 0) {
          const collaborativeRecs = await this.getCollaborativeFilteringRecommendations(
            userId,
            watchHistory,
            Array.from(watchedMovieIds),
            Array.from(watchlistMovieIds),
            limit
          );
          
          // Blend both recommendation approaches (50/50 split)
          return this.blendRecommendations(
            contentBasedRecs, 
            collaborativeRecs, 
            limit
          );
        }
        
        return contentBasedRecs;
      }
      
      // If user has watch history but no preferences
      if (watchHistory.length > 0) {
        return this.getCollaborativeFilteringRecommendations(
          userId,
          watchHistory,
          Array.from(watchedMovieIds),
          Array.from(watchlistMovieIds),
          limit
        );
      }
      
      // Fallback to popular movies if no data available
      return this.getPopularMoviesRecommendations(
        Array.from(watchedMovieIds),
        Array.from(watchlistMovieIds),
        limit
      );
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      // Fallback to trending movies
      return this.tmdbService.getTrending();
    }
  }

  /**
   * Get content-based recommendations based on user preferences
   */
  private async getContentBasedRecommendations(
    preferences: UserPreferences,
    watchedMovieIds: number[],
    watchlistMovieIds: number[],
    limit: number
  ): Promise<Movie[]> {
    // Extract user preferences
    const preferredGenres = preferences.likedGenres || []; // Changed from preferredGenres
    const yearRange = preferences.yearRange || null;
    // preferredLanguages removed as it's not in UserPreferences
    
    // Build discover params based on preferences
    const discoverParams: Record<string, string> = {};
    
    // Add genre preferences
    if (preferredGenres.length > 0) {
      discoverParams.with_genres = preferredGenres.join(',');
    }
    
    // Add year range if specified
    if (yearRange) {
      const [minYear, maxYear] = yearRange.split('-');
      if (minYear) discoverParams.primary_release_date_gte = `${minYear}-01-01`;
      if (maxYear) discoverParams.primary_release_date_lte = `${maxYear}-12-31`;
    }
    
    // Add language preferences - REMOVED
    // if (preferredLanguages.length > 0) {
    //   discoverParams.with_original_language = preferredLanguages[0]; // TMDb only supports one language filter
    // }
    
    // Sort by popularity but maintain diversity
    discoverParams.sort_by = 'popularity.desc';
    
    // Discover movies with these params
    const recommendedMovies = await this.tmdbService.discoverMovies(discoverParams);
    
    // Filter out already watched movies and movies in watchlist
    const filteredMovies = recommendedMovies.filter(
      movie => !watchedMovieIds.includes(movie.id) && !watchlistMovieIds.includes(movie.id)
    );
    
    return filteredMovies.slice(0, limit);
  }

  /**
   * Get recommendations using collaborative filtering approach
   */
  private async getCollaborativeFilteringRecommendations(
    userId: string,
    userWatchHistory: WatchHistory[],
    watchedMovieIds: number[],
    watchlistMovieIds: number[],
    limit: number
  ): Promise<Movie[]> {
    try {
      // 1. Convert watch history to implicit ratings (based on completion percentage and rewatches)
      const userRatings: UserMovieRating[] = userWatchHistory.map(history => ({
        userId,
        movieId: history.movieId,
        rating: this.calculateImplicitRating(history)
      }));
      
      // 2. Find similar users based on watch history overlap
      const similarUsers = await this.findSimilarUsers(userId, userRatings);
      
      // 3. Get movies watched by similar users that current user hasn't watched
      const recommendations: MovieSimilarity[] = [];
      
      // For each similar user, fetch their watch history
      for (const simUser of similarUsers) {
        const simUserHistory = await storage.getWatchHistory(simUser.userId);
        
        for (const historyItem of simUserHistory) {
          // Skip if current user already watched this movie or has it in watchlist
          if (watchedMovieIds.includes(historyItem.movieId) || 
              watchlistMovieIds.includes(historyItem.movieId)) {
            continue;
          }
          
          // Calculate recommendation score based on user similarity and implicit rating
          const score = simUser.similarity * this.calculateImplicitRating(historyItem);
          
          // Find if this movie is already in recommendations
          const existingRec = recommendations.find(r => r.movieId === historyItem.movieId);
          
          if (existingRec) {
            // Update score if this recommendation already exists
            existingRec.similarityScore += score;
          } else {
            // Add new recommendation
            recommendations.push({
              movieId: historyItem.movieId,
              similarityScore: score
            });
          }
        }
      }
      
      // 4. Sort recommendations by score
      recommendations.sort((a, b) => b.similarityScore - a.similarityScore);
      
      // 5. Get movie details for top recommendations
      const topRecommendations = recommendations.slice(0, limit);
      const movieIds = topRecommendations.map(rec => rec.movieId);
      
      if (movieIds.length === 0) {
        // Fallback to popular movies if no collaborative recommendations available
        return this.getPopularMoviesRecommendations(watchedMovieIds, watchlistMovieIds, limit);
      }
      
      return await this.tmdbService.getMoviesByIds(movieIds);
      
    } catch (error) {
      console.error("Error in collaborative filtering:", error);
      // Fallback to popular movies
      return this.getPopularMoviesRecommendations(watchedMovieIds, watchlistMovieIds, limit);
    }
  }

  /**
   * Calculate implicit rating based on watch history
   */
  private calculateImplicitRating(history: WatchHistory): number {
    // Base rating
    let rating = 3;
    
    // Adjust based on watch progress
    if (history.watchProgress) {
      // If user watched more than 75%, they likely enjoyed it
      if (history.watchProgress > 0.75) {
        rating += 1;
      } else if (history.watchProgress < 0.3) {
        // If user watched less than 30%, they probably didn't like it
        rating -= 1;
      }
    }
    
    // Adjust based on watch count (rewatches indicate strong preference)
    if (history.watchCount && history.watchCount > 1) {
      rating += Math.min(history.watchCount - 1, 2);  // Cap bonus at +2
    }
    
    // Keep rating in 1-5 range
    return Math.max(1, Math.min(5, rating));
  }

  /**
   * Find users with similar tastes
   */
  private async findSimilarUsers(userId: string, userRatings: UserMovieRating[]): Promise<{ userId: string; similarity: number }[]> {
    // This would typically use a more sophisticated algorithm in production
    // For demo purposes, we're using a simplified approach
    
    // 1. Get all users
    // Ensure you have 'sql' imported from 'drizzle-orm'
    // import { sql } from "drizzle-orm"; 
    // This import might be needed at the top of the file if not already present.
    const watchHistories = await db.execute(sql`
      SELECT DISTINCT user_id 
      FROM watch_history 
      WHERE user_id != ${userId}
    `);
    
    const otherUserIds = watchHistories.rows.map((row: any) => row.user_id as string);
    
    // 2. Calculate similarity for each user
    const similarities: { userId: string; similarity: number }[] = [];
    
    for (const otherId of otherUserIds) {
      const otherUserHistory = await storage.getWatchHistory(otherId);
      
      // Skip users with very little history
      if (otherUserHistory.length < 3) {
        continue;
      }
      
      // Convert to ratings format
      const otherRatings: UserMovieRating[] = otherUserHistory.map(history => ({
        userId: otherId,
        movieId: history.movieId,
        rating: this.calculateImplicitRating(history)
      }));
      
      // Find common movies
      const commonMovies = userRatings.filter(ur => 
        otherRatings.some(or => or.movieId === ur.movieId)
      );
      
      // Skip if not enough movies in common
      if (commonMovies.length < 2) {
        continue;
      }
      
      // Calculate Pearson correlation
      const similarity = this.calculatePearsonCorrelation(
        userRatings,
        otherRatings,
        commonMovies.map(m => m.movieId)
      );
      
      // Only consider positive correlations
      if (similarity > 0) {
        similarities.push({
          userId: otherId,
          similarity
        });
      }
    }
    
    // Sort by similarity (descending) and return top 10
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  /**
   * Calculate Pearson correlation between two users' ratings
   */
  private calculatePearsonCorrelation(
    user1Ratings: UserMovieRating[],
    user2Ratings: UserMovieRating[],
    commonMovieIds: number[]
  ): number {
    if (commonMovieIds.length === 0) return 0;
    
    // Extract ratings for common movies
    const ratings1: number[] = [];
    const ratings2: number[] = [];
    
    for (const movieId of commonMovieIds) {
      const r1 = user1Ratings.find(r => r.movieId === movieId)?.rating || 0;
      const r2 = user2Ratings.find(r => r.movieId === movieId)?.rating || 0;
      
      if (r1 > 0 && r2 > 0) {
        ratings1.push(r1);
        ratings2.push(r2);
      }
    }
    
    const n = ratings1.length;
    if (n < 2) return 0;  // Need at least 2 points for correlation
    
    // Calculate means
    const mean1 = ratings1.reduce((sum, r) => sum + r, 0) / n;
    const mean2 = ratings2.reduce((sum, r) => sum + r, 0) / n;
    
    // Calculate Pearson correlation coefficient
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = ratings1[i] - mean1;
      const diff2 = ratings2[i] - mean2;
      
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }
    
    if (denom1 === 0 || denom2 === 0) return 0;
    
    return numerator / Math.sqrt(denom1 * denom2);
  }

  /**
   * Blend multiple recommendation sources
   */
  private blendRecommendations(
    contentBasedRecs: Movie[],
    collaborativeRecs: Movie[],
    limit: number
  ): Movie[] {
    // Create a map for faster lookups
    const recommendationMap = new Map<number, { movie: Movie; score: number }>();
    
    // Add content-based recommendations (50% weight)
    contentBasedRecs.forEach((movie, index) => {
      const score = (contentBasedRecs.length - index) / contentBasedRecs.length * 0.5;
      recommendationMap.set(movie.id, { movie, score });
    });
    
    // Add collaborative filtering recommendations (50% weight)
    collaborativeRecs.forEach((movie, index) => {
      const score = (collaborativeRecs.length - index) / collaborativeRecs.length * 0.5;
      
      if (recommendationMap.has(movie.id)) {
        // If movie exists in both lists, add to its score
        recommendationMap.get(movie.id)!.score += score;
      } else {
        recommendationMap.set(movie.id, { movie, score });
      }
    });
    
    // Convert map back to array and sort by score
    const blendedRecs = Array.from(recommendationMap.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.movie)
      .slice(0, limit);
    
    return blendedRecs;
  }

  /**
   * Fallback to popular movies when no user data is available
   */
  private async getPopularMoviesRecommendations(
    watchedMovieIds: number[],
    watchlistMovieIds: number[],
    limit: number
  ): Promise<Movie[]> {
    const popularMovies = await this.tmdbService.getPopular();
    
    // Filter out already watched movies and movies in watchlist
    const filteredMovies = popularMovies.filter(
      movie => !watchedMovieIds.includes(movie.id) && !watchlistMovieIds.includes(movie.id)
    );
    
    return filteredMovies.slice(0, limit);
  }
}