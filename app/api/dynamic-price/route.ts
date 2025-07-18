import { NextRequest, NextResponse } from 'next/server';
import { IDynamicPriceResponse } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const imdbID = searchParams.get('imdbID');
  const timeOfDay = parseInt(searchParams.get('timeOfDay') || '0', 10);
  const dayOfWeek = searchParams.get('dayOfWeek'); // e.g., "Mon", "Tue", "Sat"
  const moviePopularity = parseFloat(searchParams.get('moviePopularity') || '0'); // Using imdbRating as proxy

  const basePrice = 4.99;
  let rentalPrice = basePrice;
  let bestTimeToRentSuggestion = "Rent between 2 AM - 6 AM for lowest prices!";

  if (timeOfDay >= 19 && timeOfDay <= 22) { 
    rentalPrice *= 1.25; // 25% increase during prime time
    bestTimeToRentSuggestion = "Prime time pricing active (7-10 PM).";
  }

  // 2. Day of week (weekends cost more)
  const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
  if (isWeekend) {
    rentalPrice *= 1.15; // 15% increase on weekends
    if (bestTimeToRentSuggestion === "Rent between 2 AM - 6 AM for lowest prices!") {
        bestTimeToRentSuggestion = "Weekends are more expensive. Try weekdays for better rates.";
    } else {
        bestTimeToRentSuggestion += " Also, it's a weekend, so prices are higher.";
    }
  }

  // OMDb's imdbRating ranges from 1.0 to 10.0.
  // Let's assume a rating > 7.5 is "trending" for this mock.
  if (moviePopularity > 7.5) {
    rentalPrice *= 1 + (moviePopularity - 7.5) * 0.05; // Small boost for very popular movies
    bestTimeToRentSuggestion = "This movie is popular, affecting its price. " + bestTimeToRentSuggestion;
  }

  const mockWatchedMovieIds = ['tt0133093', 'tt0111161']; // Example: The Matrix, Shawshank Redemption
  if (imdbID && mockWatchedMovieIds.includes(imdbID)) {
      rentalPrice *= 0.9; // 10% discount if watched before
      bestTimeToRentSuggestion = "Welcome back! You've watched this before, enjoy a discount. " + bestTimeToRentSuggestion;
  }

  // Ensure price is positive and formatted
  rentalPrice = Math.max(0.99, parseFloat(rentalPrice.toFixed(2)));

  const responseData: IDynamicPriceResponse = {
    rentalPrice: rentalPrice,
    bestTimeToRentSuggestion: bestTimeToRentSuggestion,
  };

  // Return a JSON response
  return NextResponse.json(responseData);
}
