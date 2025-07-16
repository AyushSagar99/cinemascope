
import { AppMovie, SocialContext, OMDbMovieDetails } from '@/types';

/**
 * 
 * @param runtimeStr 
 * @returns 
 */
function parseRuntime(runtimeStr: string): number {
  const match = runtimeStr.match(/(\d+)\s*min/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 
 * @param movieDetails 
 * @param targetGenres 
 * @returns 
 */
function hasAnyGenre(movieDetails: OMDbMovieDetails, targetGenres: string[]): boolean {
  if (!movieDetails.Genre) return false;
  const movieGenres = movieDetails.Genre.split(',').map(g => g.trim().toLowerCase());
  return targetGenres.some(tg => movieGenres.includes(tg.toLowerCase()));
}

/**
 * @param movies 
 * @param movieDetailsCache 
 * @param context 
 * @returns 
 */
export function filterMoviesBySocialContext(
  movies: AppMovie[],
  movieDetailsCache: { [imdbID: string]: OMDbMovieDetails | undefined },
  context: SocialContext
): AppMovie[] {
  if (!movies || movies.length === 0) return [];

  return movies.filter(movie => {
    const details = movieDetailsCache[movie.imdbID];


    if (!details || details.Response === 'False') return true;
    const runtime = parseRuntime(details.Runtime);
    const genres = details.Genre;
    const rated = details.Rated;

    switch (context) { 
      case 'Solo Night':
        return true;
      case 'Date Night':
        
        if (runtime < 90 || runtime > 150) return false;

        if (hasAnyGenre(details, ['Horror', 'Documentary'])) return false;
        return true;
      case 'Family Time':

        if (rated === 'R' || rated === 'NC-17' || rated === 'X' || rated === 'Adult') return false;
        return true;
      case 'Friend Group':

        return true;
      case 'Background Noise':

        return true;
      default:
        return true;
    }
  });
}

/**
 *
 * @param movie 
 * @param details 
 * @param context 
 * @returns 
 */
export function getSocialContextScoreModifier(
  movie: AppMovie,
  details: OMDbMovieDetails,
  context: SocialContext
): number {
  if (!details || details.Response === 'False') return 0;

  const runtime = parseRuntime(details.Runtime);
  const genres = details.Genre;
  const rated = details.Rated;
  let modifier = 0;

  switch (context) {
    case 'Date Night':
      if (hasAnyGenre(details, ['Romance', 'Comedy', 'Thriller'])) {
        modifier += 0.25; 
      }
      break;
    case 'Family Time':

      if (hasAnyGenre(details, ['Animation', 'Family', 'Kids'])) {
        modifier += 0.2;
      }
      break;
    
    default:
      break;
  }
  return modifier;
}
