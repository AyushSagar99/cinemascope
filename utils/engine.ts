
import { AppMovie, OMDbMovieDetails, MoodType, SocialContext, UserViewingHistory, IDynamicPriceResponse } from '@/types';
import { getSocialContextScoreModifier } from './filter';

/**
 * @param runtimeStr
 * @returns 
 */
function parseRuntime(runtimeStr: string): number {
  const match = runtimeStr.match(/(\d+)\s*min/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
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
 * @param movieDetails 
 * @param mood 
 * @returns 
 */
export function calculateMoodMatchScore(movieDetails: OMDbMovieDetails, mood: MoodType): number {
  if (!movieDetails || movieDetails.Response === 'False') return 0;

  let score = 0;
  const runtime = parseRuntime(movieDetails.Runtime);
  const imdbRating = parseFloat(movieDetails.imdbRating || '0');
  const releaseYear = parseInt(movieDetails.Year, 10);
  const currentYear = new Date().getFullYear();

  if (releaseYear >= currentYear - 2) {
    score += 0.20;
  }

  switch (mood) {
    case 'Need a Good Cry':
      if (hasAnyGenre(movieDetails, ['Drama', 'Romance'])) score += 0.8;
      if (hasAnyGenre(movieDetails, ['Comedy', 'Action'])) score -= 0.5;
      if (imdbRating > 7.5) score += 0.1;
      break;
    case 'Brain Food':
      if (hasAnyGenre(movieDetails, ['Documentary', 'Mystery', 'Sci-Fi', 'Thriller'])) score += 0.9;
      if (imdbRating > 8.0) score += 0.2;
      if (runtime < 90) score -= 0.3;
      break;
    case 'Mindless Fun':
      if (hasAnyGenre(movieDetails, ['Action', 'Comedy', 'Adventure'])) score += 1.0;

      if (runtime > 180) score -= 0.15;
      if (imdbRating < 6.0) score += 0.1;
      break;
    case 'Edge of Seat':
      if (hasAnyGenre(movieDetails, ['Thriller', 'Horror', 'Action', 'Mystery'])) score += 1.0;
      if (imdbRating > 7.0) score += 0.2;
      if (runtime < 90) score -= 0.2;
      break;
    case 'Feel Good Vibes':
      if (hasAnyGenre(movieDetails, ['Comedy', 'Musical', 'Family', 'Romance'])) score += 1.0;
      if (imdbRating > 7.0) score += 0.1;
      if (movieDetails.Rated === 'R') score -= 0.3;
      break;
    case 'Deep Thoughts':
      if (hasAnyGenre(movieDetails, ['Drama', 'Sci-Fi', 'Mystery', 'Documentary'])) score += 0.9;
      if (imdbRating > 7.8) score += 0.2;
      if (runtime < 100) score -= 0.2;
      break;
    default:
      break;
  }
  return Math.max(0, score);
}

/**
 * @param rentalPrice 
 * @param maxExpectedPrice 
 * @returns 
 */
export function calculatePriceSensitivityScore(rentalPrice: number, maxExpectedPrice: number = 10): number {
  if (maxExpectedPrice <= 0) return 0;

  return 1 - Math.min(1, rentalPrice / maxExpectedPrice);
}

/**
 * @param releaseDateString 
 * @returns 
 */
export function calculateRecencyBiasScore(releaseDateString: string): number {
  const releaseYear = parseInt(releaseDateString.substring(releaseDateString.length - 4), 10);
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;

  if (age <= 1) return 1.0; 
  if (age <= 5) return 0.8;
  if (age <= 10) return 0.6;
  if (age <= 20) return 0.3;
  return 0.1; 
}

interface RecommendationArgs {
  selectedMood: MoodType;
  selectedSocialContext: SocialContext;
  userViewingHistory: UserViewingHistory;
  dynamicPriceInfo?: IDynamicPriceResponse;
  fuzzyMatchScore: number; // Score from fuzzy search
}

/**
 * @param movie 
 * @param details 
 * @param args 
 * @returns 
 */
export function calculateOverallRecommendationScore(
  movie: AppMovie,
  details: OMDbMovieDetails | undefined,
  args: RecommendationArgs
): number {
  if (!details || details.Response === 'False') {
    return args.fuzzyMatchScore * 0.1;
  }

  let totalScore = 0;

  const moodScore = calculateMoodMatchScore(details, args.selectedMood);
  totalScore += moodScore * 0.40;

  const socialContextModifier = getSocialContextScoreModifier(movie, details, args.selectedSocialContext);
  totalScore += socialContextModifier * 0.25;

  const priceScore = args.dynamicPriceInfo ? calculatePriceSensitivityScore(args.dynamicPriceInfo.rentalPrice) : 0;
  totalScore += priceScore * 0.20;

  const recencyScore = calculateRecencyBiasScore(details.Released);
  totalScore += recencyScore * 0.15;


  if (details.Genre) {
    const movieGenres = details.Genre.split(',').map(g => g.trim());
    const hasWatchedGenreRecently = movieGenres.some(genre =>
      args.userViewingHistory.watchedGenresLast30Days.includes(genre)
    );
    if (!hasWatchedGenreRecently) {
      totalScore *= 1.25;
    }
  }

  totalScore += args.fuzzyMatchScore * 0.05;

  return totalScore;
}
