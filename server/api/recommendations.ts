import { Request, Response } from "express";
import { RecommendationEngine } from "../services/recommendation-engine";

// Initialize recommendation engine with TMDB API key
const recommendationEngine = new RecommendationEngine(process.env.TMDB_API_KEY || "");

/**
 * Get personalized movie recommendations for a user
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    // Get user ID from session
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get optional limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    // Get recommendations using the enhanced engine
    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      userId,
      limit
    );
    
    return res.json(recommendations);
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    return res.status(500).json({ message: "Failed to generate recommendations" });
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
    
    // Fetch trending movies from recommendation engine
    const movies = await recommendationEngine.getPopularMoviesRecommendations([], [], 20);
    
    return res.json(movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return res.status(500).json({ message: "Failed to fetch trending movies" });
  }
}