import React, { useCallback, useState } from "react";
import { Link, useLocation } from "wouter";
import { TVShow } from "@/types/tvshow";
import { cn } from "@/lib/utils";
import { Play, Plus, Check, Info, Heart } from "lucide-react";
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

  // Use backdrop image for horizontal display
  const imagePath = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}`
    : show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "/placeholder-backdrop.png";

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
  return (
    <div 
      className={cn(
        "group relative aspect-[16/9] overflow-hidden rounded-md bg-secondary/20 transition-all cursor-pointer",
        "hover:ring-2 hover:ring-primary hover:scale-105 hover:z-10",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imagePath}
        alt={show.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      
      {!hideInfo && (
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-3 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* TV Show title and info */}
          <h3 className="font-bold line-clamp-1 text-white transform transition-all duration-300 ease-in-out">{show.name}</h3>
          <div className="flex items-center text-xs space-x-2 mt-1 opacity-90">
            {show.vote_average > 0 && (
              <span className="text-green-500 font-semibold">{Math.round(show.vote_average * 10)}% Match</span>
            )}
            {show.first_air_date && (
              <span className="text-gray-300">
                {new Date(show.first_air_date).getFullYear()}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              {/* Play button */}
              <button 
                className="p-1.5 bg-red-600 text-white rounded-full transform transition-all duration-200 hover:scale-110 hover:bg-red-700 group-hover:animate-pulse" 
                onClick={handlePlay}
                aria-label="View TV show details"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
              
              {/* Add to Watchlist button */}
              <button 
                className={`p-1.5 rounded-full border transition-all duration-200 transform hover:scale-110
                  ${isShowInWatchlist 
                    ? 'bg-white border-white hover:bg-gray-200' 
                    : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700'}`}
                onClick={handleWatchlistToggle}
                aria-label={isShowInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isShowInWatchlist ? (
                  <Check className={`h-4 w-4 ${isShowInWatchlist ? 'text-black' : 'text-white'}`} />
                ) : (
                  <Plus className="text-white h-4 w-4" />
                )}
              </button>
              
              {/* Add to Favorites button */}
              <button 
                className={`p-1.5 rounded-full border transition-all duration-200 transform hover:scale-110
                  ${isShowFavorite 
                    ? 'bg-red-600 border-red-600 hover:bg-red-700' 
                    : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700'}`}
                onClick={handleFavoriteToggle}
                aria-label={isShowFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 ${isShowFavorite ? 'text-white fill-current' : 'text-white'}`} />
              </button>
            </div>
            
            {/* Info button */}
            <button 
              className="p-1.5 rounded-full border border-gray-600 bg-gray-800/80 transform transition-all duration-200 hover:scale-110 hover:bg-gray-700"
              onClick={handlePlay}
              aria-label="More information"
            >
              <Info className="text-white h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TVShowCard;
