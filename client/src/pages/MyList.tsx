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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Heart, 
  Bookmark, 
  Play, 
  Grid3X3, 
  List,
  Calendar,
  Star,
  TrendingUp
} from "lucide-react";
import MediaGrid from "@/components/MediaGrid";

type MediaItem = Movie | TVShow;

const MyList = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    } else if (tabParam === "watchlist") {
      setActiveTab("watchlist");
    }
  }, [location]);

  // Get watchlist and favorites from user preferences
  const watchlist = preferences?.watchlist || [];
  const favorites = preferences?.favoriteMovies || [];
  // Utility functions for handling media items
  const getMediaTitle = (media: MediaItem): string => {
    return (media as any).title || (media as any).name || "Unknown";
  };
  
  const getMediaReleaseYear = (media: MediaItem): string | null => {
    if ((media as any).release_date) {
      return new Date((media as any).release_date).getFullYear().toString();
    }
    if ((media as any).first_air_date) {
      return new Date((media as any).first_air_date).getFullYear().toString();
    }
    return null;
  };
  
  const getMediaPosterUrl = (media: MediaItem): string => {
    return (media as any).poster_path 
      ? `https://image.tmdb.org/t/p/w500${(media as any).poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Poster";
  };
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
  // Get total items count
  const getTotalItems = () => {
    return watchlist.length + favorites.length;
  };

  // Get recent activity (latest additions)
  const getRecentActivity = () => {
    const recentFavorites = favorites.slice(0, 3).map(item => ({ ...item, type: 'favorite' }));
    const recentWatchlist = watchlist.slice(0, 3).map(item => ({ ...item, type: 'watchlist' }));
    
    return [...recentFavorites, ...recentWatchlist].slice(0, 4);
  };
  // Loading state
  if (isPreferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
        <div className="container mx-auto pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-6 mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <Skeleton className="w-full aspect-[2/3] rounded-t-lg" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative container mx-auto pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                My List
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Your personal collection of movies and TV shows
              </p>
                {/* Stats Overview */}
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-500">{getTotalItems()}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{watchlist.length}</div>
                  <div className="text-sm text-muted-foreground">Watchlist</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{favorites.length}</div>
                  <div className="text-sm text-muted-foreground">Favorites</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="watchlist" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </TabsTrigger>
              </TabsList>
              
              {/* View Mode Toggle (only show when not on overview) */}
              {activeTab !== "overview" && (
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
              {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:bg-blue-500/5 transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Bookmark className="w-5 h-5" />
                      Watchlist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{watchlist.length}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Items ready to watch
                    </p>
                    {watchlist.length > 0 && (
                      <div className="space-y-2">
                        {watchlist.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs truncate">{getMediaTitle(item)}</span>
                          </div>
                        ))}
                        {watchlist.length > 2 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500/50 rounded-full"></div>
                            <span className="text-xs text-muted-foreground">+{watchlist.length - 2} more</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:bg-red-500/5 transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="w-5 h-5" />
                      Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 mb-2">{favorites.length}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Movies and shows you love
                    </p>
                    {favorites.length > 0 && (
                      <div className="space-y-2">
                        {favorites.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-xs truncate">{getMediaTitle(item)}</span>
                          </div>
                        ))}
                        {favorites.length > 2 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500/50 rounded-full"></div>
                            <span className="text-xs text-muted-foreground">+{favorites.length - 2} more</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {getRecentActivity().length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {getRecentActivity().map((item, index) => (
                        <div key={`${item.id}-${index}`} className="space-y-2">
                          <div className="relative group">
                            <img
                              src={getMediaPosterUrl(item)}
                              alt={getMediaTitle(item)}
                              className="w-full aspect-[2/3] object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                            />                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  (item as any).type === 'favorite' ? 'bg-red-500/20 text-red-600' :
                                  'bg-blue-500/20 text-blue-600'
                                }`}
                              >
                                {(item as any).type === 'favorite' ? 'Loved' : 'Added'}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="text-sm font-medium truncate">{getMediaTitle(item)}</h3>
                          <p className="text-xs text-muted-foreground">{getMediaReleaseYear(item)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State for Overview */}
              {getTotalItems() === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your personal collection of movies and TV shows
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <Link href="/">Discover Movies</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/tv-shows">Browse TV Shows</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist">
              <MediaGrid 
                title="My Watchlist"
                items={watchlist}
                isLoading={isPreferencesLoading}
                onRemove={handleRemoveFromWatchlist}
                emptyMessage="Your watchlist is empty."
                emptyAction={<Button asChild><Link href="/">Discover Movies</Link></Button>}
                getMediaTitle={getMediaTitle}
                getMediaPosterUrl={getMediaPosterUrl}
                getMediaReleaseYear={getMediaReleaseYear}
              />
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <MediaGrid 
                title="My Favorites"
                items={favorites}
                isLoading={isPreferencesLoading}
                onRemove={handleRemoveFromFavorites}
                emptyMessage="You haven't added any favorites yet."
                emptyAction={<Button asChild><Link href="/">Discover Movies</Link></Button>}
                getMediaTitle={getMediaTitle}
                getMediaPosterUrl={getMediaPosterUrl}
                getMediaReleaseYear={getMediaReleaseYear}
              />            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyList;
