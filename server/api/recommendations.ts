import { Request, Response } from "express";
import { storage } from "../storage";
import { TMDBService } from "../services/tmdb";
import { RecommendationConnector } from "../services/recommendation-connector";
import { RecommendationEngine } from "../services/recommendation-engine";

// Define basic Movie interface for type safety
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  original_language: string;
  original_title: string;
  popularity: number;
}

// Define a type for the user object with claims
interface AuthUser {
  claims?: {
    sub: string;
    [key: string]: any;
  };
}

// Define Movie interface to match client-side type
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  original_language: string;
  original_title: string;
  popularity: number;
}

// Define import for database operations
import { db } from "../db"; 
import { favoriteItems } from "../../shared/schema"; 
import { eq } from "drizzle-orm";

// Initialize TMDb service and recommendation connector
const tmdbService = new TMDBService(process.env.TMDB_API_KEY || "");
const recommendationConnector = new RecommendationConnector();
// Initialize the enhanced recommendation engine
const recommendationEngine = new RecommendationEngine(process.env.TMDB_API_KEY || "");

/**
 * Get personalized recommendations for the authenticated user
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    // Handle user authentication safely
    const userId = (req.user as AuthUser | undefined)?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user's data for recommendation engine
    const watchHistory = await storage.getWatchHistory(userId);
    const preferences = await storage.getUserPreferences(userId);
    const watchlist = await storage.getWatchlistItems(userId);
    
    // Get favorite items from database
    let userFavorites: { movieId: number }[] = [];
    
    try {
      const favorites = await db
        .select()
        .from(favoriteItems)
        .where(eq(favoriteItems.userId, userId));
      
      userFavorites = favorites || [];
    } catch (err) {
      console.error("Error fetching favorite items:", err);
      // Fall back to empty array
      userFavorites = [];
    }
    
    // Check if Python recommendation service is available
    const isRecommendationServiceAvailable = await recommendationConnector.isAvailable();
    
    // Format history items with proper type safety
    const transformedHistory = watchHistory.map((item: any) => ({
      movieId: item.movieId,
      watch_progress: item.watchProgress ? item.watchProgress / 100 : 0,
      watch_count: item.watchCount || 1,
      completed: item.completed || false,
      rating: item.rating || null,
      watchedAt: item.watchedAt
    }));
    
    if (isRecommendationServiceAvailable) {
      try {
        // Format user data for personalized recommendations with type safety
        const userData = {
          userId,
          liked_movies: userFavorites.map((item: any) => item.movieId),
          watch_history: transformedHistory,
          watchlist: watchlist.map((item: any) => item.movieId),
          user_preferences: preferences ? {
            // Include backward compatibility with old schema
            likedGenres: preferences.likedGenres || [],
            dislikedGenres: preferences.dislikedGenres || []
          } : {}
        };
        
        // Get personalized recommendations
        const recommendationResponse = await recommendationConnector.getPersonalizedRecommendations(userData);
        
        // Return recommendation categories
        return res.json(recommendationResponse);
      } catch (error) {
        console.error("Error connecting to recommendation service:", error);
        // Fall back to enhanced TypeScript recommendation engine instead of basic TMDB
        const enhancedRecommendations = await recommendationEngine.getPersonalizedRecommendations(userId, 15);
        return res.json({ 
          recommendation_categories: [
            { category: "Recommended for you", movies: enhancedRecommendations }
          ]
        });
      }
    } else {
      // Use enhanced TypeScript recommendation engine instead of basic TMDB fallback
      const enhancedRecommendations = await recommendationEngine.getPersonalizedRecommendations(userId, 15);
      return res.json({ 
        recommendation_categories: [
          { category: "Recommended for you", movies: enhancedRecommendations }
        ]
      });
    }
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    return res.status(500).json({ message: "Failed to generate recommendations" });
  }
}

/**
 * Get similar movies based on a specific movie
 */
export async function getSimilarMovies(req: Request, res: Response) {
  try {
    const movieId = parseInt(req.params.movieId);
    
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // Get authenticated user ID for personalized filtering
    const userId = (req.user as AuthUser | undefined)?.claims?.sub;
    
    // Check if Python recommendation service is available
    const isRecommendationServiceAvailable = await recommendationConnector.isAvailable();
    
    let similarMovies = [];
    
    if (isRecommendationServiceAvailable) {
      // Get similar movie recommendations from Python service
      try {
        similarMovies = await recommendationConnector.getSimilarMovies(movieId, 10);
      } catch (error) {
        console.error("Error connecting to recommendation service:", error);
        // Fall back to enhanced TypeScript recommendation engine for ALL users
        const userIdOrAnonymous = userId || 'anonymous-user';
        similarMovies = await recommendationEngine.getEnhancedBecauseYouWatched(userIdOrAnonymous, movieId, 15);
      }
    } else {
      // Use enhanced TypeScript recommendation engine for ALL users (authenticated and non-authenticated)
      const userIdOrAnonymous = userId || 'anonymous-user';
      similarMovies = await recommendationEngine.getEnhancedBecauseYouWatched(userIdOrAnonymous, movieId, 15);
    }
    
    return res.json(similarMovies);
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return res.status(500).json({ message: "Failed to fetch similar movies" });
  }
}

