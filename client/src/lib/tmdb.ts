import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";

// Debug helper to diagnose environment variable issues
export const debugApiKeys = () => {
  console.log("TMDB API Keys Debug Information:");
  console.log("--------------------------------");
  
  // Check import.meta.env variables
  console.log("import.meta.env.VITE_TMDB_API_KEY:", import.meta.env.VITE_TMDB_API_KEY ? "Available" : "Not found");
  console.log("import.meta.env.VITE_TMDB_API_KEY_V3:", import.meta.env.VITE_TMDB_API_KEY_V3 ? "Available" : "Not found");
  
  // Check window global variables
  console.log("window.TMDB_API_KEY:", (window as any).TMDB_API_KEY ? "Available" : "Not found");
  console.log("window.TMDB_API_KEY_V3:", (window as any).TMDB_API_KEY_V3 ? "Available" : "Not found");
  
  // Check window.ENV object
  console.log("window.ENV?.TMDB_API_KEY:", (window as any).ENV?.TMDB_API_KEY ? "Available" : "Not found");
  console.log("window.ENV?.TMDB_API_KEY_V3:", (window as any).ENV?.TMDB_API_KEY_V3 ? "Available" : "Not found");
  
  // Output all environment variables (masked)
  console.log("All import.meta.env variables:");
  Object.keys(import.meta.env).forEach(key => {
    const value = import.meta.env[key];
    const maskedValue = typeof value === 'string' && value.length > 10 
      ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` 
      : value;
    console.log(`  ${key}: ${maskedValue}`);
  });
};

// Get both API key formats - JWT token and regular API key - from multiple possible sources
const getApiKey = () => {
  const sources = [
    import.meta.env.VITE_TMDB_API_KEY,
    (window as any).TMDB_API_KEY,
    (window as any).ENV?.TMDB_API_KEY
  ];
  
  // Debug which source is providing the key
  debugApiKeys();
  
  return sources.find(key => key && key.length > 0) || "";
};

const getApiKeyV3 = () => {
  const sources = [
    import.meta.env.VITE_TMDB_API_KEY_V3,
    (window as any).TMDB_API_KEY_V3,
    (window as any).ENV?.TMDB_API_KEY_V3
  ];
  
  return sources.find(key => key && key.length > 0) || "";
};

const TMDB_API_KEY = getApiKey();
const TMDB_API_KEY_V3 = getApiKeyV3();

// Use actual TMDB API to get real data
const BASE_URL = "https://api.themoviedb.org/3";

// Set this to false to ensure we use the real TMDB API for movies/shows data
// Demo server will still be used for user preferences and watchlist
const USE_DEMO_SERVER = false;

// Keep this for other functionality like user preferences
const DEMO_SERVER_URL = "http://localhost:5001/api";

/**
 * Helper function to make requests to TMDb API
 */
async function fetchFromTMDb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // For API endpoints, we'll determine if we should use demo server or real TMDB API
  let requestUrl;
  let requestHeaders = new Headers();
  
  // Always log which API key we're using (masked for security)
  const apiKeyPreview = TMDB_API_KEY ? 
    `${TMDB_API_KEY.substring(0, 5)}...${TMDB_API_KEY.substring(TMDB_API_KEY.length - 5)}` : 
    "Not found";
  console.log(`TMDB API key preview: ${apiKeyPreview}`);
  console.log(`USE_DEMO_SERVER value: ${USE_DEMO_SERVER}`);
  
  if (USE_DEMO_SERVER) {
    // Use demo server
    requestUrl = `${DEMO_SERVER_URL}${endpoint}`;
    console.log(`Using demo server URL: ${requestUrl}`);
  } else {
    // Use actual TMDB API with complete URL
    requestUrl = `${BASE_URL}${endpoint}`;
    
    // Add query parameters for TMDB API
    const urlObj = new URL(requestUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });
    
    // Try both authentication methods:
    // 1. Use Bearer token authentication for newer JWT tokens
    if (TMDB_API_KEY && TMDB_API_KEY.startsWith("ey")) {
      requestHeaders.append('Authorization', `Bearer ${TMDB_API_KEY}`);
      requestHeaders.append('Content-Type', 'application/json');
      console.log("Using JWT bearer token authentication");
    } 
    // 2. Add the API key as a query parameter for older API keys
    else if (TMDB_API_KEY_V3) {
      urlObj.searchParams.append('api_key', TMDB_API_KEY_V3);
      console.log("Using api_key parameter authentication");
    }
    // Fallback to using whatever token is available
    else if (TMDB_API_KEY) {
      urlObj.searchParams.append('api_key', TMDB_API_KEY);
      console.log("Using fallback api_key parameter authentication");
    }
    else {
      console.error("No TMDB API key found!");
      throw new Error("TMDB API key not found");
    }
    
    requestUrl = urlObj.toString();
  }
  
  console.log(`Fetching from ${USE_DEMO_SERVER ? 'demo server' : 'TMDB API'}: ${requestUrl}`);
  
  try {
    console.log(`Sending request with headers:`, 
      Array.from(requestHeaders.entries()).map(([key, value]) => 
        `${key}: ${key.toLowerCase() === 'authorization' ? 'Bearer ***' : value}`
      )
    );
    
    const response = await fetch(requestUrl, { headers: requestHeaders });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API error (${response.status}): ${errorText}`);
      throw new Error(`TMDb API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`API request succeeded! Found ${data.results?.length || 0} items`);
    
    // Debug the first result
    if (data.results && data.results.length > 0) {
      console.log("First result:", {
        id: data.results[0].id,
        title: data.results[0].title || data.results[0].name,
        poster: data.results[0].poster_path
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error in TMDB API request:", error);
    throw error;
  }
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
  const data = await fetchFromTMDb<{ results: Movie[] }>(`/trending/movie/${timeWindow}`);
  return data.results;
}

/**
 * Get popular movies
 */
export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDb<{ results: Movie[] }>("/movie/popular");
  return data.results;
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(movieId: number): Promise<Movie> {
  return fetchFromTMDb<Movie>(`/movie/${movieId}`, {
    append_to_response: "credits,videos,similar,recommendations"
  });
}

/**
 * Search for movies by query
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  console.log(`Searching for movies with query: "${query}"`);
  try {
    const data = await fetchFromTMDb<{ results: Movie[] }>("/search/movie", { query });
    console.log(`Search complete! Found ${data.results.length} results`);
    return data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Get list of genres
 */
export async function getGenres(): Promise<{ id: number; name: string }[]> {
  const data = await fetchFromTMDb<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
  return data.genres;
}

/**
 * Discover movies based on parameters
 */
export async function discoverMovies(params: Record<string, string> = {}): Promise<Movie[]> {
  const data = await fetchFromTMDb<{ results: Movie[] }>("/discover/movie", {
    sort_by: "popularity.desc",
    ...params
  });
  return data.results;
}

/**
 * Get similar movies for a movie ID
 */
export async function getSimilarMovies(movieId: number): Promise<Movie[]> {
  const data = await fetchFromTMDb<{ results: Movie[] }>(`/movie/${movieId}/similar`);
  return data.results;
}

/**
 * Get movie videos (trailers, etc)
 */
export async function getMovieVideos(movieId: number): Promise<{
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}[]> {
  const data = await fetchFromTMDb<{ results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[] }>(`/movie/${movieId}/videos`);
  return data.results;
}

/**
 * Get movie reviews
 */
export async function getMovieReviews(movieId: number): Promise<{
  id: string;
  author: string;
  content: string;
  created_at: string;
  url?: string;
  author_details: {
    username: string;
    rating?: number;
    avatar_path?: string;
  };
}[]> {
  const data = await fetchFromTMDb<{ results: {
    id: string;
    author: string;
    content: string;
    created_at: string;
    url?: string;
    author_details: {
      username: string;
      rating?: number;
      avatar_path?: string;
    };
  }[] }>(`/movie/${movieId}/reviews`);
  return data.results;
}

/**
 * Get trending TV shows
 */
export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`);
  return data.results;
}

/**
 * Get popular TV shows
 */
export async function getPopularTVShows(): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/tv/popular");
  return data.results;
}

