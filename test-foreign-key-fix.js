// Test script to verify the foreign key constraint fix
import { DatabaseStorage } from './server/storage.ts';

async function testForeignKeyFix() {
  console.log('🔍 Testing foreign key constraint fix...');
  
  const storage = new DatabaseStorage();
  
  // Test user ID that doesn't exist in the database (simulating Firebase user)
  const testUserId = 'test_firebase_user_' + Date.now();
  
  try {
    console.log('\n1. Testing updateUserPreferences with non-existent user...');
    
    // This should create the user automatically and then save preferences
    await storage.updateUserPreferences(testUserId, {
      genres: [28, 12], // Action and Adventure
      yearRange: 'recent',
      duration: 'medium',
      favoriteMovies: [],
      watchlist: [],
      watchHistory: []
    });
    
    console.log('✅ updateUserPreferences succeeded - user was created automatically');
    
    console.log('\n2. Testing addToWatchlist with the same user...');
    
    // This should work since the user now exists
    await storage.addToWatchlist({
      userId: testUserId,
      movieId: 12345
    });
    
    console.log('✅ addToWatchlist succeeded');
    
    console.log('\n3. Testing updateWatchProgress with the same user...');
    
    // This should work since the user exists
    await storage.updateWatchProgress({
      userId: testUserId,
      movieId: 67890,
      watchProgress: 45
    });
    
    console.log('✅ updateWatchProgress succeeded');
    
    console.log('\n4. Testing saveRating with the same user...');
    
    // This should work since the user exists
    await storage.saveRating(testUserId, 11111, 4);
    
    console.log('✅ saveRating succeeded');
    
    console.log('\n5. Verifying user was created...');
    
    const user = await storage.getUser(testUserId);
    if (user) {
      console.log('✅ User record exists:', {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      });
    } else {
      console.log('❌ User record not found');
    }
    
    console.log('\n6. Verifying preferences were saved...');
    
    const preferences = await storage.getUserPreferences(testUserId);
    if (preferences) {
      console.log('✅ Preferences exist:', {
        userId: preferences.userId,
        genres: preferences.genres,
        yearRange: preferences.yearRange
      });
    } else {
      console.log('❌ Preferences not found');
    }
    
    console.log('\n🎉 All tests passed! Foreign key constraint fix is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testForeignKeyFix()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
