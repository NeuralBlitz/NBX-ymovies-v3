export class TMDBService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey || process.env.TMDB_API_KEY || "";
    this.baseUrl = 'https://api.themoviedb.org/3';
    
    if (!this.apiKey) {
      console.warn("No TMDb API key provided. API calls will fail!");
    }
  }
  
  private async fetchFromApi(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    
    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Get trending movies
  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
    const data = await this.fetchFromApi(`/trending/movie/${timeWindow}`);
    return data.results;
  }
  
  // Get popular movies
  async getPopular(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/popular');
    return data.results;
  }
  
  // Get movie details by ID
  async getMovieDetails(movieId: number): Promise<any> {
    return this.fetchFromApi(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,images,recommendations'
    });
  }
  
  // Get similar movies
  async getSimilarMovies(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/similar`);
    return data.results;
  }
  
  // Search movies
  async searchMovies(query: string): Promise<any[]> {
    const data = await this.fetchFromApi('/search/movie', { query });
    return data.results;
  }
  
  // Get all genres
  async getGenres(): Promise<any[]> {
    const data = await this.fetchFromApi('/genre/movie/list');
    return data.genres;
  }
  
  // Discover movies with filters
  async discoverMovies(params: Record<string, string> = {}): Promise<any[]> {
    const data = await this.fetchFromApi('/discover/movie', { 
      sort_by: 'popularity.desc',
      ...params
    });
    return data.results;
  }
  
  // Get movies by IDs
  async getMoviesByIds(movieIds: number[]): Promise<any[]> {
    if (movieIds.length === 0) return [];
    
    // TMDb doesn't have a "get movies by IDs" endpoint, so we have to make
    // individual requests for each movie
    const requests = movieIds.map(id => this.getMovieDetails(id));
    return Promise.all(requests);
  }
}
