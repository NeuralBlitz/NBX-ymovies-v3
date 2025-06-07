import React, { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Heart, 
  Bookmark, 
  Settings, 
  Star, 
  Calendar,
  TrendingUp,
  Eye
} from "lucide-react";
import MediaGrid from "@/components/MediaGrid";

// Define a combined media type for both movies and TV shows
type MediaItem = Movie | TVShow;

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
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
  
  // Get favorites and watchlist from user preferences
  const favorites = preferences?.favoriteMovies || [];
  const watchlist = preferences?.watchlist || [];
  
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
      {/* Hero Section with Profile Info */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative container mx-auto pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-12">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-white/10 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={user?.profileImageUrl} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-3xl font-bold">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Stats Cards - Mobile */}
                <div className="flex lg:hidden gap-3 mt-6">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-red-500">{favorites.length}</div>
                    <div className="text-xs text-muted-foreground">Favorites</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-blue-500">{watchlist.length}</div>
                    <div className="text-xs text-muted-foreground">Watchlist</div>
                  </div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {user?.firstName 
                    ? `${user.firstName} ${user.lastName || ''}`
                    : user?.email?.split('@')[0] || 'User'}
                </h1>
                
                <p className="text-muted-foreground mb-6 flex items-center justify-center lg:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatJoinDate()}
                </p>
                
                {/* Genre Preferences */}
                {getGenreNames().length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center lg:justify-start gap-2">
                      <Star className="w-4 h-4" />
                      Favorite Genres
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {getGenreNames().slice(0, 6).map((genre, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20 transition-colors duration-200"
                        >
                          {genre}
                        </Badge>
                      ))}
                      {getGenreNames().length > 6 && (
                        <Badge variant="outline" className="bg-muted/50">
                          +{getGenreNames().length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Button 
                    asChild 
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Link href="/my-list" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View My List
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card transition-all duration-200 hover:scale-105"
                  >
                    <Link href="/quiz" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Edit Preferences
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Stats Cards - Desktop */}
              <div className="hidden lg:flex flex-col gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-500">{favorites.length}</div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Bookmark className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-500">{watchlist.length}</div>
                    <div className="text-sm text-muted-foreground">Watchlist</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Watchlist</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="w-5 h-5" />
                      Recent Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.slice(0, 3).map((movie, index) => (
                      <div key={movie.id} className="flex items-center gap-3 mb-3 last:mb-0">
                        <img 
                          src={getMediaPosterUrl(movie)}
                          alt={getMediaTitle(movie)}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{getMediaTitle(movie)}</div>
                          <div className="text-sm text-muted-foreground">{getMediaReleaseYear(movie)}</div>
                        </div>
                      </div>
                    ))}
                    {favorites.length === 0 && (
                      <p className="text-muted-foreground text-sm">No favorites yet</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Bookmark className="w-5 h-5" />
                      Up Next
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {watchlist.slice(0, 3).map((movie, index) => (
                      <div key={movie.id} className="flex items-center gap-3 mb-3 last:mb-0">
                        <img 
                          src={getMediaPosterUrl(movie)}
                          alt={getMediaTitle(movie)}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{getMediaTitle(movie)}</div>
                          <div className="text-sm text-muted-foreground">{getMediaReleaseYear(movie)}</div>
                        </div>
                      </div>
                    ))}
                    {watchlist.length === 0 && (
                      <p className="text-muted-foreground text-sm">No items in watchlist</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
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
              />
            </TabsContent>
            
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
