#!/usr/bin/env node

/**
 * Test script to verify the enhanced recommendation algorithm is working
 * This will test the actual API endpoints with the new algorithm
 */

import { RecommendationEngine } from './server/services/recommendation-engine.js';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c5d1483201a7d5fee0e8e8c6b44b72b8';

async function testEnhancedRecommendations() {
  console.log('🧪 Testing Enhanced Recommendation Algorithm...\n');
  
  const engine = new RecommendationEngine(TMDB_API_KEY);
  
  // Test case: The Garfield Movie (family/animated content)
  const garfieldMovieId = 748783; // The Garfield Movie (2024)
  const testUserId = 'test-user-123';
  
  try {
    console.log('📺 Testing recommendations for "The Garfield Movie"...');
    console.log('This should now prioritize family-friendly content and avoid action/thriller movies.\n');
    
    // Get recommendations using the enhanced algorithm
    const recommendations = await engine.getEnhancedBecauseYouWatched(testUserId, garfieldMovieId, 10);
    
    console.log(`✅ Got ${recommendations.length} recommendations:\n`);
    
    // Analyze the recommendations
    const inappropriateGenres = [28, 53, 27, 80]; // Action, Thriller, Horror, Crime
    const familyGenres = [16, 10751, 35, 14, 12]; // Animation, Family, Comedy, Fantasy, Adventure
    
    let appropriateCount = 0;
    let inappropriateCount = 0;
    
    recommendations.forEach((movie, index) => {
      const movieGenres = movie.genre_ids || [];
      const hasInappropriate = movieGenres.some(id => inappropriateGenres.includes(id));
      const hasFamilyContent = movieGenres.some(id => familyGenres.includes(id));
      
      if (hasInappropriate) {
        inappropriateCount++;
        console.log(`❌ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - INAPPROPRIATE GENRES DETECTED`);
      } else if (hasFamilyContent) {
        appropriateCount++;
        console.log(`✅ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - Family-friendly ✨`);
      } else {
        console.log(`⚪ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - Neutral content`);
      }
    });
    
    console.log('\n📊 Results Summary:');
    console.log(`✅ Family-appropriate recommendations: ${appropriateCount}`);
    console.log(`❌ Inappropriate recommendations: ${inappropriateCount}`);
    console.log(`⚪ Neutral recommendations: ${recommendations.length - appropriateCount - inappropriateCount}`);
    
    if (inappropriateCount === 0) {
      console.log('\n🎉 SUCCESS: No inappropriate content recommended for family movie!');
      console.log('The enhanced algorithm is working correctly.');
    } else {
      console.log('\n⚠️  WARNING: Some inappropriate content still being recommended.');
      console.log('The algorithm may need further tuning.');
    }
    
    // Check for specific problematic movies
    const problematicTitles = ['Mission: Impossible', 'John Wick', 'The Dark Knight', 'Deadpool'];
    const foundProblematic = recommendations.some(movie => 
      problematicTitles.some(title => movie.title.includes(title))
    );
    
    if (foundProblematic) {
      console.log('\n❌ CRITICAL: Known problematic movies still being recommended!');
    } else {
      console.log('\n✅ GOOD: No known problematic movies in recommendations.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testEnhancedRecommendations().catch(console.error);
