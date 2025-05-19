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
   * Get similar movie recommendations
   */
  async getSimilarMovies(movieId: number, count = 10): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recommendations/similar/${movieId}?count=${count}`
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error(`Failed to get similar movies for ${movieId}:`, error);
      return this.getFallbackRecommendations(movieId);
    }
  }

  /**
   * Get "Because you liked X" recommendations
   */
  async getBecauseYouLikedRecommendations(movieId: number, count = 10): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recommendations/because-you-liked/${movieId}?count=${count}`
      );
      return {
        recommendations: response.data.recommendations || [],
        sourceMovie: response.data.source_movie,
        category: `Because you liked ${response.data.source_movie?.title || 'this movie'}`
      };
    } catch (error) {
      console.error(`Failed to get "because you liked" recommendations for ${movieId}:`, error);
      return { recommendations: [], sourceMovie: null, category: 'Recommendations' };
    }
  }

  /**
   * Get personalized recommendations based on quiz, liked movies, and watch history
   */
  async getPersonalizedRecommendations(userData: any, count = 20): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/recommendations/personalized?count=${count}`,
        userData
      );
      return response.data || { recommendation_categories: [] };
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return { recommendation_categories: [] };
    }
  }

  /**
   * Get recommendations based on quiz preferences only (for new users)
   */
  async getQuizBasedRecommendations(quizData: any, count = 20): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/recommendations/quiz-based?count=${count}`,
        quizData
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Failed to get quiz-based recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get trending movie recommendations
   */
  async getTrendingRecommendations(count = 20): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recommendations/trending?count=${count}`
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Failed to get trending recommendations:', error);
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