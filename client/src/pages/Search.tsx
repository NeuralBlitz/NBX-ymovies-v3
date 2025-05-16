import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Search = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  
  // Parse query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
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
  
  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: [`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}`],
    enabled: debouncedSearchQuery.length > 0,
  });
  
  // Fetch genres for category browsing
  const { data: genres } = useQuery({
    queryKey: ["/api/genres"],
  });
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      window.history.pushState(
        {}, 
        "", 
        `/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setDebouncedSearchQuery(searchQuery.trim());
    }
  };
  
  // Fetch popular movies for initial display
  const { data: popularMovies, isLoading: isPopularLoading } = useQuery({
    queryKey: ["/api/movies/popular"],
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
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-2/4" />
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((movie: any) => (
                <div key={movie.id} className="space-y-2">
                  <MovieCard movie={movie} hideInfo />
                  <h3 className="font-medium text-sm">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movie.release_date).getFullYear()}
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
        </div>
      ) : (
        <>
          {/* Popular Searches */}
          <h2 className="text-xl font-bold mb-4">Popular Movies</h2>
          {isPopularLoading ? (
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
              {popularMovies && popularMovies.slice(0, 12).map((movie: any) => (
                <div key={movie.id} className="space-y-2">
                  <MovieCard movie={movie} hideInfo />
                  <h3 className="font-medium text-sm">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Categories */}
          <h2 className="text-xl font-bold mt-10 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genres && genres.map((genre: any) => (
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
