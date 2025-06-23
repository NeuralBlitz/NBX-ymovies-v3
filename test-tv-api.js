// Quick test script to check TV show API functionality
// Run this with: node test-tv-api.js

const testTVShowId = 1399; // Game of Thrones - popular show with lots of content

async function testTVShowAPIs() {
  console.log("Testing TV Show API Functions...");
  console.log("===================================");
  
  const baseUrl = "https://api.themoviedb.org/3";
  
  // Get API key from environment
  const apiKey = process.env.VITE_TMDB_API_KEY_V3 || process.env.TMDB_API_KEY_V3;
  
  if (!apiKey) {
    console.error("❌ No TMDB API key found!");
    console.log("Set VITE_TMDB_API_KEY_V3 or TMDB_API_KEY_V3 environment variable");
    return;
  }
  
  console.log("✅ API Key found:", apiKey.substring(0, 8) + "...");
  
  try {
    // Test TV show details
    console.log("\n1. Testing TV show details...");
    const detailsResponse = await fetch(`${baseUrl}/tv/${testTVShowId}?api_key=${apiKey}&append_to_response=credits,videos,similar,recommendations`);
    const details = await detailsResponse.json();
    
    if (detailsResponse.ok) {
      console.log("✅ TV show details:", details.name);
      console.log("   - Seasons:", details.number_of_seasons);
      console.log("   - Episodes:", details.number_of_episodes);
    } else {
      console.error("❌ TV show details failed:", details);
    }
    
    // Test videos
    console.log("\n2. Testing TV show videos...");
    const videosResponse = await fetch(`${baseUrl}/tv/${testTVShowId}/videos?api_key=${apiKey}`);
    const videos = await videosResponse.json();
    
    if (videosResponse.ok) {
      console.log("✅ Videos found:", videos.results.length);
      const trailers = videos.results.filter(v => v.type === "Trailer");
      console.log("   - Trailers:", trailers.length);
      if (trailers.length > 0) {
        console.log("   - First trailer:", trailers[0].name);
      }
    } else {
      console.error("❌ Videos failed:", videos);
    }
    
    // Test reviews
    console.log("\n3. Testing TV show reviews...");
    const reviewsResponse = await fetch(`${baseUrl}/tv/${testTVShowId}/reviews?api_key=${apiKey}`);
    const reviews = await reviewsResponse.json();
    
    if (reviewsResponse.ok) {
      console.log("✅ Reviews found:", reviews.results.length);
      if (reviews.results.length > 0) {
        console.log("   - First review by:", reviews.results[0].author);
      }
    } else {
      console.error("❌ Reviews failed:", reviews);
    }
    
    // Test episodes (season 1)
    console.log("\n4. Testing TV show episodes (Season 1)...");
    const episodesResponse = await fetch(`${baseUrl}/tv/${testTVShowId}/season/1?api_key=${apiKey}`);
    const episodes = await episodesResponse.json();
    
    if (episodesResponse.ok) {
      console.log("✅ Season 1 episodes found:", episodes.episodes.length);
      if (episodes.episodes.length > 0) {
        console.log("   - First episode:", episodes.episodes[0].name);
      }
    } else {
      console.error("❌ Episodes failed:", episodes);
    }
    
    console.log("\n🎉 All tests completed!");
    
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testTVShowAPIs();
}

module.exports = { testTVShowAPIs };