/**
 * Get TV show details by ID
 */
export async function getTVShowDetails(tvId: number): Promise<TVShow> {
  return fetchFromTMDb<TVShow>(`/tv/${tvId}`, {
    append_to_response: "credits,videos,similar,recommendations"
  });
}

/**
 * Search for TV shows by query
 */
export async function searchTVShows(query: string): Promise<TVShow[]> {
  console.log(`Searching for TV shows with query: "${query}"`);
  try {
    const data = await fetchFromTMDb<{ results: TVShow[] }>("/search/tv", { query });
    console.log(`Search complete! Found ${data.results.length} results`);
    return data.results;
  } catch (error) {
    console.error("Error searching TV shows:", error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Get list of TV genres
 */
export async function getTVGenres(): Promise<{ id: number; name: string }[]> {
  const data = await fetchFromTMDb<{ genres: { id: number; name: string }[] }>("/genre/tv/list");
  return data.genres;
}

/**
 * Discover TV shows based on parameters
 */
export async function discoverTVShows(params: Record<string, string> = {}): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/discover/tv", {
    sort_by: "popularity.desc",
    ...params
  });
  return data.results;
}

/**
 * Get similar TV shows for a TV show ID
 */
export async function getSimilarTVShows(tvId: number): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>(`/tv/${tvId}/similar`);
  return data.results;
}

