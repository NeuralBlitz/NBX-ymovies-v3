// API utility functions for client
import { apiRequest } from './queryClient';

/**
 * Fetches movie genres from the backend API
 * @returns Promise with array of genre objects with id and name
 */
export async function fetchGenres() {
  return apiRequest('/api/genres');
}
