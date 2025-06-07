// Test script for favorites functionality
// This script tests the complete favorites flow from client to server

console.log('🎬 YMovies Favorites Functionality Test');
console.log('=====================================\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5000',
  testMovieId: 12345,
  testMovie: {
    id: 12345,
    title: 'Test Movie for Favorites',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    overview: 'This is a test movie used to verify the favorites functionality works correctly.',
    release_date: '2023-01-01',
    vote_average: 8.5,
    genre_ids: [28, 12, 878]
  }
};

// Test functions
async function testServer() {
  console.log('🔧 Testing server connectivity...');
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log(`❌ Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server connection failed: ${error.message}`);
    return false;
  }
}

async function testPreferencesAPI() {
  console.log('\n📡 Testing preferences API...');
  
  // Test without authentication first
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/preferences`);
    if (response.status === 401) {
      console.log('✅ API correctly requires authentication');
    } else {
      console.log(`⚠️  API returned unexpected status without auth: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
    return false;
  }

  // Test with mock authentication token
  try {
    console.log('🔑 Testing with mock authentication...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/preferences`, {
      headers: {
        'Authorization': 'Bearer mock-test-token-12345'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully retrieved preferences:', {
        favoriteMovies: data.favoriteMovies?.length || 0,
        watchlist: data.watchlist?.length || 0,
        watchHistory: data.watchHistory?.length || 0
      });
      return true;
    } else {
      console.log(`❌ Preferences API failed: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log(`❌ Preferences API test failed: ${error.message}`);
    return false;
  }
}

async function testAddFavorite() {
  console.log('\n❤️  Testing add to favorites...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-test-token-12345'
      },
      body: JSON.stringify({
        favoriteMovies: [TEST_CONFIG.testMovie],
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: [],
        completed: false
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successfully added movie to favorites:', result);
      return true;
    } else {
      console.log(`❌ Failed to add favorite: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log(`❌ Add favorite test failed: ${error.message}`);
    return false;
  }
}

async function testGetFavoritesAfterAdd() {
  console.log('\n🔍 Testing get favorites after adding...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/preferences`, {
      headers: {
        'Authorization': 'Bearer mock-test-token-12345'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const favoriteCount = data.favoriteMovies?.length || 0;
      const hasPersisted = favoriteCount > 0;
      
      if (hasPersisted) {
        console.log(`✅ Favorites persisted correctly! Found ${favoriteCount} favorite(s)`);
        console.log('First favorite:', data.favoriteMovies[0]);
        return true;
      } else {
        console.log('❌ Favorites did not persist - no favorites found');
        return false;
      }
    } else {
      console.log(`❌ Failed to get favorites: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Get favorites test failed: ${error.message}`);
    return false;
  }
}

async function testRemoveFavorite() {
  console.log('\n🗑️  Testing remove from favorites...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-test-token-12345'
      },
      body: JSON.stringify({
        favoriteMovies: [], // Empty array to remove all favorites
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: [],
        completed: false
      })
    });
    
    if (response.ok) {
      console.log('✅ Successfully removed favorites');
      return true;
    } else {
      console.log(`❌ Failed to remove favorites: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Remove favorite test failed: ${error.message}`);
    return false;
  }
}

async function testLocalStorage() {
  console.log('\n💾 Testing localStorage functionality...');
  
  // Note: This would normally run in a browser environment
  // For Node.js testing, we'll simulate the localStorage behavior
  
  const mockLocalStorage = {
    data: {},
    setItem(key, value) {
      this.data[key] = value;
    },
    getItem(key) {
      return this.data[key] || null;
    },
    removeItem(key) {
      delete this.data[key];
    }
  };
  
  try {
    // Test storing favorites
    const testFavorites = [TEST_CONFIG.testMovie];
    mockLocalStorage.setItem('user_favorites', JSON.stringify(testFavorites));
    
    // Test retrieving favorites
    const retrieved = JSON.parse(mockLocalStorage.getItem('user_favorites') || '[]');
    
    if (retrieved.length > 0 && retrieved[0].id === TEST_CONFIG.testMovieId) {
      console.log('✅ localStorage simulation passed');
      return true;
    } else {
      console.log('❌ localStorage simulation failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ localStorage test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting comprehensive favorites functionality test...\n');
  
  const results = {};
  
  // Run all tests
  results.server = await testServer();
  results.preferencesAPI = await testPreferencesAPI();
  results.addFavorite = await testAddFavorite();
  results.getFavoritesAfterAdd = await testGetFavoritesAfterAdd();
  results.removeFavorite = await testRemoveFavorite();
  results.localStorage = await testLocalStorage();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Favorites functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Export for use in other scripts or run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testServer,
  testPreferencesAPI,
  testAddFavorite,
  testGetFavoritesAfterAdd,
  testRemoveFavorite,
  testLocalStorage,
  TEST_CONFIG
};
