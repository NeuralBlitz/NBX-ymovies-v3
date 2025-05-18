import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";

type MediaItem = Movie | TVShow;

interface UserPreferences {
  favoriteMovies: MediaItem[];
  watchlist: MediaItem[];
  watchHistory: MediaItem[];
  likedGenres: string[];
  dislikedGenres: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  addToFavorites: (movie: MediaItem) => Promise<void>;
  removeFromFavorites: (movieId: number) => Promise<void>;
  addToWatchlist: (movie: MediaItem) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  addToWatchHistory: (movie: MediaItem) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
  isInWatchlist: (movieId: number) => boolean;
  clearWatchHistory: () => Promise<void>;
}

// Local storage keys
const FAVORITES_KEY = "user_favorites";
const WATCHLIST_KEY = "user_watchlist";
const WATCH_HISTORY_KEY = "user_watch_history";
const LIKED_GENRES_KEY = "user_liked_genres";
const DISLIKED_GENRES_KEY = "user_disliked_genres";

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Default empty preference state
const defaultPreferences: UserPreferences = {
  favoriteMovies: [],
  watchlist: [],
  watchHistory: [],
  likedGenres: [],
  dislikedGenres: [],
};

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, firebaseUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // Load preferences when user authentication state changes
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and firebaseUser exists
        if (isAuthenticated && user && firebaseUser) {
          // If authenticated, try to load from server API
          try {
            // Safely try to get Firebase ID token
            let idToken = null;
            try {
              idToken = await firebaseUser.getIdToken();
            } catch (tokenError) {
              console.error("Failed to get Firebase token:", tokenError);
              // Fall back to local storage if token fetch fails
              loadFromLocalStorage();
              return;
            }
            
            if (!idToken) {
              throw new Error("No authentication token available");
            }
            
            // Attempt to fetch from server with auth token
            const response = await fetch("/api/preferences", {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setPreferences(data);
            } else {
              // Fallback to local storage if API fails
              loadFromLocalStorage();
            }
          } catch (error) {
            console.error("Failed to load preferences from server:", error);
            // Fallback to local storage
            loadFromLocalStorage();
          }
        } else {
          // If not authenticated, load from local storage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast({
          title: "Error loading preferences",
          description: "Your preferences could not be loaded. Default settings applied.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }    };

    // Only load preferences if firebaseUser is defined when authenticated
    if (!isAuthenticated || (isAuthenticated && firebaseUser)) {
      loadPreferences();
    }
  }, [isAuthenticated, user ? user.id : null, firebaseUser, toast]);

  // Helper function to load from localStorage
  const loadFromLocalStorage = () => {
    try {
      // Load each preference category from localStorage
      const favoritesJson = localStorage.getItem(FAVORITES_KEY);
      const watchlistJson = localStorage.getItem(WATCHLIST_KEY);
      const watchHistoryJson = localStorage.getItem(WATCH_HISTORY_KEY);
      const likedGenresJson = localStorage.getItem(LIKED_GENRES_KEY);
      const dislikedGenresJson = localStorage.getItem(DISLIKED_GENRES_KEY);

      // Parse JSON if available
      const favoriteMovies = favoritesJson ? JSON.parse(favoritesJson) : [];
      const watchlist = watchlistJson ? JSON.parse(watchlistJson) : [];
      const watchHistory = watchHistoryJson ? JSON.parse(watchHistoryJson) : [];
      const likedGenres = likedGenresJson ? JSON.parse(likedGenresJson) : [];
      const dislikedGenres = dislikedGenresJson ? JSON.parse(dislikedGenresJson) : [];

      setPreferences({
        favoriteMovies,
        watchlist,
        watchHistory,
        likedGenres,
        dislikedGenres,
      });
    } catch (error) {
      console.error("Failed to load preferences from localStorage:", error);
      setPreferences(defaultPreferences);
    }
  };

  // Save to both server (if authenticated) and localStorage
  const savePreferences = async (newPreferences: UserPreferences) => {
    // Update state
    setPreferences(newPreferences);

    // Save to localStorage (as backup/for guest users)
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newPreferences.favoriteMovies));
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newPreferences.watchlist));
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(newPreferences.watchHistory));
      localStorage.setItem(LIKED_GENRES_KEY, JSON.stringify(newPreferences.likedGenres));
      localStorage.setItem(DISLIKED_GENRES_KEY, JSON.stringify(newPreferences.dislikedGenres));    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }

    // If authenticated, save to server
    if (isAuthenticated && firebaseUser) {
      try {
        // Get Firebase ID token for authenticated API requests
        let idToken = null;
        try {
          idToken = await firebaseUser.getIdToken();
        } catch (tokenError) {
          console.error("Failed to get Firebase token for saving:", tokenError);
          // Continue with local storage only
          return;
        }
        
        if (!idToken) {
          throw new Error("No authentication token available");
        }
        
        const response = await fetch("/api/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify(newPreferences),
        });

        if (!response.ok) {
          console.error("Failed to save preferences to server");
        }
      } catch (error) {
        console.error("Error saving preferences to server:", error);
      }
    }
  };

  // Helper functions for specific preference updates
  const addToFavorites = async (movie: MediaItem) => {
    if (preferences.favoriteMovies.some(m => m.id === movie.id)) {
      return; // Already in favorites
    }
    
    const newFavorites = [...preferences.favoriteMovies, movie];
    await savePreferences({
      ...preferences,
      favoriteMovies: newFavorites,
    });
    
    toast({
      title: "Added to Favorites",
      description: `${(movie as any).title || (movie as any).name} has been added to your favorites.`,
    });
  };

  const removeFromFavorites = async (movieId: number) => {
    const newFavorites = preferences.favoriteMovies.filter((m) => m.id !== movieId);
    await savePreferences({
      ...preferences,
      favoriteMovies: newFavorites,
    });
    
    toast({
      title: "Removed from Favorites",
      description: "Movie has been removed from your favorites.",
    });
  };

  const addToWatchlist = async (movie: MediaItem) => {
    if (preferences.watchlist.some(m => m.id === movie.id)) {
      return; // Already in watchlist
    }
    
    const newWatchlist = [...preferences.watchlist, movie];
    await savePreferences({
      ...preferences,
      watchlist: newWatchlist,
    });
    
    toast({
      title: "Added to Watchlist",
      description: `${(movie as any).title || (movie as any).name} has been added to your watchlist.`,
    });
  };

  const removeFromWatchlist = async (movieId: number) => {
    const newWatchlist = preferences.watchlist.filter((m) => m.id !== movieId);
    await savePreferences({
      ...preferences,
      watchlist: newWatchlist,
    });
    
    toast({
      title: "Removed from Watchlist",
      description: "Movie has been removed from your watchlist.",
    });
  };

  const addToWatchHistory = async (movie: MediaItem) => {
    // Remove if it already exists (to avoid duplicates)
    const filteredHistory = preferences.watchHistory.filter((m) => m.id !== movie.id);
    
    // Add to the beginning (most recent)
    const newHistory = [movie, ...filteredHistory];
    
    // Keep only the last 100 watched items
    const trimmedHistory = newHistory.slice(0, 100);
    
    await savePreferences({
      ...preferences,
      watchHistory: trimmedHistory,
    });
  };
  
  const clearWatchHistory = async () => {
    await savePreferences({
      ...preferences,
      watchHistory: [],
    });
    
    toast({
      title: "Watch History Cleared",
      description: "Your watch history has been cleared successfully.",
    });
  };

  // Utility functions to check if a movie is in a particular list
  const isFavorite = (movieId: number) => {
    return preferences.favoriteMovies.some((movie) => movie.id === movieId);
  };

  const isInWatchlist = (movieId: number) => {
    return preferences.watchlist.some((movie) => movie.id === movieId);
  };

  // Context value
  const contextValue: UserPreferencesContextType = {
    preferences,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist,
    addToWatchHistory,
    isFavorite,
    isInWatchlist,
    clearWatchHistory,
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Custom hook to use the preferences context
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};
