import { checkServerStatus } from './queryClient';

// Check if demo server is running
async function checkDemoServer(): Promise<boolean> {
  console.log("Checking if demo server is running...");
  
  const isRunning = await checkServerStatus();
  
  if (!isRunning) {
    console.log("Demo server is not running or not accessible");
    console.log("\nTo start the demo server, run this command in a new terminal:");
    console.log("\u001b[32mnpm run dev:demo\u001b[0m");
    console.log("\nAfter starting the demo server, refresh this page.");
  } else {
    console.log("Demo server is running!");
  }
  
  return isRunning;
}

// Function to display friendly error message
function handleApiError(endpoint: string, error: Error | unknown) {
  console.error(`Error fetching from ${endpoint}:`, error);
  
  if (error instanceof Error && 
      (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'))) {
    checkDemoServer();
  }
  
  throw error;
}

export { checkDemoServer, handleApiError };
