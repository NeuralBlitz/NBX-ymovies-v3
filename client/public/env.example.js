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
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: "your_firebase_api_key_here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id",
    measurementId: "your_measurement_id"
  }
};

console.log("Environment variables loaded in env.js:", Object.keys(window.ENV).join(", "));
