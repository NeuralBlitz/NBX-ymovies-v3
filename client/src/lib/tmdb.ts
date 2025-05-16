import { Movie } from "@/types/movie";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Helper function to make requests to TMDb API
 */
async function fetchFromTMDb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add API key and any additional parameters
  url.searchParams.append("api_key", TMDB_API_KEY);
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
