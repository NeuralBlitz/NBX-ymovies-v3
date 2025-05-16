import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  
  // Format user's join date
  const formatJoinDate = () => {
    if (!user?.createdAt) return "Member";
    
    const date = new Date(user.createdAt);
    return `Member since ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };
  
  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  // Fetch all genres to get names from IDs
  const { data: allGenres } = useQuery({
    queryKey: ["/api/genres"],
  });
  
  // Get genre names from IDs
  const getGenreNames = () => {
    if (!preferences?.genres || !allGenres) return [];
    
    return preferences.genres.map((genreId: number) => {
      const genre = allGenres.find((g: any) => g.id === genreId);
      return genre ? genre.name : null;
    }).filter(Boolean);
  };
  
  // Fetch watchlist
  const { data: watchlist, isLoading: isWatchlistLoading } = useQuery({
    queryKey: ["/api/watchlist"],
  });
  
  // Fetch watch history
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["/api/history"],
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async (movieId: number) => {
      return apiRequest("DELETE", `/api/watchlist/${movieId}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from My List",
        description: "The movie has been removed from your list.",
      });
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

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      {/* User Profile Card */}
      <div className="bg-card rounded-lg p-6 mb-8">
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
            <p className="text-muted-foreground">{formatJoinDate()}</p>
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
      
      {/* My List Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">My List</h2>
        
        {isWatchlistLoading ? (
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
            {watchlist.map((movie: Movie) => (
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
                    onClick={() => removeFromWatchlist.mutate(movie.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium truncate">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-border rounded-md">
            <p className="text-muted-foreground mb-4">Your list is empty.</p>
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
            {history.map((movie: Movie & { progress: number }) => (
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
