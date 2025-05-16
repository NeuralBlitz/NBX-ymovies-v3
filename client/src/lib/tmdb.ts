import { Movie } from "@/types/movie";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
// Use local demo server instead of actual TMDB API
const BASE_URL = "http://localhost:5001/api";

/**
 * Helper function to make requests to TMDb API
 */
async function fetchFromTMDb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // Map TMDB endpoints to our demo server endpoints
  let mappedEndpoint = endpoint;
  if (endpoint.includes("/movie/popular")) {
    mappedEndpoint = "/movies/popular";
  } else if (endpoint.includes("/movie/top_rated")) {
    mappedEndpoint = "/movies/top_rated";
  } else if (endpoint.includes("/trending")) {
    mappedEndpoint = "/movies/trending";
  } else if (endpoint.startsWith("/search")) {
    mappedEndpoint = "/movies/search";
  } else if (endpoint.startsWith("/movie/") && !endpoint.includes("recommendations")) {
    // Detail endpoint like /movie/123
    const id = endpoint.split("/").pop();
    mappedEndpoint = `/movies/${id}`;
  } else if (endpoint.includes("recommendations")) {
    const id = endpoint.split("/")[2]; // Extract movie ID from /movie/123/recommendations
    mappedEndpoint = `/movies/${id}/recommendations`;
  }
  
  const url = new URL(`${BASE_URL}${mappedEndpoint}`);
  
  // Add parameters for search
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
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
  const data = await fetchFromTMDb<{ results: Movie[] }>("/search/movie", { query });
  return data.results;
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
