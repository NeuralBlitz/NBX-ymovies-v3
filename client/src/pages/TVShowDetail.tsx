import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, Check, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieCard from "@/components/MovieCard";
import TVShowCard from "@/components/TVShowCard";
import TVShowList from "@/components/TVShowList";
import { TVShow } from "@/types/tvshow";
import { getTVShowDetails, getTVShowVideos, getTVShowReviews } from "@/lib/tmdb";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Define interfaces for the TV show details page
interface VideoType {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface ReviewAuthorDetails {
  username: string;
  rating?: number;
  avatar_path?: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
  url?: string;
  author_details: ReviewAuthorDetails;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

interface Genre {
  id: number;
  name: string;
}

const TVShowDetail = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();const { 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites,
    isInWatchlist: checkIsInWatchlist,
    addToWatchlist: addToUserWatchlist,
    removeFromWatchlist: removeFromUserWatchlist
  } = useUserPreferences();
  
  const tvShowId = id ? parseInt(id) : 0;
  
  // Check if TV show is in favorites - reactive approach
  const favoriteStatus = useMemo(() => {
    return isAuthenticated && tvShowId > 0 ? isFavorite(tvShowId) : false;
  }, [isAuthenticated, tvShowId, isFavorite]);
  
  // Check if TV show is in watchlist - reactive approach
  const watchlistStatus = useMemo(() => {
    return isAuthenticated && tvShowId > 0 ? checkIsInWatchlist(tvShowId) : false;
  }, [isAuthenticated, tvShowId, checkIsInWatchlist]);
    // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add shows to your favorites.",
        variant: "default",
      });
      return;
    }
    
    if (!tvShow) {
      console.warn("TV show data not available for favorite toggle");
      return;
    }
    
    console.log(`📺 Toggling favorite for TV show ${tvShowId}, current status: ${favoriteStatus}`);
    
    try {
      if (favoriteStatus) {
        await removeFromFavorites(tvShowId);
        console.log(`✅ Removed TV show ${tvShowId} from favorites`);
      } else {
        // Convert TVShow to Movie-like format for favorites (they use similar structure) 
        const movieFormat = {
          ...tvShow,
          title: tvShow.name, // Map name to title for compatibility
        };
        await addToFavorites(movieFormat);
        console.log(`✅ Added TV show ${tvShowId} to favorites`);
      }
    } catch (error) {
      console.error(`❌ Error toggling favorite for TV show ${tvShowId}:`, error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add shows to your watchlist.",
        variant: "default",
      });
      return;
    }
    
    if (!tvShow) {
      console.warn("TV show data not available for watchlist toggle");
      return;
    }
    
    console.log(`📺 Toggling watchlist for TV show ${tvShowId}, current status: ${watchlistStatus}`);
    
    try {
      if (watchlistStatus) {
        await removeFromUserWatchlist(tvShowId);
        console.log(`✅ Removed TV show ${tvShowId} from watchlist`);
      } else {
        // Convert TVShow to format for watchlist
        const watchlistFormat = {
          ...tvShow,
          title: tvShow.name, // Map name to title for compatibility
        };
        await addToUserWatchlist(watchlistFormat);
        console.log(`✅ Added TV show ${tvShowId} to watchlist`);
      }
    } catch (error) {
      console.error(`❌ Error toggling watchlist for TV show ${tvShowId}:`, error);
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };
    // Fetch TV show details
  const { data: tvShow, isLoading, isError } = useQuery<TVShow>({
    queryKey: [`/api/tv/${tvShowId}`],
    queryFn: () => getTVShowDetails(tvShowId),
    retry: 1,
    enabled: tvShowId > 0, // Only run the query if we have a valid ID
  });
  
  // Fetch videos (trailers, teasers, etc)
  const { data: videos } = useQuery<VideoType[]>({
    queryKey: [`/api/tv/${tvShowId}/videos`],
    queryFn: () => getTVShowVideos(tvShowId),
    retry: 1,
    enabled: tvShowId > 0, // Only run the query if we have a valid ID
  });
  
  // Fetch reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/tv/${tvShowId}/reviews`],
    queryFn: () => getTVShowReviews(tvShowId),
    retry: 1,
    enabled: tvShowId > 0, // Only run the query if we have a valid ID
  });
  
  // Find trailer
  const trailer = useMemo(() => {
    if (!videos || videos.length === 0) return null;
    
    // First look for official trailers from YouTube
    const officialTrailer = videos.find(
      (video) => 
        video.site === "YouTube" && 
        video.type === "Trailer" && 
        video.name.toLowerCase().includes("official")
    );
    
    if (officialTrailer) return officialTrailer;
    
    // Then any trailer from YouTube
    const anyTrailer = videos.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );
    
    if (anyTrailer) return anyTrailer;
    
    // Then any teaser from YouTube
    const teaser = videos.find(
      (video) => video.site === "YouTube" && video.type === "Teaser"
    );
    
    if (teaser) return teaser;
    
    // Finally, just return the first YouTube video
    return videos.find((video) => video.site === "YouTube") || null;  }, [videos]);
  
  // Thumbnail generator from YouTube video ID
  const getYoutubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format runtime function
  const formatSeasons = (seasons: number) => {
    return `${seasons} ${seasons === 1 ? 'Season' : 'Seasons'}`;
  };
    // Show loading state
  if (isLoading) {
    return (
      <div className="pb-12">
        {/* Hero Banner Skeleton */}
        <LoadingSkeleton variant="hero-banner" />
        
        {/* TV Show Details Skeleton */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <div className="flex items-center space-x-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
              
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              
              <div className="mb-6">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              
              <div className="mb-6">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="mb-4">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="mt-8">
            <div className="flex space-x-4 mb-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
            
            {/* Content area skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <LoadingSkeleton key={i} variant="tv-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
    // Show error state
  if (isError || !tvShow || !tvShowId) {
    return (
      <div className="pt-20 pb-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">TV Show Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {!tvShowId 
            ? "Invalid TV show ID provided." 
            : "We couldn't find the TV show you're looking for."}
        </p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }
  
  // Get similar TV shows
  const similarShows = tvShow.similar?.results.slice(0, 12) || [];
  
  // Get recommended TV shows
  const recommendedShows = tvShow.recommendations?.results.slice(0, 12) || [];
  
  // Get the backdrop path
  const backdropPath = tvShow.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
    : null;
  
  // Get the poster path
  const posterPath = tvShow.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : "/placeholder-poster.png";
    
  return (
    <div>
      {/* Hero backdrop */}
      {backdropPath && (
        <div className="relative h-[90vh] w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backdropPath})`,
              backgroundPosition: "center 20%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
  
          
          <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-16">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-24 left-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col md:flex-row gap-8 items-end md:items-center">
              <img 
                src={posterPath}
                alt={tvShow.name}
                className="hidden md:block w-48 rounded-md shadow-xl ring-1 ring-white/10"
              />                <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {tvShow.first_air_date && (
                    <span className="text-muted-foreground text-sm">
                      ({new Date(tvShow.first_air_date).getFullYear()})
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{tvShow.name}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tvShow.genres?.map((genre) => (
                    <Badge key={genre.id} variant="outline" className="bg-secondary/30">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  {tvShow.first_air_date && (
                    <div>
                      <span className="text-muted-foreground mr-1">First aired:</span>
                      <span>{formatDate(tvShow.first_air_date)}</span>
                    </div>
                  )}
                  {tvShow.number_of_seasons && (
                    <div>
                      <span className="text-muted-foreground mr-1">Seasons:</span>
                      <span>{formatSeasons(tvShow.number_of_seasons)}</span>
                    </div>
                  )}
                  {tvShow.vote_average > 0 && (
                    <div>
                      <span className="text-muted-foreground mr-1">Rating:</span>
                      <span className="text-yellow-400">
                        ★ {tvShow.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-base text-gray-300 mb-6 max-w-2xl">{tvShow.overview}</p>
                
                <div className="flex flex-wrap gap-3">                {trailer && (
                    <Button 
                      size="lg" 
                      className="gap-2"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank', 'noopener,noreferrer')}
                    >
                      <Play className="h-5 w-5" /> Play Trailer
                    </Button>
                  )}                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2"
                    onClick={handleWatchlistToggle}
                  >
                    {watchlistStatus ? (
                      <><Check className="h-5 w-5" /> In My List</>
                    ) : (
                      <><Plus className="h-5 w-5" /> Add to My List</>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className={`gap-2 ${favoriteStatus ? "bg-red-600 border-red-600 hover:bg-red-700 text-white" : ""}`}
                    onClick={handleFavoriteToggle}
                    title={favoriteStatus ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart className={`h-5 w-5 ${favoriteStatus ? 'fill-current' : ''}`} />
                    {favoriteStatus ? "Favorited" : "Favorite"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="cast" className="mb-12">
          <TabsList>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
          
          {/* Cast & Crew Tab */}
          <TabsContent value="cast" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tvShow.credits?.cast?.slice(0, 12).map((person) => (
                <Card key={person.id} className="overflow-hidden bg-secondary/10">
                  <div className="aspect-[2/3] bg-secondary/20">
                    {person.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-6">Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tvShow.credits?.crew?.filter(person => 
                ["Director", "Producer", "Writer", "Creator", "Executive Producer"].includes(person.job)
              ).slice(0, 8).map((person) => (
                <Card key={`${person.id}-${person.job}`} className="bg-secondary/10">
                  <div className="p-4">
                    <h3 className="font-bold text-base">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">{person.job}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Episodes Tab */}
          <TabsContent value="episodes" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Episodes</h2>
            <div className="space-y-4">
              <Card className="bg-secondary/10 p-4">
                <p className="text-center text-muted-foreground">
                  Episode information available on the full show page
                </p>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <Card key={review.id} className="bg-secondary/10">
                    <div className="p-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-bold">{review.author}</div>
                        {review.author_details.rating && (
                          <div className="text-yellow-400">
                            ★ {review.author_details.rating}/10
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">
                        {formatDate(review.created_at)}
                      </div>
                      <p className="text-gray-300 line-clamp-4">{review.content}</p>                      {review.url && (
                        <div className="mt-4">
                          <button 
                            onClick={() => window.open(review.url, '_blank', 'noopener,noreferrer')}
                            className="text-red-400 text-sm hover:underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            Read full review
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-secondary/10 p-6 text-center">
                <p className="text-muted-foreground">No reviews available for this TV show.</p>
              </Card>
            )}
          </TabsContent>
          
          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            {videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.filter(video => video.site === "YouTube").map((video) => (
                  <div 
                    key={video.id}
                    className="group cursor-pointer"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="relative aspect-video bg-secondary/20 rounded-md overflow-hidden">
                      <img 
                        src={getYoutubeThumbnail(video.key)} 
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="bg-red-600 rounded-full p-3">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-medium mt-2 group-hover:text-primary transition-colors">{video.name}</h3>
                    <p className="text-xs text-muted-foreground">{video.type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-secondary/10 p-6 text-center">
                <p className="text-muted-foreground">No videos available for this TV show.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Similar TV Shows */}
        <TVShowList 
          title="Similar TV Shows" 
          shows={similarShows} 
          className="mb-12" 
        />
        
        {/* Recommended TV Shows */}
        <TVShowList 
          title="Recommended TV Shows" 
          shows={recommendedShows} 
          className="mb-12" 
        />
      </div>
    </div>
  );
};

export default TVShowDetail;
