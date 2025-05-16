import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { TMDBService } from "./services/tmdb";
import { getRecommendations } from "./api/recommendations";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize TMDb service
  const tmdbService = new TMDBService(process.env.TMDB_API_KEY || "");

  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || null);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.saveUserPreferences({
        userId,
        ...req.body
      });
      res.json(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(500).json({ message: "Failed to save preferences" });
    }
  });

  // Watchlist routes
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlist = await storage.getWatchlistItems(userId);
      const movieIds = watchlist.map(item => item.movieId);
      
      if (movieIds.length === 0) {
        return res.json([]);
      }
      
      // Fetch movie details from TMDb for all watchlist items
      const movieDetails = await tmdbService.getMoviesByIds(movieIds);
      res.json(movieDetails);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId } = req.body;
      
      if (!movieId) {
        return res.status(400).json({ message: "Movie ID is required" });
      }
      
      const item = await storage.addToWatchlist({
        userId,
        movieId: Number(movieId)
      });
      
      res.json({ success: true, item });
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlist/:movieId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      await storage.removeFromWatchlist(userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  app.get('/api/watchlist/check/:movieId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      const isInWatchlist = await storage.isInWatchlist(userId, movieId);
      
      res.json({ isInWatchlist });
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      res.status(500).json({ message: "Failed to check watchlist status" });
    }
  });

  // Watch history routes
  app.get('/api/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getWatchHistory(userId);
      const movieIds = history.map(item => item.movieId);
      
      if (movieIds.length === 0) {
        return res.json([]);
      }
      
      // Fetch movie details from TMDb for all history items
      const movieDetails = await tmdbService.getMoviesByIds(movieIds);
      
      // Attach progress information to movie details
      const moviesWithProgress = movieDetails.map(movie => {
        const historyItem = history.find(h => h.movieId === movie.id);
        return {
          ...movie,
          progress: historyItem?.progress || 0
        };
      });
      
      res.json(moviesWithProgress);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      res.status(500).json({ message: "Failed to fetch watch history" });
    }
  });

  app.post('/api/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId, progress } = req.body;
      
      if (!movieId || progress === undefined) {
        return res.status(400).json({ message: "Movie ID and progress are required" });
      }
      
      const item = await storage.updateWatchProgress({
        userId,
        movieId: Number(movieId),
        progress: Number(progress)
      });
      
      res.json({ success: true, item });
    } catch (error) {
      console.error("Error updating watch progress:", error);
      res.status(500).json({ message: "Failed to update watch progress" });
    }
  });

  // Movie data routes
  app.get('/api/movies/trending', async (req, res) => {
    try {
      const trendingMovies = await tmdbService.getTrending();
      res.json(trendingMovies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  app.get('/api/movies/popular', async (req, res) => {
    try {
      const popularMovies = await tmdbService.getPopular();
      res.json(popularMovies);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ message: "Failed to fetch popular movies" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const movie = await tmdbService.getMovieDetails(movieId);
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  app.get('/api/movies/:id/similar', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const similarMovies = await tmdbService.getSimilarMovies(movieId);
      res.json(similarMovies);
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      res.status(500).json({ message: "Failed to fetch similar movies" });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await tmdbService.searchMovies(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get('/api/genres', async (req, res) => {
    try {
      const genres = await tmdbService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        // If no preferences, return popular movies
        const popular = await tmdbService.getPopular();
        return res.json(popular);
      }
      
      const recommendations = await getRecommendations(preferences, tmdbService);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
