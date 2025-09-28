import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import HorizontalSearchFilters from "@/components/HorizontalSearchFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { 
  searchMovies, 
  searchTVShows, 
  searchMoviesWithFilters,
  searchTVShowsWithFilters,
  getPopularMovies, 
  getPopularTVShows,
  SearchFilters as SearchFiltersType
} from "@/lib/tmdb";

const Search = () => {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({});
  
  console.log("Search component rendering...", { searchQuery, debouncedSearchQuery, searchFilters });
  
  // Parse query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }
    
    // Parse filters from URL
    const filters: SearchFiltersType = {};
    const country = params.get("country");
    const language = params.get("language");
    const year = params.get("year");
    const rating = params.get("rating");
    const sortBy = params.get("sortBy");
    const genre = params.get("genre");
    
    if (country) filters.country = country;
    if (language) filters.language = language;
    if (year) filters.year = parseInt(year);
    if (rating) filters.rating = parseInt(rating);
    if (sortBy) filters.sortBy = sortBy as any;
    if (genre) filters.genre = parseInt(genre);
    
    setSearchFilters(filters);
  }, [location]);
  
  // Debounce search query and filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Function to determine if we should use advanced search
  const hasFilters = Object.values(searchFilters).some(value => value !== undefined);
  const shouldUseAdvancedSearch = debouncedSearchQuery.length > 0 && hasFilters;

  // Fetch movie search results
  const { data: movieSearchResults, isLoading: isMovieLoading, isError: isMovieError } = useQuery({
    queryKey: ['/api/search/movies', debouncedSearchQuery, searchFilters],
    queryFn: () => shouldUseAdvancedSearch 
      ? searchMoviesWithFilters(debouncedSearchQuery, searchFilters)
      : searchMovies(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
    retry: 1,
  });
  
  // Fetch TV show search results
  const { data: tvShowSearchResults, isLoading: isTVLoading, isError: isTVError } = useQuery({
    queryKey: ['/api/search/tv', debouncedSearchQuery, searchFilters],
    queryFn: () => shouldUseAdvancedSearch 
      ? searchTVShowsWithFilters(debouncedSearchQuery, searchFilters)
      : searchTVShows(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
    retry: 1,
  });
  
  // Fetch popular movies for initial display
  const { data: popularMovies, isLoading: isPopularMoviesLoading } = useQuery({
    queryKey: ["/api/movies/popular"],
    queryFn: () => getPopularMovies(),
    enabled: !debouncedSearchQuery,
  });
  
  // Fetch popular TV shows for initial display
  const { data: popularTVShows, isLoading: isPopularTVShowsLoading } = useQuery({
    queryKey: ["/api/tv/popular"],
    queryFn: () => getPopularTVShows(),
    enabled: !debouncedSearchQuery,
  });
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      
      // Add filters to URL
      if (searchFilters.country) params.set('country', searchFilters.country);
      if (searchFilters.language) params.set('language', searchFilters.language);
      if (searchFilters.year) params.set('year', searchFilters.year.toString());
      if (searchFilters.rating) params.set('rating', searchFilters.rating.toString());
      if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy);
      if (searchFilters.genre) params.set('genre', searchFilters.genre.toString());
      
      navigate(`/search?${params.toString()}`);
      setDebouncedSearchQuery(searchQuery.trim());
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setSearchFilters(newFilters);
    
    // If there's a search query, update URL with new filters
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      
      if (newFilters.country) params.set('country', newFilters.country);
      if (newFilters.language) params.set('language', newFilters.language);
      if (newFilters.year) params.set('year', newFilters.year.toString());
      if (newFilters.rating) params.set('rating', newFilters.rating.toString());
      if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
      if (newFilters.genre) params.set('genre', newFilters.genre.toString());
      
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      {/* Search Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search movies, TV shows..."
                className="w-full pl-10 py-2 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </form>
          
          {/* Search Filters - Now inline with search bar */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <HorizontalSearchFilters
              filters={searchFilters}
              onFiltersChange={handleFiltersChange}
              mediaType="both"
            />
          </div>
        </div>
      </div>
      
      {/* Search Results or Popular Content */}
      {debouncedSearchQuery ? (
        <div>
          <h2 className="text-xl font-bold mb-6">
            Results for "{debouncedSearchQuery}"
          </h2>

          {/* Combined Results */}
          <div className="space-y-8">
            {/* Movies Section */}
            {movieSearchResults && movieSearchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Movies</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieSearchResults.slice(0, 6).map((movie: Movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
            
            {/* TV Shows Section */}
            {tvShowSearchResults && tvShowSearchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">TV Shows</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {tvShowSearchResults.slice(0, 6).map((show: TVShow) => (
                    <MovieCard 
                      key={show.id} 
                      movie={{...show, title: show.name} as any} 
                      mediaType="tv" 
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {(isMovieLoading || isTVLoading) && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <LoadingSkeleton key={i} variant="movie-card" />
                ))}
              </div>
            )}
            
            {/* No Results */}
            {(!movieSearchResults || movieSearchResults.length === 0) && 
             (!tvShowSearchResults || tvShowSearchResults.length === 0) && 
             !isMovieLoading && !isTVLoading && (
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Movies</h2>
            {isPopularMoviesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <LoadingSkeleton key={i} variant="movie-card" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularMovies && popularMovies.slice(0, 12).map((movie: Movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular TV Shows</h2>
            {isPopularTVShowsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <LoadingSkeleton key={i} variant="movie-card" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularTVShows && popularTVShows.slice(0, 12).map((show: TVShow) => (
                  <MovieCard 
                    key={show.id} 
                    movie={{...show, title: show.name} as any} 
                    mediaType="tv" 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
