import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
  const watchHistory = preferences?.watchHistory || [];
  
  // Define interfaces for genre data
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
  
  // Define movie with progress
  interface MovieWithProgress extends Movie {
    progress: number;
  }
  
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
            {preferences?.genres ? (
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
              {preferences?.duration === 'short'
                ? 'Under 90 minutes'
                : preferences?.duration === 'medium'
                ? '90-120 minutes'
                : preferences?.duration === 'long'
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
            {favorites.map((movie: any) => (
              <div key={movie.id} className="relative group">
                <div className="relative">
                  <img 
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Poster"
                    } 
                    alt={`${movie.title} poster`}
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
                  <h3 className="font-medium truncate">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.release_date && new Date(movie.release_date).getFullYear()}
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
            {watchlist.map((movie: any) => (
              <div key={movie.id} className="relative group">
                <div className="relative">
                  <img 
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Poster"
                    } 
                    alt={`${movie.title} poster`}
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
                  <h3 className="font-medium truncate">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.release_date && new Date(movie.release_date).getFullYear()}
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
        ) : history && history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.map((movie) => (
              <div key={movie.id} className="space-y-2">
                <Link href={`/movie/${movie.id}`}>
                  <img 
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Poster"
                    } 
                    alt={`${movie.title} poster`}
                    className="rounded-md w-full h-auto"
                    loading="lazy"
                  />
                </Link>
                <div>
                  <h3 className="font-medium truncate">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                  <div className="mt-1">
                    <Progress value={movie.progress} className="h-1" />
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
