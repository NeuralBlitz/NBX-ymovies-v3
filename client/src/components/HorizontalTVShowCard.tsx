import React from "react";
import { Link } from "wouter";
import { TVShow } from "@/types/tvshow";
import { cn } from "@/lib/utils";
import { Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface HorizontalTVShowCardProps {
  show: TVShow;
  className?: string;
}

const HorizontalTVShowCard: React.FC<HorizontalTVShowCardProps> = ({ show, className }) => {
  const { isAuthenticated } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserPreferences();
  
  const posterPath = show.poster_path
    ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
    : "/placeholder-poster.png";
    
  const backdropPath = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}`
    : posterPath;
    
  const isInList = isAuthenticated && isInWatchlist(show.id);
  
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    if (isInList) {
      removeFromWatchlist(show.id);
    } else {
      addToWatchlist(show);
    }
  };

  return (
    <Link href={`/tv/${show.id}`}>
      <div className={cn(
        "group relative flex flex-row overflow-hidden rounded-md bg-secondary/10 transition-all hover:bg-secondary/20 h-32",
        className
      )}>
        {/* Poster Image */}
        <div className="flex-shrink-0 w-24 h-full overflow-hidden">
          <img
            src={posterPath}
            alt={show.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-base mb-1 line-clamp-1">{show.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {show.vote_average > 0 && (
                <span className="text-xs font-semibold text-green-500">
                  {Math.round(show.vote_average * 10)}% Match
                </span>
              )}
              {show.first_air_date && (
                <span className="text-xs text-gray-400">
                  {new Date(show.first_air_date).getFullYear()}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {show.overview || "No overview available."}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 bg-white/10 hover:bg-white/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/tv/${show.id}`;
              }}
            >
              <Play className="h-4 w-4 mr-1" /> Play
            </Button>
            {isAuthenticated && (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-black/20 border-gray-500"
                onClick={handleWatchlistToggle}
              >
                {isInList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
};

export default HorizontalTVShowCard;
