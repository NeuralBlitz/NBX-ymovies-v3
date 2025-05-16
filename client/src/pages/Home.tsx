import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import HeroBanner from "@/components/HeroBanner";
import MovieSlider from "@/components/MovieSlider";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types/movie";
import { Link } from "wouter";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  
  // Fetch trending movies
  const { data: trendingMovies, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["/api/movies/trending"],
  });
  
  // Fetch popular movies
  const { data: popularMovies, isLoading: isPopularLoading } = useQuery({
    queryKey: ["/api/movies/popular"],
  });
  
  // Fetch personalized recommendations if authenticated
  const { data: recommendations, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
    enabled: isAuthenticated
  });
  
  // Fetch watchlist if authenticated
  const { data: watchlist, isLoading: isWatchlistLoading } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: isAuthenticated
  });
  
  // Select a featured movie from trending or popular
  useEffect(() => {
    if (trendingMovies && trendingMovies.length > 0) {
      // Select a random movie from the first 5 trending movies for the banner
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingMovies.length));
      setFeaturedMovie(trendingMovies[randomIndex]);
    }
  }, [trendingMovies]);

  // Check if user has completed preference quiz
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/preferences"],
    enabled: isAuthenticated,
  });
  
  const showQuizPrompt = isAuthenticated && (!userPreferences || !recommendations);

  return (
    <main className="pt-16 pb-12">
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
      
      {/* Recommended Movies Section */}
      {isAuthenticated && recommendations && recommendations.length > 0 && (
        <MovieSlider 
          title="Recommended For You" 
          movies={recommendations} 
          isLoading={isRecommendationsLoading} 
        />
      )}
      
      {/* Trending Movies Section */}
      <MovieSlider 
        title="Trending Now" 
        movies={trendingMovies} 
        isLoading={isTrendingLoading} 
      />
      
      {/* Popular Movies Section */}
      <MovieSlider 
        title="Popular on StreamFlix" 
        movies={popularMovies}
        isLoading={isPopularLoading} 
      />
      
      {/* My List Section */}
      {isAuthenticated && watchlist && watchlist.length > 0 && (
        <MovieSlider 
          title="My List" 
          movies={watchlist} 
          isLoading={isWatchlistLoading} 
        />
      )}
    </main>
  );
};

export default Home;
