// Comprehensive test script for database operations
// This tests all critical database operations with proper error handling

import { DatabaseStorage } from './server/storage.ts';

async function testDatabaseOperations() {
  console.log('🔍 Starting comprehensive database operations test...');
  console.log('=====================================================');
  
  const storage = new DatabaseStorage();
  
  // Generate a unique test user ID
  const testUserId = `test_user_${Date.now()}`;
  let success = true;
  
  try {
    // Test 1: User Operations
    console.log('\n📋 TEST SET 1: User Operations');
    console.log('-----------------------------');
    
    // 1.1 Create a new user
    console.log('\n1.1 Creating a test user...');
    const user = await storage.upsertUser({
      id: testUserId,
      email: `${testUserId}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: 'https://example.com/avatar.png',
    });
    
    if (user && user.id === testUserId) {
      console.log('✅ User created successfully:', {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    } else {
      console.error('❌ Failed to create user');
      success = false;
    }
    
    // 1.2 Get the user
    console.log('\n1.2 Fetching the user by ID...');
    const fetchedUser = await storage.getUser(testUserId);
    
    if (fetchedUser && fetchedUser.id === testUserId) {
      console.log('✅ User fetched successfully:', {
        id: fetchedUser.id,
        email: fetchedUser.email,
      });
    } else {
      console.error('❌ Failed to fetch user');
      success = false;
    }
    
    // Test 2: User Preferences
    console.log('\n📋 TEST SET 2: User Preferences');
    console.log('-------------------------------');
    
    // 2.1 Save user preferences
    console.log('\n2.1 Creating user preferences...');
    const preferencesSuccess = await storage.updateUserPreferences(testUserId, {
      genres: [28, 12, 35], // Action, Adventure, Comedy
      yearRange: 'recent',
      duration: 'medium',
      contentType: 'movies',
      favoriteMovies: [],
      watchlist: [],
      watchHistory: [],
      likedGenres: ['28', '12'],
      dislikedGenres: ['27'], // Horror
    });
    
    if (preferencesSuccess) {
      console.log('✅ User preferences created successfully');
    } else {
      console.error('❌ Failed to create user preferences');
      success = false;
    }
    
    // 2.2 Get user preferences
    console.log('\n2.2 Fetching user preferences...');
    const preferences = await storage.getUserPreferences(testUserId);
    
    if (preferences && preferences.userId === testUserId) {
      console.log('✅ User preferences fetched successfully:', {
        userId: preferences.userId,
        genres: preferences.genres,
        yearRange: preferences.yearRange,
      });
    } else {
      console.error('❌ Failed to fetch user preferences');
      success = false;
    }
    
    // 2.3 Update user preferences
    console.log('\n2.3 Updating user preferences...');
    const updateSuccess = await storage.updateUserPreferences(testUserId, {
      genres: [28, 12, 35, 80], // Added Crime (80)
      yearRange: 'classic',
      duration: 'long',
    });
    
    if (updateSuccess) {
      console.log('✅ User preferences updated successfully');
      
      // Verify the update
      const updatedPreferences = await storage.getUserPreferences(testUserId);
      if (updatedPreferences && updatedPreferences.yearRange === 'classic') {
        console.log('✅ Verified preference changes:', {
          yearRange: updatedPreferences.yearRange,
          duration: updatedPreferences.duration,
        });
      } else {
        console.error('❌ Failed to verify preference changes');
        success = false;
      }
    } else {
      console.error('❌ Failed to update user preferences');
      success = false;
    }
    
    // Test 3: Watchlist Operations
    console.log('\n📋 TEST SET 3: Watchlist Operations');
    console.log('----------------------------------');
    
    // 3.1 Add to watchlist
    console.log('\n3.1 Adding a movie to watchlist...');
    const watchlistItem = await storage.addToWatchlist({
      userId: testUserId,
      movieId: 12345,
    });
    
    if (watchlistItem && watchlistItem.movieId === 12345) {
      console.log('✅ Added movie to watchlist successfully:', {
        userId: watchlistItem.userId,
        movieId: watchlistItem.movieId,
      });
    } else {
      console.error('❌ Failed to add movie to watchlist');
      success = false;
    }
    
    // 3.2 Get watchlist items
    console.log('\n3.2 Fetching watchlist...');
    const watchlist = await storage.getWatchlistItems(testUserId);
    
    if (watchlist && watchlist.length > 0) {
      console.log(`✅ Fetched watchlist successfully (${watchlist.length} items)`);
    } else {
      console.error('❌ Failed to fetch watchlist or watchlist is empty');
      success = false;
    }
    
    // 3.3 Check if movie is in watchlist
    console.log('\n3.3 Checking if movie is in watchlist...');
    const isInWatchlist = await storage.isInWatchlist(testUserId, 12345);
    
    if (isInWatchlist) {
      console.log('✅ Movie is correctly found in watchlist');
    } else {
      console.error('❌ Movie should be in watchlist but was not found');
      success = false;
    }
    
    // Test 4: Watch History Operations
    console.log('\n📋 TEST SET 4: Watch History Operations');
    console.log('--------------------------------------');
    
    // 4.1 Update watch progress
    console.log('\n4.1 Creating watch history entry...');
    const watchHistoryItem = await storage.updateWatchProgress({
      userId: testUserId,
      movieId: 67890,
      watchProgress: 45,
      watchDuration: 1200, // 20 minutes
    });
    
    if (watchHistoryItem && watchHistoryItem.movieId === 67890) {
      console.log('✅ Created watch history entry successfully:', {
        movieId: watchHistoryItem.movieId,
        progress: watchHistoryItem.watchProgress,
      });
    } else {
      console.error('❌ Failed to create watch history entry');
      success = false;
    }
    
    // 4.2 Update progress to completed
    console.log('\n4.2 Updating movie to completed status...');
    const completedMovie = await storage.updateWatchProgress({
      userId: testUserId,
      movieId: 67890,
      watchProgress: 95, // Should mark as completed (>= 90%)
      watchDuration: 600, // 10 more minutes
    });
    
    if (completedMovie && completedMovie.completed === true) {
      console.log('✅ Movie marked as completed successfully');
    } else {
      console.error('❌ Failed to mark movie as completed');
      success = false;
    }
    
    // 4.3 Get watch history
    console.log('\n4.3 Fetching watch history...');
    const history = await storage.getWatchHistory(testUserId);
    
    if (history && history.length > 0) {
      console.log(`✅ Fetched watch history successfully (${history.length} items)`);
    } else {
      console.error('❌ Failed to fetch watch history or history is empty');
      success = false;
    }
    
    // Test 5: Rating Operations
    console.log('\n📋 TEST SET 5: Rating Operations');
    console.log('-------------------------------');
    
    // 5.1 Save a rating
    console.log('\n5.1 Rating a movie...');
    const ratedMovie = await storage.saveRating(testUserId, 11111, 5); // 5-star rating
    
    if (ratedMovie && ratedMovie.rating === 5) {
      console.log('✅ Saved movie rating successfully:', {
        movieId: ratedMovie.movieId,
        rating: ratedMovie.rating,
      });
    } else {
      console.error('❌ Failed to save movie rating');
      success = false;
    }
    
    // 5.2 Get top rated movies
    console.log('\n5.2 Fetching top rated movies...');
    const topRated = await storage.getTopRatedMovies(testUserId);
    
    if (topRated && topRated.length > 0) {
      console.log(`✅ Fetched top rated movies successfully (${topRated.length} items)`);
    } else {
      console.error('❌ Failed to fetch top rated movies or none found');
      success = false;
    }
    
    // 5.3 Update a rating
    console.log('\n5.3 Updating existing rating...');
    const updatedRating = await storage.saveRating(testUserId, 11111, 4); // Changed to 4-star
    
    if (updatedRating && updatedRating.rating === 4) {
      console.log('✅ Updated movie rating successfully:', {
        movieId: updatedRating.movieId,
        rating: updatedRating.rating,
      });
    } else {
      console.error('❌ Failed to update movie rating');
      success = false;
    }
    
    // Test 6: Foreign Key Constraint Test
    console.log('\n📋 TEST SET 6: Foreign Key Constraint Tests');
    console.log('-----------------------------------------');
    
    // Generate a non-existent user ID
    const nonExistentUserId = `nonexistent_${Date.now()}`;
    
    // 6.1 Try adding preferences for non-existent user (should create user)
    console.log('\n6.1 Adding preferences for non-existent user...');
    const nonExistentPrefsResult = await storage.updateUserPreferences(nonExistentUserId, {
      genres: [28], 
      yearRange: 'recent',
    });
    
    if (nonExistentPrefsResult) {
      console.log('✅ Successfully created user and added preferences');
      
      // Verify user was actually created
      const createdUser = await storage.getUser(nonExistentUserId);
      if (createdUser) {
        console.log('✅ Verified user was created automatically');
      } else {
        console.error('❌ User should have been created but was not found');
        success = false;
      }
    } else {
      console.error('❌ Failed to handle non-existent user correctly');
      success = false;
    }
    
    // 6.2 Try adding to watchlist for non-existent user (should create user)
    console.log('\n6.2 Adding to watchlist for a different non-existent user...');
    const nonExistentUserId2 = `nonexistent2_${Date.now()}`;
    const nonExistentWatchlistResult = await storage.addToWatchlist({
      userId: nonExistentUserId2,
      movieId: 54321,
    });
    
    if (nonExistentWatchlistResult) {
      console.log('✅ Successfully created user and added to watchlist');
      
      // Verify user was created
      const createdUser2 = await storage.getUser(nonExistentUserId2);
      if (createdUser2) {
        console.log('✅ Verified second user was created automatically');
      } else {
        console.error('❌ Second user should have been created but was not found');
        success = false;
      }
    } else {
      console.error('❌ Failed to handle second non-existent user correctly');
      success = false;
    }
    
    // Summary
    console.log('\n=====================================================');
    if (success) {
      console.log('🎉 ALL TESTS PASSED! Database operations are working correctly.');
    } else {
      console.log('⚠️ Some tests failed. See errors above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite encountered an error:', error);
    success = false;
  }
  
  return success;
}

// Run the test
console.log(`📅 Test started at ${new Date().toISOString()}`);
testDatabaseOperations()
  .then((success) => {
    if (success) {
      console.log('\n✅ Test suite completed successfully');
    } else {
      console.log('\n⚠️ Test suite completed with failures');
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed with an unexpected error:', error);
    process.exitCode = 1;
  });
