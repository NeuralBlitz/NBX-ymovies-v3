// Environment variables for the client
// This is loaded directly by the client to get access to environment variables
// even if Vite's import.meta.env system isn't working properly
// IMPORTANT: Copy this file to env.js and fill in your own values

console.log("Loading environment variables from env.js");

window.ENV = {
  // JWT Bearer Token
  TMDB_API_KEY: "your_tmdb_jwt_bearer_token_here",
  // Regular API Key (V3)
  TMDB_API_KEY_V3: "your_tmdb_v3_api_key_here",
  USE_DEMO_SERVER: "false",
  
  // Supabase Configuration
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: "your_supabase_anon_key_here"
};

console.log("Environment variables loaded in env.js:", Object.keys(window.ENV).join(", "));
