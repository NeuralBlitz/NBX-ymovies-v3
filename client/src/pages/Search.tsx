import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon, ArrowLeft, Film, Tv } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { searchMovies, searchTVShows, searchMulti, MediaItem, getPopularMovies, getPopularTVShows, getGenres } from "@/lib/tmdb";

const Search = () => {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Parse query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }
    
    const tab = params.get("tab");
    if (tab && ["all", "movies", "tv"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);
  
  // Debounce search query
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    setDebounceTimeout(timeout);
    
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [searchQuery]);
  
  // Change tab handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(location.split("?")[1]);
    params.set("tab", value);
    navigate(`/search?${params.toString()}`);
  };
  
  // Fetch all search results (movies and TV shows)
  const { data: multiSearchResults, isLoading: isMultiLoading, isError: isMultiError } = useQuery<MediaItem[]>({
    queryKey: ['/api/search/multi', debouncedSearchQuery],
    queryFn: () => searchMulti(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0 && activeTab === "all",
    retry: 1,
    staleTime: 60000, // Cache results for 1 minute
  });
  
  // Fetch movie search results
  const { data: movieSearchResults, isLoading: isMovieLoading, isError: isMovieError } = useQuery<Movie[]>({
    queryKey: ['/api/search/movies', debouncedSearchQuery],
    queryFn: () => searchMovies(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0 && activeTab === "movies",
    retry: 1,
    staleTime: 60000, // Cache results for 1 minute
  });
  
  // Fetch TV show search results
  const { data: tvShowSearchResults, isLoading: isTVLoading, isError: isTVError } = useQuery<TVShow[]>({
    queryKey: ['/api/search/tv', debouncedSearchQuery],
    queryFn: () => searchTVShows(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0 && activeTab === "tv",
    retry: 1,
    staleTime: 60000, // Cache results for 1 minute
  });
  
  // Fetch genres for category browsing
  const { data: genres } = useQuery<Array<{id: number; name: string}>>({
    queryKey: ["/api/genres"],
    queryFn: () => getGenres(),
  });
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setDebouncedSearchQuery(searchQuery.trim());
    }
  };
  
  // Fetch popular movies for initial display
  const { data: popularMovies, isLoading: isPopularMoviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies/popular"],
    queryFn: () => getPopularMovies(),
    enabled: !debouncedSearchQuery,
  });
  
  // Fetch popular TV shows for initial display
  const { data: popularTVShows, isLoading: isPopularTVShowsLoading } = useQuery<TVShow[]>({
    queryKey: ["/api/tv/popular"],
    queryFn: () => getPopularTVShows(),
    enabled: !debouncedSearchQuery,
  });

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      {/* Search Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 md:hidden"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for movies, genres, actors..."
              className="w-full pl-10 py-2 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      {debouncedSearchQuery ? (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Results for "{debouncedSearchQuery}"
          </h2>
          
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
              </TabsTrigger>
              <TabsTrigger value="movies" className="flex items-center gap-2">
                <Film className="h-4 w-4" /> Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" /> TV Shows
              </TabsTrigger>
            </TabsList>

            {/* All Results Tab */}
            <TabsContent value="all">
              {isMultiLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-2/4" />
                    </div>
                  ))}
                </div>
              ) : isMultiError ? (
                <div className="text-center py-10 bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Search Error</h3>
                  <p className="text-white/70 mb-4">
                    There was an error searching for "{debouncedSearchQuery}". Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="bg-red-900/50 border-red-700 hover:bg-red-800"
                  >
                    Try Again
                  </Button>
                </div>
              ) : multiSearchResults && multiSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {multiSearchResults.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <MovieCard 
                        movie={{
                          ...item,
                          title: item.media_type === 'tv' ? (item as TVShow).name : (item as Movie).title
                        } as any} 
                        hideInfo 
                      />
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        {item.media_type === 'tv' ? (
                          <>
                            <Tv className="h-3 w-3 text-red-400" /> 
                            {(item as TVShow).name}
                          </>
                        ) : (
                          <>
                            <Film className="h-3 w-3 text-amber-400" /> 
                            {(item as Movie).title}
                          </>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.media_type === 'tv' 
                          ? ((item as TVShow).first_air_date ? new Date((item as TVShow).first_air_date).getFullYear() : 'N/A')
                          : ((item as Movie).release_date ? new Date((item as Movie).release_date).getFullYear() : 'N/A')
                        }
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse categories below
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Movies Tab */}
            <TabsContent value="movies">
              {isMovieLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-2/4" />
                    </div>
                  ))}
                </div>
              ) : isMovieError ? (
                <div className="text-center py-10 bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Search Error</h3>
                  <p className="text-white/70 mb-4">
                    There was an error searching for movies with "{debouncedSearchQuery}". Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="bg-red-900/50 border-red-700 hover:bg-red-800"
                  >
                    Try Again
                  </Button>
                </div>
              ) : movieSearchResults && movieSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieSearchResults.map((movie) => (
                    <div key={movie.id} className="space-y-2">
                      <MovieCard movie={movie} hideInfo />
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Film className="h-3 w-3 text-amber-400" /> {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-semibold mb-2">No movie results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse categories below
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* TV Shows Tab */}
            <TabsContent value="tv">
              {isTVLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-2/4" />
                    </div>
                  ))}
                </div>
              ) : isTVError ? (
                <div className="text-center py-10 bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Search Error</h3>
                  <p className="text-white/70 mb-4">
                    There was an error searching for TV shows with "{debouncedSearchQuery}". Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="bg-red-900/50 border-red-700 hover:bg-red-800"
                  >
                    Try Again
                  </Button>
                </div>
              ) : tvShowSearchResults && tvShowSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {tvShowSearchResults.map((show) => (
                    <div key={show.id} className="space-y-2">
                      <MovieCard movie={{...show, title: show.name} as any} hideInfo mediaType="tv" />
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Tv className="h-3 w-3 text-red-400" /> {show.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-semibold mb-2">No TV show results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse categories below
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <>
          <Tabs defaultValue="movies" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="movies" className="flex items-center gap-2">
                <Film className="h-4 w-4" /> Popular Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" /> Popular TV Shows
              </TabsTrigger>
            </TabsList>
            
            {/* Popular Movies Tab */}
            <TabsContent value="movies">
              <h2 className="text-xl font-bold mb-4">Popular Movies</h2>
              {isPopularMoviesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-2/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {popularMovies && popularMovies.slice(0, 12).map((movie) => (
                    <div key={movie.id} className="space-y-2">
                      <MovieCard movie={movie} hideInfo />
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Film className="h-3 w-3 text-amber-400" /> {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Popular TV Shows Tab */}
            <TabsContent value="tv">
              <h2 className="text-xl font-bold mb-4">Popular TV Shows</h2>
              {isPopularTVShowsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-2/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {popularTVShows && popularTVShows.slice(0, 12).map((show) => (
                    <div key={show.id} className="space-y-2">
                      <MovieCard movie={{...show, title: show.name} as any} hideInfo mediaType="tv" />
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Tv className="h-3 w-3 text-red-400" /> {show.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Categories */}
          <h2 className="text-xl font-bold mt-10 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genres && genres.map((genre) => (
              <Card 
                key={genre.id} 
                className="bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors"
                onClick={() => setSearchQuery(genre.name)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium">{genre.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
