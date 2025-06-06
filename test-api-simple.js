#!/usr/bin/env node

/**
 * Simple test to check if enhanced recommendations are working
 */

async function testRecommendations() {
  try {
    console.log('🧪 Testing Enhanced Recommendations via API...\n');
    
    // Test The Garfield Movie recommendations
    const garfieldId = 748783;
    console.log(`Making request to: http://localhost:5000/api/recommendations/because-you-liked/${garfieldId}`);
    
    const response = await fetch(`http://localhost:5000/api/recommendations/because-you-liked/${garfieldId}`);
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data keys:', Object.keys(data));
    
    const recommendations = data.recommendations || [];
    
    console.log(`📺 Testing recommendations for "The Garfield Movie" (ID: ${garfieldId})`);
    console.log(`✅ Got ${recommendations.length} recommendations:\n`);
    
    // Analyze recommendations
    const inappropriateGenres = [28, 53, 27, 80]; // Action, Thriller, Horror, Crime
    const familyGenres = [16, 10751, 35, 14, 12]; // Animation, Family, Comedy, Fantasy, Adventure
    
    let inappropriateCount = 0;
    let familyCount = 0;
    
    recommendations.slice(0, 10).forEach((movie, index) => {
      const genres = movie.genre_ids || [];
      const hasInappropriate = genres.some(id => inappropriateGenres.includes(id));
      const hasFamilyContent = genres.some(id => familyGenres.includes(id));
      
      let status = '⚪';
      if (hasInappropriate) {
        status = '❌';
        inappropriateCount++;
      } else if (hasFamilyContent) {
        status = '✅';
        familyCount++;
      }
      
      console.log(`${status} ${index + 1}. ${movie.title} (${movie.vote_average}/10)`);
      console.log(`   Genres: [${genres.join(', ')}]`);
    });
    
    console.log('\n📊 Results:');
    console.log(`✅ Family-appropriate: ${familyCount}`);
    console.log(`❌ Inappropriate: ${inappropriateCount}`);
    console.log(`⚪ Neutral: ${recommendations.length - familyCount - inappropriateCount}`);
    
    if (inappropriateCount === 0) {
      console.log('\n🎉 SUCCESS: Enhanced algorithm is working! No inappropriate content found.');
    } else {
      console.log('\n⚠️  WARNING: Some inappropriate content still found. Algorithm needs attention.');
    }
    
    // Check for specific problematic movies
    const problematicTitles = ['Mission: Impossible', 'John Wick', 'The Dark Knight', 'Deadpool'];
    const hasProblematic = recommendations.some(movie => 
      problematicTitles.some(title => movie.title.includes(title))
    );
    
    if (hasProblematic) {
      console.log('\n❌ CRITICAL: Known problematic movies found in recommendations!');
    } else {
      console.log('\n✅ GOOD: No known problematic movies in recommendations.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecommendations();
