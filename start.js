// Enhanced script to output the right commands and check server status
const http = require('http');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Check if demo server is running
function checkServerStatus(callback) {
  const req = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/health',
    method: 'GET',
    timeout: 1000
  }, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  });

  req.on('error', () => {
    callback(false);
  });

  req.on('timeout', () => {
    req.destroy();
    callback(false);
  });

  req.end();
}

// Print the main title
console.log(`\n${colors.bright}${colors.cyan}=== NETFLIX CLONE - STARTUP GUIDE ===${colors.reset}\n`);

// Check if demo server is running
console.log(`${colors.yellow}Checking if demo server is running...${colors.reset}`);
checkServerStatus((isRunning) => {
  if (isRunning) {
    console.log(`${colors.green}✓ Demo server is already running on port 5001!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Demo server is not running${colors.reset}\n`);
  }

  // Print the instructions
  console.log(`${colors.bright}To run the Netflix clone, follow these steps:${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.yellow}Step 1: Start the Demo API Server${colors.reset}`);
  console.log(`Run this command in a terminal:`);
  console.log(`${colors.green}npm run dev:demo${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.yellow}Step 2: Start the Client Application${colors.reset}`);
  console.log(`Run this command in a second terminal:`);
  console.log(`${colors.green}npm run dev:client${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.blue}Alternative: Run both at once${colors.reset}`);
  console.log(`If you have concurrently installed, you can run:`);
  console.log(`${colors.green}npm run dev:all${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.magenta}Environment Configuration${colors.reset}`);
  console.log(`Make sure your .env file contains:`);
  console.log(`1. DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/netflix_clone`);
  console.log(`2. USE_DEMO_SERVER=true`);
  console.log(`3. TMDB_API_KEY=yourkey`);
  console.log(`4. VITE_TMDB_API_KEY=yourbearertoken`);

  console.log(`\n${colors.bright}${colors.cyan}Troubleshooting${colors.reset}`);
  console.log(`If you see "<!DOCTYPE..." errors in the console, the demo server is not running.`);
  console.log(`Start it with ${colors.green}npm run dev:demo${colors.reset} and refresh the page.\n`);
});
