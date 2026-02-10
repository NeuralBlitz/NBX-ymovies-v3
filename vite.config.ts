import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Vite automatically loads .env files - no dotenv needed

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd());

  // Get values from the .env file (prioritize Vercel environment variables)
  const tmdbApiKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY || env.TMDB_API_KEY;
  const tmdbApiKeyV3 = process.env.VITE_TMDB_API_KEY_V3 || process.env.TMDB_API_KEY_V3 || env.TMDB_API_KEY_V3;

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      // No async imports to avoid errors
    ],
    define: {
      // Explicitly define these environment variables to make them available in the client
      'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(tmdbApiKey),
      'import.meta.env.VITE_TMDB_API_KEY_V3': JSON.stringify(tmdbApiKeyV3),
      'import.meta.env.VITE_USE_DEMO_SERVER': JSON.stringify(process.env.VITE_USE_DEMO_SERVER),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    // Add base config for proper path resolution in production
    base: "./",
  };
});
