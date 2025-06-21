import React, { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { TVShow } from "@/types/tvshow";
import { cn } from "@/lib/utils";
import { Play, Plus, Check, Info, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

interface HorizontalTVShowCardProps {
  show: TVShow;
  className?: string;
  hideInfo?: boolean;
}

const HorizontalTVShowCard: React.FC<HorizontalTVShowCardProps> = ({ show, className, hideInfo = false }) => {
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
  const backdropPath = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}`
    : show.poster_path 
      ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
      : "/placeholder-backdrop.png";
  
  // Flag to check if the show is in favorites
  const isShowFavorite = isFavorite(show.id);
  
  // Flag to check if the show is in watchlist
  const isShowInWatchlist = isInWatchlist(show.id);  const handleWatchlistToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('📺 TV Show Watchlist button clicked:', show.name, show.id);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated for watchlist');
      toast({
        title: "Login Required",
        description: "Please log in to add shows to your list.",
        variant: "default",
      });
      return;
    }

    if (isShowInWatchlist) {
      console.log('🗑️ Removing from watchlist:', show.id);
      removeFromWatchlist(show.id);
    } else {
      console.log('➕ Adding to watchlist:', show.id);
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
    
    console.log('📺 TV Show Favorite button clicked:', show.name, show.id);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated for favorites');
      toast({
        title: "Login Required",
        description: "Please log in to add shows to favorites.",
        variant: "default",
      });
      return;
    }

    if (isShowFavorite) {
      console.log('💔 Removing from favorites:', show.id);
      removeFromFavorites(show.id);
    } else {
      console.log('💖 Adding to favorites:', show.id);
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
    
    // Add to watch history if authenticated
    if (isAuthenticated) {
      const historyFormat = {
        ...show,
        title: show.name, // Map name to title for compatibility
      };
      addToWatchHistory(historyFormat);
    }
    
    navigate(`/tv/${show.id}`);
  }, [navigate, show, isAuthenticated, addToWatchHistory]);  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if the click was on a button or interactive element
    const target = e.target as HTMLElement;
    
    // Check for button or any interactive element
    if (target.closest('button') || 
        target.closest('[role="button"]') || 
        target.tagName === 'BUTTON' ||
        target.closest('.action-button')) {
      console.log('🚫 Card click blocked - button was clicked', target);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    console.log('🔗 Card click - navigating to TV show:', show.id);
    navigate(`/tv/${show.id}`);
  }, [navigate, show.id]);

  return (
    <div 
      className={cn(
        "tv-card flex-shrink-0 relative group cursor-pointer overflow-hidden w-72 md:w-80 lg:w-96",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-md transition-all duration-300 ease-in-out ${isHovered ? 'transform scale-105 shadow-xl z-10' : 'shadow-md'}`}>
          {/* Always visible title at bottom that animates on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 z-10 transition-all duration-700 ${isHovered ? 'opacity-0 transform translate-y-6' : 'opacity-100 transform translate-y-0'}`}>
          <div className="h-24 w-full absolute bottom-0 left-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent"></div>
          <h3 style={{fontFamily: 'Schkorycza Regular, sans-serif'}} className="relative text-4xl tracking-wide line-clamp-1 text-white drop-shadow-lg transform transition-all duration-700 ease-out">{show.name}</h3>
          <div className="relative mt-1 overflow-hidden h-0.5">
            <div className={`bg-red-500 h-0.5 w-12 transform transition-all duration-700 ease-out ${isHovered ? 'translate-x-full' : 'translate-x-0'}`}></div>
          </div>
        </div>
        
        <img 
          src={backdropPath} 
          alt={`${show.name} backdrop`} 
          className="w-full h-auto aspect-[16/9] rounded-md transition-all duration-300 ease-in-out object-cover"
          loading="lazy"
        />
        
        {!hideInfo && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-3 transition-all duration-500 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Animated TV title with enhanced styling */}
            <div className="overflow-hidden">
              <h3 
                style={{fontFamily: 'Schkorycza Regular, sans-serif'}}
                className={`text-2xl tracking-wide text-white transform transition-all duration-700 ease-out ${isHovered ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
              >
                {show.name}
              </h3>
              <div className={`bg-red-500 h-0.5 w-16 mt-1 transform transition-all duration-700 delay-100 ease-out ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-[-100%] opacity-0'}`}></div>
            </div>
            
            {/* TV show details with enhanced staggered animation */}
            <div className={`flex items-center text-xs space-x-3 mt-3 transform transition-all duration-700 delay-150 ease-out ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {show.vote_average > 0 && (
                <span className="bg-red-600 text-white font-medium px-2 py-0.5 rounded-sm tracking-wide">
                  {Math.round(show.vote_average * 10)}% Match
                </span>
              )}
              {show.first_air_date && (
                <span className="text-red-200 font-light tracking-wide">
                  {new Date(show.first_air_date).getFullYear()}
                </span>
              )}
              
              {show.number_of_seasons && (
                <span className="text-gray-300 border-l border-gray-500 pl-2 ml-1 font-light tracking-wide">
                  {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                </span>
              )}
            </div>
            
            {/* Overview text with enhanced staggered animation */}
            <div className={`mt-3 transform transition-all duration-700 delay-200 ease-out ${isHovered ? 'translate-y-0 opacity-95' : 'translate-y-6 opacity-0'}`}>
              <p className="text-xs text-gray-200 leading-relaxed tracking-wide line-clamp-2 font-light">{show.overview || "No overview available."}</p>
              <div className="h-4"></div> {/* Spacer for better layout */}
            </div>
              {/* Action Buttons with enhanced staggered animation */}
            <div className={`flex items-center justify-between transform transition-all duration-700 delay-300 ease-out ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex space-x-3 action-buttons" style={{ zIndex: 40 }}>
                <button 
                  className="p-2 bg-red-600 rounded-full transform transition-all duration-300 hover:scale-110 hover:bg-red-700 text-white shadow-md hover:shadow-red-500/30 action-button" 
                  onClick={handlePlay}
                  aria-label="Play trailer"
                  style={{ zIndex: 50, pointerEvents: 'auto' }}
                >
                  <Play className="h-4 w-4" />
                </button>{/* Add to Watchlist button */}
                <button 
                  className={`p-1.5 rounded-full border transition-all duration-300 transform hover:scale-110 shadow-sm
                    ${isShowInWatchlist 
                      ? 'bg-red-600 border-red-600 hover:bg-red-700 hover:shadow-red-500/30' 
                      : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700'}`}
                  onClick={handleWatchlistToggle}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🖱️ Watchlist button pointer down');
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🖱️ Watchlist button pointer up');
                  }}
                  aria-label={isShowInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  style={{ zIndex: 30, pointerEvents: 'auto', position: 'relative' }}
                >
                  {isShowInWatchlist ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Plus className="text-white h-4 w-4" />
                  )}
                </button>
                
                {/* Add to Favorites button */}
                <button 
                  className={`p-1.5 rounded-full border transition-all duration-300 transform hover:scale-110 shadow-sm
                    ${isShowFavorite 
                      ? 'bg-red-600 border-red-600 hover:bg-red-700 hover:shadow-red-500/30' 
                      : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700'}`}
                  onClick={handleFavoriteToggle}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🖱️ Favorites button pointer down');
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🖱️ Favorites button pointer up');
                  }}
                  aria-label={isShowFavorite ? "Remove from favorites" : "Add to favorites"}
                  style={{ zIndex: 30, pointerEvents: 'auto', position: 'relative' }}
                >
                  <Heart className={`h-4 w-4 ${isShowFavorite ? 'text-white fill-current' : 'text-white'}`} />
                </button>
              </div>
              
              <button 
                className="p-1.5 rounded-full border border-red-500 bg-gray-900/70 transform transition-all duration-300 hover:scale-110 hover:bg-red-900/50 hover:shadow-red-500/20 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tv/${show.id}`);
                }}
                aria-label="More information"
              >
                <Info className="text-white h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* TV-specific elegant glow effect */}
      {isHovered && !hideInfo && (
        <>
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70 blur-sm rounded-b-lg animate-pulse" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-red-500/40 opacity-0 blur-sm animate-pulse group-hover:opacity-100 transition-opacity duration-1000" />
        </>
      )}
    </div>
  );
};

export default HorizontalTVShowCard;
