import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    // Use empty fallbacks for environment variables to prevent hanging
    'import.meta.env.VITE_TMDB_API_KEY': 'undefined',
    'import.meta.env.VITE_TMDB_API_KEY_V3': 'undefined',
    'import.meta.env.VITE_USE_DEMO_SERVER': 'undefined',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  base: "./",
});
