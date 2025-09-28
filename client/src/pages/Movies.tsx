import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeroBanner from "@/components/HeroBanner";
import MovieList from "@/components/MovieList";
import { Movie } from "@/types/movie";
import { 
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMoviesByGenre
} from "@/lib/tmdb";

const Movies = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Fetch trending movies
  const { data: trendingMovies, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/trending/movie'],
    queryFn: () => getTrendingMovies(),
  });

  // Fetch popular movies  
  const { data: popularMovies, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['/api/movie/popular'],
    queryFn: () => getPopularMovies(),
  });

  // Fetch top rated movies
  const { data: topRatedMovies, isLoading: isLoadingTopRated } = useQuery({
    queryKey: ['/api/movie/top-rated'],
    queryFn: () => getTopRatedMovies(),
  });

  // Fetch movies by genres
  const { data: actionMovies } = useQuery({
    queryKey: ['/api/movie/genre/28'],
    queryFn: () => getMoviesByGenre(28), // Action genre ID
  });

  const { data: dramaMovies } = useQuery({
    queryKey: ['/api/movie/genre/18'],
    queryFn: () => getMoviesByGenre(18), // Drama genre ID
  });

  const { data: comedyMovies } = useQuery({
    queryKey: ['/api/movie/genre/35'],
    queryFn: () => getMoviesByGenre(35), // Comedy genre ID
  });

  // Select a random featured movie for the hero banner
  useEffect(() => {
    if (trendingMovies && trendingMovies.length > 0) {
      // Pick a random movie from the top 5 trending movies
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingMovies.length));
      setFeaturedMovie(trendingMovies[randomIndex]);
    }
  }, [trendingMovies]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Get the active movies based on selected tab
  const getActiveMovies = () => {
    switch (activeTab) {
      case "trending":
        return trendingMovies || [];
      case "popular":
        return popularMovies || [];
      case "top-rated":
        return topRatedMovies || [];
      default:
        return trendingMovies || [];
    }
  };

  // Loading skeleton
  if (isLoadingTrending && isLoadingPopular && isLoadingTopRated) {
    return (
      <div>
        <LoadingSkeleton variant="hero-banner" />
        <div className="pt-8 container mx-auto px-4 mt-8 space-y-8">
          <div>
            <LoadingSkeleton variant="slider-title" />
            <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide">
              {Array(6)
                .fill("")
                .map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <LoadingSkeleton variant="movie-card" />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <LoadingSkeleton variant="slider-title" />
            <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide">
              {Array(6)
                .fill("")
                .map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <LoadingSkeleton variant="movie-card" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner with featured movie - positioned directly under navbar */}
      {featuredMovie && (
        <HeroBanner
          content={{
            id: featuredMovie.id,
            title: featuredMovie.title,
            overview: featuredMovie.overview,
            backdrop_path: featuredMovie.backdrop_path,
            poster_path: featuredMovie.poster_path,
            release_date: featuredMovie.release_date,
            vote_average: featuredMovie.vote_average,
            vote_count: featuredMovie.vote_count,
            genre_ids: featuredMovie.genre_ids,
            adult: featuredMovie.adult,
            original_language: featuredMovie.original_language,
            original_title: featuredMovie.original_title,
            popularity: featuredMovie.popularity,
            video: featuredMovie.video
          }}
        />
      )}

      {/* Movie Categories - with top padding */}
      <div className="pt-8 container mx-auto px-4 py-8">
        <Tabs defaultValue="trending" className="mb-8" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" className="text-sm" asChild>
              <a href="/search?type=movie">Browse All Movies</a>
            </Button>
          </div>          <TabsContent value="trending" className="mt-0">
            <MovieList 
              title=""
              movies={trendingMovies || []}
              defaultLayout="grid"
            />
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <MovieList 
              title=""
              movies={popularMovies || []}
              defaultLayout="grid"
            />
          </TabsContent>
          
          <TabsContent value="top-rated" className="mt-0">
            <MovieList 
              title=""
              movies={topRatedMovies || []}
              defaultLayout="grid"
            />
          </TabsContent>
        </Tabs>        {/* Genre Based Movie Sections */}
        {actionMovies && actionMovies.length > 0 && (
          <MovieList 
            title="Action Movies"
            movies={actionMovies}
            className="mb-10"
            defaultLayout="grid"
          />
        )}
        
        {dramaMovies && dramaMovies.length > 0 && (
          <MovieList 
            title="Drama Movies"
            movies={dramaMovies}
            className="mb-10"
            defaultLayout="grid"
          />
        )}
        
        {comedyMovies && comedyMovies.length > 0 && (
          <MovieList 
            title="Comedy Movies"
            movies={comedyMovies}
            className="mb-10"
            defaultLayout="grid"
          />
        )}
      </div>
    </div>
  );
};

export default Movies;
