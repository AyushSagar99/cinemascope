'use client';

import React from 'react';
import MovieCard from './moviecard';
import { useMovie } from '@/context/moviecontext';

export default function MovieList() {
  const { state } = useMovie();

  if (state.loading && state.filteredMovies.length === 0) {
    return <p className="text-center text-xl text-gray-600 mt-8">Loading movies...</p>;
  }

  if (state.error) {
    return <p className="text-center text-xl text-red-500 mt-8">Error: {state.error}</p>;
  }

  if (state.searchQuery && state.filteredMovies.length === 0 && !state.loading) {
    return <p className="text-center text-xl text-gray-600 mt-8">No movies found for "{state.searchQuery}".</p>;
  }

  if (state.filteredMovies.length === 0 && !state.searchQuery && !state.loading) {
    return <p className="text-center text-xl text-gray-600 mt-8">Start by searching for a movie!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {state.filteredMovies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} />
      ))}
    </div>
  );
}
