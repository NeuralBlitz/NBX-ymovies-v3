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
   * Calculate enhanced implicit rating based on watch history with behavioral analysis
   */
  private calculateImplicitRating(history: WatchHistory): number {
    // Base rating starts neutral
    let rating = 3;
    
    // 1. Watch progress analysis (primary indicator)
    if (history.watchProgress) {
      if (history.watchProgress >= 0.9) {
        // Completed viewing indicates strong engagement
        rating += 1.5;
      } else if (history.watchProgress >= 0.75) {
        // High completion rate
        rating += 1;
      } else if (history.watchProgress >= 0.5) {
        // Moderate engagement
        rating += 0.3;
      } else if (history.watchProgress < 0.3) {
        // Early abandonment suggests dislike
        rating -= 1.2;
      } else if (history.watchProgress < 0.15) {
        // Very early abandonment
        rating -= 1.8;
      }
    }
    
    // 2. Rewatch behavior (strong preference indicator)
    if (history.watchCount && history.watchCount > 1) {
      // Multiple viewings indicate strong preference
      const rewatchBonus = Math.min((history.watchCount - 1) * 0.8, 2);
      rating += rewatchBonus;
    }
    
    // 3. Viewing recency (fresher preferences weighted higher)
    if (history.watchedAt) {
      const daysSinceWatch = (Date.now() - new Date(history.watchedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceWatch < 7) {
        rating += 0.2; // Recent viewing bonus
      } else if (daysSinceWatch > 365) {
        rating -= 0.1; // Older preferences slightly less relevant
      }
    }
    
    // 4. Watch duration analysis (based on available data)
    if (history.watchDuration && history.watchDuration > 0) {
      // Assume average movie is 2 hours, adjust rating based on watch duration
      const avgMovieLength = 120 * 60; // 120 minutes in seconds
      const completionRatio = history.watchDuration / avgMovieLength;
      if (completionRatio > 0.9) {
        // Watched most/all of expected runtime
        rating += 0.3;
      } else if (completionRatio < 0.3) {
        // Very short watch time suggests disinterest
        rating -= 0.2;
      }
    }
    
    // 6. Rating context based on user's average behavior
    // Note: This would require user's historical average, simplified for now
    
    // Keep rating in 1-5 range with more nuanced scoring
    return Math.max(1, Math.min(5, rating));
  }

  /**
   * Find users with similar tastes using enhanced similarity algorithms
   */
  private async findSimilarUsers(userId: string, userRatings: UserMovieRating[]): Promise<{ userId: string; similarity: number }[]> {
    // Get all other users with sufficient watch history
    const watchHistories = await db.execute(sql`
      SELECT DISTINCT user_id 
      FROM watch_history 
      WHERE user_id != ${userId}
    `);
    
    const otherUserIds = watchHistories.rows.map((row: any) => row.user_id as string);
    
    // Calculate similarity for each user with multiple approaches
    const similarities: { userId: string; similarity: number }[] = [];
    
    for (const otherId of otherUserIds) {
      const otherUserHistory = await storage.getWatchHistory(otherId);
      
      // Skip users with insufficient history
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
      
      // Need sufficient overlap for meaningful comparison
      if (commonMovies.length < 2) {
        continue;
      }
      
      // Calculate multiple similarity metrics
      const pearsonSim = this.calculatePearsonCorrelation(
        userRatings,
        otherRatings,
        commonMovies.map(m => m.movieId)
      );
      
      const cosineSim = this.calculateCosineSimilarity(
        userRatings,
        otherRatings,
        commonMovies.map(m => m.movieId)
      );
      
      const jaccardSim = this.calculateJaccardSimilarity(
        userRatings,
        otherRatings
      );
      
      // Weighted combination of similarity measures
      const combinedSimilarity = (
        pearsonSim * 0.5 +     // Pearson for rating agreement
        cosineSim * 0.3 +      // Cosine for preference alignment  
        jaccardSim * 0.2       // Jaccard for taste overlap
      );
      
      // Apply overlap boost - more common movies = more reliable similarity
      const overlapBoost = Math.min(commonMovies.length / 10, 0.2);
      const finalSimilarity = combinedSimilarity + overlapBoost;
      
      // Only consider meaningful similarities
      if (finalSimilarity > 0.1) {
        similarities.push({
          userId: otherId,
          similarity: finalSimilarity
        });
      }
    }
    
    // Sort by similarity (descending) and return top 15 for more diverse recommendations
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 15);
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
   * Calculate Cosine similarity between two users' rating vectors
   */
  private calculateCosineSimilarity(
    user1Ratings: UserMovieRating[],
    user2Ratings: UserMovieRating[],
    commonMovieIds: number[]
  ): number {
    if (commonMovieIds.length === 0) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const movieId of commonMovieIds) {
      const r1 = user1Ratings.find(r => r.movieId === movieId)?.rating || 0;
      const r2 = user2Ratings.find(r => r.movieId === movieId)?.rating || 0;
      
      if (r1 > 0 && r2 > 0) {
        dotProduct += r1 * r2;
        norm1 += r1 * r1;
        norm2 += r2 * r2;
      }
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate Jaccard similarity for binary preference overlap
   */
  private calculateJaccardSimilarity(
    user1Ratings: UserMovieRating[],
    user2Ratings: UserMovieRating[]
  ): number {
    // Consider movies with rating >= 3.5 as "liked"
    const user1Liked = new Set(
      user1Ratings.filter(r => r.rating >= 3.5).map(r => r.movieId)
    );
    const user2Liked = new Set(
      user2Ratings.filter(r => r.rating >= 3.5).map(r => r.movieId)
    );
    
    const intersection = new Set(Array.from(user1Liked).filter(id => user2Liked.has(id)));
    const union = new Set([...Array.from(user1Liked), ...Array.from(user2Liked)]);
    
    if (union.size === 0) return 0;
    
    return intersection.size / union.size;
  }

  /**
   * Enhanced blending of multiple recommendation sources with Netflix-like scoring
   */
  private blendRecommendations(
    contentBasedRecs: Movie[],
    collaborativeRecs: Movie[],
    limit: number
  ): Movie[] {
    // Create a sophisticated scoring map
    const recommendationMap = new Map<number, { 
      movie: Movie; 
      contentScore: number; 
      collaborativeScore: number; 
      combinedScore: number;
      sources: string[];
    }>();
    
    // Add content-based recommendations with position-based scoring
    contentBasedRecs.forEach((movie, index) => {
      const positionScore = Math.exp(-index * 0.1); // Exponential decay for position
      const contentScore = positionScore * 0.6; // Content weight
      
      recommendationMap.set(movie.id, { 
        movie, 
        contentScore,
        collaborativeScore: 0,
        combinedScore: contentScore,
        sources: ['content']
      });
    });
    
    // Add collaborative filtering recommendations
    collaborativeRecs.forEach((movie, index) => {
      const positionScore = Math.exp(-index * 0.1);
      const collaborativeScore = positionScore * 0.6; // Collaborative weight
      
      if (recommendationMap.has(movie.id)) {
        // Movie appears in both lists - boost its score significantly
        const existing = recommendationMap.get(movie.id)!;
        existing.collaborativeScore = collaborativeScore;
        existing.combinedScore = existing.contentScore + collaborativeScore + 0.3; // Consensus bonus
        existing.sources.push('collaborative');
      } else {
        recommendationMap.set(movie.id, { 
          movie, 
          contentScore: 0,
          collaborativeScore,
          combinedScore: collaborativeScore,
          sources: ['collaborative']
        });
      }
    });
    
    // Apply additional scoring factors
    Array.from(recommendationMap.values()).forEach(rec => {
      const movie = rec.movie;
      
      // Popularity boost (but not too much to avoid mainstream bias)
      if (movie.popularity && movie.popularity > 50) {
        rec.combinedScore += 0.1;
      }
      
      // Quality boost for highly rated movies
      if (movie.vote_average && movie.vote_average >= 8.0) {
        rec.combinedScore += 0.15;
      } else if (movie.vote_average && movie.vote_average >= 7.0) {
        rec.combinedScore += 0.08;
      }
      
      // Recency boost for recent releases
      if (movie.release_date) {
        const releaseYear = new Date(movie.release_date).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - releaseYear <= 2) {
          rec.combinedScore += 0.05;
        } else if (currentYear - releaseYear <= 5) {
          rec.combinedScore += 0.02;
        }
      }
      
      // Genre diversity bonus (encourage variety)
      if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
        const genreCount = movie.genre_ids.length;
        if (genreCount >= 3) {
          rec.combinedScore += 0.03; // Multi-genre movies offer more variety
        }
      }
      
      // Runtime preference (avoid extremely long/short movies unless specifically preferred)
      if (movie.runtime) {
        if (movie.runtime >= 90 && movie.runtime <= 150) {
          rec.combinedScore += 0.02; // Sweet spot for most viewers
        } else if (movie.runtime > 180) {
          rec.combinedScore -= 0.05; // Penalty for very long movies
        }
      }
      
      // Vote count reliability factor
      if (movie.vote_count && movie.vote_count > 1000) {
        rec.combinedScore += 0.03; // More reliable ratings
      } else if (movie.vote_count && movie.vote_count < 100) {
        rec.combinedScore -= 0.02; // Less reliable ratings
      }
      
      // Diversity penalty if movie is too similar to others in list
      // (This would be more sophisticated in production)
      if (rec.sources.length === 1 && rec.combinedScore < 0.3) {
        rec.combinedScore *= 0.8; // Slight penalty for single-source, low-score items
      }
    });
    
    // Convert map to array, sort by combined score, and return top recommendations
    const blendedRecs = Array.from(recommendationMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
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
  
  /**
   * Get Netflix-style personalized recommendation categories
   */
  async getPersonalizedCategories(userId: string): Promise<Array<{
    category: string;
    movies: Movie[];
    recommendationType: string;
  }>> {
    try {
      const categories = [];
      
      // Get user data
      const userPreferences = await storage.getUserPreferences(userId);
      const watchHistory = await storage.getWatchHistory(userId);
      const watchlist = await storage.getWatchlistItems(userId);
      
      const watchedMovieIds = new Set(watchHistory.map(item => item.movieId));
      const watchlistMovieIds = new Set(watchlist.map(item => item.movieId));
      const excludeIds = new Set([...Array.from(watchedMovieIds), ...Array.from(watchlistMovieIds)]);
      
      // 1. "Continue Watching" for partially watched movies (highest priority)
      const continueWatching = watchHistory
        .filter(h => h.watchProgress && h.watchProgress > 0.1 && h.watchProgress < 0.9)
        .sort((a, b) => new Date(b.watchedAt || 0).getTime() - new Date(a.watchedAt || 0).getTime())
        .slice(0, 8);
      
      if (continueWatching.length > 0) {
        const continueMovies = await Promise.all(
          continueWatching.map(h => this.tmdbService.getMovieDetails(h.movieId))
        );
        
        categories.unshift({ // Add at beginning
          category: "Continue Watching",
          movies: continueMovies.filter(Boolean),
          recommendationType: 'continue_watching'
        });
      }

      // 2. "Because You Watched" categories for recent high-engagement movies
      const recentHighEngagement = watchHistory
        .filter(h => h.watchProgress && h.watchProgress > 0.8)
        .sort((a, b) => new Date(b.watchedAt || 0).getTime() - new Date(a.watchedAt || 0).getTime())
        .slice(0, 3);
      
      for (const history of recentHighEngagement) {
        try {
          const sourceMovie = await this.tmdbService.getMovieDetails(history.movieId);
          const enhancedSimilar = await this.getEnhancedBecauseYouWatched(userId, history.movieId, 12);
          
          if (enhancedSimilar.length > 0) {
            categories.push({
              category: `Because you watched ${sourceMovie.title}`,
              movies: enhancedSimilar,
              recommendationType: 'because_you_watched'
            });
          }
        } catch (error) {
          console.error(`Error getting enhanced similar movies for ${history.movieId}:`, error);
        }
      }

      // 3. "Top Picks for You" using collaborative filtering
      const personalizedRecs = await this.getPersonalizedRecommendations(userId, 15);
      if (personalizedRecs.length > 0) {
        categories.push({
          category: "Top Picks for You",
          movies: personalizedRecs,
          recommendationType: 'personalized'
        });
      }

      // 4. "Trending Now" with personalized filtering
      const trendingMovies = await this.tmdbService.getTrending();
      const personalizedTrending = trendingMovies.filter(movie => !excludeIds.has(movie.id)).slice(0, 12);
      if (personalizedTrending.length > 0) {
        categories.push({
          category: "Trending Now",
          movies: personalizedTrending,
          recommendationType: 'trending'
        });
      }

      // 5. Genre-specific recommendations based on user preferences
      if (userPreferences?.likedGenres?.length) {
        const genresToShow = userPreferences.likedGenres.slice(0, 3); // Show top 3 genres
        
        for (const genreId of genresToShow) {
          try {
            const genreMovies = await this.tmdbService.discoverMovies({
              with_genres: genreId.toString(),
              sort_by: 'vote_average.desc',
              'vote_count.gte': '500'
            });
            
            const filteredGenreMovies = genreMovies
              .filter(movie => !excludeIds.has(movie.id))
              .slice(0, 12);
            
            if (filteredGenreMovies.length > 0) {
              const genreName = this.getGenreName(parseInt(genreId));
              categories.push({
                category: `Popular ${genreName}`,
                movies: filteredGenreMovies,
                recommendationType: 'genre_specific'
              });
            }
          } catch (error) {
            console.error(`Error getting genre recommendations for ${genreId}:`, error);
          }
        }
      }

      // 6. "Watch Again" - Movies user loved (high-rated movies)
      const topRatedMovies = await storage.getTopRatedMovies(userId, 10);
      const watchAgainMovies = await Promise.all(
        topRatedMovies.map(async (item) => {
          try {
            return await this.tmdbService.getMovieDetails(item.movieId);
          } catch (error) {
            console.error(`Failed to get movie details for ${item.movieId}:`, error);
            return null;
          }
        })
      );
      const watchAgain = watchAgainMovies.filter(movie => movie && !excludeIds.has(movie.id)).slice(0, 8);
      if (watchAgain.length > 0) {
        categories.push({
          category: "Watch Again",
          movies: watchAgain,
          recommendationType: 'watch_again'
        });
      }

      // 7. Seasonal recommendations (popular movies from current time period)
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const seasonName = currentMonth >= 3 && currentMonth <= 5 ? 'Spring' :
                        currentMonth >= 6 && currentMonth <= 8 ? 'Summer' :
                        currentMonth >= 9 && currentMonth <= 11 ? 'Fall' : 'Winter';
      
      const seasonalMovies = await this.tmdbService.discoverMovies({
        'primary_release_date.gte': `${currentYear}-01-01`,
        'primary_release_date.lte': `${currentYear}-12-31`,
        sort_by: 'vote_average.desc',
        'vote_count.gte': '200'
      });
      
      const seasonal = seasonalMovies.filter(movie => !excludeIds.has(movie.id)).slice(0, 10);
      if (seasonal.length > 0) {
        categories.push({
          category: `${seasonName} Favorites`,
          movies: seasonal,
          recommendationType: 'seasonal'
        });
      }

      // 8. "New Releases" 
      const newReleases = await this.tmdbService.discoverMovies({
        'primary_release_date.gte': new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sort_by: 'popularity.desc',
        'vote_count.gte': '50'
      });
      
      const filteredNewReleases = newReleases
        .filter(movie => !excludeIds.has(movie.id))
        .slice(0, 12);
      
      if (filteredNewReleases.length > 0) {
        categories.push({
          category: "New Releases",
          movies: filteredNewReleases,
          recommendationType: 'new_releases'
        });
      }

      // 9. "Award Winners" - High rated movies
      const awardWinners = await this.tmdbService.discoverMovies({
        'vote_average.gte': '8.0',
        'vote_count.gte': '1000',
        sort_by: 'vote_average.desc'
      });
      
      const filteredAwardWinners = awardWinners
        .filter(movie => !excludeIds.has(movie.id))
        .slice(0, 12);
      
      if (filteredAwardWinners.length > 0) {
        categories.push({
          category: "Award Winners & Critically Acclaimed",
          movies: filteredAwardWinners,
          recommendationType: 'award_winners'
        });
      }

      // 10. "Hidden Gems" - Good movies with lower popularity
      const hiddenGems = await this.tmdbService.discoverMovies({
        'vote_average.gte': '7.0',
        'vote_count.gte': '100',
        'vote_count.lte': '1000',
        sort_by: 'vote_average.desc'
      });
      
      const filteredHiddenGems = hiddenGems
        .filter(movie => !excludeIds.has(movie.id))
        .slice(0, 12);
      
      if (filteredHiddenGems.length > 0) {
        categories.push({
          category: "Hidden Gems",
          movies: filteredHiddenGems,
          recommendationType: 'hidden_gems'
        });
      }

      // 11. Director-based recommendations from favorite movies
      if (watchHistory.length > 0) {
        const highRatedMovies = watchHistory
          .filter(h => h.watchProgress && h.watchProgress > 0.8)
          .slice(0, 2); // Limit to avoid too many director categories
        
        for (const historyItem of highRatedMovies) {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(historyItem.movieId);
            if (movieDetails.credits?.crew) {
              const directors = movieDetails.credits.crew
                .filter((person: any) => person.job === 'Director')
                .slice(0, 1);
              
              for (const director of directors) {
                const directorMovies = await this.tmdbService.discoverMovies({
                  with_crew: director.id.toString(),
                  sort_by: 'vote_average.desc'
                });
                
                const filteredDirectorMovies = directorMovies
                  .filter(movie => !excludeIds.has(movie.id))
                  .slice(0, 8);
                
                if (filteredDirectorMovies.length > 2) {
                  categories.push({
                    category: `More from ${director.name}`,
                    movies: filteredDirectorMovies,
                    recommendationType: 'director_based'
                  });
                  break; // Only add one director category per movie
                }
              }
            }
          } catch (error) {
            console.error(`Error getting director recommendations:`, error);
          }
        }
      }

      // 12. Time-based recommendations
      const currentHour = new Date().getHours();
      let timeBasedCategory = "";
      let timeBasedParams: any = {};
      
      if (currentHour >= 22 || currentHour < 6) {
        // Late night - thrillers, horror, crime
        timeBasedCategory = "Late Night Thrills";
        timeBasedParams = {
          with_genres: '53,27,80', // Thriller, Horror, Crime
          sort_by: 'popularity.desc'
        };
      } else if (currentHour >= 18) {
        // Evening - action, adventure
        timeBasedCategory = "Prime Time Action";
        timeBasedParams = {
          with_genres: '28,12', // Action, Adventure
          sort_by: 'popularity.desc'
        };
      } else if (currentHour >= 12) {
        // Afternoon - comedy, family
        timeBasedCategory = "Afternoon Favorites";
        timeBasedParams = {
          with_genres: '35,10751', // Comedy, Family
          sort_by: 'popularity.desc'
        };
      } else {
        // Morning - feel-good movies
        timeBasedCategory = "Morning Pick-Me-Ups";
        timeBasedParams = {
          with_genres: '35,10749,16', // Comedy, Romance, Animation
          sort_by: 'vote_average.desc'
        };
      }
      
      if (timeBasedCategory) {
        try {
          const timeBasedMovies = await this.tmdbService.discoverMovies(timeBasedParams);
          const filteredTimeBasedMovies = timeBasedMovies
            .filter(movie => !excludeIds.has(movie.id))
            .slice(0, 12);
          
          if (filteredTimeBasedMovies.length > 0) {
            categories.push({
              category: timeBasedCategory,
              movies: filteredTimeBasedMovies,
              recommendationType: 'time_based'
            });
          }
        } catch (error) {
          console.error('Error getting time-based recommendations:', error);
        }
      }

      // 13. "Popular on Netflix" simulation - highly popular movies
      const popularNow = await this.tmdbService.getPopular();
      const filteredPopular = popularNow
        .filter(movie => !excludeIds.has(movie.id))
        .slice(0, 15);
      
      if (filteredPopular.length > 0) {
        categories.push({
          category: "Popular Movies",
          movies: filteredPopular,
          recommendationType: 'popular'
        });
      }
      
      return categories;
      
    } catch (error) {
      console.error("Error generating personalized categories:", error);
      
      // Fallback to basic categories
      const trending = await this.tmdbService.getTrending();
      const popular = await this.tmdbService.getPopular();
      
      return [
        {
          category: "Trending Now",
          movies: trending.slice(0, 15),
          recommendationType: 'trending'
        },
        {
          category: "Popular Movies",
          movies: popular.slice(0, 15),
          recommendationType: 'popular'
        }
      ];
    }
  }
  
  /**
   * Helper method to get genre name from ID
   */
  private getGenreName(genreId: number): string {
    const genreMap: Record<number, string> = {
      28: 'Action',
      12: 'Adventure', 
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };
    
    return genreMap[genreId] || 'Movies';
  }

  /**
   * Get enhanced "Because You Watched" recommendations with sophisticated matching
   */
  async getEnhancedBecauseYouWatched(userId: string, sourceMovieId: number, limit: number = 15): Promise<Movie[]> {
    try {
      // Get the source movie details with comprehensive data
      const sourceMovie = await this.tmdbService.getMovieDetails(sourceMovieId);
      if (!sourceMovie) {
        console.error(`Source movie ${sourceMovieId} not found`);
        return [];
      }
      
      // Analyze user preferences to understand their taste
      const userProfile = await this.analyzeUserPreferences(userId);
      
      // Get user's watch history to exclude already watched movies
      const watchHistory = await storage.getWatchHistory(userId);
      const watchedMovieIds = new Set(watchHistory.map(item => item.movieId));
      
      console.log(`[BecauseYouWatched] Generating recommendations for "${sourceMovie.title}" (${sourceMovie.release_date?.split('-')[0]}) based on user profile:`, {
        preferredDecades: userProfile.preferredDecades,
        preferredGenres: userProfile.preferredGenres,
        avgQualityThreshold: userProfile.avgQualityThreshold,
        preferredLanguages: userProfile.preferredLanguages
      });
      
      // NEW ENHANCED APPROACH: Prioritize most relevant similarity factors
      const allCandidates: Array<{ movie: Movie; relevanceScore: number; source: string }> = [];
      
      // 1. HIGHEST PRIORITY: Look for sequels, prequels, and franchise movies
      await this.findFranchiseMovies(sourceMovie, allCandidates, userProfile);
      
      // 2. HIGH PRIORITY: Same title variations and remakes
      await this.findSameTitleMovies(sourceMovie, allCandidates, userProfile);
      
      // 3. HIGH PRIORITY: Same language movies with temporal relevance
      await this.findLanguageAndEraMatches(sourceMovie, allCandidates, userProfile);
      
      // 4. MEDIUM PRIORITY: Director and main cast matches (but with temporal constraints)
      await this.findDirectorAndCastMatches(sourceMovie, allCandidates, userProfile);
      
      // 5. LOWER PRIORITY: Enhanced TMDB similar movies (filtered for relevance)
      const similarMovies = await this.tmdbService.getSimilarMovies(sourceMovieId);
      const temporallyRelevantSimilar = this.filterTemporallyRelevant(similarMovies, sourceMovie);
      const filteredSimilar = this.filterByUserPreferences(temporallyRelevantSimilar, sourceMovie, userProfile);
      allCandidates.push(...filteredSimilar.map(movie => ({
        movie,
        relevanceScore: this.calculateEnhancedRelevanceScore(movie, sourceMovie, userProfile),
        source: 'tmdb_similar'
      })));
      
      // 6. LOWEST PRIORITY: Genre-based discovery (only for same era)
      if (sourceMovie.genre_ids && sourceMovie.genre_ids.length > 0) {
        const genreFilters = this.buildTemporalGenreFilters(sourceMovie, userProfile);
        const genreRecs = await this.tmdbService.discoverMovies(genreFilters);
        const temporallyRelevantGenre = this.filterTemporallyRelevant(genreRecs, sourceMovie);
        const filteredGenre = this.filterByUserPreferences(temporallyRelevantGenre, sourceMovie, userProfile);
        allCandidates.push(...filteredGenre.map(movie => ({
          movie,
          relevanceScore: this.calculateEnhancedRelevanceScore(movie, sourceMovie, userProfile) * 0.7, // Lower priority
          source: 'temporal_genre'
        })));
      }
      
      // Remove duplicates, already watched movies, and the source movie
      const uniqueCandidates = allCandidates
        .filter((candidate, index, self) => 
          self.findIndex(c => c.movie.id === candidate.movie.id) === index &&
          !watchedMovieIds.has(candidate.movie.id) &&
          candidate.movie.id !== sourceMovieId
        );
      
      // Sort by relevance score (highest first)
      const sortedCandidates = uniqueCandidates
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Apply final quality threshold with content-specific requirements
      const isSourceFamilyContent = sourceMovie.genre_ids?.includes(16) || sourceMovie.genre_ids?.includes(10751);
      const minRelevanceThreshold = isSourceFamilyContent ? 0.4 : 0.3; // Higher threshold for family content
      
      const qualifiedCandidates = sortedCandidates
        .filter(candidate => {
          // Basic relevance threshold
          if (candidate.relevanceScore < minRelevanceThreshold) {
            return false;
          }
          
          // Additional content appropriateness check
          if (isSourceFamilyContent) {
            const movieGenres = new Set(candidate.movie.genre_ids || []);
            const hasInappropriate = movieGenres.has(27) || movieGenres.has(53) || movieGenres.has(80); // Horror, Thriller, Crime
            
            if (hasInappropriate) {
              return false; // Absolutely no inappropriate content for family sources
            }
            
            // For family content, ensure higher quality or family-appropriate genres
            const isFamilyAppropriate = movieGenres.has(16) || movieGenres.has(10751) || movieGenres.has(35) || movieGenres.has(14);
            if (!isFamilyAppropriate && candidate.movie.vote_average && candidate.movie.vote_average < 7.0) {
              return false;
            }
          }
          
          return true;
        });
      
      console.log(`[BecauseYouWatched] Found ${qualifiedCandidates.length} qualified recommendations, returning top ${limit}`);
      
      // Return top recommendations
      const finalRecommendations = qualifiedCandidates
        .slice(0, limit)
        .map(candidate => candidate.movie);
      
      return finalRecommendations;
      
    } catch (error) {
      console.error('Error getting enhanced because you watched recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze user preferences based on watch history and ratings
   */
  private async analyzeUserPreferences(userId: string): Promise<{
    preferredDecades: string[];
    preferredGenres: number[];
    avgQualityThreshold: number;
    preferredLanguages: string[];
    recentWatchingPatterns: any;
  }> {
    try {
      const watchHistory = await storage.getWatchHistory(userId);
      const completedMovies = watchHistory.filter(item => item.completed);
      const ratedMovies = watchHistory.filter(item => item.rating && item.rating >= 4);
      
      // Analyze preferred decades from completed/highly-rated movies
      const movieYears: number[] = [];
      const genreCounts: Record<number, number> = {};
      const languageCounts: Record<string, number> = {};
      const qualityScores: number[] = [];
      
      // Get movie details for completed/rated movies to analyze preferences
      const relevantMovies = [...completedMovies, ...ratedMovies];
      const movieDetailsPromises = relevantMovies.slice(0, 20).map(async (item) => {
        try {
          const details = await this.tmdbService.getMovieDetails(item.movieId);
          return { item, details };
        } catch (error) {
          console.error(`Failed to get details for movie ${item.movieId}:`, error);
          return null;
        }
      });
      
      const movieDetails = (await Promise.all(movieDetailsPromises)).filter(Boolean);
      
      movieDetails.forEach((movieDetail) => {
        if (!movieDetail || !movieDetail.item || !movieDetail.details) return;
        
        const { item, details } = movieDetail;
        
        // Analyze release years
        if (details.release_date) {
          const year = parseInt(details.release_date.split('-')[0]);
          if (!isNaN(year) && year > 1900) {
            movieYears.push(year);
          }
        }
        
        // Analyze genres (weight by rating if available)
        if (details.genre_ids) {
          const weight = item.rating ? item.rating : (item.completed ? 3 : 1);
          details.genre_ids.forEach((genreId: number) => {
            genreCounts[genreId] = (genreCounts[genreId] || 0) + weight;
          });
        }
        
        // Analyze languages
        if (details.original_language) {
          const weight = item.rating ? item.rating : (item.completed ? 2 : 1);
          languageCounts[details.original_language] = (languageCounts[details.original_language] || 0) + weight;
        }
        
        // Track quality preferences
        if (details.vote_average && details.vote_count && details.vote_count > 50) {
          qualityScores.push(details.vote_average);
        }
      });
      
      // Calculate preferred decades
      const preferredDecades = this.calculatePreferredDecades(movieYears);
      
      // Get top genres (sorted by weighted preference)
      const preferredGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genreId]) => parseInt(genreId));
      
      // Calculate quality threshold
      const avgQualityThreshold = qualityScores.length > 0 
        ? Math.max(6.0, qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length - 1.0)
        : 6.5; // Default threshold
      
      // Get preferred languages
      const preferredLanguages = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([lang]) => lang);
      
      const profile = {
        preferredDecades,
        preferredGenres,
        avgQualityThreshold,
        preferredLanguages,
        recentWatchingPatterns: {
          totalWatched: watchHistory.length,
          completionRate: completedMovies.length / Math.max(1, watchHistory.length),
          avgRating: ratedMovies.length > 0 ? ratedMovies.reduce((sum, item) => sum + item.rating!, 0) / ratedMovies.length : null
        }
      };
      
      return profile;
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      // Return sensible defaults
      return {
        preferredDecades: ['2020s', '2010s'],
        preferredGenres: [],
        avgQualityThreshold: 6.5,
        preferredLanguages: ['en'],
        recentWatchingPatterns: {}
      };
    }
  }

  /**
   * Calculate preferred decades from movie years
   */
  private calculatePreferredDecades(years: number[]): string[] {
    if (years.length === 0) return ['2020s', '2010s']; // Default to recent decades
    
    const decadeCounts: Record<string, number> = {};
    
    years.forEach(year => {
      const decade = Math.floor(year / 10) * 10;
      const decadeString = `${decade}s`;
      decadeCounts[decadeString] = (decadeCounts[decadeString] || 0) + 1;
    });
    
    return Object.entries(decadeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([decade]) => decade);
  }

  /**
   * Filter movies based on user preferences and content appropriateness
   */
  private filterByUserPreferences(movies: Movie[], sourceMovie: Movie, userProfile: any): Movie[] {
    const sourceGenres = new Set(sourceMovie.genre_ids || []);
    const isSourceFamilyContent = sourceGenres.has(16) || sourceGenres.has(10751); // Animation or Family
    
    return movies.filter(movie => {
      const movieGenres = new Set(movie.genre_ids || []);
      
      // Quality filter - ensure movie meets user's quality standards
      if (movie.vote_average && movie.vote_count) {
        // More lenient quality standards for family content
        const minVoteCount = isSourceFamilyContent ? 30 : 50;
        const qualityThreshold = isSourceFamilyContent ? 
          Math.max(5.5, userProfile.avgQualityThreshold - 0.5) : 
          userProfile.avgQualityThreshold;
          
        if (movie.vote_count < minVoteCount || movie.vote_average < qualityThreshold) {
          return false;
        }
      }
      
      // CRITICAL: Content appropriateness filtering
      if (isSourceFamilyContent) {
        // If source is family/animated content, filter out inappropriate content
        const hasInappropriateContent = movieGenres.has(27) || // Horror
                                       movieGenres.has(53) || // Thriller  
                                       movieGenres.has(80) || // Crime
                                       movieGenres.has(10749); // Romance (can be mature)
        
        if (hasInappropriateContent) {
          return false; // Reject inappropriate content for family source
        }
        
        // Strongly prefer family-appropriate content
        const isFamilyAppropriate = movieGenres.has(16) || // Animation
                                   movieGenres.has(10751) || // Family
                                   movieGenres.has(35) || // Comedy
                                   movieGenres.has(14) || // Fantasy
                                   movieGenres.has(12); // Adventure
        
        // For family source, be very selective
        if (!isFamilyAppropriate && movie.vote_average && movie.vote_average < 7.0) {
          return false;
        }
      } else {
        // For non-family source, avoid recommending family content unless it's high quality
        const isFamilyContent = movieGenres.has(16) || movieGenres.has(10751);
        if (isFamilyContent && movie.vote_average && movie.vote_average < 7.5) {
          return false;
        }
      }
      
      // Era filter - prefer movies from user's preferred decades with content-specific rules
      if (movie.release_date && userProfile.preferredDecades.length > 0) {
        const movieYear = parseInt(movie.release_date.split('-')[0]);
        const movieDecade = `${Math.floor(movieYear / 10) * 10}s`;
        
        // For family/animated content, apply stricter recency preferences
        if (isSourceFamilyContent) {
          // Animated content ages differently - prefer more recent unless it's a classic
          if (movieYear < 1995 && movie.vote_average && movie.vote_average < 8.0) {
            return false; // Filter out older animated content unless it's exceptional
          }
        } else {
          // Normal era filtering for non-family content
          const hasModernPreference = userProfile.preferredDecades.some((decade: string) => 
            decade === '2020s' || decade === '2010s' || decade === '2000s'
          );
          
          if (hasModernPreference && movieYear < 1990) {
            return false; // Filter out movies older than 1990 if user prefers modern films
          }
        }
      }
      
      // Language filter - prefer movies in user's preferred languages, but be flexible
      if (movie.original_language && userProfile.preferredLanguages.length > 0) {
        // Only filter if user has strong non-English preference
        const hasNonEnglishPreference = userProfile.preferredLanguages.some((lang: string) => lang !== 'en');
        if (hasNonEnglishPreference && !userProfile.preferredLanguages.includes(movie.original_language)) {
          // Allow English movies even if user prefers other languages
          if (movie.original_language !== 'en') {
            return false;
          }
        }
      }
      
      return true;
    });
  }

  /**
   * Calculate relevance score based on movie similarity to source and user preferences
   */
  private calculateRelevanceScore(movie: Movie, sourceMovie: Movie, userProfile: any): number {
    let score = 0.0;
    
    // Base score for general movie quality
    if (movie.vote_average && movie.vote_count && movie.vote_count > 100) {
      score += Math.min(0.2, movie.vote_average / 10 * 0.2); // Reduced base quality weight
    }
    
    // MAJOR ENHANCEMENT: Genre similarity score with animation priority
    if (movie.genre_ids && sourceMovie.genre_ids) {
      const sourceGenres = new Set(sourceMovie.genre_ids);
      const movieGenres = new Set(movie.genre_ids);
      const commonGenres = movie.genre_ids.filter(id => sourceGenres.has(id));
      
      // Calculate basic genre similarity
      let genreScore = commonGenres.length / Math.max(sourceMovie.genre_ids.length, movie.genre_ids.length);
      
      // CRITICAL: Special handling for animation and family content
      const isSourceAnimation = sourceGenres.has(16); // Animation genre ID
      const isSourceFamily = sourceGenres.has(10751); // Family genre ID
      const isMovieAnimation = movieGenres.has(16);
      const isMovieFamily = movieGenres.has(10751);
      
      // If source is animated/family, heavily prioritize animated/family recommendations
      if (isSourceAnimation || isSourceFamily) {
        if (isMovieAnimation || isMovieFamily) {
          genreScore += 0.4; // Massive boost for animation/family matching
        } else {
          // Penalize non-family content when source is family/animation
          const hasActionThriller = movieGenres.has(28) || movieGenres.has(53) || movieGenres.has(27); // Action, Thriller, Horror
          if (hasActionThriller) {
            genreScore -= 0.6; // Heavy penalty for inappropriate content
          }
        }
      }
      
      // Boost for exact genre matches (especially important genres)
      const importantGenres = [16, 10751, 35, 18, 28, 53, 27, 878, 14]; // Animation, Family, Comedy, Drama, Action, Thriller, Horror, Sci-Fi, Fantasy
      const exactMatches = commonGenres.filter(id => importantGenres.includes(id));
      genreScore += exactMatches.length * 0.1;
      
      score += genreScore * 0.5; // Increased weight for genre similarity
    }
    
    // Enhanced content rating compatibility
    if (sourceMovie.genre_ids) {
      const sourceGenres = new Set(sourceMovie.genre_ids);
      const movieGenres = new Set(movie.genre_ids || []);
      
      // Family content should recommend family content
      if (sourceGenres.has(10751) || sourceGenres.has(16)) {
        if (movieGenres.has(10751) || movieGenres.has(16) || movieGenres.has(35)) {
          score += 0.2; // Bonus for family-appropriate content
        }
        // Penalize mature content for family source movies
        if (movieGenres.has(27) || movieGenres.has(53)) { // Horror, Thriller
          score -= 0.5;
        }
      }
      
      // Adult content should generally recommend adult content
      if (sourceGenres.has(28) || sourceGenres.has(53) || sourceGenres.has(80)) { // Action, Thriller, Crime
        if (movieGenres.has(10751) || movieGenres.has(16)) {
          score -= 0.3; // Penalize family content for action/thriller source
        }
      }
    }
    
    // Era similarity score with tighter constraints for animated content
    if (movie.release_date && sourceMovie.release_date) {
      const movieYear = parseInt(movie.release_date.split('-')[0]);
      const sourceYear = parseInt(sourceMovie.release_date.split('-')[0]);
      const yearDiff = Math.abs(movieYear - sourceYear);
      
      // For animated/family content, prefer more recent releases
      const isSourceAnimationFamily = sourceMovie.genre_ids?.includes(16) || sourceMovie.genre_ids?.includes(10751);
      if (isSourceAnimationFamily) {
        if (yearDiff <= 5) {
          score += 0.15; // Strong boost for recent animated content
        } else if (yearDiff <= 10) {
          score += 0.1;
        } else if (yearDiff > 15) {
          score -= 0.1; // Slight penalty for very old content
        }
      } else {
        // Normal era scoring for non-family content
        let eraScore = Math.max(0, (25 - yearDiff) / 25 * 0.15);
        
        // Bonus if movie is in user's preferred decades
        const movieDecade = `${Math.floor(movieYear / 10) * 10}s`;
        if (userProfile.preferredDecades.includes(movieDecade)) {
          eraScore += 0.08;
        }
        
        score += eraScore;
      }
    }
    
    // Language preference score
    if (movie.original_language && userProfile.preferredLanguages.includes(movie.original_language)) {
      score += 0.08;
    }
    
    // User genre preference score
    if (movie.genre_ids && userProfile.preferredGenres.length > 0) {
      const preferredGenreMatches = movie.genre_ids.filter(id => userProfile.preferredGenres.includes(id));
      score += (preferredGenreMatches.length / movie.genre_ids.length) * 0.12;
    }
    
    // Quality threshold enforcement
    if (movie.vote_average && movie.vote_count) {
      if (movie.vote_average < userProfile.avgQualityThreshold - 1.0) {
        score -= 0.3; // Penalty for significantly low quality
      } else if (movie.vote_average >= userProfile.avgQualityThreshold + 1.0) {
        score += 0.1; // Bonus for high quality
      }
    }
    
    // Animation-specific scoring enhancements
    if (sourceMovie.genre_ids?.includes(16) && movie.genre_ids?.includes(16)) {
      score += 0.25; // Strong boost for animation-to-animation recommendations
    }
    
    // Family-specific scoring enhancements
    if (sourceMovie.genre_ids?.includes(10751) && movie.genre_ids?.includes(10751)) {
      score += 0.2; // Strong boost for family-to-family recommendations
    }
    
    // Popularity boost for very popular movies (but controlled)
    if (movie.popularity && movie.popularity > 50) {
      score += Math.min(0.03, Math.log(movie.popularity) / 200);
    }
    
    return Math.max(0, Math.min(1.0, score)); // Cap between 0 and 1.0
  }

  /**
   * Build enhanced genre filters with user context and content appropriateness
   */
  private buildGenreFilters(sourceMovie: Movie, userProfile: any): any {
    // Build base filters with genre priority for content type
    const sourceGenres = sourceMovie.genre_ids || [];
    let primaryGenres = sourceGenres.slice(0, 2); // Take top 2 source genres
    
    // Special handling for animation and family content
    const hasAnimation = sourceGenres.includes(16); // Animation
    const hasFamily = sourceGenres.includes(10751); // Family
    const hasComedy = sourceGenres.includes(35); // Comedy
    
    if (hasAnimation || hasFamily) {
      // For family/animated content, prioritize family-friendly genres
      const familyFriendlyGenres = [16, 10751, 35, 14, 12]; // Animation, Family, Comedy, Fantasy, Adventure
      primaryGenres = sourceGenres.filter(id => familyFriendlyGenres.includes(id));
      
      // If no family-friendly genres, add them
      if (primaryGenres.length === 0) {
        primaryGenres = [16, 10751]; // Default to Animation and Family
      }
      
      // Ensure we have at least animation or family in the filter
      if (!primaryGenres.includes(16) && !primaryGenres.includes(10751)) {
        primaryGenres.unshift(hasAnimation ? 16 : 10751);
      }
    }
    
    const filters: any = {
      with_genres: primaryGenres.join(','),
      'vote_count.gte': hasAnimation || hasFamily ? '50' : '100', // Lower threshold for family content
      sort_by: 'vote_average.desc'
    };
    
    // Apply quality threshold with consideration for content type
    const qualityThreshold = hasAnimation || hasFamily ? 
      Math.max(6.0, userProfile.avgQualityThreshold - 0.5) : // Slightly lower for family content
      userProfile.avgQualityThreshold;
    filters['vote_average.gte'] = qualityThreshold.toString();
    
    // Apply era preference with content-specific rules
    if (userProfile.preferredDecades.length > 0 && sourceMovie.release_date) {
      const sourceYear = parseInt(sourceMovie.release_date.split('-')[0]);
      
      // For animated/family content, prefer more recent releases
      if (hasAnimation || hasFamily) {
        if (sourceYear >= 2010) {
          filters['primary_release_date.gte'] = '2005-01-01'; // Recent animated content
        } else if (sourceYear >= 2000) {
          filters['primary_release_date.gte'] = '1995-01-01';
        }
      } else {
        // Normal era filtering for other content
        if (sourceYear >= 2000 && userProfile.preferredDecades.some((d: string) => ['2020s', '2010s', '2000s'].includes(d))) {
          filters['primary_release_date.gte'] = '2000-01-01';
        }
      }
    }
    
    // Content appropriateness filters
    if (hasAnimation || hasFamily) {
      // For family content, avoid mature themes
      const matureGenres = [27, 53, 80]; // Horror, Thriller, Crime
      filters.without_genres = matureGenres.join(',');
    }
    
    return filters;
  }

  /**
   * Build director filters with user context
   */
  private buildDirectorFilters(director: any, sourceMovie: Movie, userProfile: any): any {
    const filters: any = {
      with_crew: director.id.toString(),
      'vote_count.gte': '50',
      sort_by: 'vote_average.desc'
    };
    
    // Apply quality threshold
    filters['vote_average.gte'] = Math.max(6.0, userProfile.avgQualityThreshold - 0.5).toString();
    
    return filters;
  }

  /**
   * Build cast filters with user context
   */
  private buildCastFilters(actor: any, sourceMovie: Movie, userProfile: any): any {
    const filters: any = {
      with_cast: actor.id.toString(),
      'vote_count.gte': '100',
      sort_by: 'popularity.desc'
    };
    
    // Apply quality threshold
    filters['vote_average.gte'] = Math.max(6.0, userProfile.avgQualityThreshold - 1.0).toString();
    
    // Prefer recent movies for cast-based recommendations
    if (userProfile.preferredDecades.includes('2020s') || userProfile.preferredDecades.includes('2010s')) {
      filters['primary_release_date.gte'] = '2005-01-01';
    }
    
    return filters;
  }

  /**
   * Build keyword-based filters for thematic similarity
   */
  private buildKeywordFilters(keywordIds: string, sourceMovie: Movie, userProfile: any): any {
    const filters: any = {
      with_keywords: keywordIds,
      'vote_count.gte': '50',
      sort_by: 'vote_average.desc'
    };
    
    // Apply quality threshold
    filters['vote_average.gte'] = userProfile.avgQualityThreshold.toString();
    
    return filters;
  }

  /**
   * Find franchise movies (sequels, prequels, same series)
   * HIGHEST PRIORITY - These are most similar to what user watched
   */
  private async findFranchiseMovies(
    sourceMovie: Movie, 
    candidates: Array<{ movie: Movie; relevanceScore: number; source: string }>, 
    userProfile: any
  ): Promise<void> {
    const sourceTitle = sourceMovie.title.toLowerCase();
    const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
    
    try {
      // Search for movies with similar titles (sequels, prequels, franchise entries)
      const franchiseKeywords = [
        // Extract main title without numbers/subtitles
        sourceTitle.replace(/\s*\d+.*$/, '').replace(/:\s*.*$/, ''),
        // Common franchise patterns
        sourceTitle.split(':')[0], // Before colon
        sourceTitle.split(' - ')[0], // Before dash
      ].filter(keyword => keyword.length > 3);

      for (const keyword of franchiseKeywords) {
        const searchResults = await this.tmdbService.searchMovies(keyword);
        
        for (const movie of searchResults) {
          const movieTitle = movie.title.toLowerCase();
          const movieYear = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;
          
          // Check if it's likely a franchise movie
          const isFranchiseMovie = (
            movieTitle.includes(keyword) &&
            movie.id !== sourceMovie.id &&
            (
              // Same title with numbers (sequels)
              /\d+/.test(movieTitle) ||
              // Subtitles suggesting sequels
              movieTitle.includes('part') ||
              movieTitle.includes('chapter') ||
              movieTitle.includes('returns') ||
              movieTitle.includes('revenge') ||
              movieTitle.includes('rise') ||
              movieTitle.includes('origins') ||
              // Within reasonable time frame for franchise
              (sourceYear && movieYear && Math.abs(movieYear - sourceYear) <= 15)
            )
          );
          
          if (isFranchiseMovie) {
            // Very high relevance score for franchise movies
            let relevanceScore = 0.95;
            
            // Bonus for temporal proximity
            if (sourceYear && movieYear) {
              const yearDiff = Math.abs(movieYear - sourceYear);
              relevanceScore += Math.max(0, (15 - yearDiff) / 15 * 0.3);
            }
            
            candidates.push({
              movie,
              relevanceScore,
              source: 'franchise'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error finding franchise movies:', error);
    }
  }

  /**
   * Find same title movies (remakes, different versions)
   * HIGH PRIORITY - Same story, different execution
   */
  private async findSameTitleMovies(
    sourceMovie: Movie, 
    candidates: Array<{ movie: Movie; relevanceScore: number; source: string }>, 
    userProfile: any
  ): Promise<void> {
    try {
      const sourceTitle = sourceMovie.title.toLowerCase();
      const searchResults = await this.tmdbService.searchMovies(sourceMovie.title);
      
      for (const movie of searchResults) {
        if (movie.id === sourceMovie.id) continue;
        
        const movieTitle = movie.title.toLowerCase();
        const similarity = this.calculateTitleSimilarity(sourceTitle, movieTitle);
        
        // High similarity threshold for same title detection
        if (similarity >= 0.8) {
          let relevanceScore = 0.85 + (similarity - 0.8) * 0.5; // 0.85-0.95 range
          
          // Bonus for different eras (remakes often span decades)
          const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
          const movieYear = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;
          
          if (sourceYear && movieYear) {
            const yearDiff = Math.abs(movieYear - sourceYear);
            if (yearDiff >= 15) {
              relevanceScore += 0.1; // Bonus for remakes/reboots
            }
          }
          
          candidates.push({
            movie,
            relevanceScore,
            source: 'same_title'
          });
        }
      }
    } catch (error) {
      console.error('Error finding same title movies:', error);
    }
  }

  /**
   * Find movies with same language and temporal relevance
   * MEDIUM-HIGH PRIORITY - Cultural and era context matters
   */
  private async findLanguageAndEraMatches(
    sourceMovie: Movie, 
    candidates: Array<{ movie: Movie; relevanceScore: number; source: string }>, 
    userProfile: any
  ): Promise<void> {
    try {
      const sourceLanguage = sourceMovie.original_language;
      const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
      
      if (!sourceLanguage || !sourceYear) return;
      
      // Build temporal filters
      const yearRange = this.getTemporalRange(sourceYear);
      
      const discoverParams: Record<string, string> = {
        with_original_language: sourceLanguage,
        'primary_release_date.gte': `${yearRange.min}-01-01`,
        'primary_release_date.lte': `${yearRange.max}-12-31`,
        'vote_count.gte': '30',
        sort_by: 'vote_average.desc'
      };
      
      // Add genre overlap if available
      if (sourceMovie.genre_ids && sourceMovie.genre_ids.length > 0) {
        discoverParams.with_genres = sourceMovie.genre_ids.slice(0, 2).join(',');
      }
      
      const languageMatches = await this.tmdbService.discoverMovies(discoverParams);
      
      for (const movie of languageMatches) {
        if (movie.id === sourceMovie.id) continue;
        
        const relevanceScore = this.calculateLanguageAndEraRelevance(movie, sourceMovie, userProfile);
        
        if (relevanceScore >= 0.4) {
          candidates.push({
            movie,
            relevanceScore,
            source: 'language_era'
          });
        }
      }
    } catch (error) {
      console.error('Error finding language and era matches:', error);
    }
  }

  /**
   * Find movies with same director or main cast members
   * MEDIUM PRIORITY - Creative team similarity with temporal constraints
   */
  private async findDirectorAndCastMatches(
    sourceMovie: Movie, 
    candidates: Array<{ movie: Movie; relevanceScore: number; source: string }>, 
    userProfile: any
  ): Promise<void> {
    try {
      // Get movie credits to find director and main cast
      const movieDetails = await this.tmdbService.getMovieDetails(sourceMovie.id);
      
      if (!movieDetails.credits) return;
      
      const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
      if (!sourceYear) return;
      
      // Find director matches (higher priority)
      const directors = movieDetails.credits.crew?.filter((person: any) => person.job === 'Director') || [];
      for (const director of directors.slice(0, 2)) { // Top 2 directors
        if (!director.id) continue;
        
        const directorMovies = await this.tmdbService.discoverMovies({
          with_crew: director.id.toString(),
          'primary_release_date.gte': `${Math.max(1990, sourceYear - 15)}-01-01`,
          'primary_release_date.lte': `${sourceYear + 15}-12-31`,
          'vote_count.gte': '50'
        });
        
        for (const movie of directorMovies) {
          if (movie.id === sourceMovie.id) continue;
          
          const relevanceScore = this.calculateDirectorCastRelevance(movie, sourceMovie, 'director', userProfile);
          
          if (relevanceScore >= 0.35) {
            candidates.push({
              movie,
              relevanceScore,
              source: 'director_match'
            });
          }
        }
      }
      
      // Find main cast matches (lower priority)
      const mainCast = movieDetails.credits.cast?.slice(0, 3) || []; // Top 3 cast members
      for (const actor of mainCast) {
        if (!actor.id) continue;
        
        const actorMovies = await this.tmdbService.discoverMovies({
          with_cast: actor.id.toString(),
          'primary_release_date.gte': `${Math.max(1990, sourceYear - 10)}-01-01`,
          'primary_release_date.lte': `${sourceYear + 10}-12-31`,
          'vote_count.gte': '30'
        });
        
        for (const movie of actorMovies) {
          if (movie.id === sourceMovie.id) continue;
          
          const relevanceScore = this.calculateDirectorCastRelevance(movie, sourceMovie, 'cast', userProfile);
          
          if (relevanceScore >= 0.3) {
            candidates.push({
              movie,
              relevanceScore,
              source: 'cast_match'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error finding director and cast matches:', error);
    }
  }

  /**
   * Filter movies based on temporal relevance (max 10 years for recent movies)
   */
  private filterTemporallyRelevant(movies: Movie[], sourceMovie: Movie): Movie[] {
    const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
    if (!sourceYear) return movies;
    
    return movies.filter(movie => {
      const movieYear = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;
      if (!movieYear) return false;
      
      const yearDiff = Math.abs(movieYear - sourceYear);
      
      // For recent movies (2015+), be more strict about temporal relevance
      if (sourceYear >= 2015) {
        return yearDiff <= 10;
      }
      
      // For older movies, be more lenient
      if (sourceYear >= 2000) {
        return yearDiff <= 15;
      }
      
      // For very old movies, allow broader range but prioritize same era
      return yearDiff <= 25;
    });
  }

  /**
   * Calculate enhanced relevance score prioritizing sequels/franchises over genre
   */
  private calculateEnhancedRelevanceScore(movie: Movie, sourceMovie: Movie, userProfile: any): number {
    let score = 0;
    
    // 1. Franchise/title similarity (highest weight)
    const titleSimilarity = this.calculateTitleSimilarity(
      sourceMovie.title.toLowerCase(), 
      movie.title.toLowerCase()
    );
    score += titleSimilarity * 0.4;
    
    // 2. Language match
    if (movie.original_language === sourceMovie.original_language) {
      score += 0.25;
    }
    
    // 3. Temporal relevance
    const temporalScore = this.calculateTemporalRelevance(movie, sourceMovie);
    score += temporalScore * 0.2;
    
    // 4. Genre similarity (lower priority than before)
    const genreSimilarity = this.calculateGenreSimilarity(movie, sourceMovie);
    score += genreSimilarity * 0.15;
    
    return Math.min(score, 1.0);
  }

  /**
   * Build temporal genre filters for same-era recommendations
   */
  private buildTemporalGenreFilters(sourceMovie: Movie, userProfile: any): any {
    const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
    const filters: any = {
      'vote_count.gte': '40',
      sort_by: 'vote_average.desc'
    };
    
    // Add genre filter if available
    if (sourceMovie.genre_ids && sourceMovie.genre_ids.length > 0) {
      filters.with_genres = sourceMovie.genre_ids.slice(0, 2).join(',');
    }
    
    // Apply temporal constraints
    if (sourceYear) {
      const range = this.getTemporalRange(sourceYear);
      filters['primary_release_date.gte'] = `${range.min}-01-01`;
      filters['primary_release_date.lte'] = `${range.max}-12-31`;
    }
    
    // Quality threshold
    filters['vote_average.gte'] = Math.max(6.0, userProfile.avgQualityThreshold - 0.3).toString();
    
    return filters;
  }

  // Helper methods for the new algorithm

  /**
   * Calculate title similarity for franchise detection
   */
  private calculateTitleSimilarity(title1: string, title2: string): number {
    // Simple implementation - can be enhanced with more sophisticated string matching
    if (title1 === title2) return 1.0;
    
    // Check for common words
    const words1 = new Set(title1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(title2.split(' ').filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Get temporal range for movie discovery
   */
  private getTemporalRange(sourceYear: number): { min: number; max: number } {
    if (sourceYear >= 2015) {
      return { min: sourceYear - 8, max: sourceYear + 8 };
    } else if (sourceYear >= 2000) {
      return { min: sourceYear - 12, max: sourceYear + 12 };
    } else {
      return { min: sourceYear - 20, max: sourceYear + 20 };
    }
  }

  /**
   * Calculate language and era relevance
   */
  private calculateLanguageAndEraRelevance(movie: Movie, sourceMovie: Movie, userProfile: any): number {
    let score = 0;
    
    // Language match
    if (movie.original_language === sourceMovie.original_language) {
      score += 0.4;
    }
    
    // Temporal relevance
    score += this.calculateTemporalRelevance(movie, sourceMovie) * 0.3;
    
    // Genre overlap
    score += this.calculateGenreSimilarity(movie, sourceMovie) * 0.3;
    
    return score;
  }

  /**
   * Calculate director/cast relevance with temporal constraints
   */
  private calculateDirectorCastRelevance(movie: Movie, sourceMovie: Movie, type: 'director' | 'cast', userProfile: any): number {
    let score = type === 'director' ? 0.5 : 0.4; // Directors get higher base score
    
    // Temporal bonus
    score += this.calculateTemporalRelevance(movie, sourceMovie) * 0.3;
    
    // Genre similarity
    score += this.calculateGenreSimilarity(movie, sourceMovie) * 0.2;
    
    return score;
  }

  /**
   * Calculate temporal relevance between two movies
   */
  private calculateTemporalRelevance(movie: Movie, sourceMovie: Movie): number {
    const sourceYear = sourceMovie.release_date ? parseInt(sourceMovie.release_date.split('-')[0]) : null;
    const movieYear = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;
    
    if (!sourceYear || !movieYear) return 0;
    
    const yearDiff = Math.abs(movieYear - sourceYear);
    
    // Recent movies get stricter temporal requirements
    if (sourceYear >= 2015) {
      return Math.max(0, (10 - yearDiff) / 10);
    } else if (sourceYear >= 2000) {
      return Math.max(0, (15 - yearDiff) / 15);
    } else {
      return Math.max(0, (25 - yearDiff) / 25);
    }
  }

  /**
   * Calculate genre similarity between two movies
   */
  private calculateGenreSimilarity(movie: Movie, sourceMovie: Movie): number {
    const sourceGenres = new Set(sourceMovie.genre_ids || []);
    const movieGenres = new Set(movie.genre_ids || []);
    
    if (sourceGenres.size === 0 || movieGenres.size === 0) return 0;
    
    const intersection = new Set([...sourceGenres].filter(g => movieGenres.has(g)));
    const union = new Set([...sourceGenres, ...movieGenres]);
    
    return intersection.size / union.size;
  }
}