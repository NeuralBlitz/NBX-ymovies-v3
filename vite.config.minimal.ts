import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    // Provide safe fallbacks for all environment variables
    'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(process.env.VITE_TMDB_API_KEY || ''),
    'import.meta.env.VITE_TMDB_API_KEY_V3': JSON.stringify(process.env.VITE_TMDB_API_KEY_V3 || ''),
    'import.meta.env.VITE_USE_DEMO_SERVER': JSON.stringify(process.env.VITE_USE_DEMO_SERVER || 'false'),
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
    rollupOptions: {
      external: [],
      output: {
        // Ensure deterministic builds
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  base: "./",
  // Ensure consistent behavior
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
