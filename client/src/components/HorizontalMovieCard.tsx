import React, { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { Movie } from "@/types/movie";
import { cn } from "@/lib/utils";
import { Play, Plus, Check, Info, Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

interface HorizontalMovieCardProps {
  movie: Movie;
  className?: string;
  hideInfo?: boolean;
}

const HorizontalMovieCard: React.FC<HorizontalMovieCardProps> = ({ movie, className, hideInfo = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { 
    isFavorite, 
    isInWatchlist, 
    addToFavorites, 
    removeFromFavorites, 
    addToWatchlist, 
    removeFromWatchlist,
    addToWatchHistory
  } = useUserPreferences();
  
  // Use backdrop image for horizontal cards
  const backdropPath = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
    : movie.poster_path 
      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
      : "https://via.placeholder.com/500x281?text=No+Image";
  
  // Flag to check if the movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);
  
  // Flag to check if the movie is in watchlist
  const isMovieInWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Movie Watchlist button clicked:', movie.title, movie.id);
    
    if (!isAuthenticated) {
      console.log('User not authenticated for watchlist');
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your watchlist.",
        variant: "destructive",
      });
      return;
    }

    if (isMovieInWatchlist) {
      removeFromWatchlist(movie.id);
      console.log('Removed from watchlist:', movie.title);
      toast({
        title: "Removed from watchlist",
        description: `${movie.title} has been removed from your watchlist.`,
      });
    } else {      addToWatchlist(movie);
      console.log('Added to watchlist:', movie.title);
      toast({
        title: "Added to watchlist",
        description: `${movie.title} has been added to your watchlist.`,
      });
    }
  }, [movie, isMovieInWatchlist, isAuthenticated, addToWatchlist, removeFromWatchlist, toast]);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Movie Favorite button clicked:', movie.title, movie.id);
    
    if (!isAuthenticated) {
      console.log('User not authenticated for favorites');
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isMovieFavorite) {
      removeFromFavorites(movie.id);
      console.log('Removed from favorites:', movie.title);
      toast({
        title: "Removed from favorites",
        description: `${movie.title} has been removed from your favorites.`,
      });
    } else {      addToFavorites(movie);
      console.log('Added to favorites:', movie.title);
      toast({
        title: "Added to favorites",
        description: `${movie.title} has been added to your favorites.`,
      });
    }
  }, [movie, isMovieFavorite, isAuthenticated, addToFavorites, removeFromFavorites, toast]);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Play button clicked for movie:', movie.title, movie.id);    // Add to watch history
    addToWatchHistory(movie);
    
    // Navigate to movie details page
    navigate(`/movie/${movie.id}`);
  }, [movie, navigate, addToWatchHistory]);

  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Info button clicked for movie:', movie.title, movie.id);
    navigate(`/movie/${movie.id}`);
  }, [movie.id, navigate]);

  const handleCardClick = useCallback(() => {
    console.log('Movie card clicked:', movie.title, movie.id);
    navigate(`/movie/${movie.id}`);
  }, [movie.id, navigate]);

  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-card/50 rounded-lg overflow-visible border border-border/50 hover:border-border hover:z-30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="flex">
        {/* Movie Image */}
  <div className="relative w-32 h-20 flex-shrink-0 overflow-visible">
          <img
            src={backdropPath}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/500x281?text=No+Image";
            }}
          />
          
          {/* Play button overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={handlePlayClick}
              className="bg-white/90 hover:bg-white text-black rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label={`Play ${movie.title}`}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
        
        {/* Movie Info */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </p>
            </div>
            
            {/* Action buttons */}
            {!hideInfo && (
              <div className={cn(
                "flex items-center space-x-1 transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                {/* Watchlist button */}                <button
                  onClick={handleWatchlistToggle}
                  className={cn(
                    "p-1.5 rounded-full transition-all duration-200 hover:scale-110",
                    isMovieInWatchlist 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-zinc-700 hover:bg-zinc-600 text-white"
                  )}
                  aria-label={isMovieInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
                >
                  {isMovieInWatchlist ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </button>
                
                {/* Favorite button */}
                <button
                  onClick={handleFavoriteToggle}
                  className={cn(
                    "p-1.5 rounded-full transition-all duration-200 hover:scale-110",
                    isMovieFavorite 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-zinc-700 hover:bg-zinc-600 text-white"
                  )}
                  aria-label={isMovieFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                >
                  <Heart className={cn("w-3 h-3", isMovieFavorite && "fill-current")} />
                </button>
                
                {/* Info button */}
                <button
                  onClick={handleInfoClick}
                  className="p-1.5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-all duration-200 hover:scale-110"
                  aria-label={`More info about ${movie.title}`}
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Movie Overview */}
          {!hideInfo && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {movie.overview || "No description available."}
            </p>
          )}
          
          {/* Rating */}
          {movie.vote_average > 0 && (
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorizontalMovieCard;
