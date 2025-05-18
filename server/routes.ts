import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { firebaseAuth } from "./firebaseAuth";
import { TMDBService } from "./services/tmdb";
import { 
  getPersonalizedRecommendations,
  getPreferenceBasedRecommendations,
  getSimilarMovies,
  getTrendingWithDelay
} from "./api/recommendations";
import preferencesRoutes from "./api/preferences";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize TMDb service
  const tmdbService = new TMDBService(process.env.TMDB_API_KEY || "");

  // Register API routes that require authentication
  app.use('/api/preferences', preferencesRoutes);

  // Auth routes
  app.get('/api/auth/user', firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.uid;
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
      
      // Attach watch history information to movie details
      const moviesWithWatchData = movieDetails.map(movie => {
        const historyItem = history.find(h => h.movieId === movie.id);
        return {
          ...movie,
          watchData: {
            watchProgress: historyItem?.watchProgress || 0,
            watchCount: historyItem?.watchCount || 0,
            completed: historyItem?.completed || false,
            rating: historyItem?.rating || null,
            lastStoppedAt: historyItem?.lastStoppedAt || 0,
            watchDuration: historyItem?.watchDuration || 0,
            watchedAt: historyItem?.watchedAt || null
          }
        };
      });
      
      res.json(moviesWithWatchData);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      res.status(500).json({ message: "Failed to fetch watch history" });
    }
  });

  app.post('/api/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId, watchProgress, watchDuration, lastStoppedAt, rating } = req.body;
      
      if (!movieId || watchProgress === undefined) {
        return res.status(400).json({ message: "Movie ID and watch progress are required" });
      }
      
      const item = await storage.updateWatchProgress({
        userId,
        movieId: Number(movieId),
        watchProgress: Number(watchProgress),
        watchDuration: watchDuration ? Number(watchDuration) : undefined,
        lastStoppedAt: lastStoppedAt ? Number(lastStoppedAt) : undefined,
        rating: rating ? Number(rating) : undefined
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
  
  app.get('/api/movies/:id/videos', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const videos = await tmdbService.getMovieVideos(movieId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching movie videos:", error);
      res.status(500).json({ message: "Failed to fetch movie videos" });
    }
  });
  
  app.get('/api/movies/:id/reviews', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const reviews = await tmdbService.getMovieReviews(movieId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching movie reviews:", error);
      res.status(500).json({ message: "Failed to fetch movie reviews" });
    }
  });
  
  app.get('/api/movies/top_rated', async (req, res) => {
    try {
      const topRatedMovies = await tmdbService.getTopRated();
      res.json(topRatedMovies);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      res.status(500).json({ message: "Failed to fetch top rated movies" });
    }
  });
  
  app.get('/api/movies/upcoming', async (req, res) => {
    try {
      const upcomingMovies = await tmdbService.getUpcoming();
      res.json(upcomingMovies);
    } catch (error) {
      console.error("Error fetching upcoming movies:", error);
      res.status(500).json({ message: "Failed to fetch upcoming movies" });
    }
  });
  
  app.get('/api/movies/now_playing', async (req, res) => {
    try {
      const nowPlayingMovies = await tmdbService.getNowPlaying();
      res.json(nowPlayingMovies);
    } catch (error) {
      console.error("Error fetching now playing movies:", error);
      res.status(500).json({ message: "Failed to fetch now playing movies" });
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

  // Advanced recommendation routes
  app.get('/api/recommendations/personalized', isAuthenticated, getPersonalizedRecommendations);
  
  app.get('/api/recommendations/similar/:movieId', getSimilarMovies);
  
  app.get('/api/recommendations/trending', getTrendingWithDelay);
  
  app.get('/api/recommendations/preference-based', isAuthenticated, getPreferenceBasedRecommendations);

  // Legacy recommendation route
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Redirect to personalized recommendations
      return getPersonalizedRecommendations(req, res);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
