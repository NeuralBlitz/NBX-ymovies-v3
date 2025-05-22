import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Define a combined media type for both movies and TV shows
type MediaItem = Movie | TVShow;

// Create an interface for media items with progress
interface MediaItemWithProgress {
  id: number;
  title?: string;               // For movies
  name?: string;                // For TV shows
  poster_path?: string;
  release_date?: string;        // For movies
  first_air_date?: string;      // For TV shows
  progress: number;             // Watch progress percentage (0-100)
  media_type?: 'movie' | 'tv';  // Explicit media type
  lastWatched?: string;         // ISO date string of last watch
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    preferences, 
    isLoading: isPreferencesLoading,
    removeFromFavorites,
    removeFromWatchlist
  } = useUserPreferences();
  
  // Format user's join date
  const formatJoinDate = () => {
    if (!user?.createdAt) return "Member";
    
    const date = new Date(user.createdAt);
    return `Member since ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };
  
  // Get favorites, watchlist and watch history from user preferences
  const favorites = preferences?.favoriteMovies || [];
  const watchlist = preferences?.watchlist || [];
  // Convert watchHistory to the correct type by ensuring each item has a progress property
  const watchHistory = (preferences?.watchHistory || []).map(item => {
    // Make sure each item has a progress property
    return {
      ...(item as MediaItem),
      progress: (item as any).progress !== undefined ? (item as any).progress : 0
    } as MediaItemWithProgress;
  });
  
  // History loading uses the same loading state as preferences
  const isHistoryLoading = isPreferencesLoading;
  
  // Define interface for genre data
  interface Genre {
    id: number;
    name: string;
  }
  
  // Fetch all genres to get names from IDs
  const { data: allGenres } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  // Get genre names from IDs
  const getGenreNames = () => {
    if (!preferences?.likedGenres || !allGenres) return [];
    
    // Ensure likedGenres exists and is an array
    const likedGenres = Array.isArray(preferences.likedGenres) ? preferences.likedGenres : [];
    
    return likedGenres.map((genreId: string) => {
      const genre = allGenres.find(g => g.id.toString() === genreId);
      return genre ? genre.name : null;
    }).filter(Boolean);
  };
  
  // Utility functions for handling media items
  const getMediaTitle = (media: MediaItem | MediaItemWithProgress): string => {
    return (media as any).title || (media as any).name || "Unknown";
  };
  
  const getMediaReleaseYear = (media: MediaItem | MediaItemWithProgress): string | null => {
    if ((media as any).release_date) {
      return new Date((media as any).release_date).getFullYear().toString();
    }
    if ((media as any).first_air_date) {
      return new Date((media as any).first_air_date).getFullYear().toString();
    }
    return null;
  };
  
  const isMovie = (media: MediaItem | MediaItemWithProgress): boolean => {
    return (media as any).media_type === 'movie' || 
           (media as any).title !== undefined ||
           (media as any).release_date !== undefined;
  };
  
  const getMediaPosterUrl = (media: MediaItem | MediaItemWithProgress): string => {
    return (media as any).poster_path 
      ? `https://image.tmdb.org/t/p/w500${(media as any).poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Poster";
  };
  
  // Handle removing from watchlist
  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlist(movieId);
    toast({
      title: "Removed from Watchlist",
      description: "The movie has been removed from your watchlist.",
    });
  };
  
  // Handle removing from favorites
  const handleRemoveFromFavorites = (movieId: number) => {
    removeFromFavorites(movieId);
    toast({
      title: "Removed from Favorites",
      description: "The movie has been removed from your favorites.",
    });
  };

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      {/* User Profile Card */}
      <div className="bg-card rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-bold">
                {user?.firstName 
                  ? `${user.firstName} ${user.lastName || ''}`
                  : user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {formatJoinDate()}
              </p>
              
              {getGenreNames().length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {getGenreNames().map((genre, index) => (
                    <Badge key={index} variant="outline" className="bg-background">{genre}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex items-center gap-1">
              <Link href="/my-list">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="m9 14 2 2 4-4"></path>
                </svg>
                View My List
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Favorite Genres</h3>
            {preferences?.likedGenres && preferences.likedGenres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getGenreNames().map((name, index) => (
                  <Badge key={index} variant="secondary">{name}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No preferences set. <Link href="/quiz" className="text-primary hover:underline">Take the quiz</Link> to get personalized recommendations.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Preferred Length</h3>
            <p className="text-muted-foreground">
              {(preferences as any)?.duration === 'short'
                ? 'Under 90 minutes'
                : (preferences as any)?.duration === 'medium'
                ? '90-120 minutes'
                : (preferences as any)?.duration === 'long'
                ? 'Over 2 hours'
                : 'Not specified'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="link" className="text-primary" asChild>
            <Link href="/quiz">Edit Preferences</Link>
          </Button>
        </div>
      </div>
      
      {/* Favorites Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Favorites</h2>
          <Button asChild variant="link" className="text-sm text-primary">
            <Link href="/my-list?tab=favorites">View all</Link>
          </Button>
        </div>
        
        {isPreferencesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-2/4" />
              </div>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((movie: MediaItem) => (
              <div key={movie.id} className="relative group">
                <div className="relative">
                  <img 
                    src={getMediaPosterUrl(movie)} 
                    alt={`${getMediaTitle(movie)} poster`}
                    className="rounded-md w-full h-auto"
                    loading="lazy"
                  />
                  <button 
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromFavorites(movie.id)}
                    aria-label="Remove from favorites"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium truncate">{getMediaTitle(movie)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getMediaReleaseYear(movie)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-border rounded-md">
            <p className="text-muted-foreground mb-4">You haven't added any favorites yet.</p>
            <Button asChild>
              <Link href="/">Discover Movies</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Watchlist Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Watchlist</h2>
          <Button asChild variant="link" className="text-sm text-primary">
            <Link href="/my-list?tab=watchlist">View all</Link>
          </Button>
        </div>
        
        {isPreferencesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-2/4" />
              </div>
            ))}
          </div>
        ) : watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchlist.map((movie: MediaItem) => (
              <div key={movie.id} className="relative group">
                <div className="relative">
                  <img 
                    src={getMediaPosterUrl(movie)} 
                    alt={`${getMediaTitle(movie)} poster`}
                    className="rounded-md w-full h-auto"
                    loading="lazy"
                  />
                  <button 
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromWatchlist(movie.id)}
                    aria-label="Remove from watchlist"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium truncate">{getMediaTitle(movie)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getMediaReleaseYear(movie)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-border rounded-md">
            <p className="text-muted-foreground mb-4">Your watchlist is empty.</p>
            <Button asChild>
              <Link href="/">Discover Movies</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Recently Watched Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recently Watched</h2>
        
        {isHistoryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : watchHistory && watchHistory.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchHistory.map((movie: MediaItemWithProgress) => (
              <div key={movie.id} className="space-y-2">
                <Link href={isMovie(movie) ? `/movie/${movie.id}` : `/tv/${movie.id}`}>
                  <img 
                    src={getMediaPosterUrl(movie)} 
                    alt={`${getMediaTitle(movie)} poster`}
                    className="rounded-md w-full h-auto"
                    loading="lazy"
                  />
                </Link>
                <div>
                  <h3 className="font-medium truncate">{getMediaTitle(movie)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getMediaReleaseYear(movie)}
                  </p>
                  <div className="mt-1">
                    <Progress value={movie.progress !== undefined ? movie.progress : 0} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-border rounded-md">
            <p className="text-muted-foreground mb-4">You haven't watched any movies yet.</p>
            <Button asChild>
              <Link href="/">Start Watching</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
