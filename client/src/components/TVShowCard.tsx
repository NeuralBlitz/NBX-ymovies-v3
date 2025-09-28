import React, { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { TVShow } from "@/types/tvshow";
import { cn } from "@/lib/utils";
import { Play, Plus, Check, Heart, Tv } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

interface TVShowCardProps {
  show: TVShow;
  hideInfo?: boolean;
  className?: string;
}

const TVShowCard = ({ show, hideInfo = false, className }: TVShowCardProps) => {
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

  // Prefer poster to match MovieCard aspect; fallback to backdrop
  const imagePath = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : show.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

  // Check if TV show is in favorites and watchlist
  const isShowFavorite = isFavorite(show.id);
  const isShowInWatchlist = isInWatchlist(show.id);

  // Handle watchlist toggle
  const handleWatchlistToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add shows to your list.",
        variant: "default",
      });
      return;
    }    if (isShowInWatchlist) {
      removeFromWatchlist(show.id);
    } else {
      // Convert TVShow to format compatible with preferences
      const watchlistFormat = {
        ...show,
        title: show.name, // Map name to title for compatibility
      };
      addToWatchlist(watchlistFormat);
    }
  }, [isAuthenticated, isShowInWatchlist, addToWatchlist, removeFromWatchlist, show, toast]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add shows to favorites.",
        variant: "default",
      });
      return;
    }

    if (isShowFavorite) {
      removeFromFavorites(show.id);
    } else {
      // Convert TVShow to format compatible with preferences
      const favoriteFormat = {
        ...show,
        title: show.name, // Map name to title for compatibility
      };
      addToFavorites(favoriteFormat);
    }
  }, [isAuthenticated, isShowFavorite, addToFavorites, removeFromFavorites, show, toast]);
  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Add to watch history if authenticated
    if (isAuthenticated) {
      const historyFormat = {
        ...show,
        title: show.name, // Map name to title for compatibility
      };
      addToWatchHistory(historyFormat);
    }
    
    navigate(`/tv/${show.id}`);
  }, [navigate, show, isAuthenticated, addToWatchHistory]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/tv/${show.id}`);
  }, [navigate, show.id]);

  const displayName = show.original_name || show.name;

  return (
    <div 
      className={cn(
        "movie-card relative group cursor-pointer overflow-visible transition-all duration-300 ease-in-out w-56",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-visible rounded-lg transition-all duration-300 ease-in-out ${isHovered ? 'transform scale-105 shadow-2xl z-30' : 'shadow-lg'} will-change-transform`} style={{ transformOrigin: 'center center' }}>
        {/* TV badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="h-6 w-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 grid place-items-center text-white/90">
            <Tv className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="aspect-[2/3.2] w-full">
          <img 
            src={imagePath}
            alt={displayName}
            className="w-full h-full object-cover rounded-lg transition-all duration-300 ease-in-out"
            loading="lazy"
          />
        </div>

        {!hideInfo && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 flex flex-col justify-end p-3 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="font-bold text-base line-clamp-2 text-white mb-2">{displayName}</h3>
            <div className="flex items-center text-xs space-x-2 mb-2 text-gray-200">
              {show.vote_average > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {Math.round(show.vote_average * 10)}% Match
                </span>
              )}
              <span className="text-gray-300 text-xs">
                {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
              </span>
              {/* TV API doesn't include 'adult' flag consistently; omit for TV shows */}
            </div>
            <p className="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">
              {show.overview || "No description available."}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <button 
                  className="flex items-center space-x-1 bg-white text-black px-3 py-1.5 rounded-md font-semibold transition-colors duration-200 hover:bg-gray-200"
                  onClick={handlePlay}
                  aria-label="Play"
                >
                  <Play className="h-3 w-3" />
                  <span className="text-xs font-medium">Play</span>
                </button>
                <button 
                  className={`p-1.5 rounded-full border transition-colors duration-200 ${isShowInWatchlist ? 'bg-white border-white text-black hover:bg-gray-200' : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 text-white'}`}
                  onClick={handleWatchlistToggle}
                  aria-label={isShowInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {isShowInWatchlist ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </button>
                <button 
                  className={`p-1.5 rounded-full border transition-colors duration-200 ${isShowFavorite ? 'bg-white border-white text-black hover:bg-gray-200' : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 text-white'}`}
                  onClick={handleFavoriteToggle}
                  aria-label={isShowFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-3 w-3 ${isShowFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isHovered && (
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 blur-sm rounded-lg -z-10" />
      )}
    </div>
  );
};

export default TVShowCard;
