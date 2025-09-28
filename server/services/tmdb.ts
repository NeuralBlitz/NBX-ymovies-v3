import axios from 'axios';

export class TMDBService {
  private apiKey: string;
  private baseUrl: string;
  // Simple in-memory cache with TTL to cut repeated calls
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private defaultTtlMs = 1000 * 60 * 5; // 5 minutes

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.themoviedb.org/3";
    
    if (!apiKey) {
      console.warn("Warning: TMDBService initialized without API key. API requests will fail.");
    }
  }

  private getCacheKey(endpoint: string, params: Record<string, string> = {}): string {
    const p = new URLSearchParams(params).toString();
    return `${endpoint}?${p}`;
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string> = {}, ttlMs: number = this.defaultTtlMs): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const cacheKey = this.getCacheKey(endpoint, params);
      const now = Date.now();
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }
      const response = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          ...params
        }
      });
      const data = response.data;
      this.cache.set(cacheKey, { data, expiresAt: now + ttlMs });
      return data;
    } catch (error) {
      console.error(`Error fetching from TMDB API (${endpoint}):`, error);
      throw error;
    }
  }

  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
    const data = await this.fetchFromApi(`/trending/movie/${timeWindow}`, {}, 1000 * 60 * 2);
    return data.results || [];
  }

  async getPopular(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/popular', {}, 1000 * 60 * 2);
    return data.results || [];
  }

  async getMovieDetails(movieId: number): Promise<any> {
    return this.fetchFromApi(`/movie/${movieId}`, { append_to_response: 'credits,videos,images,reviews' }, 1000 * 60 * 10);
  }

  // Quick summary to reduce payload when details aren't needed
  async getMovieSummary(movieId: number): Promise<any> {
    return this.fetchFromApi(`/movie/${movieId}`, {}, 1000 * 60 * 10);
  }

  async getMovieRecommendations(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/recommendations`, {}, 1000 * 60 * 5);
    return data.results || [];
  }
  
  async getMovieVideos(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/videos`);
    return data.results || [];
  }
  
  async getMovieReviews(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/reviews`);
    return data.results || [];
  }
  
  async getTopRated(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/top_rated');
    return data.results || [];
  }
  
  async getUpcoming(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/upcoming');
    return data.results || [];
  }
  
  async getNowPlaying(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/now_playing');
    return data.results || [];
  }

  async getSimilarMovies(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/similar`, {}, 1000 * 60 * 5);
    return data.results || [];
  }

  // TV endpoints (minimal set for enhanced TV recommendations)
  async getTVDetails(tvId: number): Promise<any> {
    return this.fetchFromApi(`/tv/${tvId}`, { append_to_response: 'credits,images' }, 1000 * 60 * 10);
  }

  async getSimilarTV(tvId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/tv/${tvId}/similar`, {}, 1000 * 60 * 5);
    return data.results || [];
  }

  async getTVRecommendations(tvId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/tv/${tvId}/recommendations`, {}, 1000 * 60 * 5);
    return data.results || [];
  }

  async searchMovies(query: string): Promise<any[]> {
    const data = await this.fetchFromApi('/search/movie', { query });
    return data.results || [];
  }

  async getGenres(): Promise<any[]> {
    const data = await this.fetchFromApi('/genre/movie/list', {}, 1000 * 60 * 60);
    return data.genres || [];
  }

  async discoverMovies(params: Record<string, string> = {}): Promise<any[]> {
    const data = await this.fetchFromApi('/discover/movie', params, 1000 * 60 * 2);
    return data.results || [];
  }

  async getMoviesByIds(movieIds: number[]): Promise<any[]> {
    if (!movieIds.length) return [];
    // Fetch details with caching at the request layer
    // TMDB doesn't have a batch endpoint, so we need to make multiple requests
    const moviePromises = movieIds.map(id => this.getMovieDetails(id));
    const movies = await Promise.all(
      moviePromises.map(p => p.catch(err => {
        console.error('Error fetching movie details:', err);
        return null;
      }))
    );
    
    // Filter out any failed requests
    return movies.filter(movie => movie !== null);
  }
}