/**
 * Get trending movies with loading delay simulation for demonstration
 */
export async function getTrendingWithDelay(req: Request, res: Response) {
  try {
    // Simulate loading delay for demonstration purposes
    const delay = req.query.delay ? parseInt(req.query.delay as string) : 0;
    
    // Wait for specified delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Fetch trending movies
    const movies = await tmdbService.getTrending();
    
    return res.json(movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return res.status(500).json({ message: "Failed to fetch trending movies" });
  }
}

/**
 * Get "Because you liked X" style recommendations
 */
export async function getBecauseYouLikedRecommendations(req: Request, res: Response) {
  try {
    const movieId = parseInt(req.params.movieId);
    
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // Get authenticated user ID for personalized filtering
    const userId = (req.user as AuthUser | undefined)?.claims?.sub;
    
    // Check if Python recommendation service is available
    const isRecommendationServiceAvailable = await recommendationConnector.isAvailable();
    
    if (isRecommendationServiceAvailable) {
      // Get "because you liked" recommendations
      try {
        const recommendations = await recommendationConnector.getBecauseYouLikedRecommendations(movieId, 10);
        return res.json(recommendations);
      } catch (error) {
        console.error("Error connecting to recommendation service:", error);
        // Fall back to enhanced TypeScript recommendation engine
        if (userId) {
          const recommendations = await recommendationEngine.getEnhancedBecauseYouWatched(userId, movieId, 10);
          const movieDetails = await tmdbService.getMovieDetails(movieId);
          
          return res.json({
            recommendations: recommendations,
            sourceMovie: movieDetails,
            category: `Because you liked ${movieDetails?.title || 'this movie'}`
          });
        } else {
          // Use enhanced algorithm for non-authenticated users too
          const recommendations = await recommendationEngine.getEnhancedBecauseYouWatched('anonymous-user', movieId, 10);
          const movieDetails = await tmdbService.getMovieDetails(movieId);
          
          return res.json({
            recommendations: recommendations,
            sourceMovie: movieDetails,
            category: `Because you liked ${movieDetails?.title || 'this movie'}`
          });
        }
      }
    } else {
      // Use enhanced TypeScript recommendation engine instead of basic TMDB
      if (userId) {
        const recommendations = await recommendationEngine.getEnhancedBecauseYouWatched(userId, movieId, 10);
        const movieDetails = await tmdbService.getMovieDetails(movieId);
        
        return res.json({
          recommendations: recommendations,
          sourceMovie: movieDetails,
          category: `Because you liked ${movieDetails?.title || 'this movie'}`
        });
      } else {
        // Use enhanced algorithm for non-authenticated users too, with a generic user profile
        const recommendations = await recommendationEngine.getEnhancedBecauseYouWatched('anonymous-user', movieId, 10);
        const movieDetails = await tmdbService.getMovieDetails(movieId);
        
        return res.json({
          recommendations: recommendations,
          sourceMovie: movieDetails,
          category: `Because you liked ${movieDetails?.title || 'this movie'}`
        });
      }
    }
  } catch (error) {
    console.error("Error getting 'because you liked' recommendations:", error);
    return res.status(500).json({ message: "Failed to get recommendations" });
  }
}

/**
 * Fallback recommendation logic using TMDb API and basic user history
 */
async function getFallbackRecommendations(userId: string, watchHistory: any[]): Promise<Movie[]> {
  // If user has watch history, get recommendations based on most recent movie
  if (watchHistory.length > 0) {
    // Sort by most recent
    const sortedHistory = [...watchHistory].sort((a, b) => {
      const dateA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
      const dateB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Get recently watched movie ID
    const recentMovieId = sortedHistory[0].movieId;
    
    // Get similar movies based on recently watched
    const similarMovies = await tmdbService.getSimilarMovies(recentMovieId);
    
    return similarMovies;
  }
  
  // If no watch history, get user preferences
  const preferences = await storage.getUserPreferences(userId);
  
  if (preferences && preferences.likedGenres && preferences.likedGenres.length > 0) {
    // Build params based on preferences
    const discoverParams: Record<string, string> = {
      with_genres: preferences.likedGenres.join(','),
      sort_by: 'popularity.desc'
    };
    
    // Get movies based on genre preferences
    return await tmdbService.discoverMovies(discoverParams);
  }
  
  // If all else fails, return popular movies
  return await tmdbService.getPopular();
}