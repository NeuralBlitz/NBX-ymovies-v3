// Environment variables for the client
// This is loaded directly by the client to get access to environment variables
// even if Vite's import.meta.env system isn't working properly

console.log("Loading environment variables from env.js");

window.ENV = {
  // JWT Bearer Token
  TMDB_API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjgxMDQ2NzdlZWI0ZDY3YmQ0NzZhZjVkMGVkOWFkNiIsIm5iZiI6MTczODI2MTkxNy4wOTc5OTk4LCJzdWIiOiI2NzliYzU5ZDgxOWVkMmVhYjAzNDY2NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.px06QFaL2fXmNbfrECHcyKnT3nIzKt75VFG71gU1ELI", 
  // Regular API Key (V3)
  TMDB_API_KEY_V3: "e28104677eeb4d67bd476af5d0ed9ad6",
  USE_DEMO_SERVER: "false"
};

console.log("Environment variables loaded in env.js:", Object.keys(window.ENV).join(", "));
