const axios = require('axios');

async function testEnhancedAnonymousRecommendations() {
  console.log('🎭 Testing Enhanced Anonymous User Recommendations...\n');
  
  const API_BASE = 'http://localhost:5040';
  
  // Test cases with different movie types
  const testCases = [
    {
      movieId: 550,
      movieTitle: 'Fight Club',
      type: 'Action/Drama',
      expectedGenres: [18, 53, 28] // Drama, Thriller, Action
    },
    {
      movieId: 748783,
      movieTitle: 'The Garfield Movie',
      type: 'Family/Animation',
      expectedGenres: [16, 10751, 35] // Animation, Family, Comedy
    },
    {
      movieId: 238,
      movieTitle: 'The Godfather',
      type: 'Crime/Drama',
      expectedGenres: [80, 18] // Crime, Drama
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🎬 Testing recommendations for: ${testCase.movieTitle} (${testCase.type})`);
    console.log(`Movie ID: ${testCase.movieId}`);
    
    try {
      // Make request without authentication (anonymous user)
      const response = await axios.get(`${API_BASE}/api/recommendations/similar/${testCase.movieId}`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const recommendations = response.data;
      
      if (!Array.isArray(recommendations)) {
        console.log('❌ Invalid response format - expected array');
        continue;
      }
      
      console.log(`✅ Received ${recommendations.length} recommendations`);
      
      if (recommendations.length === 0) {
        console.log('⚠️ No recommendations returned');
        continue;
      }
      
      // Analyze recommendation quality
      let relevantCount = 0;
      let totalQualityScore = 0;
      let genreMatches = 0;
      
      console.log('\n📋 Analyzing recommendations:');
      recommendations.slice(0, 5).forEach((movie, index) => {
        const movieGenres = movie.genre_ids || [];
        const hasExpectedGenre = movieGenres.some(id => testCase.expectedGenres.includes(id));
        const qualityScore = movie.vote_average || 0;
        const popularity = movie.popularity || 0;
        
        if (hasExpectedGenre) {
          genreMatches++;
          relevantCount++;
        }
        
        totalQualityScore += qualityScore;
        
        const status = hasExpectedGenre ? '✅' : '❓';
        console.log(`  ${status} ${index + 1}. ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`);
        console.log(`      Rating: ${qualityScore}/10, Popularity: ${popularity.toFixed(0)}`);
        console.log(`      Genres: [${movieGenres.join(', ')}]`);
      });
      
      // Calculate metrics
      const averageQuality = recommendations.length > 0 ? (totalQualityScore / recommendations.length).toFixed(1) : 0;
      const relevancePercentage = recommendations.length > 0 ? ((genreMatches / Math.min(5, recommendations.length)) * 100).toFixed(0) : 0;
      
      console.log(`\n📊 Quality Metrics:`);
      console.log(`   • Genre Relevance: ${relevancePercentage}% (${genreMatches}/${Math.min(5, recommendations.length)} movies)`);
      console.log(`   • Average Quality: ${averageQuality}/10`);
      console.log(`   • Total Recommendations: ${recommendations.length}`);
      
      // Check for quality improvements
      const highQualityCount = recommendations.filter(m => (m.vote_average || 0) >= 6.5).length;
      const highQualityPercentage = recommendations.length > 0 ? ((highQualityCount / recommendations.length) * 100).toFixed(0) : 0;
      console.log(`   • High Quality Movies (≥6.5): ${highQualityPercentage}% (${highQualityCount}/${recommendations.length})`);
      
      // Check for content appropriateness (especially for family content)
      if (testCase.type.includes('Family')) {
        const inappropriateGenres = [27, 53, 80]; // Horror, Thriller, Crime
        const inappropriateCount = recommendations.filter(m => 
          (m.genre_ids || []).some(id => inappropriateGenres.includes(id))
        ).length;
        
        if (inappropriateCount === 0) {
          console.log(`   • ✅ Family-appropriate: All recommendations are suitable for family viewing`);
        } else {
          console.log(`   • ⚠️ Family-appropriate: ${inappropriateCount} potentially inappropriate movies found`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${testCase.movieTitle}:`, error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('   Server appears to be down. Make sure the server is running on port 5040.');
      }
    }
  }
  
  console.log('\n🎉 Enhanced Anonymous Recommendation Test Complete!');
  console.log('\nKey Improvements to Look For:');
  console.log('• Higher genre relevance scores (should be >60%)');
  console.log('• Better average quality scores (should be >6.5)'); 
  console.log('• Family content getting family-appropriate recommendations');
  console.log('• More recent movies in recommendations');
  console.log('• No obviously irrelevant recommendations');
}

// Run the test
testEnhancedAnonymousRecommendations().catch(console.error);
