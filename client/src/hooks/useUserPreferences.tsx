import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";

type MediaItem = Movie | TVShow;

export interface UserCollection {
  id: string;
  name: string;
  items: MediaItem[];
  createdAt: string; // ISO
  color?: string;
}

interface UserPreferences {
  favoriteMovies: MediaItem[];
  watchlist: MediaItem[];
  watchHistory: MediaItem[];
  likedGenres: string[];
  dislikedGenres: string[];
  completed?: boolean;
  collections?: UserCollection[];
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
  // Collections
  createCollection: (name: string, color?: string) => Promise<UserCollection>;
  renameCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addItemToCollection: (id: string, item: MediaItem) => Promise<void>;
  removeItemFromCollection: (id: string, itemId: number) => Promise<void>;
}

// Local storage keys
const FAVORITES_KEY = "user_favorites";
const WATCHLIST_KEY = "user_watchlist";
const WATCH_HISTORY_KEY = "user_watch_history";
const LIKED_GENRES_KEY = "user_liked_genres";
const DISLIKED_GENRES_KEY = "user_disliked_genres";
const COLLECTIONS_KEY = "user_collections";

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Default empty preference state
const defaultPreferences: UserPreferences = {
  favoriteMovies: [],
  watchlist: [],
  watchHistory: [],
  likedGenres: [],
  dislikedGenres: [],
  completed: false,
  collections: [],
};

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, firebaseUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();  // Load preferences when user authentication state changes
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
              
              // If server returned default empty prefs (user has no saved data yet),
              // prefer localStorage data which may have local additions
              if (data._isDefault) {
                const localPrefs = getLocalStoragePrefs();
                const hasLocalData = localPrefs.favoriteMovies.length > 0 || 
                                     localPrefs.watchlist.length > 0 || 
                                     localPrefs.watchHistory.length > 0;
                if (hasLocalData) {
                  // Push local data to server so it persists
                  setPreferences(localPrefs);
                  syncToServer(localPrefs);
                  return;
                }
              }
              
              // Ensure we have all required fields
              const fullPreferences = {
                favoriteMovies: data.favoriteMovies || [],
                watchlist: data.watchlist || [],
                watchHistory: data.watchHistory || [],
                likedGenres: data.likedGenres || [],
                dislikedGenres: data.dislikedGenres || [],
                completed: data.completed || false,
                collections: data.collections || [],
              };
              setPreferences(fullPreferences);
              // Also update localStorage as backup
              saveToLocalStorage(fullPreferences);
            } else if (response.status >= 500) {
              console.warn("Server unavailable, using localStorage");
              loadFromLocalStorage();
            } else {
              console.warn("Server API returned an error, falling back to localStorage");
              // Fallback to local storage if API fails
              loadFromLocalStorage();
              // Show a non-disruptive toast message
              toast({
                title: "Using local preferences",
                description: "We couldn't connect to the server. Your preferences are saved locally.",
                variant: "default",
              });
            }
          } catch (error) {
            console.error("Failed to load preferences from server:", error);
            // Fallback to local storage
            loadFromLocalStorage();
            // No toast here to avoid disrupting the user experience
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
  }, [isAuthenticated, firebaseUser, toast]); // Removed user.id dependency to prevent unnecessary reloads
  // Helper function to read prefs from localStorage without setting state
  const getLocalStoragePrefs = (): UserPreferences => {
    try {
      const favoritesJson = localStorage.getItem(FAVORITES_KEY);
      const watchlistJson = localStorage.getItem(WATCHLIST_KEY);
      const watchHistoryJson = localStorage.getItem(WATCH_HISTORY_KEY);
      const likedGenresJson = localStorage.getItem(LIKED_GENRES_KEY);
      const dislikedGenresJson = localStorage.getItem(DISLIKED_GENRES_KEY);
      const collectionsJson = localStorage.getItem(COLLECTIONS_KEY);
      return {
        favoriteMovies: favoritesJson ? JSON.parse(favoritesJson) : [],
        watchlist: watchlistJson ? JSON.parse(watchlistJson) : [],
        watchHistory: watchHistoryJson ? JSON.parse(watchHistoryJson) : [],
        likedGenres: likedGenresJson ? JSON.parse(likedGenresJson) : [],
        dislikedGenres: dislikedGenresJson ? JSON.parse(dislikedGenresJson) : [],
        completed: false,
        collections: collectionsJson ? JSON.parse(collectionsJson) : [],
      };
    } catch {
      return defaultPreferences;
    }
  };

  // Helper to save prefs to localStorage
  const saveToLocalStorage = (prefs: UserPreferences) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(prefs.favoriteMovies));
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(prefs.watchlist));
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(prefs.watchHistory));
      localStorage.setItem(LIKED_GENRES_KEY, JSON.stringify(prefs.likedGenres));
      localStorage.setItem(DISLIKED_GENRES_KEY, JSON.stringify(prefs.dislikedGenres));
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(prefs.collections || []));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };

  // Helper to sync prefs to server (fire-and-forget)
  const syncToServer = async (prefs: UserPreferences) => {
    if (!isAuthenticated || !firebaseUser) return;
    try {
      const idToken = await firebaseUser.getIdToken();
      if (!idToken) return;
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify(prefs),
      });
    } catch (error) {
      console.error("Error syncing preferences to server:", error);
    }
  };

  // Helper function to load from localStorage
  const loadFromLocalStorage = () => {
    const localPreferences = getLocalStoragePrefs();
    setPreferences(localPreferences);
  };
  // Save to both server (if authenticated) and localStorage
  const savePreferences = async (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    saveToLocalStorage(newPreferences);
    await syncToServer(newPreferences);
  };

  // Collections API
  const createCollection = async (name: string, color?: string) => {
    const newCollection: UserCollection = {
      id: Math.random().toString(36).slice(2),
      name,
      items: [],
      createdAt: new Date().toISOString(),
      color,
    };
    const next = { ...preferences, collections: [...(preferences.collections || []), newCollection] };
    await savePreferences(next);
    toast({ title: "Collection created", description: `“${name}” was added.` });
    return newCollection;
  };

  const renameCollection = async (id: string, name: string) => {
    const next = {
      ...preferences,
      collections: (preferences.collections || []).map(c => c.id === id ? { ...c, name } : c)
    };
    await savePreferences(next);
    toast({ title: "Collection renamed", description: `Now “${name}”.` });
  };

  const deleteCollection = async (id: string) => {
    const col = (preferences.collections || []).find(c => c.id === id);
    const next = {
      ...preferences,
      collections: (preferences.collections || []).filter(c => c.id !== id)
    };
    await savePreferences(next);
    toast({ title: "Collection deleted", description: col ? `“${col.name}” removed.` : "Removed." });
  };

  const addItemToCollection = async (id: string, item: MediaItem) => {
    const payload: any = { ...item };
    if (!payload.title && payload.name) payload.title = payload.name; // normalize
    const next = {
      ...preferences,
      collections: (preferences.collections || []).map(c => {
        if (c.id !== id) return c;
        if (c.items.some(m => m.id === payload.id)) return c; // skip dup
        return { ...c, items: [payload, ...c.items] };
      })
    };
    await savePreferences(next);
    toast({ title: "Added to collection", description: "Item added successfully." });
  };

  const removeItemFromCollection = async (id: string, itemId: number) => {
    const next = {
      ...preferences,
      collections: (preferences.collections || []).map(c => c.id === id ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c)
    };
    await savePreferences(next);
    toast({ title: "Removed from collection", description: "Item removed successfully." });
  };
  // Helper functions for specific preference updates
  const addToFavorites = async (movie: MediaItem) => {
    if (preferences.favoriteMovies.some(m => m.id === movie.id)) return;
    
    const newFavorites = [...preferences.favoriteMovies, movie];
    const newPreferences = {
      ...preferences,
      favoriteMovies: newFavorites,
    };

    await savePreferences(newPreferences);
    
    toast({
      title: "Added to Favorites",
      description: `${(movie as any).title || (movie as any).name} has been added to your favorites.`,
    });
  };

  const removeFromFavorites = async (movieId: number) => {
    const existingMovie = preferences.favoriteMovies.find(m => m.id === movieId);
    if (!existingMovie) return;
    
    const newFavorites = preferences.favoriteMovies.filter((m) => m.id !== movieId);
    const newPreferences = {
      ...preferences,
      favoriteMovies: newFavorites,
    };

    await savePreferences(newPreferences);
    
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
    createCollection,
    renameCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection,
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
