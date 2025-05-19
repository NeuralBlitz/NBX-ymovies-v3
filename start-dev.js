#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

console.log(`${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════╗
║        YMovies DEVELOPMENT STARTER            ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

// Function to check if a port is in use
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = http.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

// Start the demo server
async function startDemoServer() {
  console.log(`${colors.yellow}[1/2] Starting Demo API Server...${colors.reset}`);
  
  // Check if port 5001 is available
  const isPort5001Free = await isPortAvailable(5001);
  if (!isPort5001Free) {
    console.log(`${colors.red}⚠️ Port 5001 is already in use. The demo server might already be running.${colors.reset}`);
    console.log(`${colors.dim}Try checking with: netstat -ano | findstr :5001${colors.reset}`);
  }
  
  // Start the demo server
  const demoServer = spawn('node', ['demo-server.js'], {
    cwd: path.resolve(__dirname),
    shell: true,
    stdio: 'pipe'
  });
  
  demoServer.stdout.on('data', (data) => {
    console.log(`${colors.green}[API] ${colors.reset}${data.toString().trim()}`);
  });
  
  demoServer.stderr.on('data', (data) => {
    console.log(`${colors.red}[API ERROR] ${colors.reset}${data.toString().trim()}`);
  });
  
  // Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if the server is responding
  try {
    const req = http.get('http://localhost:5001/api/health', (res) => {
      if (res.statusCode === 200) {
        console.log(`${colors.green}✓ Demo API Server started successfully on port 5001!${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Demo API Server responded with status ${res.statusCode}${colors.reset}`);
      }
    });
    
    req.on('error', () => {
      console.log(`${colors.red}⚠️ Could not connect to Demo API Server. Continuing anyway...${colors.reset}`);
    });
    
    req.end();
  } catch (error) {
    console.error(`${colors.red}Error checking API server: ${error.message}${colors.reset}`);
  }
  
  return demoServer;
}

// Start the client application
async function startClientApp() {
  console.log(`${colors.yellow}[2/2] Starting Client Application...${colors.reset}`);
  
  // Check if port 5174 is available (Vite's default port)
  const isPort5174Free = await isPortAvailable(5174);
  if (!isPort5174Free) {
    console.log(`${colors.yellow}⚠️ Port 5174 is already in use. The client app might try a different port.${colors.reset}`);
  }
  
  // Start the client app
  const clientApp = spawn('npm', ['run', 'dev:client'], {
    cwd: path.resolve(__dirname),
    shell: true,
    stdio: 'pipe'
  });
  
  clientApp.stdout.on('data', (data) => {
    const output = data.toString().trim();
    
    // Check for the local URL in the Vite output
    if (output.includes('Local:')) {
      const urlMatch = output.match(/https?:\/\/localhost:\d+/);
      if (urlMatch) {
        console.log(`\n${colors.magenta}${colors.bright}
╔═══════════════════════════════════════════════╗
║  🎬 YMOVIES IS READY! OPEN THIS URL:          ║
║  ${urlMatch[0].padEnd(39)}                    ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);
      }
    }
    
    console.log(`${colors.blue}[CLIENT] ${colors.reset}${output}`);
  });
  
  clientApp.stderr.on('data', (data) => {
    console.log(`${colors.red}[CLIENT ERROR] ${colors.reset}${data.toString().trim()}`);
  });
  
  return clientApp;
}

// Main function
async function main() {
  try {
    // Start the demo server
    const demoServer = await startDemoServer();
    
    // Start the client app
    const clientApp = await startClientApp();
    
    // Handle cleanup on exit
    const cleanup = () => {
      console.log(`\n${colors.yellow}Shutting down applications...${colors.reset}`);
      demoServer.kill();
      clientApp.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    console.error(`${colors.red}Error starting applications: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Start everything
main();
