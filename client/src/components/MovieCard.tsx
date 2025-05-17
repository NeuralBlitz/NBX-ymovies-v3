import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Plus, Check, Info, Film, Tv } from "lucide-react";

interface MovieCardProps {
  movie: Movie | (TVShow & { title: string });
  hideInfo?: boolean;
  mediaType?: 'movie' | 'tv';
}

const MovieCard = ({ movie, hideInfo = false, mediaType }: MovieCardProps) => {
  // Determine if this is a TV show based on presence of 'name' property or mediaType prop
  const isTV = 'name' in movie || mediaType === 'tv';
  const [isHovered, setIsHovered] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get the base URL for poster images
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  // Check if movie is in watchlist
  const { data: watchlistStatus } = useQuery<{isInWatchlist: boolean}>({
    queryKey: [`/api/watchlist/check/${movie.id}`],
    enabled: isAuthenticated,
  });

  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/watchlist", { movieId: movie.id });
    },
    onSuccess: () => {
      toast({
        title: "Added to My List",
        description: `"${movie.title}" has been added to your list.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${movie.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add movie to your list. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add to watchlist:", error);
    }
  });

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/watchlist/${movie.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from My List",
        description: `"${movie.title}" has been removed from your list.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${movie.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove movie from your list. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to remove from watchlist:", error);
    }
  });

  const handleWatchlistToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
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
  }, [isAuthenticated, watchlistStatus?.isInWatchlist, addToWatchlist, removeFromWatchlist, toast]);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTV) {
      navigate(`/tv/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  }, [navigate, movie.id, isTV]);

  return (
    <div 
      className="movie-card flex-shrink-0 w-48 sm:w-56 md:w-64 relative group cursor-pointer overflow-hidden"
      onClick={() => isTV ? navigate(`/tv/${movie.id}`) : navigate(`/movie/${movie.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-md transition-all duration-300 ease-in-out ${isHovered ? 'transform scale-105 shadow-xl z-10' : 'shadow-md'}`}>
        {/* Show TV badge for TV shows */}
        {isTV && (
          <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded z-10 flex items-center gap-1">
            <Tv className="h-3 w-3" />
            <span>TV</span>
          </div>
        )}
        <img 
          src={posterUrl} 
          alt={`${movie.title} poster`} 
          className="w-full h-auto rounded-md transition-all duration-300 ease-in-out"
          loading="lazy"
        />
        
        {!hideInfo && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-3 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="font-bold line-clamp-1 text-white transform transition-all duration-300 ease-in-out">{movie.title}</h3>
            <div className="flex items-center text-xs space-x-2 mt-1 opacity-90">
              {movie.vote_average > 0 && (
                <span className="text-green-500 font-semibold">{Math.round(movie.vote_average * 10)}% Match</span>
              )}
              <span>
                {isTV 
                  ? 'first_air_date' in movie && movie.first_air_date 
                    ? new Date(movie.first_air_date).getFullYear() 
                    : 'N/A'
                  : 'release_date' in movie && movie.release_date 
                    ? new Date(movie.release_date).getFullYear() 
                    : 'N/A'
                }
              </span>
              {'adult' in movie && movie.adult && <span className="border border-gray-500 px-1">18+</span>}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button 
                  className="p-1.5 bg-white rounded-full transform transition-all duration-200 hover:scale-110 hover:bg-red-600 hover:text-white group-hover:animate-pulse" 
                  onClick={handlePlay}
                  aria-label="Play trailer"
                >
                  <Play className="h-4 w-4" />
                </button>
                
                {isAuthenticated && (
                  <button 
                    className={`p-1.5 rounded-full border transition-all duration-200 transform hover:scale-110
                      ${watchlistStatus?.isInWatchlist 
                        ? 'bg-white border-white hover:bg-gray-200' 
                        : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700'}`}
                    onClick={handleWatchlistToggle}
                    disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
                    aria-label={watchlistStatus?.isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {watchlistStatus?.isInWatchlist ? (
                      <Check className={`h-4 w-4 ${watchlistStatus?.isInWatchlist ? 'text-black' : 'text-white'}`} />
                    ) : (
                      <Plus className="text-white h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              <button 
                className="p-1.5 rounded-full border border-gray-600 bg-gray-800/80 transform transition-all duration-200 hover:scale-110 hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTV) {
                    navigate(`/tv/${movie.id}`);
                  } else {
                    navigate(`/movie/${movie.id}`);
                  }
                }}
                aria-label="More information"
              >
                <Info className="text-white h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isHovered && !hideInfo && (
        <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-t from-red-600 to-transparent opacity-75 blur-sm rounded-b-lg animate-pulse" />
      )}
    </div>
  );
};

export default MovieCard;
