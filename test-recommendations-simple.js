// Simple test for recommendation engine
const { spawn } = require('child_process');
const path = require('path');

// Test the recommendation engine using tsx to run the TypeScript file directly
const testRecommendations = async () => {
  console.log('Testing Netflix Clone Recommendation Algorithm...\n');
  
  // Create a test script that uses tsx
  const testScript = `
import { RecommendationEngine } from './server/services/recommendation-engine.js';

const engine = new RecommendationEngine();

// Test movie: The Garfield Movie (animated family film)
const garthfieldMovie = {
  id: 748783,
  title: "The Garfield Movie",
  genre_ids: [16, 35, 10751], // Animation, Comedy, Family
  vote_average: 7.1,
  release_date: "2024-04-30",
  overview: "After Garfield's unexpected reunion with his long-lost father..."
};

console.log('Testing recommendations for:', garthfieldMovie.title);
console.log('Genres: Animation, Comedy, Family');
console.log('Expected: Family-friendly animated or comedy movies\\n');

try {
  const recommendations = await engine.getRecommendations(garthfieldMovie, 5);
  
  console.log('Received', recommendations.length, 'recommendations:');
  recommendations.forEach((movie, index) => {
    console.log(\`\${index + 1}. \${movie.title} (\${movie.release_date?.substring(0, 4) || 'Unknown'}) - Rating: \${movie.vote_average}\`);
    console.log(\`   Genres: \${movie.genre_ids?.join(', ') || 'Unknown'}\`);
    console.log(\`   Overview: \${movie.overview?.substring(0, 100)}...\`);
    console.log('');
  });
  
  // Analyze recommendations
  const hasAnimation = recommendations.some(movie => movie.genre_ids?.includes(16));
  const hasFamily = recommendations.some(movie => movie.genre_ids?.includes(10751));
  const hasInappropriate = recommendations.some(movie => 
    movie.genre_ids?.some(id => [27, 53, 80, 18].includes(id)) // Horror, Thriller, Crime, Drama
  );
  
  console.log('Analysis:');
  console.log('- Contains Animation:', hasAnimation);
  console.log('- Contains Family content:', hasFamily);
  console.log('- Contains inappropriate content:', hasInappropriate);
  
  if (hasAnimation || hasFamily) {
    console.log('✅ IMPROVEMENT: Algorithm now includes appropriate content!');
  }
  
  if (!hasInappropriate) {
    console.log('✅ SUCCESS: No inappropriate content detected!');
  } else {
    console.log('❌ ISSUE: Still contains inappropriate content for family movie');
  }
  
} catch (error) {
  console.error('Error during recommendation test:', error.message);
}
`;

  // Write the test script to a temporary file
  require('fs').writeFileSync(path.join(__dirname, 'temp-test.mjs'), testScript);
  
  // Run the test script with tsx
  const child = spawn('npx', ['tsx', 'temp-test.mjs'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    // Clean up temporary file
    try {
      require('fs').unlinkSync(path.join(__dirname, 'temp-test.mjs'));
    } catch (e) {
      // Ignore cleanup errors
    }
    
    if (code === 0) {
      console.log('\nTest completed successfully!');
    } else {
      console.log('\nTest failed with code:', code);
    }
  });
  
  child.on('error', (error) => {
    console.error('Failed to start test:', error.message);
  });
};

testRecommendations();
