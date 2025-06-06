/**
 * Quick test for enhanced recommendations
 */

import 'dotenv/config';
// We'll use require for the TypeScript file through tsx
const { createRequire } = require('module');
const require = createRequire(import.meta.url);

// For now, let's test via the built dist if available, or compile first

async function quickTest() {
  console.log('🎬 Quick Test: Enhanced "Because You Watched" Recommendations...\n');
  
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error('❌ TMDB_API_KEY environment variable is required');
      return;
    }
    
    const engine = new RecommendationEngine(apiKey);
    
    // Test with an animated movie (The Garfield Movie)
    const testUserId = 'test-user-123';
    const animatedMovieId = 748783; // The Garfield Movie
    
    console.log(`📝 Testing recommendations for animated movie ID: ${animatedMovieId}`);
    console.log(`👤 Test user ID: ${testUserId}`);
    console.log('🔄 Generating enhanced recommendations...\n');
    
    const recommendations = await engine.getEnhancedBecauseYouWatched(testUserId, animatedMovieId, 8);
    
    console.log(`✅ Generated ${recommendations.length} recommendations:`);
    console.log('=' .repeat(80));
    
    recommendations.forEach((movie, index) => {
      const genres = movie.genre_ids?.map(id => getGenreName(id)).join(', ') || 'N/A';
      const year = movie.release_date?.split('-')[0] || 'N/A';
      
      console.log(`${index + 1}. ${movie.title} (${year})`);
      console.log(`   Rating: ${movie.vote_average}/10 (${movie.vote_count} votes)`);
      console.log(`   Genres: ${genres}`);
      console.log(`   Language: ${movie.original_language}`);
      
      // Check if recommendation is appropriate for animated source
      const isAnimation = movie.genre_ids?.includes(16);
      const isFamily = movie.genre_ids?.includes(10751);
      const isComedy = movie.genre_ids?.includes(35);
      const isAdventure = movie.genre_ids?.includes(12);
      const isFantasy = movie.genre_ids?.includes(14);
      
      const isAppropriate = isAnimation || isFamily || isComedy || isAdventure || isFantasy;
      console.log(`   ✓ Appropriate for animated source: ${isAppropriate ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    // Analyze the results
    const appropriateCount = recommendations.filter(movie => {
      const isAnimation = movie.genre_ids?.includes(16);
      const isFamily = movie.genre_ids?.includes(10751);
      const isComedy = movie.genre_ids?.includes(35);
      const isAdventure = movie.genre_ids?.includes(12);
      const isFantasy = movie.genre_ids?.includes(14);
      return isAnimation || isFamily || isComedy || isAdventure || isFantasy;
    }).length;
    
    const inappropriateCount = recommendations.filter(movie => {
      const isAction = movie.genre_ids?.includes(28);
      const isThriller = movie.genre_ids?.includes(53);
      const isHorror = movie.genre_ids?.includes(27);
      const isCrime = movie.genre_ids?.includes(80);
      return isAction || isThriller || isHorror || isCrime;
    }).length;
    
    console.log('📊 RECOMMENDATION ANALYSIS:');
    console.log(`   Appropriate recommendations: ${appropriateCount}/${recommendations.length} (${Math.round(appropriateCount/recommendations.length*100)}%)`);
    console.log(`   Inappropriate recommendations: ${inappropriateCount}/${recommendations.length} (${Math.round(inappropriateCount/recommendations.length*100)}%)`);
    
    if (appropriateCount >= recommendations.length * 0.8) {
      console.log('   🎉 SUCCESS: 80%+ appropriate recommendations!');
    } else if (appropriateCount >= recommendations.length * 0.6) {
      console.log('   ⚠️  PARTIAL: 60-79% appropriate recommendations');
    } else {
      console.log('   ❌ POOR: Less than 60% appropriate recommendations');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
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
quickTest().catch(console.error);
