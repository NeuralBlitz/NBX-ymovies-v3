// Test current recommendation behavior
async function testCurrentRecommendations() {
  const movieId = 550; // Fight Club - a well-known movie for testing
  
  console.log("🎬 Testing recommendations for Fight Club (ID: 550)...\n");
  
  try {
    // Test 1: Basic TMDB similar movies
    console.log("📊 Testing basic TMDB similar movies:");
    const tmdbResponse = await fetch(`http://localhost:5000/api/recommendations/similar/${movieId}`);
    
    if (!tmdbResponse.ok) {
      throw new Error(`HTTP error! status: ${tmdbResponse.status}`);
    }
    
    const tmdbData = await tmdbResponse.json();
    console.log(`✅ Got ${tmdbData.length} recommendations from API`);
    
    // Analyze the recommendations
    console.log("\n🔍 Analyzing recommendation quality:");
    
    tmdbData.slice(0, 10).forEach((movie, index) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      const genres = movie.genre_ids || [];
      
      console.log(`${index + 1}. ${movie.title} (${year}) - Rating: ${rating}/10`);
      console.log(`   Genres: ${genres.join(', ')}`);
      console.log(`   Overview: ${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview'}`);
      console.log('');
    });
    
    // Test 2: Enhanced recommendations API
    console.log("\n🚀 Testing enhanced recommendations:");
    const enhancedResponse = await fetch(`http://localhost:5000/api/recommendations/because-you-liked/${movieId}`);
    
    if (enhancedResponse.ok) {
      const enhancedData = await enhancedResponse.json();
      console.log(`✅ Enhanced API available - got ${enhancedData.recommendations?.length || 0} recommendations`);
      console.log(`Category: ${enhancedData.category || 'Unknown'}`);
    } else {
      console.log("❌ Enhanced recommendations API not available");
    }
    
  } catch (error) {
    console.error("❌ Error testing recommendations:", error.message);
    console.log("\n💡 Make sure the server is running with: npm run dev");
  }
}

testCurrentRecommendations();