/**
 * Get TV show videos (trailers, etc)
 */
export async function getTVShowVideos(tvId: number): Promise<any[]> {
  const data = await fetchFromTMDb<{ results: any[] }>(`/tv/${tvId}/videos`);
  return data.results;
}

/**
 * Get TV show reviews
 */
export async function getTVShowReviews(tvId: number): Promise<any[]> {
  const data = await fetchFromTMDb<{ results: any[] }>(`/tv/${tvId}/reviews`);
  return data.results;
}

/**
 * Get top rated TV shows
 */
export async function getTopRatedTVShows(): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/tv/top_rated");
  return data.results;
}

/**
 * Get TV shows by genre ID with pagination support
 */
export async function getTVShowsByGenre(genreId: number, page: number = 1): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/discover/tv", {
    with_genres: genreId.toString(),
    page: page.toString(),
    sort_by: "popularity.desc"
  });
  return data.results;
}

/**
 * Get movies by genre ID with pagination support
 */
export async function getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  const data = await fetchFromTMDb<{ results: Movie[] }>("/discover/movie", {
    with_genres: genreId.toString(),
    page: page.toString(),
    sort_by: "popularity.desc"
  });
  return data.results;
}

/**
 * Get TV shows airing today
 */
export async function getTVShowsAiringToday(): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/tv/airing_today");
  return data.results;
}

/**
 * Get TV shows on the air (currently airing)
 */
export async function getTVShowsOnTheAir(): Promise<TVShow[]> {
  const data = await fetchFromTMDb<{ results: TVShow[] }>("/tv/on_the_air");
  return data.results;
}

/**
 * Search for both movies and TV shows
 */
export type MediaItem = (Movie | TVShow) & { media_type: 'movie' | 'tv' };

export async function searchMulti(query: string): Promise<MediaItem[]> {
  console.log(`Searching for movies and TV shows with query: "${query}"`);
  try {
    const data = await fetchFromTMDb<{ results: MediaItem[] }>("/search/multi", { query });
    // Filter to only movies and TV shows (exclude people)
    const filteredResults = data.results.filter(item => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );
    console.log(`Multi search complete! Found ${filteredResults.length} results`);
    return filteredResults;
  } catch (error) {
    console.error("Error in multi search:", error);
    return [];
  }
}
