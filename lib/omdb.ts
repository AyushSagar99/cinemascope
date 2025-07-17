// lib/omdb.ts
import { OMDBSearchResponse, OMDbMovieDetails, OMDBSearchResult } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

/**
 * @param query 
 * @returns 
 */
export async function searchMovies(query: string): Promise<OMDBSearchResult[] | null> {
  if (!query) return null;
  try {
    const response = await fetch(`${BASE_URL}&s=${encodeURIComponent(query)}`);
    const data: OMDBSearchResponse = await response.json();
    if (data.Response === 'True' && data.Search) {
      return data.Search;
    } else {
      if (data.Error) {
        console.error('OMDb Search Error:', data.Error);
        if (data.Error.includes('Too many results')) {
          throw new Error('Please enter a more specific search query (e.g., "La La Land" instead of "La").');
        } else {
          throw new Error(`OMDb Error: ${data.Error}`);
        }
      }
      return null;
    }
  } catch (error: any) {
    console.error('Failed to fetch movies from OMDb:', error);
    throw new Error(`Failed to fetch movies: ${error.message || 'Unknown error'}`);
  }
}

/**
 * @param imdbID 
 * @returns 
 */
export async function getMovieDetails(imdbID: string): Promise<OMDbMovieDetails | null> {
  if (!imdbID) return null;
  try {
    const response = await fetch(`${BASE_URL}&i=${encodeURIComponent(imdbID)}&plot=full`);
    const data: OMDbMovieDetails = await response.json();
    if (data.Response === 'True') {
      return data;
    } else {
      console.error('OMDb Details Error:', data.Error);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch movie details from OMDb:', error);
    return null;
  }
}
