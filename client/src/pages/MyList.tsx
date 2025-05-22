import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

type MediaItem = Movie | TVShow;

const MyList = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("watchlist");
  const { 
    preferences, 
    isLoading: isPreferencesLoading,
    removeFromFavorites,
    removeFromWatchlist 
  } = useUserPreferences();

  // Set the active tab based on URL parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get("tab");
    if (tabParam === "favorites") {
      setActiveTab("favorites");
    }
  }, [location]);

  // Get watchlist and favorites from user preferences
  const watchlist = preferences?.watchlist || [];
  const favorites = preferences?.favoriteMovies || [];

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlist(movieId);
    toast({
      title: "Removed from Watchlist",
      description: "The title has been removed from your watchlist.",
    });
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = (movieId: number) => {
    removeFromFavorites(movieId);
    toast({
      title: "Removed from Favorites",
      description: "The title has been removed from your favorites.",
    });
  };

  // Determine if the item is a movie or TV show
  const getMediaType = (item: MediaItem): string => {
    return 'title' in item ? 'movie' : 'tv';
  };

  // Loading state
  if (isPreferencesLoading) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-2xl font-bold mb-6">My List</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[2/3] rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <h1 className="text-2xl font-bold mb-6">My List</h1>

      <Tabs defaultValue="watchlist" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="watchlist">Watchlist ({watchlist.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
        </TabsList>
        
        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="mt-6">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {watchlist.map((item: MediaItem) => (
                <div key={item.id} className="group relative">
                  <Link href={`/${getMediaType(item)}/${item.id}`}>
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={('title' in item ? item.title : item.name) || 'Movie poster'}
                      className="w-full rounded-md hover:opacity-75 transition-opacity"
                    />
                  </Link>
                  
                  <button 
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromWatchlist(item.id)}
                    aria-label="Remove from watchlist"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  
                  <h3 className="mt-2 font-medium truncate">
                    {'title' in item ? item.title : item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date('release_date' in item ? item.release_date : item.first_air_date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-border rounded-md">
              <p className="text-muted-foreground mb-4">Your watchlist is empty.</p>
              <Button asChild>
                <Link href="/">Browse Titles</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-6">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {favorites.map((item: MediaItem) => (
                <div key={item.id} className="group relative">
                  <Link href={`/${getMediaType(item)}/${item.id}`}>
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={('title' in item ? item.title : item.name) || 'Movie poster'}
                      className="w-full rounded-md hover:opacity-75 transition-opacity"
                    />
                  </Link>
                  
                  <button 
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromFavorites(item.id)}
                    aria-label="Remove from favorites"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  
                  <h3 className="mt-2 font-medium truncate">
                    {'title' in item ? item.title : item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date('release_date' in item ? item.release_date : item.first_air_date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-border rounded-md">
              <p className="text-muted-foreground mb-4">You haven't added any favorites yet.</p>
              <Button asChild>
                <Link href="/">Browse Titles</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyList;
