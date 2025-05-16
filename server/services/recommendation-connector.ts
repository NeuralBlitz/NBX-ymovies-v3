import axios from 'axios';
import { WatchHistory } from '@shared/schema';

// Configuration for the recommendation microservice
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5100';

/**
 * Service for connecting to the Python-based recommendation microservice
 */
export class RecommendationConnector {
  private baseUrl: string;
  private tmdbApiKey: string;

  constructor(baseUrl = RECOMMENDATION_SERVICE_URL, tmdbApiKey = process.env.TMDB_API_KEY) {
    this.baseUrl = baseUrl;
    this.tmdbApiKey = tmdbApiKey || '';
  }

  /**
   * Check if the recommendation service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.error('Recommendation service health check failed:', error);
      return false;
    }
  }

  /**
   * Get content-based recommendations for a movie
   */
  async getContentBasedRecommendations(movieId: number, count = 10): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recommendations/content-based/${movieId}?count=${count}`
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error(`Failed to get content-based recommendations for movie ${movieId}:`, error);
      return [];
    }
  }

  /**
   * Get collaborative filtering recommendations based on user history
   */
  async getCollaborativeRecommendations(userHistory: WatchHistory[], count = 20): Promise<any[]> {
    try {
      // Transform watch history to the format expected by the recommendation service
      const transformedHistory = userHistory.map(item => ({
        movie_id: item.movieId,
        watch_progress: item.watchProgress ? item.watchProgress / 100 : 0, // Convert to 0-1 range
        watch_count: item.watchCount || 1,
        rating: item.rating || null,
        completed: item.completed || false
      }));

      const response = await axios.post(
        `${this.baseUrl}/recommendations/collaborative`,
        {
          user_history: transformedHistory,
          count
        }
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Failed to get collaborative recommendations:', error);
      return [];
    }
  }

  /**
   * Get hybrid recommendations using both content-based and collaborative filtering
   */
  async getHybridRecommendations(userId: string, userHistory: WatchHistory[], count = 20): Promise<any[]> {
    try {
      // Transform watch history to the format expected by the recommendation service
      const transformedHistory = userHistory.map(item => ({
        movie_id: item.movieId,
        watch_progress: item.watchProgress ? item.watchProgress / 100 : 0,
        watch_count: item.watchCount || 1,
        completed: item.completed || false,
        rating: item.rating || null
      }));

      const response = await axios.get(
        `${this.baseUrl}/recommendations/hybrid/${userId}?count=${count}`,
        {
          data: {
            user_history: transformedHistory
          }
        }
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error(`Failed to get hybrid recommendations for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Fallback to TMDB API if recommendation service is unavailable
   */
  async getFallbackRecommendations(movieId?: number): Promise<any[]> {
    try {
      let endpoint = '/movie/popular';
      
      // If a specific movie is provided, get recommendations for it
      if (movieId) {
        endpoint = `/movie/${movieId}/recommendations`;
      }
      
      const response = await axios.get(
        `https://api.themoviedb.org/3${endpoint}?api_key=${this.tmdbApiKey}`
      );
      
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get fallback recommendations:', error);
      return [];
    }
  }
}