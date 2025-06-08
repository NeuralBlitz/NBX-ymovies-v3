import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, Check, ArrowLeft, Heart } from "lucide-react";

// Define interfaces for the movie details page
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types/movie";
import { getMovieDetails, getSimilarMovies, getMovieVideos, getMovieReviews } from "@/lib/tmdb";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const MovieDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isFavorite, addToFavorites, removeFromFavorites } = useUserPreferences();
  
  const [usingMockData, setUsingMockData] = useState(false);
  const movieId = parseInt(id || "0", 10);
  
  // Check if movie is in favorites - use a more reactive approach
  const favoriteStatus = useMemo(() => {
    return isAuthenticated && movieId > 0 ? isFavorite(movieId) : false;
  }, [isAuthenticated, movieId, isFavorite]);
  
  // Log state for debugging only when status changes
  useEffect(() => {
    console.log(`🎬 MovieDetail favorite status changed for movie ${movieId}:`, {
      favoriteStatus,
      isAuthenticated,
      movieId
    });
  }, [favoriteStatus, isAuthenticated, movieId]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add movies to your favorites.",
        variant: "default",
      });
      return;
    }
    
    if (!movie) {
      console.warn("Movie data not available for favorite toggle");
      return;
    }
    
    console.log(`🎬 Toggling favorite for movie ${movieId}, current status: ${favoriteStatus}`);
    
    try {
      if (favoriteStatus) {
        await removeFromFavorites(movieId);
        console.log(`✅ Removed movie ${movieId} from favorites`);
      } else {
        await addToFavorites(movie);
        console.log(`✅ Added movie ${movieId} to favorites`);
      }
    } catch (error) {
      console.error(`❌ Error toggling favorite for movie ${movieId}:`, error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };
  


  // Fetch movie details
  const { data: movie, isLoading: isMovieLoading, isError: isMovieError, error: movieError } = useQuery<Movie>({
    queryKey: [`movie-details-${movieId}`],
    queryFn: () => getMovieDetails(movieId),
    enabled: movieId > 0,
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
  
  // Handle error using useEffect
  React.useEffect(() => {
    if (movieError) {
      console.error("Error fetching movie details:", movieError);
      toast({
        title: "Error loading movie details",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  }, [movieError, toast]);
  
  // Fetch similar movies with better error handling
  const { data: similarMovies, isLoading: isSimilarMoviesLoading, error: similarMoviesError } = useQuery<Movie[]>({
    queryKey: [`movie-similar-${movieId}`],
    queryFn: () => getSimilarMovies(movieId),
    enabled: movieId > 0 && !!movie,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
  
  // Handle error using useEffect
  React.useEffect(() => {
    if (similarMoviesError) {
      console.error("Error fetching similar movies:", similarMoviesError);
    }
  }, [similarMoviesError]);
  
  // Fetch movie videos (trailers) with better error handling
  const { data: videos, isLoading: isVideosLoading, error: videosError } = useQuery<VideoType[]>({
    queryKey: [`movie-videos-${movieId}`],
    queryFn: () => getMovieVideos(movieId),
    enabled: movieId > 0 && !!movie,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
  
  // Handle error using useEffect
  React.useEffect(() => {
    if (videosError) {
      console.error("Error fetching movie videos:", videosError);
    }
  }, [videosError]);
  
  // Fetch movie reviews with better error handling
  const { data: reviews, isLoading: isReviewsLoading, error: reviewsError } = useQuery<Review[]>({
    queryKey: [`movie-reviews-${movieId}`],
    queryFn: () => getMovieReviews(movieId),
    enabled: movieId > 0 && !!movie,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
  
  // Handle error using useEffect
  React.useEffect(() => {
    if (reviewsError) {
      console.error("Error fetching movie reviews:", reviewsError);
    }
  }, [reviewsError]);
  
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserPreferences();
  
  // Check if movie is in watchlist using the hook
  const isMovieInWatchlist = isAuthenticated && movie ? isInWatchlist(movie.id) : false;
  
  // Define the update progress mutation
  const updateProgress = useMutation({
    mutationFn: (progress: number) => {
      return apiRequest("PUT", `/api/watch-history/${movieId}/progress`, { 
        watchProgress: progress,
        movieId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watch-history"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update watch progress:", error);
    }
  });
  // Get backdrop URL
  const backdropUrl = useMemo(() => {
    if (movie?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    }
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=600&q=80';
  }, [movie]);
  
  // Handle watchlist toggle - updated to use useUserPreferences hook
  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add movies to your list.",
        variant: "default",
      });
      return;
    }
    
    if (!movie) return;
    
    if (isMovieInWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };
  
  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Start watching function - updated to play the trailer
  const startWatching = () => {
    // Find a trailer video if available
    const trailer = videos && Array.isArray(videos) ? videos.find(video => 
      video && typeof video === 'object' && video.type && video.site &&
      video.type.toLowerCase() === "trailer" && video.site.toLowerCase() === "youtube"
    ) : undefined;
    
    if (trailer) {
      // Update progress to 0% when starting to watch if authenticated
      if (isAuthenticated) {
        updateProgress.mutate(0);
      }
      
      // Create a modal to play the trailer
      const trailerModal = document.createElement('div');
      trailerModal.style.position = 'fixed';
      trailerModal.style.top = '0';
      trailerModal.style.left = '0';
      trailerModal.style.width = '100%';
      trailerModal.style.height = '100%';
      trailerModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      trailerModal.style.display = 'flex';
      trailerModal.style.flexDirection = 'column';
      trailerModal.style.alignItems = 'center';
      trailerModal.style.justifyContent = 'center';
      trailerModal.style.zIndex = '9999';
      
      // Close button at top right
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '20px';
      closeButton.style.right = '20px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.color = 'white';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.zIndex = '10000';
      
      trailerModal.appendChild(closeButton);
      
      // Create iframe for YouTube trailer
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      iframe.style.width = '80%';
      iframe.style.height = '60%';
      iframe.style.maxWidth = '900px';
      iframe.style.border = 'none';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      
      trailerModal.appendChild(iframe);
      
      // Title below the video
      const title = document.createElement('h2');
      title.textContent = trailer.name;
      title.style.color = 'white';
      title.style.marginTop = '20px';
      title.style.fontSize = '18px';
      
      trailerModal.appendChild(title);
      
      document.body.appendChild(trailerModal);
      
      // Add event listener to close button
      closeButton.addEventListener('click', () => {
        document.body.removeChild(trailerModal);
        
        // Update progress to a random value between 50% and 100%
        if (isAuthenticated) {
          const randomProgress = Math.floor(Math.random() * 51) + 50; // 50-100
          updateProgress.mutate(randomProgress);
        }
      });
    } else {
      // If no trailer is found, show a message
      toast({
        title: "No Trailer Available",
        description: "Sorry, no trailer is available for this movie.",
        variant: "default",
      });
    }
  };
  
  // Update page title on movie load
  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} - YMovies`;
    }
    
    return () => {
      document.title = "YMovies - Movie Recommendations";
    };
  }, [movie]);

  // No longer need to refresh watchlist status as useUserPreferences handles it

  if (isMovieLoading) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4">
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-md" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
        <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Movie Header with Backdrop */}
      <div className="relative">
        <div 
          className="h-[50vh] md:h-[60vh] bg-cover bg-center bg-no-repeat relative"
          style={{ 
            backgroundImage: `url('${backdropUrl}')`,
            backgroundPosition: 'center 20%'
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 bg-black/60 hover:bg-black/80 z-10"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 movie-info-gradient">
          <div className="container mx-auto flex items-center space-x-4 px-6">
            <Button className="bg-white text-black hover:bg-gray-200" onClick={startWatching}>
              <Play className="mr-2 h-5 w-5" />
              {videos && videos.length > 0 && videos.find(v => v && v.type && v.type.toLowerCase() === "trailer") 
                ? "Play Trailer" 
                : "Play"}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleWatchlistToggle}
              title={isMovieInWatchlist ? "Remove from My List" : "Add to My List"}
            >
              {isMovieInWatchlist ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleFavoriteToggle}
              title={favoriteStatus ? "Remove from Favorites" : "Add to Favorites"}
              className={favoriteStatus ? "bg-red-600 border-red-600 hover:bg-red-700" : ""}
            >
              <Heart className={`h-5 w-5 ${favoriteStatus ? 'text-white fill-current' : 'text-white'}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Movie Details */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-600 dark:text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-foreground">{new Date(movie.release_date).getFullYear()}</span>
              {movie.adult ? (
                <span className="border border-foreground/50 px-1 text-xs text-foreground">R</span>
              ) : (
                <span className="border border-foreground/50 px-1 text-xs text-foreground">PG-13</span>
              )}
              {movie.runtime && <span className="text-foreground">{formatRuntime(movie.runtime)}</span>}
              <span className="border border-foreground/50 px-1 text-xs text-foreground">HD</span>
            </div>
            
            <p className="mb-6">{movie.overview}</p>
            
            {movie.credits && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Cast</h3>
                <p className="text-muted-foreground">
                  {movie.credits && movie.credits.cast && Array.isArray(movie.credits.cast) 
                    ? movie.credits.cast
                        .slice(0, 6)
                        .map((person: CastMember) => person.name)
                        .join(", ")
                    : "Cast information not available"}
                </p>
              </div>
            )}
            
            {movie.credits && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Director</h3>
                <p className="text-muted-foreground">
                  {movie.credits && movie.credits.crew && Array.isArray(movie.credits.crew)
                    ? movie.credits.crew
                        .filter((person: CrewMember) => person.job === "Director")
                        .map((person: CrewMember) => person.name)
                        .join(", ") || "Unknown"
                    : "Director information not available"}
                </p>
              </div>
            )}
          </div>
          
          <div className="md:w-1/3">
            {movie.genres && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Genres</h3>
                <p className="text-muted-foreground">
                  {movie.genres.map((genre: Genre) => genre.name).join(", ")}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-bold mb-2">This movie is...</h3>
              <p className="text-muted-foreground">
                {movie.vote_average > 7.5
                  ? "Highly Rated, "
                  : movie.vote_average > 6
                  ? "Well Received, "
                  : ""}
                {movie.genres &&
                  movie.genres
                    .slice(0, 2)
                    .map((genre: Genre) => 
                      genre.name === "Action" 
                        ? "Exciting" 
                        : genre.name === "Horror" 
                        ? "Scary" 
                        : genre.name === "Comedy" 
                        ? "Funny" 
                        : genre.name === "Drama" 
                        ? "Emotional" 
                        : genre.name === "Science Fiction" 
                        ? "Futuristic" 
                        : genre.name
                    )
                    .join(", ")}
              </p>
            </div>
          </div>
        </div>
        
        {/* Trailers & Videos Section */}
        {videos && Array.isArray(videos) && videos.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-6">Trailers & Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.slice(0, 2).map((video) => (
                <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
                  <div className="relative pb-[56.25%]">
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.key}`}
                      className="absolute top-0 left-0 w-full h-full"
                      title={video.name}
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{video.name}</h4>
                    <p className="text-sm text-muted-foreground">{video.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        {reviews && Array.isArray(reviews) && reviews.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-6">Reviews</h3>
            <div className="space-y-6">
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-4 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                      {review.author_details && review.author_details.username 
                        ? review.author_details.username.charAt(0).toUpperCase() 
                        : "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.author}</h4>
                      <div className="flex items-center">
                        {review.author_details.rating && (
                          <div className="flex items-center text-yellow-500 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                            {review.author_details.rating}/10
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-3">{review.content}</p>
                  <button 
                    onClick={() => window.open(review.url, '_blank', 'noopener,noreferrer')}
                    className="mt-2 inline-block text-sm font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Read full review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Similar Movies */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-6">More Like This</h3>
          
          {isSimilarMoviesLoading ? (
            <div className="grid grid-cols-5 gap-4">
              {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-md" />
              ))}
            </div>
          ) : similarMovies && similarMovies.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {similarMovies.slice(0, 15).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No similar movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
