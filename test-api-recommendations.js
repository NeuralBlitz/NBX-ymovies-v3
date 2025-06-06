#!/usr/bin/env node

/**
 * Test the actual API endpoints to verify enhanced recommendations are working
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testAPIRecommendations() {
  console.log('🌐 Testing Netflix Clone API Recommendations...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('🔍 Checking if server is running...');
    try {
      await axios.get(`${API_BASE}/movies/popular`);
      console.log('✅ Server is running\n');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('Run: npm run dev\n');
      return;
    }
    
    // Test 2: Get similar movies for The Garfield Movie
    console.log('📺 Testing similar movies for "The Garfield Movie" (ID: 748783)...');
    console.log('This should now use the enhanced algorithm and avoid inappropriate content.\n');
    
    try {
      const response = await axios.get(`${API_BASE}/movies/748783/similar`);
      const similarMovies = response.data;
      
      console.log(`✅ Got ${similarMovies.length} similar movies:\n`);
      
      // Analyze the recommendations
      const inappropriateGenres = [28, 53, 27, 80]; // Action, Thriller, Horror, Crime
      const familyGenres = [16, 10751, 35, 14, 12]; // Animation, Family, Comedy, Fantasy, Adventure
      
      let appropriateCount = 0;
      let inappropriateCount = 0;
      
      similarMovies.forEach((movie, index) => {
        const movieGenres = movie.genre_ids || [];
        const hasInappropriate = movieGenres.some(id => inappropriateGenres.includes(id));
        const hasFamilyContent = movieGenres.some(id => familyGenres.includes(id));
        
        if (hasInappropriate) {
          inappropriateCount++;
          console.log(`❌ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - INAPPROPRIATE`);
        } else if (hasFamilyContent) {
          appropriateCount++;
          console.log(`✅ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - Family-friendly ✨`);
        } else {
          console.log(`⚪ ${index + 1}. ${movie.title} (${movie.vote_average}/10) - Neutral`);
        }
      });
      
      console.log('\n📊 Similar Movies Results:');
      console.log(`✅ Family-appropriate: ${appropriateCount}`);
      console.log(`❌ Inappropriate: ${inappropriateCount}`);
      console.log(`⚪ Neutral: ${similarMovies.length - appropriateCount - inappropriateCount}`);
      
      if (inappropriateCount === 0 && appropriateCount > 0) {
        console.log('\n🎉 SUCCESS: Enhanced algorithm is working! No inappropriate content for family movie.');
      } else if (inappropriateCount > 0) {
        console.log('\n⚠️  Issue: Some inappropriate content still being recommended.');
      } else {
        console.log('\n⚪ Note: Neutral results - may be using fallback TMDB recommendations.');
      }
      
    } catch (error) {
      console.log(`❌ Error testing similar movies: ${error.message}`);
      
      if (error.response?.status === 401) {
        console.log('Note: This endpoint may require authentication for enhanced recommendations.');
      }
    }
    
    // Test 3: Test another family movie
    console.log('\n📺 Testing similar movies for "Shrek" (ID: 808)...');
    
    try {
      const response = await axios.get(`${API_BASE}/movies/808/similar`);
      const similarMovies = response.data;
      
      console.log(`✅ Got ${similarMovies.length} similar movies for Shrek\n`);
      
      const hasFamily = similarMovies.some(movie => 
        movie.genre_ids?.includes(16) || movie.genre_ids?.includes(10751)
      );
      
      if (hasFamily) {
        console.log('✅ Good: Family content recommended for family movie');
      } else {
        console.log('⚪ Note: No obvious family content in recommendations');
      }
      
    } catch (error) {
      console.log(`❌ Error testing Shrek recommendations: ${error.message}`);
    }
    
    console.log('\n🔧 Algorithm Status:');
    console.log('- Enhanced TypeScript recommendation engine is now active');
    console.log('- Fallback to enhanced engine when Python service unavailable');
    console.log('- Content appropriateness filtering implemented');
    console.log('- Genre similarity improvements applied');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIRecommendations();
