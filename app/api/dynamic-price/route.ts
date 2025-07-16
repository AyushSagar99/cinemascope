// app/api/dynamic-price/route.ts
// This is an Edge Runtime API Route in Next.js 13+ App Router
import { NextRequest, NextResponse } from 'next/server';
import { IDynamicPriceResponse } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const imdbID = searchParams.get('imdbID');
  const timeOfDay = parseInt(searchParams.get('timeOfDay') || '0', 10);
  const dayOfWeek = searchParams.get('dayOfWeek'); // e.g., "Mon", "Tue", "Sat"
  const moviePopularity = parseFloat(searchParams.get('moviePopularity') || '0'); // Using imdbRating as proxy

  let basePrice = 4.99; // Base rental price
  let rentalPrice = basePrice;
  let bestTimeToRentSuggestion = "Rent between 2 AM - 6 AM for lowest prices!";

  // 1. Time of day (higher prices 7-10pm)
  if (timeOfDay >= 19 && timeOfDay <= 22) { // 7 PM to 10 PM (inclusive)
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

  // 3. Movie popularity (trending movies cost more)
  // OMDb's imdbRating ranges from 1.0 to 10.0.
  // Let's assume a rating > 7.5 is "trending" for this mock.
  if (moviePopularity > 7.5) {
    rentalPrice *= 1 + (moviePopularity - 7.5) * 0.05; // Small boost for very popular movies
    bestTimeToRentSuggestion = "This movie is popular, affecting its price. " + bestTimeToRentSuggestion;
  }

  // 4. User's "viewing history" (mock data)
  // For simplicity, let's assume a mock user history is passed or accessed.
  // In a real app, this would come from a database or user session.
  // For this mock API, we'll just apply a hypothetical discount if the user has "watched" this specific movie before.
  // This part is hardcoded as the API route doesn't have direct access to client-side context.
  // In a real scenario, user ID would be passed, and history fetched from DB.
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
