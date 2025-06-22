import React, { useCallback, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Plus, Check, Info, Film, Heart } from "lucide-react";

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
  const { 
    isFavorite, 
    isInWatchlist, 
    addToFavorites, 
    removeFromFavorites, 
    addToWatchlist, 
    removeFromWatchlist,
    addToWatchHistory
  } = useUserPreferences();
  
  // Get the base URL for poster images
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  // Flag to check if the movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);
  
  // Flag to check if the movie is in watchlist
  const isMovieInWatchlist = isInWatchlist(movie.id);

  // Log state for debugging (only on mount to avoid spam)
  useEffect(() => {
    console.log(`🎬 MovieCard mounted for ${movie.title} (${movie.id}):`, {
      isMovieFavorite,
      isMovieInWatchlist,
      isAuthenticated
    });
  }, []); // Empty dependency array means this runs only on mount

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

    if (isMovieInWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  }, [isAuthenticated, isMovieInWatchlist, addToWatchlist, removeFromWatchlist, movie, toast]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log(`💖 Favorite toggle clicked for ${movie.title} (${movie.id}), current state:`, isMovieFavorite);
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add movies to favorites.",
        variant: "default",
      });
      return;
    }

    if (isMovieFavorite) {
      console.log(`🗑️ Removing ${movie.title} from favorites`);
      removeFromFavorites(movie.id);
    } else {
      console.log(`💖 Adding ${movie.title} to favorites`);
      addToFavorites(movie);
    }
  }, [isAuthenticated, isMovieFavorite, addToFavorites, removeFromFavorites, movie, toast]);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add to watch history if authenticated
    if (isAuthenticated) {
      addToWatchHistory(movie);
    }
    
    if (isTV) {
      navigate(`/tv/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  }, [navigate, movie, isTV, isAuthenticated, addToWatchHistory]);

  return (
    <div 
      className="movie-card relative group cursor-pointer overflow-visible transition-all duration-300 ease-in-out w-56"
      onClick={() => isTV ? navigate(`/tv/${movie.id}`) : navigate(`/movie/${movie.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster Container - Now taller to fill space previously used by title/date */}
      <div className={`relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out ${isHovered ? 'transform scale-105 shadow-2xl z-20' : 'shadow-lg'}`}>
        {/* Movie Poster */}
        <div className="aspect-[2/3.2] w-full">
          <img 
            src={posterUrl} 
            alt={`${movie.title} poster`} 
            className="w-full h-full object-cover rounded-lg transition-all duration-300 ease-in-out"
            loading="lazy"
          />
        </div>
        
        {/* Hover overlay with movie details (only shown when not hideInfo) */}
        {!hideInfo && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 flex flex-col justify-end p-3 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Movie title */}
          <h3 className="font-bold text-base line-clamp-2 text-white mb-2">{movie.title}</h3>
          
          {/* Movie details row */}
          <div className="flex items-center text-xs space-x-2 mb-2 text-gray-200">
            {movie.vote_average > 0 && (
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                {Math.round(movie.vote_average * 10)}% Match
              </span>
            )}
            <span className="text-gray-300 text-xs">
              {isTV 
                ? 'first_air_date' in movie && movie.first_air_date 
                  ? new Date(movie.first_air_date).getFullYear() 
                  : 'N/A'
                : 'release_date' in movie && movie.release_date 
                  ? new Date(movie.release_date).getFullYear() 
                  : 'N/A'
              }
            </span>
            {'adult' in movie && movie.adult && (
              <span className="border border-gray-400 px-1 py-0.5 text-xs rounded">18+</span>
            )}
          </div>
          
          {/* Movie overview */}
          <p className="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">
            {movie.overview || "No description available."}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {/* Play button */}
              <button 
                className="flex items-center space-x-1 bg-white text-black px-3 py-1.5 rounded-md font-semibold transform transition-all duration-200 hover:scale-105 hover:bg-gray-200" 
                onClick={handlePlay}
                aria-label="Play movie"
              >
                <Play className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">Play</span>
              </button>
              
              {/* Watchlist button */}
              <button 
                className={`p-1.5 rounded-full border transition-all duration-200 transform hover:scale-110
                  ${isMovieInWatchlist 
                    ? 'bg-white border-white hover:bg-gray-200 text-black' 
                    : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 text-white'}`}
                onClick={handleWatchlistToggle}
                aria-label={isMovieInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isMovieInWatchlist ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </button>
              
              {/* Favorites button */}
              <button 
                className={`p-1.5 rounded-full border transition-all duration-200 transform hover:scale-110
                  ${isMovieFavorite 
                    ? 'bg-white border-white hover:bg-gray-200 text-black' 
                    : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 text-white'}`}
                onClick={handleFavoriteToggle}
                aria-label={isMovieFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-3 w-3 ${isMovieFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Info button */}
            <button 
              className="p-1.5 rounded-full border border-gray-600 bg-gray-800/80 transform transition-all duration-200 hover:scale-110 hover:bg-gray-700 text-white"
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
              <Info className="h-3 w-3" />
            </button>
          </div>
        </div>
        )}
        
        {/* Rating badge in top right */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ⭐ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      
      {/* Hover glow effect */}
      {isHovered && (
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 blur-sm rounded-lg -z-10" />
      )}
    </div>
  );
};

export default MovieCard;
