/**
 * Test script for the enhanced "Because You Watched" recommendation system
 */

import 'dotenv/config';
import { RecommendationEngine } from './server/services/recommendation-engine.js';

async function testEnhancedRecommendations() {
  console.log('🎬 Testing Enhanced "Because You Watched" Recommendations...\n');
  
  try {
    // Initialize recommendation engine
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error('❌ TMDB_API_KEY environment variable is required');
      return;
    }
    
    const engine = new RecommendationEngine(apiKey);
    
    // Test with a sample user and popular movie
    const testUserId = 'test-user-123';
    const testMovieId = 748783; // The Accountant 2 (or similar popular movie)
    
    console.log(`📝 Testing recommendations for movie ID: ${testMovieId}`);
    console.log(`👤 Test user ID: ${testUserId}`);
    
    // Test the enhanced recommendation system
    const recommendations = await engine.getEnhancedBecauseYouWatched(testUserId, testMovieId, 10);
    
    console.log(`\n✅ Generated ${recommendations.length} recommendations:`);
    console.log('=' .repeat(80));
    
    recommendations.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`);
      console.log(`   Rating: ${movie.vote_average}/10 (${movie.vote_count} votes)`);
      console.log(`   Genres: ${movie.genre_ids?.map(id => getGenreName(id)).join(', ') || 'N/A'}`);
      console.log(`   Language: ${movie.original_language}`);
      console.log('');
    });
    
    // Test user preference analysis
    console.log('🔍 Testing user preference analysis...');
    const userProfile = await engine.analyzeUserPreferences(testUserId);
    console.log('User Profile:', JSON.stringify(userProfile, null, 2));
    
    console.log('\n🎉 Enhanced recommendation system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to map genre IDs to names
function getGenreName(genreId) {
  const genreMap = {
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
  return genreMap[genreId] || 'Unknown';
}

// Run the test
testEnhancedRecommendations().catch(console.error);
