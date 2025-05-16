import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, Check, ThumbsUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";

const MovieDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch movie details
  const { data: movie, isLoading: isMovieLoading } = useQuery({
    queryKey: [`/api/movies/${id}`],
  });
  
  // Fetch similar movies
  const { data: similarMovies, isLoading: isSimilarMoviesLoading } = useQuery({
    queryKey: [`/api/movies/${id}/similar`],
  });
  
  // Check if movie is in watchlist
  const { data: watchlistStatus } = useQuery({
    queryKey: [`/api/watchlist/check/${id}`],
    enabled: isAuthenticated,
  });
  
  // Update movie watch progress
  const updateProgress = useMutation({
    mutationFn: async (progress: number) => {
      return apiRequest("POST", "/api/history", { movieId: id, progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });
  
  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/watchlist", { movieId: id });
    },
    onSuccess: () => {
      toast({
        title: "Added to My List",
        description: `"${movie.title}" has been added to your list.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from My List",
        description: `"${movie.title}" has been removed from your list.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });
  
  // Get backdrop URL
  const backdropUrl = useMemo(() => {
    if (movie?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    }
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=600&q=80';
  }, [movie]);
  
  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add movies to your list.",
        variant: "default",
      });
      return;
    }
    
    if (watchlistStatus?.isInWatchlist) {
      removeFromWatchlist.mutate();
    } else {
      addToWatchlist.mutate();
    }
  };
  
  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Start watching function
  const startWatching = () => {
    // Update progress to 0% when starting to watch
    if (isAuthenticated) {
      updateProgress.mutate(0);
    }
    
    // Simulate full screen video playback
    const fullscreenElement = document.createElement('div');
    fullscreenElement.style.position = 'fixed';
    fullscreenElement.style.top = '0';
    fullscreenElement.style.left = '0';
    fullscreenElement.style.width = '100%';
    fullscreenElement.style.height = '100%';
    fullscreenElement.style.backgroundColor = 'black';
    fullscreenElement.style.color = 'white';
    fullscreenElement.style.display = 'flex';
    fullscreenElement.style.alignItems = 'center';
    fullscreenElement.style.justifyContent = 'center';
    fullscreenElement.style.zIndex = '9999';
    fullscreenElement.style.flexDirection = 'column';
    fullscreenElement.innerHTML = `
      <h2 style="font-size: 24px; margin-bottom: 16px;">Now Playing: ${movie.title}</h2>
      <p style="font-size: 16px; margin-bottom: 16px;">This is a simulation. Actual video would play here.</p>
      <button id="exit-fullscreen" style="padding: 8px 16px; background-color: #E50914; border: none; border-radius: 4px; cursor: pointer;">
        Exit
      </button>
    `;
    
    document.body.appendChild(fullscreenElement);
    
    // Add event listener to exit button
    const exitButton = document.getElementById('exit-fullscreen');
    if (exitButton) {
      exitButton.addEventListener('click', () => {
        document.body.removeChild(fullscreenElement);
        
        // Update progress to a random value between 50% and 100%
        if (isAuthenticated) {
          const randomProgress = Math.floor(Math.random() * 51) + 50; // 50-100
          updateProgress.mutate(randomProgress);
        }
      });
    }
  };
  
  // Update page title on movie load
  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} - StreamFlix`;
    }
    
    return () => {
      document.title = "StreamFlix - Movie Recommendations";
    };
  }, [movie]);

  if (isMovieLoading) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4">
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-md" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
        <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Movie Header with Backdrop */}
      <div className="relative">
        <div 
          className="h-80 bg-cover bg-center"
          style={{ backgroundImage: `url('${backdropUrl}')` }}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 z-10"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 movie-info-gradient">
          <div className="container mx-auto flex items-center space-x-4">
            <Button className="bg-white text-black hover:bg-gray-200" onClick={startWatching}>
              <Play className="mr-2 h-5 w-5" />
              Play
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleWatchlistToggle}
              disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
            >
              {watchlistStatus?.isInWatchlist ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
            
            <Button variant="outline" size="icon">
              <ThumbsUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Movie Details */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-500 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
              <span>{new Date(movie.release_date).getFullYear()}</span>
              {movie.adult ? (
                <span className="border border-gray-500 px-1 text-xs">R</span>
              ) : (
                <span className="border border-gray-500 px-1 text-xs">PG-13</span>
              )}
              {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
              <span className="border border-gray-500 px-1 text-xs">HD</span>
            </div>
            
            <p className="mb-6">{movie.overview}</p>
            
            {movie.credits && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Cast</h3>
                <p className="text-muted-foreground">
                  {movie.credits.cast
                    .slice(0, 6)
                    .map((person: any) => person.name)
                    .join(", ")}
                </p>
              </div>
            )}
            
            {movie.credits && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Director</h3>
                <p className="text-muted-foreground">
                  {movie.credits.crew
                    .filter((person: any) => person.job === "Director")
                    .map((person: any) => person.name)
                    .join(", ") || "Unknown"}
                </p>
              </div>
            )}
          </div>
          
          <div className="md:w-1/3">
            {movie.genres && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Genres</h3>
                <p className="text-muted-foreground">
                  {movie.genres.map((genre: any) => genre.name).join(", ")}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-bold mb-2">This movie is...</h3>
              <p className="text-muted-foreground">
                {movie.vote_average > 7.5
                  ? "Highly Rated, "
                  : movie.vote_average > 6
                  ? "Well Received, "
                  : ""}
                {movie.genres &&
                  movie.genres
                    .slice(0, 2)
                    .map((genre: any) => 
                      genre.name === "Action" 
                        ? "Exciting" 
                        : genre.name === "Horror" 
                        ? "Scary" 
                        : genre.name === "Comedy" 
                        ? "Funny" 
                        : genre.name === "Drama" 
                        ? "Emotional" 
                        : genre.name === "Science Fiction" 
                        ? "Futuristic" 
                        : genre.name
                    )
                    .join(", ")}
              </p>
            </div>
          </div>
        </div>
        
        {/* Similar Movies */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-6">More Like This</h3>
          
          {isSimilarMoviesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-md" />
              ))}
            </div>
          ) : similarMovies && similarMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarMovies.slice(0, 8).map((movie: any) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No similar movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
