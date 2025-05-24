import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import HeroBanner from "@/components/HeroBanner";
import MovieSlider from "@/components/MovieSlider";
import BecauseYouLikedSection from "@/components/BecauseYouLikedSection";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import QuizBasedRecommendations from "@/components/QuizBasedRecommendations";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { Link } from "wouter";
import { mockTrendingMovies, mockPopularMovies } from "@/lib/mockMovies";
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTrendingTVShows, 
  getPopularTVShows, 
  debugApiKeys 
} from "@/lib/tmdb";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { preferences } = useUserPreferences();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  
  // Let's use the environment variable directly
  const USE_DEMO_SERVER = import.meta.env.VITE_USE_DEMO_SERVER === "true";
  
  useEffect(() => {
    console.log("Environment check: Using demo server?", USE_DEMO_SERVER ? "Yes" : "No");
    
    // Debug API keys to help troubleshoot
    debugApiKeys();
    
    // Don't immediately use mock data just because demo server is enabled
    // Let the real API calls attempt to work first
    // The fallback to mock data will happen only if API calls fail
  }, []);
  
  // Fetch trending movies with TMDB API client
  const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError, error: trendingError } = useQuery<Movie[], Error>({
    queryKey: ["trending-movies"],
    queryFn: () => getTrendingMovies(),
    retry: 3,
  });
  
  // Handle trending movies success
  useEffect(() => {
    if (trendingData && trendingData.length > 0) {
      console.log("Trending data received:", trendingData.length, "movies");
      setUsingMockData(false);
      setApiError(null);
    }
  }, [trendingData]);
  
  // Handle trending movies error
  useEffect(() => {
    if (isTrendingError && trendingError) {
      console.error("Error fetching trending movies:", trendingError);
      setUsingMockData(true);
      setApiError(`Failed to load movies from TMDB API: ${trendingError.message}. Using mock data instead.`);
    }
  }, [isTrendingError, trendingError]);

  // Log detailed information about trending data
  useEffect(() => {
    if (trendingData && trendingData.length > 0) {
      console.log("Sample trending movie:", {
        id: trendingData[0].id,
        title: trendingData[0].title,
        posterPath: trendingData[0].poster_path
      });
    }
  }, [trendingData]);
  
  // Combined error handling is already in the query callbacks
  
  // Fetch popular movies with TMDB API client
  const { data: popularData, isLoading: isPopularLoading, isError: isPopularError, error: popularError } = useQuery<Movie[], Error>({
    queryKey: ["popular-movies"],
    queryFn: () => getPopularMovies(),
    retry: 3,
  });
  
  // Fetch trending TV shows with TMDB API client
  const { data: trendingTVData, isLoading: isTrendingTVLoading, isError: isTrendingTVError, error: trendingTVError } = useQuery<TVShow[], Error>({
    queryKey: ["trending-tvshows"],
    queryFn: () => getTrendingTVShows(),
    retry: 3,
  });
  
  // Fetch popular TV shows with TMDB API client
  const { data: popularTVData, isLoading: isPopularTVLoading, isError: isPopularTVError, error: popularTVError } = useQuery<TVShow[], Error>({
    queryKey: ["popular-tvshows"],
    queryFn: () => getPopularTVShows(),
    retry: 3,
  });
  
  // Handle popular movies success
  useEffect(() => {
    if (popularData && popularData.length > 0) {
      console.log("Popular data received:", popularData.length, "movies");
    }
  }, [popularData]);
  
  // Handle popular movies error
  useEffect(() => {
    if (isPopularError && popularError && !usingMockData) {
      console.error("Error fetching popular movies:", popularError);
      setUsingMockData(true);
      setApiError(`Failed to load popular movies from TMDB API: ${popularError.message}. Using mock data instead.`);
    }
  }, [isPopularError, popularError, usingMockData]);
  
  // Handle popular TV shows success
  useEffect(() => {
    if (popularTVData && popularTVData.length > 0) {
      console.log("Popular TV data received:", popularTVData.length, "TV shows");
    }
  }, [popularTVData]);
  
  // Handle trending TV shows success
  useEffect(() => {
    if (trendingTVData && trendingTVData.length > 0) {
      console.log("Trending TV data received:", trendingTVData.length, "TV shows");
    }
  }, [trendingTVData]);
  
  // Handle trending TV shows error
  useEffect(() => {
    if (isTrendingTVError && trendingTVError && !usingMockData) {
      console.error("Error fetching trending TV shows:", trendingTVError);
      // Note: We don't set usingMockData here because we don't have mock TV data yet
    }
  }, [isTrendingTVError, trendingTVError, usingMockData]);
  
  // Handle popular TV shows error
  useEffect(() => {
    if (isPopularTVError && popularTVError && !usingMockData) {
      console.error("Error fetching popular TV shows:", popularTVError);
      // Note: We don't set usingMockData here because we don't have mock TV data yet
    }
  }, [isPopularTVError, popularTVError, usingMockData]);

  // Use either API data or mock data
  const trendingMovies: Movie[] = usingMockData ? mockTrendingMovies : 
    (trendingData || []);
  
  const popularMovies: Movie[] = usingMockData ? mockPopularMovies :
    (popularData || []);
  
  const showQuizPrompt = isAuthenticated && (!preferences || preferences.completed !== true);

  // Determine recent favorites for "Because you liked" sections
  const recentFavorites = preferences?.favoriteMovies?.slice(0, 3) || [];
  
  // Determine recent watch history for personalization
  const recentlyWatched = preferences?.watchHistory?.slice(0, 5) || [];

  // Select a featured movie from trending or popular
  useEffect(() => {
    if (trendingMovies.length > 0) {
      // Select a random movie from the first 5 trending movies for the banner
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingMovies.length));
      setFeaturedMovie(trendingMovies[randomIndex]);
    }
  }, [trendingMovies]);

  return (
    <main className="pb-12 w-full overflow-x-hidden max-w-[100vw]">{/* Adding width control and overflow handling */}
      
      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-500/20 border border-red-300 rounded-lg p-4 mx-4 mt-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {usingMockData ? (
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400">{usingMockData ? "Using Mock Data" : "API Connection Error"}</h3>
              <p className="text-muted-foreground">{apiError}</p>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gray-800 rounded text-sm font-mono overflow-auto">
            <span className="text-gray-400">Check your TMDB API key in .env file:</span>
            <br />
            <code className="text-green-400">VITE_TMDB_API_KEY=your_tmdb_jwt_token_here</code>
          </div>
          
          {usingMockData && (
            <p className="mt-3 text-sm text-yellow-300">
              Showing example movies for demonstration. To see real data from the TMDB API, check your API key configuration.
            </p>
          )}
        </div>
      )}
      
      {/* Featured Movie Banner */}
      {featuredMovie && <HeroBanner movie={featuredMovie} />}
      
      {/* Quiz Prompt */}
      {showQuizPrompt && (
        <div className="bg-secondary/20 border border-border rounded-lg p-4 mx-4 mt-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Get personalized recommendations</h3>
            <p className="text-muted-foreground">Take a quick quiz to help us suggest movies you'll love.</p>
          </div>
          <Button asChild className="mt-3 md:mt-0">
            <Link href="/quiz">Take the Quiz</Link>
          </Button>
        </div>
      )}
      
      {/* Personalized Recommendations (if user is authenticated) */}
      {isAuthenticated && preferences?.completed === true && <PersonalizedRecommendations userId={user?.id} />}
      
      {/* Quiz-based recommendations for new users */}
      {isAuthenticated && preferences?.completed === true && (!preferences?.watchHistory || preferences.watchHistory.length < 5) && <QuizBasedRecommendations />}
      
      {/* "Because You Liked" sections from recent favorites */}
      {isAuthenticated && recentFavorites
        .filter((item): item is Movie => (item as Movie).title !== undefined)
        .map((movie, index) => (
          <BecauseYouLikedSection 
            key={`favorite-${movie.id}`} 
            movieId={movie.id} 
            movieTitle={movie.title || 'this movie'} 
          />
        ))}
      
      {/* My List Section (if the user has a watchlist) */}
      {isAuthenticated && preferences?.watchlist && preferences.watchlist.length > 0 && (
        <MovieSlider 
          title="My List" 
          movies={preferences.watchlist} 
          isLoading={false} 
        />
      )}
      
      {/* Trending Movies Section */}
      {trendingMovies ? (
        <MovieSlider 
          title="Trending Now" 
          movies={trendingMovies} 
          isLoading={isTrendingLoading} 
        />
      ) : isTrendingLoading ? (
        <div className="p-4">Loading trending movies...</div>
      ) : (
        <div className="p-4">No trending movies found</div>
      )}
      
      {/* Popular Movies Section */}
      {popularMovies ? (
        <MovieSlider 
          title="Popular on YMovies" 
          movies={popularMovies}
          isLoading={isPopularLoading} 
        />
      ) : isPopularLoading ? (
        <div className="p-4">Loading popular movies...</div>
      ) : (
        <div className="p-4">No popular movies found</div>
      )}
      
      {/* Trending TV Shows Section */}
      {trendingTVData ? (
        <MovieSlider 
          title="Trending TV Shows" 
          movies={trendingTVData} 
          isLoading={isTrendingTVLoading}
          mediaType="tv"
        />
      ) : isTrendingTVLoading ? (
        <div className="p-4">Loading trending TV shows...</div>
      ) : (
        <div className="p-4">No trending TV shows found</div>
      )}
      
      {/* Popular TV Shows Section */}
      {popularTVData ? (
        <MovieSlider 
          title="Popular TV Shows" 
          movies={popularTVData}
          isLoading={isPopularTVLoading}
          mediaType="tv" 
        />
      ) : isPopularTVLoading ? (
        <div className="p-4">Loading popular TV shows...</div>
      ) : (
        <div className="p-4">No popular TV shows found</div>
      )}
    </main>
  );
};

export default Home;
