import { Request, Response } from "express";
import { storage } from "../storage";
import { TMDBService } from "../services/tmdb";
import { RecommendationConnector } from "../services/recommendation-connector";

// Initialize TMDb service and recommendation connector
const tmdbService = new TMDBService(process.env.TMDB_API_KEY || "");
const recommendationConnector = new RecommendationConnector();

/**
 * Get personalized recommendations for the authenticated user
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user's watch history for recommendation engine
    const watchHistory = await storage.getWatchHistory(userId);
    
    // Get user preferences
    const preferences = await storage.getUserPreferences(userId);
    
    // Check if Python recommendation service is available
    const isRecommendationServiceAvailable = await recommendationConnector.isAvailable();
    
    let recommendedMovies = [];
    
    if (isRecommendationServiceAvailable && watchHistory.length > 0) {
      // Get hybrid recommendations from Python service
      try {
        recommendedMovies = await recommendationConnector.getHybridRecommendations(
          userId,
          watchHistory,
          20
        );
      } catch (error) {
        console.error("Error connecting to recommendation service:", error);
        // Fall back to TMDB recommendations if Python service fails
        recommendedMovies = await getFallbackRecommendations(userId, watchHistory);
      }
    } else {
      // Fall back to TMDB recommendations if Python service is unavailable
      recommendedMovies = await getFallbackRecommendations(userId, watchHistory);
    }
    
    return res.json(recommendedMovies);
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
    
    // Check if Python recommendation service is available
    const isRecommendationServiceAvailable = await recommendationConnector.isAvailable();
    
    let similarMovies = [];
    
    if (isRecommendationServiceAvailable) {
      // Get content-based recommendations from Python service
      try {
        similarMovies = await recommendationConnector.getContentBasedRecommendations(movieId, 10);
      } catch (error) {
        console.error("Error connecting to recommendation service:", error);
        // Fall back to TMDB similar movies if Python service fails
        similarMovies = await tmdbService.getSimilarMovies(movieId);
      }
    } else {
      // Fall back to TMDB similar movies if Python service is unavailable
      similarMovies = await tmdbService.getSimilarMovies(movieId);
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
 * Get recommendations based on user preferences (genres, year, etc.)
 */
export async function getPreferenceBasedRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user preferences
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ message: "No preferences found. Please take the quiz first." });
    }
    
    // Build discover params based on preferences
    const discoverParams: Record<string, string> = {};
    
    // Add genre preferences
    if (preferences.genres && preferences.genres.length > 0) {
      discoverParams.with_genres = preferences.genres.join(',');
    }
    
    // Add year range if specified
    if (preferences.yearRange) {
      switch (preferences.yearRange) {
        case 'recent':
          discoverParams.primary_release_date_gte = `${new Date().getFullYear() - 5}-01-01`;
          break;
        case 'classic':
          discoverParams.primary_release_date_lte = `${new Date().getFullYear() - 20}-12-31`;
          break;
      }
    }
    
    // Discover movies with these params
    const recommendedMovies = await tmdbService.discoverMovies(discoverParams);
    
    return res.json(recommendedMovies);
  } catch (error) {
    console.error("Error generating preference-based recommendations:", error);
    return res.status(500).json({ message: "Failed to generate recommendations" });
  }
}

/**
 * Fallback recommendation logic using TMDb API and basic user history
 */
async function getFallbackRecommendations(userId: string, watchHistory: any[]): Promise<any[]> {
  // If user has watch history, get recommendations based on most recent movie
  if (watchHistory.length > 0) {
    // Sort by most recent
    const sortedHistory = [...watchHistory].sort((a, b) => 
      new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    );
    
    // Get recently watched movie ID
    const recentMovieId = sortedHistory[0].movieId;
    
    // Get similar movies based on recently watched
    const similarMovies = await tmdbService.getSimilarMovies(recentMovieId);
    
    return similarMovies;
  }
  
  // If no watch history, get user preferences
  const preferences = await storage.getUserPreferences(userId);
  
  if (preferences && preferences.genres && preferences.genres.length > 0) {
    // Build params based on preferences
    const discoverParams: Record<string, string> = {
      with_genres: preferences.genres.join(','),
      sort_by: 'popularity.desc'
    };
    
    // Get movies based on genre preferences
    return await tmdbService.discoverMovies(discoverParams);
  }
  
  // If all else fails, return popular movies
  return await tmdbService.getPopular();
}