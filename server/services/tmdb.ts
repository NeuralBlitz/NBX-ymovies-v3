import axios from 'axios';

export class TMDBService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.themoviedb.org/3";
    
    if (!apiKey) {
      console.warn("Warning: TMDBService initialized without API key. API requests will fail.");
    }
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          ...params
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching from TMDB API (${endpoint}):`, error);
      throw error;
    }
  }

  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
    const data = await this.fetchFromApi(`/trending/movie/${timeWindow}`);
    return data.results || [];
  }

  async getPopular(): Promise<any[]> {
    const data = await this.fetchFromApi('/movie/popular');
    return data.results || [];
  }

  async getMovieDetails(movieId: number): Promise<any> {
    return this.fetchFromApi(`/movie/${movieId}`, { append_to_response: 'credits,videos,images' });
  }

  async getSimilarMovies(movieId: number): Promise<any[]> {
    const data = await this.fetchFromApi(`/movie/${movieId}/similar`);
    return data.results || [];
  }

  async searchMovies(query: string): Promise<any[]> {
    const data = await this.fetchFromApi('/search/movie', { query });
    return data.results || [];
  }

  async getGenres(): Promise<any[]> {
    const data = await this.fetchFromApi('/genre/movie/list');
    return data.genres || [];
  }

  async discoverMovies(params: Record<string, string> = {}): Promise<any[]> {
    const data = await this.fetchFromApi('/discover/movie', params);
    return data.results || [];
  }

  async getMoviesByIds(movieIds: number[]): Promise<any[]> {
    if (!movieIds.length) return [];
    
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