import { TMDBService } from "../services/tmdb";
import { UserPreferences } from "@shared/schema";

/**
 * Generate movie recommendations based on user preferences
 */
export async function getRecommendations(
  preferences: UserPreferences, 
  tmdbService: TMDBService
) {
  const { genres, yearRange, duration } = preferences;
  
  // If no genres selected, return popular movies
  if (!genres || genres.length === 0) {
    return await tmdbService.getPopular();
  }
  
  // Initialize parameters for discover API
  const params: Record<string, string> = {
    with_genres: genres.join(',')
  };
  
  // Add year range filter if specified
  if (yearRange) {
    const currentYear = new Date().getFullYear();
    if (yearRange === 'recent') {
      // Movies from last 5 years
      params.primary_release_date_gte = `${currentYear - 5}-01-01`;
    } else if (yearRange === 'classic') {
      // Movies older than 10 years
      params.primary_release_date_lte = `${currentYear - 10}-12-31`;
    }
  }
  
  // Add runtime filter if specified
  if (duration) {
    if (duration === 'short') {
      // Under 90 minutes
      params.with_runtime_lte = '90';
    } else if (duration === 'medium') {
      // 90-120 minutes
      params.with_runtime_gte = '90';
      params.with_runtime_lte = '120';
    } else if (duration === 'long') {
      // Over 120 minutes
      params.with_runtime_gte = '120';
    }
  }
  
  // Get recommendations based on preferences
  return await tmdbService.discoverMovies(params);
}
